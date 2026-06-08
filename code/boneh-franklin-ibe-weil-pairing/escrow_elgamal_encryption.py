from charm.toolbox.pairinggroup import PairingGroup, ZR, G1, pair
from hashlib import shake_256


def xor_bytes(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))


class EscrowElGamalEncryption:
    def __init__(self, curve="SS512"):
        self.group = PairingGroup(curve)

    def kdf(self, gt_element, length: int) -> bytes:
        """
        H : GT -> {0,1}^n
        用 SHAKE256 将配对群元素映射成指定长度的字节串。
        """
        data = self.group.serialize(gt_element)
        return shake_256(data).digest(length)

    def setup(self):
        """
        Setup:
        生成系统参数 params 和全局托管密钥 escrow_key。
        论文记号为 Q = sP；Charm 中写作 Q = P ** s。
        """
        P = self.group.random(G1)
        s = self.group.random(ZR)

        Q = P ** s

        params = {
            "P": P,
            "Q": Q
        }

        escrow_key = s
        return params, escrow_key

    def keygen(self, params):
        """
        KeyGen:
        用户生成自己的 ElGamal 公私钥对。
        """
        P = params["P"]

        x = self.group.random(ZR)
        Ppub = P ** x

        public_key = Ppub
        private_key = x
        return public_key, private_key

    def encrypt(self, params, public_key, message: bytes):
        """
        Encrypt:
        C = <U, V> = <rP, M xor H(g^r)>
        其中 g = e(Ppub, Q)。
        """
        P = params["P"]
        Q = params["Q"]

        r = self.group.random(ZR)

        U = P ** r

        g = pair(public_key, Q)
        K = g ** r

        pad = self.kdf(K, len(message))
        V = xor_bytes(message, pad)

        ciphertext = {
            "U": U,
            "V": V
        }

        return ciphertext

    def decrypt(self, params, private_key, ciphertext):
        """
        Decrypt:
        用户使用私钥 x 计算 M = V xor H(e(U, xQ))。
        Charm 中 xQ 写作 Q ** x。
        """
        Q = params["Q"]

        U = ciphertext["U"]
        V = ciphertext["V"]

        K = pair(U, Q ** private_key)

        pad = self.kdf(K, len(V))
        message = xor_bytes(V, pad)

        return message

    def escrow_decrypt(self, public_key, escrow_key, ciphertext):
        """
        Escrow-decrypt:
        托管方使用全局托管密钥 s 计算 M = V xor H(e(U, sPpub))。
        Charm 中 sPpub 写作 Ppub ** s。
        """
        U = ciphertext["U"]
        V = ciphertext["V"]

        K = pair(U, public_key ** escrow_key)

        pad = self.kdf(K, len(V))
        message = xor_bytes(V, pad)

        return message


if __name__ == "__main__":
    scheme = EscrowElGamalEncryption()

    params, escrow_key = scheme.setup()

    public_key, private_key = scheme.keygen(params)

    message = b"This is an implementation of Escrow ElGamal Encryption!"

    ciphertext = scheme.encrypt(params, public_key, message)

    decrypted_by_user = scheme.decrypt(params, private_key, ciphertext)
    decrypted_by_escrow = scheme.escrow_decrypt(public_key, escrow_key, ciphertext)

    print("Original message:     ", message)
    print("User decrypt:         ", decrypted_by_user)
    print("Escrow decrypt:       ", decrypted_by_escrow)
    print("User success:         ", message == decrypted_by_user)
    print("Escrow success:       ", message == decrypted_by_escrow)
