from charm.toolbox.pairinggroup import PairingGroup, ZR, G1, pair
from hashlib import shake_256


def xor_bytes(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))


class BonehFranklinIBE:
    def __init__(self, curve="SS512"):
        self.group = PairingGroup(curve)

    def kdf(self, gt_element, length: int) -> bytes:
        """
        H : GT -> {0,1}^n
        用 SHAKE256 将配对群元素映射成指定长度的字节串。
        """
        data = self.group.serialize(gt_element)
        return shake_256(data).digest(length)

    def map_to_point(self, identity: str):
        """
        MapToPoint_G(ID)
        在 Charm 中可以直接将身份哈希到 G1。
        """
        return self.group.hash(identity, G1)

    def setup(self):
        """
        Setup:
        生成系统参数 params 和主密钥 master_key。
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
        C = <U, V> = <rP, M xor H(g_ID^r)>
        """
        P = params["P"]
        Ppub = params["Ppub"]

        Q_ID = self.map_to_point(identity)

        r = self.group.random(ZR)

        U = P ** r

        g_ID = pair(Q_ID, Ppub)
        K = g_ID ** r

        pad = self.kdf(K, len(message))
        V = xor_bytes(message, pad)

        ciphertext = {
            "U": U,
            "V": V
        }

        return ciphertext

    def decrypt(self, private_key, ciphertext):
        """
        Decrypt:
        M = V xor H(e(d_ID, U))
        """
        U = ciphertext["U"]
        V = ciphertext["V"]

        K = pair(private_key, U)

        pad = self.kdf(K, len(V))
        message = xor_bytes(V, pad)

        return message


if __name__ == "__main__":
    ibe = BonehFranklinIBE()

    params, master_key = ibe.setup()

    identity = "alice@example.com"
    message = b"This is an implementation of Identity-Based Encryption!"

    private_key = ibe.extract(master_key, identity)

    ciphertext = ibe.encrypt(params, identity, message)

    decrypted = ibe.decrypt(private_key, ciphertext)

    print("Original message: ", message)
    print("Decrypted message:", decrypted)
    print("Success:", message == decrypted)
