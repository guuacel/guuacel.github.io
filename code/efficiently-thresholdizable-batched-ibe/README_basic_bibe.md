# 基础 BIBE 与批量解密说明

对应实现文件：[basic_bibe.py](./basic_bibe.py)

本文件实现论文中的基础 Batched IBE 构造，并把同一构造上的批量解密接口放在一起。该构造把 identity 编码为 digest 多项式的根。

## 记号

Charm 中使用乘法群表示群运算。为贴近论文，下面仍使用论文中的指数记号：

$$
[x]_1 = g_1^x \in G_1,\qquad [x]_2 = g_2^x \in G_2
$$

pairing 记为：

$$
e:G_2\times G_1\rightarrow G_T
$$

实现中的 `e(g2_elem, g1_elem)` 内部调用 Charm 的 `pair(g1_elem, g2_elem)`。

## Setup

输入安全参数和最大批大小：

$$
(1^\lambda,1^B)
$$

生成双线性群：

$$
(G_1,G_2,G_T,p,e)
$$

其中 \(p\) 是群阶。设置：

$$
\mathcal M = G_T
$$

identity 空间为：

$$
\mathcal I = \mathbb Z_p
$$

batch label 空间为：

$$
\mathcal T = \{0,1\}^\lambda
$$

并使用哈希函数：

$$
H:\mathcal T\rightarrow G_1
$$

代码入口：

```python
bibe = BasicBIBE(curve="MNT224", max_batch=8)
```

## KeyGen

随机采样：

$$
msk\leftarrow \mathbb Z_p,\qquad \tau\leftarrow \mathbb Z_p
$$

输出主密钥：

$$
msk
$$

以及公钥：

$$
pk=\left([\tau^0]_1,[\tau^1]_1,\ldots,[\tau^B]_1,[\tau]_2,[msk]_2\right)
$$

代码入口：

```python
msk, pk = bibe.keygen()
```

## Encrypt

输入：

$$
(pk,m,id,t)
$$

其中：

$$
m\in G_T,\qquad id\in\mathbb Z_p,\qquad t\in\mathcal T
$$

构造矩阵：

$$
A=
\begin{pmatrix}
[1]_2 & [id]_2-[\tau]_2 & 0\\
[msk]_2 & 0 & -[1]_2
\end{pmatrix}
$$

构造向量：

$$
b=
\begin{pmatrix}
[0]_T\\
-e([msk]_2,H(t))
\end{pmatrix}
$$

采样：

$$
r=(r_1,r_2)\leftarrow \mathbb Z_p^2
$$

输出密文：

$$
c=(c_1,c_2)=(r^TA,\ r^Tb+m)
$$

代码入口：

```python
ct = bibe.encrypt(pk, message, identity, batch_label)
```

## Digest

输入授权 identity 集合：

$$
S=\{id_1,\ldots,id_B\}
$$

构造以这些 identity 为根的多项式：

$$
f(X)=\prod_{i=1}^{B}(X-id_i)=\sum_{i=0}^{B} f_iX^i
$$

输出 KZG digest：

$$
d=[f(\tau)]_1=\sum_{i=0}^{B} f_i[\tau^i]_1
$$

代码入口：

```python
digest = bibe.digest(pk, identities)
```

## ComputeKey

输入：

$$
(msk,d,t)
$$

输出批量解密密钥：

$$
sk=msk\cdot(d+H(t))
$$

在 Charm 的乘法群实现中，对应：

$$
sk=(d\cdot H(t))^{msk}
$$

代码入口：

```python
batch_key = bibe.compute_key(msk, digest, batch_label)
```

## Decrypt

输入：

$$
(c,sk,d,S,id,t)
$$

对当前 identity \(id\in S\)，构造商多项式：

$$
q(X)=\prod_{id_j\in S\setminus\{id\}}(X-id_j)
$$

生成 opening proof：

$$
\pi=[q(\tau)]_1
$$

构造 witness：

$$
w=
\begin{pmatrix}
d\\
\pi\\
sk
\end{pmatrix}
$$

解析密文：

$$
c=(c_1,c_2)
$$

输出：

$$
m=c_2-c_1\circ w
$$

在 Charm 的乘法群实现中，对应：

$$
m=\frac{c_2}{e(c_{1,1},d)\cdot e(c_{1,2},\pi)\cdot e(c_{1,3},sk)}
$$

代码入口：

```python
message = bibe.decrypt(pk, ct, batch_key, digest, identities, identity, batch_label)
```

## BatchDecrypt

批量解密接口输入一批密文：

$$
\{(id_i,c_i)\}_{i=1}^{B}
$$

对每个密文调用基础 `Decrypt`：

$$
m_i=Decrypt(c_i,sk,d,S,id_i,t)
$$

输出：

$$
\{m_1,\ldots,m_B\}
$$

代码入口：

```python
messages = batch_decrypt(bibe, pk, ciphertexts, batch_key, digest, identities, batch_label)
```

当前实现为了清晰性逐个计算 opening，没有实现论文引用的快速 KZG 批量 opening。

## 运行

```powershell
python .\bibe_reference\basic_bibe.py
```

