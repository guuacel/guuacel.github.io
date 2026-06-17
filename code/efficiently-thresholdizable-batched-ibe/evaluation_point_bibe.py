from __future__ import annotations

from dataclasses import dataclass
import math
import secrets
from typing import Any, List, Sequence, Tuple

from basic_bibe import (
    Ciphertext,
    G1,
    G2,
    GT,
    PairingGroup,
    ZR,
    dot_pair,
    e,
    interpolate,
    prod,
    require_charm,
    short,
    timed,
    zr_one,
    zr_zero,
)


@dataclass(frozen=True)
class PublicKey:
    group: Any
    g1: Any
    g2: Any
    max_batch: int
    tau_g1_powers: Tuple[Any, ...]
    tau_g2: Any
    msk_g2: Any
    i1_roots: Tuple[Any, ...]


@dataclass(frozen=True)
class MasterSecretKey:
    group: Any
    msk: Any
    tau: Any


class EvaluationPointBIBE:
    """求值点 BIBE：identity=(id_x,id_y)，并满足 f(id_x)=id_y。"""

    def __init__(self, curve: str = "MNT224", max_batch: int = 8):
        require_charm()
        self.group = PairingGroup(curve)
        self.curve = curve
        self.max_batch = max_batch
        self.g1 = self.group.random(G1)
        self.g2 = self.group.random(G2)

    def hash_t(self, t: Any) -> Any:
        return self.group.hash(("batch-label", t), G1)

    def roots_of_unity(self) -> Tuple[Any, ...]:
        order = int(self.group.order())
        if (order - 1) % self.max_batch != 0:
            raise ValueError("当前曲线标量域不支持该大小的单位根集合")
        exponent = (order - 1) // self.max_batch
        factors = prime_factors(self.max_batch)
        while True:
            candidate = secrets.randbelow(order - 2) + 2
            root_int = pow(candidate, exponent, order)
            if root_int == 1:
                continue
            if pow(root_int, self.max_batch, order) != 1:
                continue
            if any(pow(root_int, self.max_batch // factor, order) == 1 for factor in factors):
                continue
            return tuple(self.group.init(ZR, pow(root_int, i, order)) for i in range(self.max_batch))

    def keygen(self) -> Tuple[MasterSecretKey, PublicKey]:
        msk = self.group.random(ZR)
        tau = self.group.random(ZR)
        powers = []
        current = zr_one(self.group)
        for _ in range(self.max_batch):
            powers.append(self.g1 ** current)
            current *= tau
        pk = PublicKey(
            group=self.group,
            g1=self.g1,
            g2=self.g2,
            max_batch=self.max_batch,
            tau_g1_powers=tuple(powers),
            tau_g2=self.g2 ** tau,
            msk_g2=self.g2 ** msk,
            i1_roots=self.roots_of_unity(),
        )
        return MasterSecretKey(self.group, msk, tau), pk

    def random_message(self) -> Any:
        return self.group.random(GT)

    def random_identity(self, pk: PublicKey, index: int, label: Any) -> Tuple[Any, Any]:
        return pk.i1_roots[index], self.group.hash(("identity-y", label), ZR)

    def encrypt(self, pk: PublicKey, message: Any, identity: Tuple[Any, Any], batch_label: Any) -> Ciphertext:
        group = pk.group
        id_x, id_y = identity
        r1 = group.random(ZR)
        r2 = group.random(ZR)
        a0 = (pk.g2, (pk.g2 ** id_x) / pk.tau_g2, pk.g2 ** zr_zero(group))
        a1 = (pk.msk_g2, pk.g2 ** zr_zero(group), pk.g2 ** -zr_one(group))
        b0 = e(pk.g2, pk.g1 ** id_y)
        b1 = e(pk.msk_g2, self.hash_t(batch_label)) ** -zr_one(group)
        c1 = tuple((a0[j] ** r1) * (a1[j] ** r2) for j in range(3))
        c2 = (b0 ** r1) * (b1 ** r2) * message
        return Ciphertext(c1, c2)

    def digest(self, pk: PublicKey, identities: Sequence[Tuple[Any, Any]]) -> Any:
        if len(identities) > pk.max_batch:
            raise ValueError("identity 数量超过 setup 支持的最大批大小")
        polynomial = interpolate(pk.group, identities)
        terms = [pk.tau_g1_powers[i] ** coeff for i, coeff in enumerate(polynomial)]
        return prod(pk.group, terms, G1)

    def compute_key(self, msk: MasterSecretKey, digest: Any, batch_label: Any) -> Any:
        return (digest * self.hash_t(batch_label)) ** msk.msk

    def opening_for_identity(self, pk: PublicKey, identities: Sequence[Tuple[Any, Any]], identity: Tuple[Any, Any]) -> Any:
        id_x, id_y = identity
        points = []
        seen_target = False
        for x_i, y_i in identities:
            if x_i == id_x and y_i == id_y:
                seen_target = True
                continue
            points.append((x_i, (y_i - id_y) / (x_i - id_x)))
        if not seen_target:
            raise ValueError("待解密 identity 不在授权集合中")
        q = interpolate(pk.group, points)
        terms = [pk.tau_g1_powers[i] ** coeff for i, coeff in enumerate(q)]
        return prod(pk.group, terms, G1)

    def decrypt(
        self,
        pk: PublicKey,
        ciphertext: Ciphertext,
        batch_key: Any,
        digest: Any,
        identities: Sequence[Tuple[Any, Any]],
        identity: Tuple[Any, Any],
        batch_label: Any,
    ) -> Any:
        del batch_label
        opening = self.opening_for_identity(pk, identities, identity)
        witness = (digest, opening, batch_key)
        return ciphertext.c2 / dot_pair(pk.group, ciphertext.c1, witness)


def prime_factors(n: int) -> List[int]:
    factors = []
    divisor = 2
    while divisor * divisor <= n:
        if n % divisor == 0:
            factors.append(divisor)
            while n % divisor == 0:
                n //= divisor
        divisor += 1
    if n > 1:
        factors.append(n)
    return factors


def supported_batch_size(order: int, preferred: int) -> int:
    for candidate in range(preferred, 1, -1):
        if (order - 1) % candidate == 0:
            return candidate
    return 1


def demo() -> None:
    print("========== 求值点 BIBE 演示 ==========")
    curve = "MNT224"
    preferred_batch = 8
    require_charm()
    order = int(PairingGroup(curve).order())
    batch_size = supported_batch_size(order, preferred_batch)
    if batch_size != preferred_batch:
        print(
            f"当前曲线 {curve} 的标量域阶 q 不满足 {preferred_batch} | (q-1)，"
            f"无法构造 {preferred_batch} 阶单位根集合；演示自动改用 B={batch_size}。"
        )

    bibe = timed("-----setup-----\n", lambda: EvaluationPointBIBE(curve=curve, max_batch=batch_size))
    print(f"公共参数为：curve={bibe.curve}, 最大批大小 B={bibe.max_batch}, 消息空间 M=G_T")

    msk, pk = timed("-----keygen-----\n", bibe.keygen)
    print(f"公钥：tau powers 前两项=({short(pk.tau_g1_powers[0])}, {short(pk.tau_g1_powers[1])}), [tau]_2={short(pk.tau_g2)}, [msk]_2={short(pk.msk_g2)}")
    print(f"私钥：msk={short(msk.msk)}, tau={short(msk.tau)}")

    batch_label = "factory-domain-line-lot-window"
    demo_count = min(4, bibe.max_batch)
    identities = [bibe.random_identity(pk, i, f"device-{i}") for i in range(demo_count)]
    messages = [bibe.random_message() for _ in identities]

    print("-----encrypt-----")
    ciphertexts = timed("加密", lambda: [(identity, bibe.encrypt(pk, message, identity, batch_label)) for identity, message in zip(identities, messages)])
    print(f"identity 数量：{len(identities)}")
    print(f"第一个密文：c1={short(ciphertexts[0][1].c1)}, c2={short(ciphertexts[0][1].c2)}")

    print("-----digest-----")
    digest = timed("摘要计算", lambda: bibe.digest(pk, identities))
    print(f"d={short(digest)}")

    print("-----compute key-----")
    batch_key = timed("密钥计算", lambda: bibe.compute_key(msk, digest, batch_label))
    print(f"批量解密密钥：{short(batch_key)}")

    print("-----decrypt-----")
    recovered = timed("解密", lambda: [bibe.decrypt(pk, ct, batch_key, digest, identities, identity, batch_label) for identity, ct in ciphertexts])
    print(f"批量解密是否正确：{recovered == messages}")


if __name__ == "__main__":
    try:
        demo()
    except RuntimeError as exc:
        print(exc)
