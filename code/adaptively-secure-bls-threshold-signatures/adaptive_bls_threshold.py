from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, Mapping, Sequence, Tuple

try:
    from charm.toolbox.pairinggroup import G1, G2, ZR, PairingGroup, pair
except ImportError as exc:  # pragma: no cover - depends on the local environment
    G1 = G2 = ZR = PairingGroup = pair = None
    _CHARM_IMPORT_ERROR = exc
else:
    _CHARM_IMPORT_ERROR = None


def require_charm() -> None:
    if PairingGroup is None:
        raise RuntimeError(
            "Charm-Crypto is not installed. Run this module in the configured "
            "Charm environment (the repository documentation uses WSL)."
        ) from _CHARM_IMPORT_ERROR


def _message_bytes(message: bytes | str) -> bytes:
    return message if isinstance(message, bytes) else message.encode("utf-8")


@dataclass(frozen=True)
class SecretKeyShare:
    signer_id: int
    s: Any
    r: Any
    u: Any


@dataclass(frozen=True)
class PublicKeyShare:
    signer_id: int
    value: Any


@dataclass(frozen=True)
class SigmaProof:
    """Fiat-Shamir version of the Sigma proof in Figure 3."""

    x: Any
    y: Any
    z_s: Any
    z_r: Any
    z_u: Any


@dataclass(frozen=True)
class PartialSignature:
    signer_id: int
    sigma: Any
    proof: SigmaProof


@dataclass(frozen=True)
class ThresholdKeys:
    public_key: Any
    public_shares: Mapping[int, PublicKeyShare]
    secret_shares: Mapping[int, SecretKeyShare]


@dataclass(frozen=True)
class SchnorrProof:
    commitment: Any
    response: Any


@dataclass(frozen=True)
class DealerState:
    dealer_id: int
    s_coefficients: Tuple[Any, ...]
    r_coefficients: Tuple[Any, ...]
    u_coefficients: Tuple[Any, ...]
    commitments: Tuple[Any, ...]
    constant_term_proof: SchnorrProof


@dataclass(frozen=True)
class DKGResult:
    keys: ThresholdKeys
    qualified_dealers: Tuple[int, ...]
    disqualified_dealers: Tuple[int, ...]


