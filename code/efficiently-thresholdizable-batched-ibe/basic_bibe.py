from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Any, Callable, List, Sequence, Tuple

try:
    from charm.toolbox.pairinggroup import PairingGroup, ZR, G1, G2, GT, pair
except ImportError as exc:  # pragma: no cover - depends on local environment
    PairingGroup = None
    ZR = G1 = G2 = GT = None
    pair = None
    _CHARM_IMPORT_ERROR = exc
else:
    _CHARM_IMPORT_ERROR = None


def require_charm() -> None:
    if PairingGroup is None:
        raise RuntimeError(
            "当前 Python 环境未安装 charm-crypto，无法运行真实 Charm pairing 版本。"
            "请先安装 Charm-Crypto 后再执行本文件。"
        ) from _CHARM_IMPORT_ERROR


def timed(label: str, fn: Callable[[], Any]) -> Any:
    start = time.perf_counter()
    value = fn()
    elapsed_ms = (time.perf_counter() - start) * 1000
    print(f"{label}运行时间为：{elapsed_ms:.3f} ms")
    return value


def short(value: Any, limit: int = 96) -> str:
    text = str(value)
    if len(text) > limit:
        return text[:limit] + "..."
    return text


def prod(group: Any, values: Sequence[Any], target: Any) -> Any:
    result = group.init(target, 1)
    for value in values:
        result *= value
    return result


def zr_zero(group: Any) -> Any:
    return group.init(ZR, 0)


def zr_one(group: Any) -> Any:
    return group.init(ZR, 1)


def poly_trim(group: Any, poly: List[Any]) -> List[Any]:
    zero = zr_zero(group)
    while len(poly) > 1 and poly[-1] == zero:
        poly.pop()
    return poly


def poly_mul(group: Any, a: Sequence[Any], b: Sequence[Any]) -> List[Any]:
    out = [zr_zero(group) for _ in range(len(a) + len(b) - 1)]
    for i, ai in enumerate(a):
        for j, bj in enumerate(b):
            out[i + j] += ai * bj
    return poly_trim(group, out)


def poly_from_roots(group: Any, roots: Sequence[Any]) -> List[Any]:
    poly = [zr_one(group)]
    for root in roots:
        poly = poly_mul(group, poly, [-root, zr_one(group)])
    return poly


def interpolate(group: Any, points: Sequence[Tuple[Any, Any]]) -> List[Any]:
    if not points:
        return [zr_zero(group)]

    xs = [point[0] for point in points]
    if len({str(x) for x in xs}) != len(xs):
        raise ValueError("插值点的 x 坐标必须互不相同")

    result = [zr_zero(group)]
    for i, (xi, yi) in enumerate(points):
        basis = [zr_one(group)]
        denom = zr_one(group)
        for j, (xj, _) in enumerate(points):
            if i == j:
                continue
            basis = poly_mul(group, basis, [-xj, zr_one(group)])
            denom *= xi - xj
        scale = yi / denom
        if len(result) < len(basis):
            result.extend(zr_zero(group) for _ in range(len(basis) - len(result)))
        for k, coeff in enumerate(basis):
            result[k] += scale * coeff
    return poly_trim(group, result)


def e(g2_elem: Any, g1_elem: Any) -> Any:
    return pair(g1_elem, g2_elem)


def dot_pair(group: Any, c1: Sequence[Any], witness: Sequence[Any]) -> Any:
    return prod(group, [e(a, b) for a, b in zip(c1, witness)], GT)


@dataclass(frozen=True)
class Ciphertext:
    c1: Tuple[Any, Any, Any]
    c2: Any


@dataclass(frozen=True)
class PublicKey:
    group: Any
    g1: Any
    g2: Any
    max_batch: int
    tau_g1_powers: Tuple[Any, ...]
    tau_g2: Any
    msk_g2: Any


@dataclass(frozen=True)
class MasterSecretKey:
    group: Any
    msk: Any
    tau: Any


