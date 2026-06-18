# KZG 多项式承诺实现说明

对应实现文件：[kzg_commitment.py](./kzg_commitment.py)

KZG 是 Kate、Zaverucha 和 Goldberg 提出的常数大小多项式承诺方案，原论文为 *Constant-Size Commitments to Polynomials and Their Applications*。多项式承诺允许承诺者先对一个多项式 \(f(X)\) 做短承诺，之后在任意点 \(z\) 打开并证明 \(f(z)=y\)，验证者只需要检查一个配对等式。

## 论文信息

- 论文：*Constant-Size Commitments to Polynomials and Their Applications*
- 作者：Aniket Kate, Gregory M. Zaverucha, Ian Goldberg
- 会议：ASIACRYPT 2010
- LNCS：6477
- 页码：177-194
- DOI：`10.1007/978-3-642-17373-8_11`

## 什么是 KZG 多项式承诺

多项式承诺可以理解为“先锁定一个多项式，后续只打开某些点”。承诺者发布一个短承诺 \(C\)，之后如果声称：

$$
f(z)=y
$$

则需要给出一个短证明 \(\pi\)，使验证者相信该点值确实来自承诺中的同一个多项式。

KZG 的特点是：

- 承诺大小为一个群元素。
- 单点打开证明大小为一个群元素。
- 验证只需要常数次配对运算。
- 多点打开也可以保持常数大小证明。

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

Charm 中使用乘法群记号。本文实现使用：

```python
pair(g1_elem, g2_elem)
```

多项式系数按升幂顺序保存：

$$
f(X)=a_0+a_1X+\cdots+a_dX^d
$$

代码中对应：

```python
polynomial = [a0, a1, ..., ad]
```

## Setup

可信设置随机选择陷门：

$$
\tau\leftarrow\mathbb Z_p
$$

并发布 \(G_1\) 和 \(G_2\) 上的 powers of tau：

$$
[1]_1,\ [\tau]_1,\ [\tau^2]_1,\ldots,[\tau^D]_1
$$

$$
[1]_2,\ [\tau]_2,\ [\tau^2]_2,\ldots,[\tau^D]_2
$$

其中 \(D\) 是支持的最大多项式次数。设置完成后，真实的 \(\tau\) 应被销毁；验证端只使用公开参数计算 \([I_S(\tau)]_1\) 和 \([Z_S(\tau)]_2\)。

代码入口：

```python
kzg = KZGCommitment(curve="MNT224", max_degree=8)
```

## Commit

输入多项式：

$$
f(X)=\sum_{i=0}^{d}a_iX^i
$$

承诺为：

$$
C=[f(\tau)]_1=\prod_{i=0}^{d}[\tau^i]_1^{a_i}
$$

代码入口：

```python
commitment = kzg.commit(polynomial)
```

## Open

要在点 \(z\) 打开，先计算：

$$
y=f(z)
$$

然后构造商多项式：

$$
q(X)=\frac{f(X)-y}{X-z}
$$

因为 \(y=f(z)\)，所以 \(f(X)-y\) 能被 \(X-z\) 整除。

证明为：

$$
\pi=[q(\tau)]_1
$$

代码入口：

```python
proof = kzg.open(polynomial, point)
```

## Verify

验证者检查：

$$
e(C/[y]_1,g_2)\stackrel{?}{=}e(\pi,[\tau-z]_2)
$$

其中：

$$
[\tau-z]_2=[\tau]_2/[z]_2
$$

正确性来自：

$$
f(X)-y=q(X)(X-z)
$$

代入 \(X=\tau\) 得：

$$
f(\tau)-y=q(\tau)(\tau-z)
$$

因此：

$$
e([f(\tau)-y]_1,g_2)=e([q(\tau)]_1,[\tau-z]_2)
$$

代码入口：

```python
ok = kzg.verify(commitment, proof)
```

## Batch Open

如果需要同时打开多个点：

$$
S=\{z_1,\ldots,z_m\}
$$

先插值得到次数小于 \(m\) 的多项式 \(I_S(X)\)，满足：

$$
I_S(z_i)=f(z_i)
$$

再构造消失多项式：

$$
Z_S(X)=\prod_{i=1}^{m}(X-z_i)
$$

由于 \(f(X)-I_S(X)\) 在所有 \(z_i\) 上为 0，所以：

$$
q(X)=\frac{f(X)-I_S(X)}{Z_S(X)}
$$

批量证明仍为一个群元素：

$$
\pi=[q(\tau)]_1
$$

代码入口：

```python
proof = kzg.batch_open(polynomial, points)
```

## Batch Verify

验证者根据公开点和值重建 \(I_S(X)\) 和 \(Z_S(X)\)，检查：

$$
e(C/[I_S(\tau)]_1,g_2)\stackrel{?}{=}e(\pi,[Z_S(\tau)]_2)
$$

代码入口：

```python
ok = kzg.batch_verify(commitment, proof)
```

## 运行

在安装 Charm-Crypto 的环境中运行：

```powershell
python .\code\kzg-polynomial-commitments\kzg_commitment.py
```

输出会演示：

- KZG setup
- 多项式承诺
- 单点打开和验证
- 篡改声明值验证失败
- 多点批量打开和验证

## 实现说明

本实现用于学习和论文算法复现，重点是展示 KZG 的代数结构。实际工程系统中，可信设置、曲线选择、哈希到域、序列化、批量验证 API、常数时间实现和输入合法性检查都需要更严格的处理。