class AdaptiveBLSThreshold:
    """Das-Ren adaptively secure BLS threshold signature construction.

    Paper notation is mapped to Charm as follows:

    * paper G (public keys)     -> Charm G2
    * paper G-hat (signatures) -> Charm G1
    * e(pk, H(m))              -> pair(H(m), pk)

    The module implements Figures 2, 3, and the honest-execution functionality
    of Figure 5.  The DDH/co-CDH reduction and SIP simulator are proof devices,
    not runtime protocol steps.
    """

    def __init__(self, n: int, threshold: int, curve: str = "MNT224"):
        require_charm()
        if n < 1:
            raise ValueError("n must be positive")
        if not 0 <= threshold < n:
            raise ValueError("threshold must satisfy 0 <= t < n")

        self.n = n
        self.threshold = threshold
        self.curve = curve
        self.group = PairingGroup(curve)
        self.g = self.group.random(G2)
        self.h = self.group.random(G2)
        self.v = self.group.random(G2)

    def _zr(self, value: int) -> Any:
        return self.group.init(ZR, value)

    def _g1_identity(self) -> Any:
        return self.group.init(G1, 1)

    def _g2_identity(self) -> Any:
        return self.group.init(G2, 1)

    def _hash_h0(self, message: bytes | str) -> Any:
        return self.group.hash(("DAS-REN-H0-v1", _message_bytes(message)), G1)

    def _hash_h1(self, message: bytes | str) -> Any:
        return self.group.hash(("DAS-REN-H1-v1", _message_bytes(message)), G1)

    def _hash_transcript(self, domain: str, elements: Sequence[Any]) -> Any:
        encoded = [domain.encode("ascii")]
        for element in elements:
            blob = self.group.serialize(element)
            encoded.append(len(blob).to_bytes(8, "big"))
            encoded.append(blob)
        return self.group.hash(b"".join(encoded), ZR)

    def _evaluate(self, coefficients: Sequence[Any], signer_id: int) -> Any:
        x = self._zr(signer_id)
        result = self._zr(0)
        for coefficient in reversed(coefficients):
            result = result * x + coefficient
        return result

    def _random_polynomial(self, zero_constant: bool = False) -> Tuple[Any, ...]:
        constant = self._zr(0) if zero_constant else self.group.random(ZR)
        return (constant,) + tuple(
            self.group.random(ZR) for _ in range(self.threshold)
        )

    def _public_share_value(self, secret_share: SecretKeyShare) -> Any:
        return (
            (self.g ** secret_share.s)
            * (self.h ** secret_share.r)
            * (self.v ** secret_share.u)
        )

    # Figure 2: trusted key generation.
    def trusted_keygen(self) -> ThresholdKeys:
        s_coefficients = self._random_polynomial(zero_constant=False)
        r_coefficients = self._random_polynomial(zero_constant=True)
        u_coefficients = self._random_polynomial(zero_constant=True)

        secret_shares: Dict[int, SecretKeyShare] = {}
        public_shares: Dict[int, PublicKeyShare] = {}
        for signer_id in range(1, self.n + 1):
            secret_share = SecretKeyShare(
                signer_id=signer_id,
                s=self._evaluate(s_coefficients, signer_id),
                r=self._evaluate(r_coefficients, signer_id),
                u=self._evaluate(u_coefficients, signer_id),
            )
            secret_shares[signer_id] = secret_share
            public_shares[signer_id] = PublicKeyShare(
                signer_id=signer_id,
                value=self._public_share_value(secret_share),
            )

        public_key = self.g ** s_coefficients[0]
        return ThresholdKeys(public_key, public_shares, secret_shares)

    # Figure 3: proof that pk_i and sigma_i use the same (s_i, r_i), while
    # pk_i additionally contains v^u_i.
    def sigma_prove(
        self,
        public_share: PublicKeyShare,
        message: bytes | str,
        sigma: Any,
        secret_share: SecretKeyShare,
    ) -> SigmaProof:
        if public_share.signer_id != secret_share.signer_id:
            raise ValueError("public and secret shares belong to different signers")

        h0 = self._hash_h0(message)
        h1 = self._hash_h1(message)
        a_s = self.group.random(ZR)
        a_r = self.group.random(ZR)
        a_u = self.group.random(ZR)
        x = (self.g ** a_s) * (self.h ** a_r) * (self.v ** a_u)
        y = (h0 ** a_s) * (h1 ** a_r)
        challenge = self._hash_transcript(
            "DAS-REN-SIGMA-v1",
            (x, y, public_share.value, sigma, h0, h1),
        )
        return SigmaProof(
            x=x,
            y=y,
            z_s=a_s + secret_share.s * challenge,
            z_r=a_r + secret_share.r * challenge,
            z_u=a_u + secret_share.u * challenge,
        )

    def sigma_verify(
        self,
        public_share: PublicKeyShare,
        message: bytes | str,
        sigma: Any,
        proof: SigmaProof,
    ) -> bool:
        h0 = self._hash_h0(message)
        h1 = self._hash_h1(message)
        challenge = self._hash_transcript(
            "DAS-REN-SIGMA-v1",
            (proof.x, proof.y, public_share.value, sigma, h0, h1),
        )
        public_relation = (
            (self.g ** proof.z_s)
            * (self.h ** proof.z_r)
            * (self.v ** proof.z_u)
        ) == (proof.x * (public_share.value ** challenge))
        signature_relation = (
            (h0 ** proof.z_s) * (h1 ** proof.z_r)
        ) == (proof.y * (sigma ** challenge))
        return bool(public_relation and signature_relation)

    def partial_sign(
        self,
        secret_share: SecretKeyShare,
        public_share: PublicKeyShare,
        message: bytes | str,
    ) -> PartialSignature:
        if secret_share.signer_id != public_share.signer_id:
            raise ValueError("public and secret shares belong to different signers")
        sigma = (
            (self._hash_h0(message) ** secret_share.s)
            * (self._hash_h1(message) ** secret_share.r)
        )
        proof = self.sigma_prove(public_share, message, sigma, secret_share)
        return PartialSignature(secret_share.signer_id, sigma, proof)

    def partial_verify(
        self,
        public_share: PublicKeyShare,
        message: bytes | str,
        partial_signature: PartialSignature,
    ) -> bool:
        if public_share.signer_id != partial_signature.signer_id:
            return False
        return self.sigma_verify(
            public_share,
            message,
            partial_signature.sigma,
            partial_signature.proof,
        )

    def _lagrange_at_zero(self, signer_id: int, signer_ids: Sequence[int]) -> Any:
        numerator = self._zr(1)
        denominator = self._zr(1)
        x_i = self._zr(signer_id)
        for other_id in signer_ids:
            if other_id == signer_id:
                continue
            x_j = self._zr(other_id)
            numerator *= -x_j
            denominator *= x_i - x_j
        return numerator / denominator

    def combine(
        self,
        message: bytes | str,
        partial_signatures: Iterable[PartialSignature],
        public_shares: Mapping[int, PublicKeyShare],
    ) -> Any:
        partials = tuple(partial_signatures)
        signer_ids = tuple(partial.signer_id for partial in partials)
        if len(set(signer_ids)) != len(signer_ids):
            raise ValueError("partial signatures must have distinct signer IDs")
        if len(partials) < self.threshold + 1:
            raise ValueError(f"at least {self.threshold + 1} partial signatures are required")

        for partial in partials:
            public_share = public_shares.get(partial.signer_id)
            if public_share is None or not self.partial_verify(
                public_share, message, partial
            ):
                raise ValueError(
                    f"invalid partial signature from signer {partial.signer_id}"
                )

        signature = self._g1_identity()
        for partial in partials:
            coefficient = self._lagrange_at_zero(partial.signer_id, signer_ids)
            signature *= partial.sigma ** coefficient
        return signature

    # Standard non-threshold BLS verification, with Charm's pairing argument
    # order adjusted to (G1, G2).
    def verify(self, public_key: Any, message: bytes | str, signature: Any) -> bool:
        return pair(self._hash_h0(message), public_key) == pair(signature, self.g)

    # Figure 5: Schnorr PoK for the dealer's constant commitment g^s_i,0.
    def _prove_constant_term(self, secret: Any, commitment: Any) -> SchnorrProof:
        nonce = self.group.random(ZR)
        announcement = self.g ** nonce
        challenge = self._hash_transcript(
            "DAS-REN-DKG-POK-v1", (announcement, commitment)
        )
        return SchnorrProof(announcement, nonce + challenge * secret)

    def _verify_constant_term(
        self, commitment: Any, proof: SchnorrProof
    ) -> bool:
        challenge = self._hash_transcript(
            "DAS-REN-DKG-POK-v1", (proof.commitment, commitment)
        )
        return (self.g ** proof.response) == (
            proof.commitment * (commitment ** challenge)
        )

    def _make_dealer(self, dealer_id: int) -> DealerState:
        s_coefficients = self._random_polynomial(zero_constant=False)
        r_coefficients = self._random_polynomial(zero_constant=True)
        u_coefficients = self._random_polynomial(zero_constant=True)
        commitments = []
        for index in range(self.threshold + 1):
            commitments.append(
                (self.g ** s_coefficients[index])
                * (self.h ** r_coefficients[index])
                * (self.v ** u_coefficients[index])
            )
        proof = self._prove_constant_term(s_coefficients[0], commitments[0])
        return DealerState(
            dealer_id,
            s_coefficients,
            r_coefficients,
            u_coefficients,
            tuple(commitments),
            proof,
        )

    def _dealer_share(self, dealer: DealerState, recipient_id: int) -> Tuple[Any, Any, Any]:
        return (
            self._evaluate(dealer.s_coefficients, recipient_id),
            self._evaluate(dealer.r_coefficients, recipient_id),
            self._evaluate(dealer.u_coefficients, recipient_id),
        )

    def _verify_dealer_share(
        self,
        dealer: DealerState,
        recipient_id: int,
        share: Tuple[Any, Any, Any],
    ) -> bool:
        if not self._verify_constant_term(
            dealer.commitments[0], dealer.constant_term_proof
        ):
            return False
        s_value, r_value, u_value = share
        left = (self.g ** s_value) * (self.h ** r_value) * (self.v ** u_value)
        right = self._g2_identity()
        x = self._zr(recipient_id)
        power = self._zr(1)
        for commitment in dealer.commitments:
            right *= commitment ** power
            power *= x
        return left == right

    def distributed_keygen(
        self, faulty_dealers: Iterable[int] = ()
    ) -> DKGResult:
        """Run a local simulation of Figure 5's sharing/agreement/derivation.

        ``faulty_dealers`` is a deterministic test hook.  Such a dealer sends
        and reveals a share inconsistent with its commitments, so the agreement
        phase disqualifies it.  Real deployments must replace this local driver
        with authenticated private channels and reliable broadcast.
        """

        if not self.threshold < self.n / 2:
            raise ValueError("the paper's DKG requires an honest majority: t < n/2")
        faulty = set(faulty_dealers)
        if not faulty.issubset(set(range(1, self.n + 1))):
            raise ValueError("faulty dealer IDs must be in 1..n")

        dealers = {
            dealer_id: self._make_dealer(dealer_id)
            for dealer_id in range(1, self.n + 1)
        }
        delivered: Dict[Tuple[int, int], Tuple[Any, Any, Any]] = {}
        complaints: set[int] = set()

        for dealer_id, dealer in dealers.items():
            for recipient_id in range(1, self.n + 1):
                share = self._dealer_share(dealer, recipient_id)
                if dealer_id in faulty:
                    share = (share[0] + self._zr(1), share[1], share[2])
                delivered[(dealer_id, recipient_id)] = share
                if not self._verify_dealer_share(dealer, recipient_id, share):
                    complaints.add(dealer_id)

        # A complaint is resolved only if the dealer publicly reveals a share
        # consistent with its commitment.  Fault injection makes the reveal
        # inconsistent as well, hence those dealers are disqualified.
        disqualified = {
            dealer_id
            for dealer_id in complaints
            if any(
                not self._verify_dealer_share(
                    dealers[dealer_id],
                    recipient_id,
                    delivered[(dealer_id, recipient_id)],
                )
                for recipient_id in range(1, self.n + 1)
            )
        }
        qualified = tuple(
            dealer_id
            for dealer_id in range(1, self.n + 1)
            if dealer_id not in disqualified
        )
        if len(qualified) < self.threshold + 1:
            raise RuntimeError("too few qualified dealers to derive threshold keys")

        public_key = self._g2_identity()
        for dealer_id in qualified:
            public_key *= dealers[dealer_id].commitments[0]

        secret_shares: Dict[int, SecretKeyShare] = {}
        public_shares: Dict[int, PublicKeyShare] = {}
        for recipient_id in range(1, self.n + 1):
            s_value = self._zr(0)
            r_value = self._zr(0)
            u_value = self._zr(0)
            for dealer_id in qualified:
                share = self._dealer_share(dealers[dealer_id], recipient_id)
                s_value += share[0]
                r_value += share[1]
                u_value += share[2]
            secret_share = SecretKeyShare(
                recipient_id, s_value, r_value, u_value
            )
            secret_shares[recipient_id] = secret_share

            public_value = self._g2_identity()
            x = self._zr(recipient_id)
            for dealer_id in qualified:
                power = self._zr(1)
                for commitment in dealers[dealer_id].commitments:
                    public_value *= commitment ** power
                    power *= x
            if public_value != self._public_share_value(secret_share):
                raise RuntimeError("DKG public and secret shares are inconsistent")
            public_shares[recipient_id] = PublicKeyShare(
                recipient_id, public_value
            )

        keys = ThresholdKeys(public_key, public_shares, secret_shares)
        return DKGResult(keys, qualified, tuple(sorted(disqualified)))


def demo() -> None:
    scheme = AdaptiveBLSThreshold(n=5, threshold=2)
    dkg = scheme.distributed_keygen()
    message = "adaptive BLS threshold signatures"
    signer_ids = (1, 3, 5)
    partials = [
        scheme.partial_sign(
            dkg.keys.secret_shares[signer_id],
            dkg.keys.public_shares[signer_id],
            message,
        )
        for signer_id in signer_ids
    ]
    signature = scheme.combine(message, partials, dkg.keys.public_shares)
    print(f"qualified dealers: {dkg.qualified_dealers}")
    print(f"partial proofs valid: {all(scheme.partial_verify(dkg.keys.public_shares[p.signer_id], message, p) for p in partials)}")
    print(f"threshold signature valid: {scheme.verify(dkg.keys.public_key, message, signature)}")
    print(f"tampered message valid: {scheme.verify(dkg.keys.public_key, message + '!', signature)}")


if __name__ == "__main__":
    try:
        demo()
    except RuntimeError as error:
        print(error)
