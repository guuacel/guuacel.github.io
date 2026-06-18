from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Any, Callable, Iterable, List, Sequence, Tuple

try:
    from charm.toolbox.pairinggroup import PairingGroup, ZR, G1, G2, pair
except ImportError as exc:  # pragma: no cover - depends on local environment
    PairingGroup = None
    ZR = G1 = G2 = None
    pair = None
    _CHARM_IMPORT_ERROR = exc
else:
    _CHARM_IMPORT_ERROR = None


def require_charm() -> None:
    if PairingGroup is None:
        raise RuntimeError(
            "charm-crypto is not installed in the current Python environment. "
            "Install Charm-Crypto before running this file."
        ) from _CHARM_IMPORT_ERROR


def timed(label: str, fn: Callable[[], Any]) -> Any:
    start = time.perf_counter()
    value = fn()
    elapsed_ms = (time.perf_counter() - start) * 1000
    print(f"{label} elapsed time: {elapsed_ms:.3f} ms")
    return value


def short(value: Any, limit: int = 96) -> str:
    text = str(value)
    if len(text) > limit:
        return text[:limit] + "..."
    return text


@dataclass(frozen=True)
class PublicParameters:
    group: Any
    curve: str
    g1: Any
    g2: Any


@dataclass(frozen=True)
class SecretKey:
    x: Any


@dataclass(frozen=True)
class PublicKey:
    pk: Any


class BLSSignature:
    """
    BLS short signature demo.

    This implementation follows the common asymmetric-pairing convention:
    signatures live in G1 and public keys live in G2.
    """

    def __init__(self, curve: str = "MNT224"):
        require_charm()
        self.group = PairingGroup(curve)
        self.curve = curve
        self.g1 = self.group.random(G1)
        self.g2 = self.group.random(G2)
        self.params = PublicParameters(self.group, curve, self.g1, self.g2)

    def hash_message(self, message: bytes | str) -> Any:
        if isinstance(message, str):
            message = message.encode("utf-8")
        return self.group.hash(("BLS-H", message), G1)

    def keygen(self) -> Tuple[SecretKey, PublicKey]:
        x = self.group.random(ZR)
        return SecretKey(x=x), PublicKey(pk=self.g2 ** x)

    def sign(self, secret_key: SecretKey, message: bytes | str) -> Any:
        h = self.hash_message(message)
        return h ** secret_key.x

    def verify(self, public_key: PublicKey, message: bytes | str, signature: Any) -> bool:
        h = self.hash_message(message)
        return pair(signature, self.g2) == pair(h, public_key.pk)

    def aggregate_signatures(self, signatures: Iterable[Any]) -> Any:
        aggregate = None
        for signature in signatures:
            aggregate = signature if aggregate is None else aggregate * signature
        if aggregate is None:
            raise ValueError("at least one signature is required")
        return aggregate

    def aggregate_verify_distinct_messages(
        self,
        public_keys: Sequence[PublicKey],
        messages: Sequence[bytes | str],
        aggregate_signature: Any,
    ) -> bool:
        if len(public_keys) != len(messages):
            raise ValueError("public key and message counts must match")
        if not public_keys:
            raise ValueError("at least one public key is required")

        left = pair(aggregate_signature, self.g2)
        right = None
        for public_key, message in zip(public_keys, messages):
            term = pair(self.hash_message(message), public_key.pk)
            right = term if right is None else right * term
        return left == right

    def fast_aggregate_verify_same_message(
        self,
        public_keys: Sequence[PublicKey],
        message: bytes | str,
        aggregate_signature: Any,
    ) -> bool:
        if not public_keys:
            raise ValueError("at least one public key is required")

        aggregate_pk = public_keys[0].pk
        for public_key in public_keys[1:]:
            aggregate_pk *= public_key.pk
        return pair(aggregate_signature, self.g2) == pair(self.hash_message(message), aggregate_pk)


def demo_basic_signature() -> None:
    print("========== BLS short signature demo ==========")
    bls = timed("-----setup-----\n", lambda: BLSSignature(curve="MNT224"))
    print(f"Public parameters: curve={bls.curve}, g1={short(bls.g1)}, g2={short(bls.g2)}")

    secret_key, public_key = timed("-----keygen-----\n", bls.keygen)
    print(f"Secret key x={short(secret_key.x)}")
    print(f"Public key pk=g2^x={short(public_key.pk)}")

    message = "BLS signatures are short pairing-based signatures."
    signature = timed("-----sign-----\n", lambda: bls.sign(secret_key, message))
    print(f"Message: {message}")
    print(f"Signature sigma=H(m)^x={short(signature)}")

    ok = timed("-----verify-----\n", lambda: bls.verify(public_key, message, signature))
    print(f"Verification passed: {ok}")

    bad = bls.verify(public_key, "tampered message", signature)
    print(f"Tampered-message verification passed: {bad}")


def demo_aggregate_signature() -> None:
    print("\n========== BLS aggregate signature demo ==========")
    bls = BLSSignature(curve="MNT224")
    keypairs = [bls.keygen() for _ in range(3)]
    public_keys = [public_key for _, public_key in keypairs]
    messages = [f"distinct message {i}" for i in range(3)]

    signatures = [bls.sign(secret_key, message) for (secret_key, _), message in zip(keypairs, messages)]
    aggregate = timed("Aggregate signatures on distinct messages", lambda: bls.aggregate_signatures(signatures))
    ok = timed(
        "Verify aggregate signature on distinct messages",
        lambda: bls.aggregate_verify_distinct_messages(public_keys, messages, aggregate),
    )
    print(f"Distinct-message aggregate verification passed: {ok}")

    shared_message = "same message for fast aggregate verify"
    same_message_signatures = [bls.sign(secret_key, shared_message) for secret_key, _ in keypairs]
    same_message_aggregate = bls.aggregate_signatures(same_message_signatures)
    fast_ok = timed(
        "Verify fast aggregate signature on a common message",
        lambda: bls.fast_aggregate_verify_same_message(public_keys, shared_message, same_message_aggregate),
    )
    print(f"Common-message fast aggregate verification passed: {fast_ok}")


if __name__ == "__main__":
    try:
        demo_basic_signature()
        demo_aggregate_signature()
    except RuntimeError as error:
        print(error)