class BasicBIBE:
    """基础 BIBE：identity 被编码为 digest 多项式的根。"""

    def __init__(self, curve: str = "MNT224", max_batch: int = 8):
        require_charm()
        self.group = PairingGroup(curve)
        self.curve = curve
        self.max_batch = max_batch
        self.g1 = self.group.random(G1)
        self.g2 = self.group.random(G2)

    def hash_t(self, t: Any) -> Any:
        return self.group.hash(("batch-label", t), G1)

    def keygen(self) -> Tuple[MasterSecretKey, PublicKey]:
        msk = self.group.random(ZR)
        tau = self.group.random(ZR)
        powers = []
        current = zr_one(self.group)
        for _ in range(self.max_batch + 1):
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
        )
        return MasterSecretKey(self.group, msk, tau), pk

    def random_message(self) -> Any:
        return self.group.random(GT)

    def random_identity(self, label: Any) -> Any:
        return self.group.hash(("identity", label), ZR)

    def encrypt(self, pk: PublicKey, message: Any, identity: Any, batch_label: Any) -> Ciphertext:
        group = pk.group
        r1 = group.random(ZR)
        r2 = group.random(ZR)
        a0 = (pk.g2, (pk.g2 ** identity) / pk.tau_g2, pk.g2 ** zr_zero(group))
        a1 = (pk.msk_g2, pk.g2 ** zr_zero(group), pk.g2 ** -zr_one(group))
        b0 = group.init(GT, 1)
        b1 = e(pk.msk_g2, self.hash_t(batch_label)) ** -zr_one(group)
        c1 = tuple((a0[j] ** r1) * (a1[j] ** r2) for j in range(3))
        c2 = (b0 ** r1) * (b1 ** r2) * message
        return Ciphertext(c1, c2)

    def digest(self, pk: PublicKey, identities: Sequence[Any]) -> Any:
        if len(identities) > pk.max_batch:
            raise ValueError("identity 数量超过 setup 支持的最大批大小")
        poly = poly_from_roots(pk.group, identities)
        terms = [pk.tau_g1_powers[i] ** coeff for i, coeff in enumerate(poly)]
        return prod(pk.group, terms, G1)

    def compute_key(self, msk: MasterSecretKey, digest: Any, batch_label: Any) -> Any:
        return (digest * self.hash_t(batch_label)) ** msk.msk

    def opening_for_identity(self, pk: PublicKey, identities: Sequence[Any], identity: Any) -> Any:
        remaining = list(identities)
        for index, candidate in enumerate(remaining):
            if candidate == identity:
                remaining.pop(index)
                break
        else:
            raise ValueError("待解密 identity 不在授权集合中")
        q = poly_from_roots(pk.group, remaining)
        terms = [pk.tau_g1_powers[i] ** coeff for i, coeff in enumerate(q)]
        return prod(pk.group, terms, G1)

    def decrypt(
        self,
        pk: PublicKey,
        ciphertext: Ciphertext,
        batch_key: Any,
        digest: Any,
        identities: Sequence[Any],
        identity: Any,
        batch_label: Any,
    ) -> Any:
        del batch_label
        opening = self.opening_for_identity(pk, identities, identity)
        witness = (digest, opening, batch_key)
        return ciphertext.c2 / dot_pair(pk.group, ciphertext.c1, witness)


def batch_decrypt(
    bibe: BasicBIBE,
    pk: PublicKey,
    ciphertexts: Sequence[Tuple[Any, Ciphertext]],
    batch_key: Any,
    digest: Any,
    identities: Sequence[Any],
    batch_label: Any,
) -> List[Any]:
    """批量解密接口。这里为了清晰性逐个计算 opening，未实现 [23] 的快速 opening。"""
    return [
        bibe.decrypt(pk, ciphertext, batch_key, digest, identities, identity, batch_label)
        for identity, ciphertext in ciphertexts
    ]


def demo() -> None:
    print("========== 基础 BIBE 与批量解密演示 ==========")
    bibe = timed("-----setup-----\n", lambda: BasicBIBE(max_batch=8))
    print(f"公共参数为：curve={bibe.curve}, 最大批大小 B={bibe.max_batch}, 消息空间 M=G_T")

    msk, pk = timed("-----keygen-----\n", bibe.keygen)
    print(f"公钥：tau powers 前两项=({short(pk.tau_g1_powers[0])}, {short(pk.tau_g1_powers[1])}), [tau]_2={short(pk.tau_g2)}, [msk]_2={short(pk.msk_g2)}")
    print(f"私钥：msk={short(msk.msk)}, tau={short(msk.tau)}")

    batch_label = "factory-domain-line-lot-window"
    identities = [bibe.random_identity(f"device-{i}") for i in range(4)]
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
    recovered_one = timed("单个解密", lambda: bibe.decrypt(pk, ciphertexts[0][1], batch_key, digest, identities, ciphertexts[0][0], batch_label))
    print(f"单个解密是否正确：{recovered_one == messages[0]}")

    print("-----batch decrypt-----")
    recovered = timed("批量解密", lambda: batch_decrypt(bibe, pk, ciphertexts, batch_key, digest, identities, batch_label))
    print(f"批量解密是否正确：{recovered == messages}")


if __name__ == "__main__":
    try:
        demo()
    except RuntimeError as exc:
        print(exc)
