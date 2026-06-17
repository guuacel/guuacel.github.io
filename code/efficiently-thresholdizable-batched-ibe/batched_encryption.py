from __future__ import annotations

from dataclasses import dataclass
from typing import Any, List, Optional, Sequence, Tuple

from basic_bibe import BasicBIBE, Ciphertext, MasterSecretKey, PublicKey, G1, ZR, short, timed, zr_one, zr_zero


@dataclass(frozen=True)
class SigningKeyPair:
    sk: Any
    vk: Any


@dataclass(frozen=True)
class Signature:
    r: Any
    s: Any


@dataclass(frozen=True)
class BECiphertext:
    vk_sign: Any
    ct_bibe: Ciphertext
    sigma: Signature


class SchnorrSignature:
    """用于演示的 Schnorr 风格签名，绑定 vk_sign 与 BIBE 密文。"""

    def __init__(self, group: Any, g1: Any):
        self.group = group
        self.g1 = g1

    def keygen(self) -> SigningKeyPair:
        sk = self.group.random(ZR)
        return SigningKeyPair(sk=sk, vk=self.g1 ** sk)

    def challenge(self, r: Any, vk: Any, message: Any) -> Any:
        return self.group.hash(("signature", str(r), str(vk), str(message)), ZR)

    def sign(self, sk: Any, vk: Any, message: Any) -> Signature:
        nonce = self.group.random(ZR)
        r = self.g1 ** nonce
        e = self.challenge(r, vk, message)
        return Signature(r=r, s=nonce + e * sk)

    def verify(self, vk: Any, message: Any, sigma: Signature) -> bool:
        e = self.challenge(sigma.r, vk, message)
        return self.g1 ** sigma.s == sigma.r * (vk ** e)


class BatchedEncryption:
    """带签名的批量加密包装：BE = BIBE + Hash + Signature。"""

    def __init__(self, curve: str = "MNT224", max_batch: int = 8):
        self.bibe = BasicBIBE(curve=curve, max_batch=max_batch)
        self.signer = SchnorrSignature(self.bibe.group, self.bibe.g1)

    def keygen(self) -> Tuple[MasterSecretKey, PublicKey]:
        return self.bibe.keygen()

    def identity_from_vk(self, vk: Any) -> Any:
        return self.bibe.group.hash(("identity-from-vk", str(vk)), ZR)

    def encrypt(self, pk: PublicKey, message: Any, batch_label: Any) -> BECiphertext:
        sign_keys = self.signer.keygen()
        identity = self.identity_from_vk(sign_keys.vk)
        ct_bibe = self.bibe.encrypt(pk, message, identity, batch_label)
        sigma = self.signer.sign(sign_keys.sk, sign_keys.vk, ct_bibe)
        return BECiphertext(vk_sign=sign_keys.vk, ct_bibe=ct_bibe, sigma=sigma)

    def decrypt(self, msk: MasterSecretKey, pk: PublicKey, ciphertexts: Sequence[BECiphertext], batch_label: Any) -> List[Optional[Any]]:
        identities = []
        valid_items = []
        output: List[Optional[Any]] = [None] * len(ciphertexts)

        for index, ciphertext in enumerate(ciphertexts):
            if self.signer.verify(ciphertext.vk_sign, ciphertext.ct_bibe, ciphertext.sigma):
                identity = self.identity_from_vk(ciphertext.vk_sign)
                identities.append(identity)
                valid_items.append((index, identity, ciphertext.ct_bibe))

        digest = self.bibe.digest(pk, identities)
        batch_key = self.bibe.compute_key(msk, digest, batch_label)

        for index, identity, ct_bibe in valid_items:
            output[index] = self.bibe.decrypt(pk, ct_bibe, batch_key, digest, identities, identity, batch_label)
        return output


def demo() -> None:
    print("========== 带签名批量加密演示 ==========")
    scheme = timed("-----setup-----\n", lambda: BatchedEncryption(max_batch=8))
    print(f"公共参数为：curve={scheme.bibe.curve}, 最大批大小 B={scheme.bibe.max_batch}, 消息空间 M=G_T")

    msk, pk = timed("-----keygen-----\n", scheme.keygen)
    print(f"公钥：[tau]_2={short(pk.tau_g2)}, [msk]_2={short(pk.msk_g2)}")
    print(f"私钥：msk={short(msk.msk)}, tau={short(msk.tau)}")

    batch_label = "factory-domain-line-lot-window"
    messages = [scheme.bibe.random_message() for _ in range(3)]

    print("-----encrypt-----")
    ciphertexts = timed("加密", lambda: [scheme.encrypt(pk, message, batch_label) for message in messages])
    print(f"扩展密文数量：{len(ciphertexts)}")
    for index, ciphertext in enumerate(ciphertexts, start=1):
        print(
            f"扩展密文 {index}："
            f"vk_sign={short(ciphertext.vk_sign)}, "
            f"ct_bibe={short(ciphertext.ct_bibe)}, "
            f"sigma={short(ciphertext.sigma)}"
        )

    print("-----decrypt-----")
    recovered = timed("解密", lambda: scheme.decrypt(msk, pk, ciphertexts, batch_label))
    print(f"批量解密是否正确：{recovered == messages}")


if __name__ == "__main__":
    try:
        demo()
    except RuntimeError as exc:
        print(exc)
