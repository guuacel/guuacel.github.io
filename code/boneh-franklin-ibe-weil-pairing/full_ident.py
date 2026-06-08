import os
from charm.toolbox.pairinggroup import PairingGroup, ZR, G1, pair
from hashlib import shake_256


def xor_bytes(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))


def encode_bytes(*parts: bytes) -> bytes:
    encoded = b""
    for part in parts:
        encoded += len(part).to_bytes(4, "big") + part
    return encoded


class BonehFranklinFullIdent:
    def __init__(self, curve="SS512", sigma_length: int = 32):
        self.group = PairingGroup(curve)
        self.sigma_length = sigma_length

    def kdf(self, gt_element, length: int) -> bytes:
        """
        H : GT -> {0,1}^n
        用 SHAKE256 将配对群元素映射成指定长度的字节串。
        """
        data = self.group.serialize(gt_element)
        return shake_256(data).digest(length)

    def g1_hash(self, sigma: bytes, length: int) -> bytes:
        """
        G_1 : {0,1}^n -> {0,1}^n
        用于从 sigma 派生加密消息 M 的字节流。
        """
        return shake_256(b"BF-FullIdent-G1" + sigma).digest(length)

    def h1_to_zr(self, sigma: bytes, message: bytes):
        """
        H_1 : {0,1}^n x {0,1}^n -> Z_q
        根据论文，FullIdent 中的 r 由 sigma 和 M 确定。
        """
        seed = b"BF-FullIdent-H1" + encode_bytes(sigma, message)
        digest = shake_256(seed).digest(64)
        return self.group.hash(digest, ZR)

    def map_to_point(self, identity: str):
        """
        MapToPoint_G(ID)
        在 Charm 中可以直接将身份哈希到 G1。
        """
        return self.group.hash(identity, G1)

    def setup(self):
        """
        Setup:
        与 BasicIdent 相同，但 FullIdent 额外使用 H_1 和 G_1。
        """
        P = self.group.random(G1)
        s = self.group.random(ZR)

        Ppub = P ** s

        params = {
            "P": P,
            "Ppub": Ppub
        }

        master_key = s
        return params, master_key

    def extract(self, master_key, identity: str):
        """
        Extract:
        输入身份 ID，输出对应的私钥 d_ID = sQ_ID。
        """
        Q_ID = self.map_to_point(identity)
        d_ID = Q_ID ** master_key
        return d_ID

    def encrypt(self, params, identity: str, message: bytes):
        """
        Encrypt:
        C = <U, V, W> = <rP, sigma xor H(g_ID^r), M xor G_1(sigma)>
        其中 r = H_1(sigma, M)。
        """
        P = params["P"]
        Ppub = params["Ppub"]

        Q_ID = self.map_to_point(identity)

        sigma = os.urandom(self.sigma_length)
        r = self.h1_to_zr(sigma, message)

        U = P ** r

        g_ID = pair(Q_ID, Ppub)
        K = g_ID ** r

        V = xor_bytes(sigma, self.kdf(K, self.sigma_length))
        W = xor_bytes(message, self.g1_hash(sigma, len(message)))

        ciphertext = {
            "U": U,
            "V": V,
            "W": W
        }

        return ciphertext

    def decrypt(self, params, private_key, ciphertext):
        """
        Decrypt:
        先恢复 sigma 和 M，然后重新计算 r 并检查 U = rP。
        """
        P = params["P"]

        U = ciphertext["U"]
        V = ciphertext["V"]
        W = ciphertext["W"]

        K = pair(private_key, U)

        sigma = xor_bytes(V, self.kdf(K, len(V)))
        message = xor_bytes(W, self.g1_hash(sigma, len(W)))

        r = self.h1_to_zr(sigma, message)
        if U != P ** r:
            raise ValueError("invalid ciphertext: U != rP")

        return message


if __name__ == "__main__":
    ibe = BonehFranklinFullIdent()

    params, master_key = ibe.setup()

    identity = "alice@example.com"
    message = b"This is an implementation of FullIdent IBE!"

    private_key = ibe.extract(master_key, identity)

    ciphertext = ibe.encrypt(params, identity, message)

    decrypted = ibe.decrypt(params, private_key, ciphertext)

    print("Original message: ", message)
    print("Decrypted message:", decrypted)
    print("Success:", message == decrypted)

    tampered = dict(ciphertext)
    tampered["W"] = bytes([tampered["W"][0] ^ 1]) + tampered["W"][1:]

    try:
        ibe.decrypt(params, private_key, tampered)
    except ValueError as error:
        print("Tampered ciphertext rejected:", error)
