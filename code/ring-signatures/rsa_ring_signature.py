"""RSA 环签名：How to Leak a Secret (2001)。

复制本文件即可独立运行；Python 3.10+，只依赖标准库。
入口：generate_rsa_key、rsa_sign、rsa_verify，签名者下标从 0 开始。
论文中的理想大域置换使用 10 轮 Feistel/HMAC-SHA-256 具体化；用于研究复现。
"""

from __future__ import annotations
from dataclasses import dataclass, field, replace
from math import gcd, lcm
from typing import Sequence
import hashlib
import hmac
import secrets

MAX_RING_SIZE = 4096
MAX_MODULUS_BITS = 16384


def _integer(value: object) -> bool:
    return type(value) is int


def is_probable_prime(n: int, rounds: int = 64) -> bool:
    """Miller-Rabin; for an odd composite, error <= 4**(-rounds)."""
    if not _integer(n) or n < 2:
        return False
    if not _integer(rounds) or rounds < 1:
        raise ValueError("rounds must be positive")
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47):
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for _ in range(rounds):
        a = 2 + secrets.randbelow(n - 3)
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def generate_prime(bits: int, *, exponent: int | None = None) -> int:
    if not _integer(bits) or bits < 3:
        raise ValueError("prime size must be >= 3 bits")
    while True:
        p = secrets.randbits(bits) | (1 << (bits - 1)) | 1
        if exponent is not None and gcd(exponent, p - 1) != 1:
            continue
        if is_probable_prime(p):
            return p


@dataclass(frozen=True)
class RSAPublicKey:
    n: int
    e: int = 65537

    def __post_init__(self) -> None:
        if not _integer(self.n) or self.n < 15 or self.n % 2 == 0:
            raise ValueError("RSA modulus must be an odd integer >= 15")
        if not _integer(self.e) or not 3 <= self.e < self.n or self.e % 2 == 0:
            raise ValueError("RSA exponent must be odd, with 3 <= e < n")


@dataclass(frozen=True)
class RSAPrivateKey:
    public_key: RSAPublicKey
    d: int = field(repr=False)
    p: int = field(repr=False)
    q: int = field(repr=False)

    @classmethod
    def from_primes(cls, p: int, q: int, e: int = 65537) -> RSAPrivateKey:
        if p == q or not is_probable_prime(p) or not is_probable_prime(q):
            raise ValueError("p and q must be distinct primes")
        public = RSAPublicKey(p * q, e)
        lam = lcm(p - 1, q - 1)
        if gcd(e, lam) != 1:
            raise ValueError("e must be coprime to lcm(p-1, q-1)")
        return cls(public, pow(e, -1, lam), p, q)


def _key_size(bits: int) -> None:
    if not _integer(bits) or not 128 <= bits <= 16384:
        raise ValueError("key size must be between 128 and 16384 bits")


