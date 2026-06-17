# 求值点 BIBE 说明

对应实现文件：[evaluation_point_bibe.py](./evaluation_point_bibe.py)

本文件实现论文第 6.5 节中的替代 BIBE 构造。该构造把 identity 编码为多项式的求值点，而不是多项式的根，用来同时支持不可篡改性和快速批量解密。

## 核心变化

基础 BIBE 中，identity 是单个值：

$$
id\in\mathbb Z_p
$$

digest 多项式满足：

$$
f(id_i)=0
$$

求值点 BIBE 中，identity 变成二元组：

$$
id=(id_x,id_y)
$$

digest 多项式满足：

$$
f(id_x)=id_y
$$

其中：

$$
id_x\in\mathcal I_1,\qquad id_y\in\mathcal I_2
$$

## Setup

输入：

$$
(1^\lambda,1^B)
$$

生成双线性群：

$$
(G_1,G_2,G_T,p,e)
$$

设置消息空间：

$$
\mathcal M=G_T
$$

identity 空间：

$$
\mathcal I=\mathcal I_1\times\mathcal I_2
$$

其中 \(\mathcal I_1\) 是大小为 \(B\) 的 \(B\) 阶单位根集合：

$$
\mathcal I_1=\Omega_B\subseteq\mathbb Z_p
$$

并且：

$$
\mathcal I_2=\mathbb Z_p
$$

batch label 空间为：

$$
\mathcal T=\{0,1\}^\lambda
$$

哈希函数为：

$$
H:\mathcal T\rightarrow G_1
$$

实现注意：要构造 \(B\) 阶单位根集合，需要标量域阶 \(q\) 满足：

$$
B\mid(q-1)
$$

如果当前 Charm 曲线不满足该条件，演示会自动选择一个支持的较小 \(B\)。

代码入口：

```python
bibe = EvaluationPointBIBE(curve="MNT224", max_batch=8)
```

## KeyGen

随机采样：

$$
msk\leftarrow\mathbb Z_p,\qquad \tau\leftarrow\mathbb Z_p
$$

输出主密钥：

$$
msk
$$

以及公钥：

$$
pk=\left([\tau^0]_1,[\tau^1]_1,\ldots,[\tau^{B-1}]_1,[\tau]_2,[msk]_2\right)
$$

注意这里 powers-of-tau 到 \(B-1\) 即可，因为 digest 多项式次数最多为 \(B-1\)。

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
m\in G_T,\qquad id=(id_x,id_y)
$$

构造矩阵：

$$
A=
\begin{pmatrix}
[1]_2 & [id_x]_2-[\tau]_2 & 0\\
[msk]_2 & 0 & -[1]_2
\end{pmatrix}
$$

构造向量：

$$
b=
\begin{pmatrix}
e([1]_2,[id_y]_1)\\
-e([msk]_2,H(t))
\end{pmatrix}
$$

采样：

$$
r=(r_1,r_2)\leftarrow\mathbb Z_p^2
$$

输出：

$$
c=(c_1,c_2)=(r^TA,\ r^Tb+m)
$$

代码入口：

```python
ct = bibe.encrypt(pk, message, identity, batch_label)
```

## Digest

输入：

$$
\{id_1,\ldots,id_B\}
$$

每个 identity 写成：

$$
id_i=(x_i,y_i)
$$

构造次数至多 \(B-1\) 的插值多项式：

$$
f(X)=\sum_{i=0}^{B-1}f_iX^i
$$

满足：

$$
f(x_i)=y_i,\qquad i=1,\ldots,B
$$

输出 digest：

$$
d=[f(\tau)]_1=\sum_{i=0}^{B-1}f_i[\tau^i]_1
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

输出：

$$
sk=msk\cdot(d+H(t))
$$

Charm 乘法群实现中对应：

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
(c,sk,d,\{id_1,\ldots,id_B\},id,t)
$$

当前待解密 identity 为：

$$
id=(x,y)
$$

其他 identity 写成：

$$
id_i=(x_i,y_i)
$$

由于 digest 多项式满足：

$$
f(x)=y
$$

因此：

$$
f(X)-y
$$

能被：

$$
X-x
$$

整除。定义商多项式：

$$
q(X)=\frac{f(X)-y}{X-x}
$$

因为：

$$
\deg f\le B-1
$$

所以：

$$
\deg q\le B-2
$$

不需要先显式求出 \(f(X)\)。对每个其他点 \((x_i,y_i)\)，有：

$$
q(x_i)=\frac{f(x_i)-y}{x_i-x}=\frac{y_i-y}{x_i-x}
$$

因此可用以下 \(B-1\) 个点插值得到 \(q(X)\)：

$$
\left(x_i,\frac{y_i-y}{x_i-x}\right),\qquad id_i\ne id
$$

设：

$$
q(X)=\sum_{i=0}^{B-2}q_iX^i
$$

生成 opening proof：

$$
\pi=[q(\tau)]_1=\sum_{i=0}^{B-2}q_i[\tau^i]_1
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

Charm 乘法群实现中对应：

$$
m=\frac{c_2}{e(c_{1,1},d)\cdot e(c_{1,2},\pi)\cdot e(c_{1,3},sk)}
$$

代码入口：

```python
message = bibe.decrypt(pk, ct, batch_key, digest, identities, identity, batch_label)
```

## 为什么这个版本有用

该版本允许把：

$$
id_x\in\Omega_B
$$

用于快速批量 opening，同时把：

$$
id_y=H(vk^{Sign})
$$

用于绑定签名公钥。这样可以兼容批量解密优化和不可篡改性需求。

## 运行

```powershell
python .\bibe_reference\evaluation_point_bibe.py
```

