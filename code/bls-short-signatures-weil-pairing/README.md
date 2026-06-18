# BLS 短签名实现说明

对应实现文件：[bls_signature.py](./bls_signature.py)

本文档实现 Boneh、Lynn 和 Shacham 在论文 *Short Signatures from the Weil Pairing* 中提出的 BLS 短签名方案。实现使用 Charm-Crypto 的 `PairingGroup` 和双线性配对接口，采用常见的非对称配对写法：签名位于 \(G_1\)，公钥位于 \(G_2\)。

## 论文信息

- 论文：*Short Signatures from the Weil Pairing*
- 作者：Dan Boneh, Ben Lynn, Hovav Shacham
- 会议：ASIACRYPT 2001
- LNCS：2248
- 页码：514-532
- DOI：`10.1007/3-540-45682-1_30`

## 记号

设有素数阶双线性群：

$$
G_1,\quad G_2,\quad G_T
$$

群阶为：

$$
p
$$

双线性映射为：

$$
e:G_1\times G_2\rightarrow G_T
$$

满足双线性：

$$
e(aP,bQ)=e(P,Q)^{ab}
$$

实现中使用 Charm 的：

```python
pair(g1_elem, g2_elem)
```

## Setup

生成双线性群，并随机选择生成元：

$$
g_1\in G_1,\qquad g_2\in G_2
$$

消息哈希函数为：

$$
H:\{0,1\}^{*}\rightarrow G_1
$$

代码入口：

```python
bls = BLSSignature(curve="MNT224")
```

实现中使用：

```python
self.group.hash(("BLS-H", message), G1)
```

把消息映射到 \(G_1\)。标签 `"BLS-H"` 用于做域分离，避免和其他用途的哈希混用。

## KeyGen

随机采样私钥：

$$
x\leftarrow \mathbb Z_p
$$

计算公钥：

$$
pk=g_2^x
$$

代码入口：

```python
secret_key, public_key = bls.keygen()
```

## Sign

输入私钥 \(x\) 和消息 \(m\)，先计算：

$$
h=H(m)\in G_1
$$

签名为：

$$
\sigma=h^x=H(m)^x
$$

代码入口：

```python
signature = bls.sign(secret_key, message)
```

## Verify

验证者检查配对等式：

$$
e(\sigma,g_2)\stackrel{?}{=}e(H(m),pk)
$$

因为：

$$
e(\sigma,g_2)=e(H(m)^x,g_2)=e(H(m),g_2)^x
$$

并且：

$$
e(H(m),pk)=e(H(m),g_2^x)=e(H(m),g_2)^x
$$

所以合法签名会通过验证。

代码入口：

```python
ok = bls.verify(public_key, message, signature)
```

## 不同消息聚合签名

对多个签名：

$$
\sigma_i=H(m_i)^{x_i}
$$

聚合签名为：

$$
\sigma=\prod_i\sigma_i
$$

验证等式为：

$$
e(\sigma,g_2)\stackrel{?}{=}\prod_i e(H(m_i),pk_i)
$$

代码入口：

```python
aggregate = bls.aggregate_signatures(signatures)
ok = bls.aggregate_verify_distinct_messages(public_keys, messages, aggregate)
```

## 同消息快速聚合验证

当多个签名者签同一个消息 \(m\) 时，可以先聚合公钥：

$$
pk=\prod_i pk_i
$$

聚合签名仍为：

$$
\sigma=\prod_i\sigma_i
$$

验证等式为：

$$
e(\sigma,g_2)\stackrel{?}{=}e(H(m),\prod_i pk_i)
$$

代码入口：

```python
ok = bls.fast_aggregate_verify_same_message(public_keys, message, aggregate)
```

注意：同消息快速聚合在实际系统中通常还需要 proof-of-possession 或其他防 rogue-key 攻击机制。本演示聚焦 BLS 签名核心结构，没有实现 proof-of-possession。

## 运行

在安装 Charm-Crypto 的环境中运行：

```powershell
python .\code\bls-short-signatures-weil-pairing\bls_signature.py
```

输出会演示：

- 单个 BLS 签名生成与验证
- 篡改消息验证失败
- 不同消息聚合签名验证
- 同消息快速聚合验证
