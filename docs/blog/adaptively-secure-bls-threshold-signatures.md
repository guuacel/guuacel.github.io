# 从 DDH 与 co-CDH 得到自适应安全的 BLS 门限签名：Das–Ren 论文精读与 Charm 实现

> 论文：Sourav Das, Ling Ren, *Adaptively Secure BLS Threshold Signatures from DDH and co-CDH*, 2024。本文中的页码与图号均指用户提供的论文 PDF。

## 一句话结论

这篇论文解决的问题是：**能否在不牺牲 BLS 门限签名的短签名、非交互签名和标准 BLS 验证兼容性的前提下，仅依赖 DDH 与 co-CDH 这类常见假设，证明其抵抗自适应腐化？**

作者的答案是肯定的。代价是把每个签名者的一维 Shamir 份额扩展成三维份额 `(s(i), r(i), u(i))`，并给每个部分签名附加一个 Fiat–Shamir 化的 Σ 证明。最终聚合结果仍然是单个普通 BLS 签名。[原文定位：p.1、p.8–9，Fig. 2–3](../paper-readers/adaptively-secure-bls-threshold-signatures/paper.md#算法总览)

## 1. 研究问题是什么？

经典 Boldyreva BLS 门限签名已经具备工程上非常喜欢的四个特征：

1. 每个签名者只发送一次部分签名，签名阶段非交互；
2. 最终签名只有一个椭圆曲线群元素；
3. 签名具有唯一性；
4. 最终验证与非门限 BLS 完全相同。

但它长期只有静态安全证明。静态攻击者必须在协议开始前决定腐化哪些签名者；自适应攻击者则可先观察公开参数、部分签名和协议状态，再决定下一步腐化谁。对长期运行的 BFT、区块链、随机信标和去中心化基础设施而言，后一种威胁模型更贴近现实。[原文定位：p.1 S002](../paper-readers/adaptively-secure-bls-threshold-signatures/paper.md#S002)

真正困难的是同时保住三件事：

- 安全假设不能过强；
- 签名仍要短、签名仍要非交互；
- 最终输出必须继续通过标准 BLS 验证。

此前方案往往需要安全擦除、非承诺加密、每次签名都运行近似 DKG 的交互协议，或者依赖 One-More Discrete Logarithm（OMDL）和 Algebraic Group Model（AGM）。尤其 Bacho–Loss 的结果表明，若坚持原始 Boldyreva 构造，要得到自适应安全证明就难以摆脱 OMDL；因此 Das–Ren 的关键不是“换一种证明”，而是**轻量地改变协议本身**。[原文定位：p.1–3 S003](../paper-readers/adaptively-secure-bls-threshold-signatures/paper.md#S003)

## 2. 研究动机是什么？

动机可以分为三层。

第一层是部署需求。BLS 门限签名已用于多个去中心化系统，系统希望保留现有 BLS 验证接口和短签名，不愿为了安全证明大改共识消息格式或验证代码。

第二层是威胁模型。攻击者在真实系统里可能逐步入侵节点，并根据已看到的信息选择下一个目标。只证明静态腐化，无法覆盖这种“边看边腐化”的攻击。

第三层是理论缺口。普通 BLS 在随机预言机模型中依赖 CDH；现有自适应安全门限 BLS 却需要明显更强、非标准的 OMDL/AGM。作者希望把门限版本的假设尽量拉回普通 BLS 附近：自适应安全只额外引入 DDH，并在非对称配对群中使用 co-CDH；若只要求静态安全，构造又退化为仅依赖 CDH。[原文定位：p.1 S001、p.18 Theorem 4、p.26 静态安全讨论](../paper-readers/adaptively-secure-bls-threshold-signatures/paper.md#S001)

## 3. 预备知识：普通 BLS 与 Boldyreva 门限 BLS

设 `(G, Ĝ, GT)` 是阶为素数 `p` 的非对称双线性群，`e: G × Ĝ → GT`，`g ∈ G`，`H: M → Ĝ`。普通 BLS 的私钥是 `s ∈ Zp`，公钥和签名为：

```text
pk = g^s
sigma = H(m)^s
```

验证等式为：

```text
e(pk, H(m)) = e(g, sigma)
```

Boldyreva 的门限化方法是选择 `t` 次 Shamir 多项式 `s(x)`，让第 `i` 个签名者持有 `s(i)`。任意 `t+1` 个部分签名 `H(m)^s(i)` 经拉格朗日插值后得到 `H(m)^s(0)`。

困难恰恰在于：自适应腐化发生时，安全归约必须随时给出与此前全部公开信息一致的内部份额。对单一多项式 `s(x)` 来说，模拟器的可操作空间太小。

## 4. 核心洞察：让“额外项”只存在于份额层，不进入最终签名

作者加入两个额外的 `t` 次多项式 `r(x)` 和 `u(x)`，并约束：

```text
r(0) = 0,  u(0) = 0
```

第 `i` 个签名者不再持有一个标量，而是：

```text
sk_i = (s(i), r(i), u(i))
pk_i = g^s(i) h^r(i) v^u(i)
```

部分签名使用 `s(i)` 和 `r(i)`：

```text
sigma_i = H0(m)^s(i) · H1(m)^r(i)
```

当聚合者用零点处的拉格朗日系数插值时：

```text
sigma
= product_i sigma_i^L_i,S
= H0(m)^s(0) · H1(m)^r(0)
= H0(m)^s(0)
```

`H1` 项自动消失。因此，部分签名阶段获得了额外的模拟自由度，最终签名却仍是标准 BLS 形式。`u(i)` 不进入部分签名；它只出现在门限公钥和正确性证明中，是为了让自适应安全归约成立。[原文定位：p.3–4、p.8–10 S004–S007](../paper-readers/adaptively-secure-bls-threshold-signatures/paper.md#S004)

## 5. 具体算法

### 5.1 Setup

生成非对称配对群 `(G, Ĝ, GT, p)`，在 `G` 中选择相互独立的生成元 `g, h, v`，并定义三个随机预言机：

```text
H0, H1: M -> Ĝ
HFS: {0,1}* -> Zp
```

### 5.2 KGen

随机选择三个 `t` 次多项式 `s(x), r(x), u(x)`，其中 `r(0)=u(0)=0`。对每个签名者 `i`：

```text
sk_i = (s(i), r(i), u(i))
pk_i = g^s(i) h^r(i) v^u(i)
```

系统公钥为：

```text
pk = g^s(0) h^r(0) v^u(0) = g^s(0)
```

![Fig. 2：门限签名构造](../paper-readers/adaptively-secure-bls-threshold-signatures/assets/fig2-threshold-scheme.png)

### 5.3 PSign：部分签名及其正确性证明

签名者计算：

```text
sigma_i = H0(m)^s(i) H1(m)^r(i)
```

为了阻止恶意签名者发送无法聚合的份额，签名者还需证明自己知道 `(s(i), r(i), u(i))`，且同一组见证同时满足：

```text
pk_i    = g^s(i) h^r(i) v^u(i)
sigma_i = H0(m)^s(i) H1(m)^r(i)
```

证明者随机选择 `a_s, a_r, a_u`：

```text
x = g^a_s h^a_r v^a_u
y = H0(m)^a_s H1(m)^a_r
c = HFS(x, y, pk_i, sigma_i, H0(m), H1(m))
z_s = a_s + c·s(i)
z_r = a_r + c·r(i)
z_u = a_u + c·u(i)
```

证明为 `(x, y, z_s, z_r, z_u)`。验证者重算 `c` 并检查：

```text
g^z_s h^z_r v^z_u = x · pk_i^c
H0(m)^z_s H1(m)^z_r = y · sigma_i^c
```

![Fig. 3：部分签名的 Σ 证明](../paper-readers/adaptively-secure-bls-threshold-signatures/assets/fig3-sigma-proof.png)

### 5.4 Comb

聚合者至少收集 `t+1` 个签名者组成的集合 `S`，先逐个运行 `PVer`。全部通过后，计算零点处的拉格朗日系数：

```text
L_i,S = product_{j in S, j != i} (-j)/(i-j)
```

然后聚合：

```text
sigma = product_{i in S} sigma_i^L_i,S
```

### 5.5 Ver

最终验证与普通 BLS 完全一致：

```text
e(pk, H0(m)) = e(g, sigma)
```

这就是该方案可以作为 BLS “近似即插即用替代品”的原因：复杂性留在签名者和聚合者之间，链上或客户端看到的最终签名与验证接口不变。

## 6. DKG：如何去掉可信密钥生成方

作者把经典 JF-DKG/Pedersen DKG 扩展为同时共享三条多项式。

### 分享阶段

每个 dealer `i` 选择：

```text
s_i(x) = s_i,0 + ... + s_i,t x^t
r_i(x) =           r_i,1 x + ... + r_i,t x^t
u_i(x) =           u_i,1 x + ... + u_i,t x^t
```

注意 `r_i(0)=u_i(0)=0`。dealer 公布系数承诺：

```text
cm_i[0] = g^s_i,0
cm_i[k] = g^s_i,k h^r_i,k v^u_i,k,  k >= 1
```

并对 `cm_i[0]` 中 `s_i,0` 的知识给出 Schnorr NIZK，然后私下向参与方 `j` 发送 `(s_i(j), r_i(j), u_i(j))`。

### 一致性阶段

接收者 `j` 检查：

```text
g^s_i(j) h^r_i(j) v^u_i(j)
= product_{k=0}^t cm_i[k]^(j^k)
```

失败则广播投诉；dealer 必须公开一致份额，否则被移出合格集合 `Q`。

### 密钥派生阶段

```text
pk = product_{i in Q} cm_i[0]
pk_j = product_{i in Q} product_{k=0}^t cm_i[k]^(j^k)
sk_j = (sum_i s_i(j), sum_i r_i(j), sum_i u_i(j))
```

![Fig. 5：改造版 JF-DKG](../paper-readers/adaptively-secure-bls-threshold-signatures/assets/fig5-dkg.png)

论文的 DKG 安全结论要求诚实多数，即 `t < n/2`。可信方生成版本只要求 `t < n`。[原文定位：p.19–24 S008、Fig. 5](../paper-readers/adaptively-secure-bls-threshold-signatures/paper.md#S008)

## 7. 为什么能证明自适应安全？

完整证明很长，但可以抓住三个支点。

1. **相关随机预言机编程。** 归约把 `H0(m)` 与 `H1(m)` 以相关方式编程，使签名查询仍可回答，同时用 DDH 保证这种相关分布对多项式时间攻击者不可区分。
2. **rigged public key。** 在安全模拟中，归约暂时使用 `r(0)=1` 而非真实协议的 `r(0)=0`，把 co-CDH 挑战嵌入公钥。伪造者给出的有效 BLS 签名随后可被转化成 co-CDH 解。
3. **Single Inconsistent Party（SIP）。** DKG 模拟只让一个诚实参与者的内部状态“不一致”。由于 `t<n/2`，随机选择的 SIP 以至少 `1/2` 的概率不会被腐化；若被腐化，模拟器回绕重试。其余参与者均可诚实模拟并在腐化时交出一致状态。

需要强调：`r(0)=1` 和 SIP 都只出现在安全归约的模拟世界中；真实协议仍然生成 `r(0)=u(0)=0` 的密钥。

## 8. 效率与代价

论文在 BLS12-381、AWS t3.2xlarge 上报告：

| 方案 | 部分签名 | 部分验证 | 部分签名大小 | `t=64` 聚合 |
|---|---:|---:|---:|---:|
| Boldyreva-I | 0.81 ms | 1.12 ms | 96 B | 74.01 ms |
| Boldyreva-II | 1.20 ms | 0.76 ms | 160 B | 55.43 ms |
| Das–Ren | 3.92 ms | 2.16 ms | 224 B | 149.52 ms |

最终签名大小和最终验证时间没有增加；增加的是部分签名阶段。作者还提出乐观聚合：先不逐个验证，直接聚合并验证最终 BLS 签名；失败时再走逐份验证的回退路径。实验中的乐观聚合约为 7.7 ms。[原文定位：p.27 S009](../paper-readers/adaptively-secure-bls-threshold-signatures/paper.md#S009)

## 9. Charm-Crypto 实现说明

实现文件：[`adaptive_bls_threshold.py`](../../code/adaptively-secure-bls-threshold-signatures/adaptive_bls_threshold.py)

测试文件：[`test_adaptive_bls_threshold.py`](../../code/adaptively-secure-bls-threshold-signatures/test_adaptive_bls_threshold.py)

Charm 的 `pair` 接口要求 `G1` 元素在前，因此实现采用如下映射：

```text
论文 G    -> Charm G2（公钥）
论文 Ĝ   -> Charm G1（签名）
e(pk,H0) -> pair(H0,pk)
```

代码实现了：

- 三多项式可信密钥生成；
- 部分签名与 Σ 证明；
- 部分证明验证；
- 拉格朗日聚合和普通 BLS 最终验证；
- 改造版 JF-DKG 的本地模拟；
- 投诉与不一致 dealer 剔除测试。

运行：

```bash
cd /mnt/d/Study/github/guuacel.github.io/code/adaptively-secure-bls-threshold-signatures
python3 adaptive_bls_threshold.py
python3 -m unittest discover -p 'test_*.py' -v
```

本次验证结果为 6 个测试全部通过。

## 10. 写博客时最值得强调的观点

这篇论文最漂亮的地方，不是简单地给 BLS 加了一个零知识证明，而是找到了一种“局部变复杂、全局不变”的门限化结构：`r(x)` 和 `u(x)` 给安全模拟留下自由度，`r(0)=u(0)=0` 又保证这些自由度在聚合点消失。最终用户仍然只看到标准 BLS 签名。

它也清楚展示了密码协议设计中的一种常见取舍：为了从静态安全走向自适应安全，真正需要增加的成本可以集中在内部份额和局部证明上，而不必扩散到最终签名格式与所有验证者。

最后要避免一个误解：本文的 Charm 代码是对论文代数关系和协议流程的忠实教学实现，不是生产级实现，也不复现论文 Go/BLS12-381 的性能数据。生产部署应使用经过审计的 BLS12-381 库，并补齐网络、广播、身份认证、域分离、密钥持久化和侧信道防护。
