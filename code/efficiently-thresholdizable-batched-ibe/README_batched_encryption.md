# 带签名批量加密 BE 说明

对应实现文件：[batched_encryption.py](./batched_encryption.py)

本文件实现论文中由 Batched IBE、哈希和签名组成的 Batched Encryption 包装。它的目的不是替代基础 BIBE，而是把显式 identity 隐藏在签名公钥之后，并防止攻击者篡改密文。

## 高层结构

该构造可以概括为：

$$
BE = BIBE + H + Sign
$$

其中：

- `BIBE` 使用 [basic_bibe.py](./basic_bibe.py) 中的基础构造。
- `H` 把签名公钥映射到 BIBE identity。
- `Sign` 用于绑定签名公钥和具体 BIBE 密文。

## Setup

执行底层 BIBE 的 setup：

$$
params_{BIBE}\leftarrow BIBE.Setup(1^\lambda,1^B)
$$

并确定哈希函数：

$$
H:\{0,1\}^\ast\rightarrow \mathbb Z_p
$$

代码入口：

```python
scheme = BatchedEncryption(curve="MNT224", max_batch=8)
```

## KeyGen

执行底层 BIBE 的 KeyGen：

$$
(msk_{BIBE},pk_{BIBE})\leftarrow BIBE.KeyGen(params)
$$

BE 的密钥为：

$$
sk_{BE}=msk_{BIBE}
$$

$$
pk_{BE}=pk_{BIBE}
$$

代码入口：

```python
msk, pk = scheme.keygen()
```

## Encrypt

输入：

$$
(pk_{BE},t,m)
$$

其中：

$$
m\in G_T
$$

首先生成一次性签名密钥对：

$$
(sk^{Sign},vk^{Sign})\leftarrow Sign.KeyGen()
$$

把签名公钥哈希为 BIBE identity：

$$
id=H(vk^{Sign})
$$

调用底层 BIBE 加密：

$$
ct^{BIBE}=BIBE.Encrypt(pk_{BE},m,id,t)
$$

然后对 BIBE 密文签名：

$$
\sigma=Sign(sk^{Sign},ct^{BIBE})
$$

输出扩展密文：

$$
ct^{BE}=(vk^{Sign},ct^{BIBE},\sigma)
$$

代码入口：

```python
ct_be = scheme.encrypt(pk, message, batch_label)
```

如果加密多条消息，则每条消息生成一个独立扩展密文：

$$
\{ct_1^{BE},\ldots,ct_B^{BE}\}
$$

每个扩展密文通常有不同的：

$$
vk_i^{Sign}
$$

因此也有不同的：

$$
id_i=H(vk_i^{Sign})
$$

## Decrypt

输入：

$$
(sk_{BE},\{ct_1^{BE},\ldots,ct_B^{BE}\},t)
$$

每个扩展密文解析为：

$$
ct_i^{BE}=(vk_i^{Sign},ct_i^{BIBE},\sigma_i)
$$

先验证签名：

$$
Verify(vk_i^{Sign},ct_i^{BIBE},\sigma_i)=1
$$

若验证失败，输出：

$$
m_i=\bot
$$

若验证成功，则计算：

$$
id_i=H(vk_i^{Sign})
$$

并把 \(id_i\) 加入合法 identity 集合：

$$
S=\{id_i:Verify(vk_i^{Sign},ct_i^{BIBE},\sigma_i)=1\}
$$

然后计算 digest：

$$
d=BIBE.Digest(pk_{BE},S)
$$

计算底层 BIBE 批量密钥：

$$
sk_{BIBE}=BIBE.ComputeKey(sk_{BE},d,t)
$$

最后对每个签名有效的密文调用底层 BIBE 解密：

$$
m_i=BIBE.Decrypt(ct_i^{BIBE},sk_{BIBE},d,S,id_i,t)
$$

输出：

$$
\{m_1,\ldots,m_B\}
$$

代码入口：

```python
messages = scheme.decrypt(msk, pk, ciphertexts, batch_label)
```

## 为什么需要签名

如果只提交：

$$
(id,ct)
$$

攻击者可以尝试复用同一个 identity 并构造相关密文：

$$
(id,\widetilde{ct})
$$

一旦该 identity 被纳入授权集合，篡改密文也可能被解密。BE 包装通过：

$$
id=H(vk^{Sign})
$$

和：

$$
\sigma=Sign(sk^{Sign},ct^{BIBE})
$$

把 identity 与具体密文绑定起来。攻击者若想保持同一 identity 并替换密文，就必须在不知道 \(sk^{Sign}\) 的情况下伪造签名。

## 运行

```powershell
python .\bibe_reference\batched_encryption.py
```

