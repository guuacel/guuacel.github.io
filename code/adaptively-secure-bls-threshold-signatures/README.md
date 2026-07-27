# Das–Ren 自适应安全 BLS 门限签名（Charm-Crypto）

这是论文 *Adaptively Secure BLS Threshold Signatures from DDH and co-CDH* 中 Fig. 2、Fig. 3 和 Fig. 5 的教学实现。

## 实现范围

- 可信方版本的 `Setup` / `KGen`；
- `PSign`、部分签名的 Fiat–Shamir Σ 证明与 `PVer`；
- 在指数上进行拉格朗日插值的 `Comb`；
- 与普通 BLS 相同的最终 `Ver`；
- 改造版 JF-DKG 的本地模拟：分享、份额验证、投诉/剔除和密钥派生；
- 6 个测试，覆盖唯一性、篡改拒绝、门限检查和 DKG。

论文中的群记号与 Charm 的映射为：

| 论文 | Charm | 用途 |
|---|---|---|
| `G` | `G2` | 公钥、承诺 |
| `Ĝ` | `G1` | 消息哈希、签名 |
| `e(pk, H(m))` | `pair(H(m), pk)` | Charm 要求 `G1` 参数在前 |

默认使用 `MNT224`，因为它在 Charm-Crypto 中提供非对称配对群。它适合验证算法关系，不应当被视为论文 BLS12-381 基准的复现。

## 运行

在仓库已经配置好的 WSL Charm 环境中：

```bash
cd /mnt/d/Study/github/guuacel.github.io/code/adaptively-secure-bls-threshold-signatures
python3 adaptive_bls_threshold.py
python3 -m unittest discover -p 'test_*.py' -v
```

预期演示输出包括：全部部分证明有效、门限签名有效、篡改消息无效。

## 关键公式

可信密钥生成选择三个 `t` 次多项式 `s(x), r(x), u(x)`，其中 `r(0)=u(0)=0`：

```text
sk_i = (s(i), r(i), u(i))
pk_i = g^s(i) h^r(i) v^u(i)
pk   = g^s(0)
```

部分签名为：

```text
sigma_i = H0(m)^s(i) H1(m)^r(i)
```

聚合时用零点处的拉格朗日系数 `L_i,S`：

```text
sigma = product(sigma_i ^ L_i,S) = H0(m)^s(0)
```

因为 `r(0)=0`，`H1` 项在插值后消失，所以最终输出仍是一枚普通 BLS 签名。

## 安全边界

这份代码验证构造的功能正确性与鲁棒性检查路径，但不会“运行”论文的 DDH/co-CDH 安全归约。随机预言机编程、SIP 模拟器和归约中的回绕是证明工具。真实部署还必须提供认证私密信道、可靠广播、成员身份与消息域分离、持久化和侧信道防护，并选用经过审计的 BLS12-381 实现。