def generate_rsa_key(bits: int = 2048, e: int = 65537) -> RSAPrivateKey:
    """Generate an exact-bit-length modulus. Small sizes are for experiments only."""
    _key_size(bits)
    if not _integer(e) or e < 3 or e % 2 == 0 or e.bit_length() >= bits:
        raise ValueError("invalid RSA exponent")
    while True:
        p = generate_prime(bits // 2, exponent=e)
        q = generate_prime(bits - bits // 2, exponent=e)
        if p != q and (p * q).bit_length() == bits:
            return RSAPrivateKey(
                RSAPublicKey(p * q, e),
                pow(e, -1, lcm(p - 1, q - 1)),
                p,
                q,
            )


def extended_map(x: int, public_key: RSAPublicKey, bits: int) -> int:
    """Paper Section 3.1: preserve complete n-blocks and the incomplete tail."""
    if not _integer(bits) or bits < 1 or public_key.n >= 1 << bits:
        raise ValueError("domain must be larger than the modulus")
    if not _integer(x) or not 0 <= x < 1 << bits:
        raise ValueError("input outside the b-bit domain")
    block, residue = divmod(x, public_key.n)
    if (block + 1) * public_key.n > 1 << bits:
        return x
    return block * public_key.n + pow(residue, public_key.e, public_key.n)


def rsa_inverse(y: int, key: RSAPrivateKey, bits: int) -> int:
    extended_map(y, key.public_key, bits)
    block, residue = divmod(y, key.public_key.n)
    if (block + 1) * key.public_key.n > 1 << bits:
        return y
    return block * key.public_key.n + pow(residue, key.d, key.public_key.n)


PublicKey = RSAPublicKey


class WideFeistel:
    """10-round balanced Feistel with counter-expanded HMAC-SHA-256 rounds.

    The full input is ONE b-bit word. Independently encrypting small blocks
    would not supply the full-domain permutation assumed by the paper.
    """

    ROUNDS = 10

    def __init__(self, key: bytes, bits: int):
        if not isinstance(key, bytes) or len(key) != 32:
            raise ValueError("key must be exactly 32 bytes")
        if type(bits) is not int or bits < 16 or bits % 16:
            raise ValueError("bits must be a positive multiple of 16")
        self.bits = bits
        self.half_bits = bits // 2
        self.half_bytes = bits // 16
        self.mask = (1 << self.half_bits) - 1
        self.key = key
        self.domain = b"RST01-WIDE-FEISTEL-v1\x00" + bits.to_bytes(4, "big")

    @classmethod
    def for_message(cls, message: bytes, bits: int) -> WideFeistel:
        return cls(hashlib.sha256(message).digest(), bits)

    def _round(self, right: int, round_index: int) -> int:
        prefix = (
            self.domain
            + round_index.to_bytes(2, "big")
            + right.to_bytes(self.half_bytes, "big")
        )
        blocks = (self.half_bytes + 31) // 32
        stream = b"".join(
            hmac.digest(self.key, prefix + j.to_bytes(4, "big"), "sha256")
            for j in range(blocks)
        )
        return int.from_bytes(stream[: self.half_bytes], "big")

    def _check(self, value: int) -> None:
        if type(value) is not int or not 0 <= value < 1 << self.bits:
            raise ValueError("value outside permutation domain")

    def encrypt(self, value: int) -> int:
        self._check(value)
        left, right = value >> self.half_bits, value & self.mask
        for j in range(self.ROUNDS):
            left, right = right, left ^ self._round(right, j)
        return (left << self.half_bits) | right

    def decrypt(self, value: int) -> int:
        self._check(value)
        left, right = value >> self.half_bits, value & self.mask
        for j in reversed(range(self.ROUNDS)):
            left, right = right ^ self._round(left, j), left
        return (left << self.half_bits) | right


def _message(message: str | bytes) -> bytes:
    if isinstance(message, str):
        return message.encode("utf-8")
    if isinstance(message, bytes):
        return message
    raise TypeError("message must be str or bytes")


def _validate_ring(ring: Sequence[PublicKey], scheme: str) -> tuple[PublicKey, ...]:
    keys = tuple(ring)
    if scheme != "rsa":
        raise ValueError("unknown scheme")
    if not 1 <= len(keys) <= MAX_RING_SIZE:
        raise ValueError("ring must contain 1..4096 public keys")
    if any(type(p) is not RSAPublicKey for p in keys):
        raise ValueError("all ring keys must match the scheme")
    if any(p.n.bit_length() > MAX_MODULUS_BITS for p in keys):
        raise ValueError("modulus too large")
    if len({p.n for p in keys}) != len(keys):
        raise ValueError("ring must not contain repeated moduli")
    return keys


def domain_bits(ring: Sequence[PublicKey]) -> int:
    """At least 160 bits above largest n, rounded for byte-aligned halves."""
    if not ring:
        raise ValueError("empty ring")
    return ((max(p.n.bit_length() for p in ring) + 160 + 15) // 16) * 16


def combine(cipher: WideFeistel, glue: int, ys: Sequence[int]) -> int:
    state = glue
    for y in ys:
        state = cipher.encrypt(state ^ y)
    return state


def solve_missing(
    cipher: WideFeistel, glue: int, ys: Sequence[int], signer: int
) -> int:
    """Forward prefix and backward suffix give y_s = L XOR D_k(R)."""
    if type(signer) is not int or not 0 <= signer < len(ys):
        raise ValueError("invalid signer index")
    left = combine(cipher, glue, ys[:signer])
    right = glue
    for y in reversed(ys[signer + 1 :]):
        right = cipher.decrypt(right) ^ y
    return left ^ cipher.decrypt(right)


@dataclass(frozen=True)
class RingSignature:
    scheme: str
    public_keys: tuple[PublicKey, ...]
    bits: int
    glue: int
    responses: tuple[int, ...]

    def validate(self) -> None:
        keys = _validate_ring(self.public_keys, self.scheme)
        if type(self.bits) is not int or self.bits != domain_bits(keys):
            raise ValueError("noncanonical domain size")
        if len(self.responses) != len(keys):
            raise ValueError("one response is required per ring member")
        words = (self.glue, *self.responses)
        if any(type(x) is not int or not 0 <= x < 1 << self.bits for x in words):
            raise ValueError("signature word outside the b-bit domain")


def _signer(
    ring: Sequence[PublicKey], scheme: str, index: int, private_key: object
) -> tuple[PublicKey, ...]:
    keys = _validate_ring(ring, scheme)
    if type(private_key) is not RSAPrivateKey:
        raise ValueError("wrong private key type")
    if type(index) is not int or not 0 <= index < len(keys):
        raise ValueError("signer index outside ring")
    if private_key.public_key != keys[index]:
        raise ValueError("private key does not match the specified ring member")
    return keys


def rsa_sign(
    message: str | bytes,
    ring: Sequence[RSAPublicKey],
    signer_index: int,
    private_key: RSAPrivateKey,
) -> RingSignature:
    keys = _signer(ring, "rsa", signer_index, private_key)
    bits = domain_bits(keys)
    cipher = WideFeistel.for_message(_message(message), bits)
    glue = secrets.randbits(bits)
    xs = [
        secrets.randbits(bits) if i != signer_index else 0
        for i in range(len(keys))
    ]
    ys = [
        extended_map(x, public_key, bits) if i != signer_index else 0
        for i, (x, public_key) in enumerate(zip(xs, keys))
    ]
    target = solve_missing(cipher, glue, ys, signer_index)
    xs[signer_index] = rsa_inverse(target, private_key, bits)
    if extended_map(xs[signer_index], keys[signer_index], bits) != target:
        raise ValueError("invalid RSA private key")
    return RingSignature("rsa", keys, bits, glue, tuple(xs))


def verify(
    message: str | bytes,
    signature: RingSignature,
    expected_ring: Sequence[PublicKey] | None = None,
) -> bool:
    """Verify the signature and optionally require a trusted ordered ring."""
    try:
        if type(signature) is not RingSignature:
            return False
        signature.validate()
        if expected_ring is not None and tuple(expected_ring) != signature.public_keys:
            return False
        cipher = WideFeistel.for_message(_message(message), signature.bits)
        ys = [
            extended_map(x, public_key, signature.bits)
            for x, public_key in zip(signature.responses, signature.public_keys)
        ]
        return combine(cipher, signature.glue, ys) == signature.glue
    except (TypeError, ValueError, AttributeError, OverflowError):
        return False


def rsa_verify(
    message: str | bytes,
    signature: RingSignature,
    expected_ring: Sequence[RSAPublicKey] | None = None,
) -> bool:
    return (
        type(signature) is RingSignature
        and signature.scheme == "rsa"
        and verify(message, signature, expected_ring)
    )


if __name__ == "__main__":
    keys = [generate_rsa_key(2048) for _ in range(3)]
    ring = tuple(key.public_key for key in keys)
    message = "这是一条匿名签名消息"

    for signer_index, key in enumerate(keys):
        signature = rsa_sign(message, ring, signer_index, key)
        valid = rsa_verify(message, signature, expected_ring=ring)
        changed_message_rejected = not rsa_verify(message + "已修改", signature, ring)

        changed_xs = list(signature.responses)
        changed_xs[0] ^= 1 << (signature.bits - 1)
        changed_response_rejected = not rsa_verify(
            message,
            replace(signature, responses=tuple(changed_xs)),
            ring,
        )

        assert valid and changed_message_rejected and changed_response_rejected
        print(
            "signer_index:", signer_index,
            "valid:", valid,
            "changed_message_rejected:", changed_message_rejected,
            "changed_response_rejected:", changed_response_rejected,
        )

    print("RSA demo passed. No private information is included in the signature.")
