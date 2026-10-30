(function () {
  'use strict';

  window.RING_SIGNATURE_BOOK = {
    id: 'ring-signatures',
    color: '#6b46c1',
    title: '环签名',
    subtitle: {
      zh: '从匿名签名定义到 RSA 环方程',
      en: 'From signer ambiguity to the RSA ring equation'
    },
    author: 'Ronald L. Rivest · Adi Shamir · Yael Tauman',
    category: { zh: '匿名认证', en: 'Anonymous Authentication' },
    level: { zh: '进阶', en: 'Intermediate' },
    overview: {
      zh: '以 ASIACRYPT 2001 论文《How to Leak a Secret》为主线，理解环签名为何不需要群管理员或预先协作，以及 RSA 陷门置换、组合函数和环方程如何共同隐藏真实签名者。',
      en: 'A paper-guided introduction to setup-free ring signatures, RSA trapdoor permutations, combining functions, and signer ambiguity.'
    },
    topics: {
      zh: ['环签名与群签名的区别', 'RSA 陷门置换的公共域扩展', '基于对称置换的组合函数', '签名者模糊性与不可伪造性边界'],
      en: ['Ring signatures versus group signatures', 'Extending RSA permutations to a common domain', 'Combining functions built from symmetric permutations', 'Signer ambiguity and unforgeability boundaries']
    },
    path: {
      zh: ['先理解无管理员的匿名认证目标', '再推导公共域和环方程', '最后运行 Python 复现并做篡改实验'],
      en: ['Understand setup-free anonymous authentication', 'Derive the common domain and ring equation', 'Run the Python reproduction and tampering tests']
    },
    chapters: [
      {
        id: 'rsa-ring-signature',
        number: '第一章',
        title: '基于 RSA 的环签名：How to Leak a Secret',
        source: 'Rivest, Shamir and Tauman, “How to Leak a Secret,” ASIACRYPT 2001, LNCS 2248, pp. 552–565',
        sourceNote: '本章依据论文第 2 节和第 3 节整理；Python 代码把论文中的理想大域对称置换具体化为 10 轮 Feistel/HMAC-SHA-256，仅用于研究复现。',
        introduction: '环签名让验证者确信“给定公钥集合中至少有一人签署了消息”，但不揭示具体是谁。论文的 RSA 版本把每个成员的 RSA 陷门置换扩展到同一个 b 位域，再用消息相关的对称置换把所有成员的响应串成一个首尾闭合的环。',
        sections: [
          {
            title: '1. 环签名解决什么问题',
            paragraphs: [
              '论文把一组可能的签名者称为“环”。真实签名者只需要自己的私钥和其他成员的普通公钥，就能独立生成签名；其他成员不需要知情、同意或参与，也不存在群管理员、建群流程、撤销流程或由管理员打开匿名性的机制。',
              '验证结果证明的是“环中至少有一名成员掌握相应私钥并签署了消息”，而不是某个确定身份。论文用匿名泄密说明这一用途：消息具有来自某个权威集合的可信度，同时真实来源仍隐藏在集合中。'
            ],
            bullets: [
              '完备性：诚实生成的签名应通过验证。',
              '不可伪造性：不知道环中任何私钥的攻击者不应生成新消息的有效签名。',
              '签名者模糊性：验证者不应比随机猜测更准确地识别真实签名者。',
              '无预设：签名者可以临时选择包含自己的公钥集合。'
            ],
            note: '环签名不等于群签名。群签名通常依赖群管理员、专用成员密钥和可打开身份的机制；经典环签名刻意取消这些中心化能力。'
          },
          {
            title: '2. RSA 陷门置换与公共 b 位域',
            paragraphs: [
              '第 i 个成员的 RSA 公钥是 P_i=(n_i,e_i)，对应置换 f_i(x)=x^{e_i} mod n_i。只有掌握私钥指数 d_i 的成员才能高效计算逆映射。由于不同成员的模数 n_i 不同，论文先把每个 f_i 扩展为公共域 {0,1}^b 上的置换 g_i。',
              '对 b 位整数 x，写成 x=q_i n_i+r_i，其中 0≤r_i<n_i。在完整的 n_i 分块中，只对余数 r_i 做 RSA 置换并保留高位分块 q_i；若最后一个分块不完整，就让 g_i(x)=x。选择 b 比最大模数多约 160 位，可使落入这个不完整尾部的概率可忽略。'
            ],
            formulas: [
              '\\[f_i(x)=x^{e_i}\\bmod n_i.\\]',
              '\\[g_i(x)=\\begin{cases}q_i n_i+f_i(r_i),&(q_i+1)n_i\\le 2^b,\\\\x,&\\text{otherwise}.\\end{cases}\\]'
            ],
            note: '公共域扩展不是把所有成员换成同一个 RSA 模数，而是在保留各自密钥的同时，让所有输入和输出都成为同样长度的 b 位字。'
          },
          {
            title: '3. 组合函数与闭合的环方程',
            paragraphs: [
              '论文令 k=h(m)，把消息哈希作为公开对称置换 E_k 的密钥。组合函数从随机胶合值 v 出发，依次把每个 y_i=g_i(x_i) 与当前状态异或，再应用 E_k。要求最终输出重新等于 v，线性的链因此闭合成环。',
              '这个组合函数对任意单个输入都是置换：固定其他 y_i 后，可以从 v 向前计算前缀、再从最终 v 反向计算后缀，从而唯一解出缺失的 y_s。只有真实签名者能利用自己的 RSA 陷门把 y_s 反演为 x_s。'
            ],
            formulas: [
              '\\[C_{k,v}(y_1,\\ldots,y_r)=E_k\\bigl(y_r\\oplus E_k(y_{r-1}\\oplus\\cdots E_k(y_1\\oplus v))\\bigr).\\]',
              '\\[C_{h(m),v}(g_1(x_1),\\ldots,g_r(x_r))=v.\\]'
            ]
          },
          {
            title: '4. RSA 环签名生成步骤',
            paragraphs: [
              '设真实签名者是第 s 个成员。签名者首先计算 k=h(m)，随机选择 b 位胶合值 v；随后为每个非签名者随机选取 x_i 并公开计算 y_i=g_i(x_i)。',
              '固定其余成员的 y_i 后，签名者沿组合函数正向计算前缀、反向计算后缀，解出使环闭合的唯一 y_s。最后使用 RSA 私钥计算 x_s=g_s^{-1}(y_s)。输出包含有序公钥环、v 和每个成员的响应 x_i。'
            ],
            bullets: [
              'k=h(m)：让环方程绑定消息，修改消息会改变整个对称置换。',
              'v←{0,1}^b：随机胶合值使不同签名具有新鲜随机性。',
              'x_i←{0,1}^b（i≠s）：非签名者位置由均匀随机响应填充。',
              '求解 y_s：利用组合函数对单个输入可逆的性质闭合环。',
              'x_s=g_s^{-1}(y_s)：只有真实签名者需要执行一次私钥运算。'
            ],
            formulas: [
              '\\[\\sigma=(P_1,\\ldots,P_r;v;x_1,\\ldots,x_r).\\]'
            ]
          },
          {
            title: '5. 验证步骤',
            paragraphs: [
              '验证者不需要任何私钥。它先检查公钥环和响应的编码，再对每个成员计算 y_i=g_i(x_i)，从待验证消息重新得到 k=h(m)，最后重算组合函数。只有结果等于胶合值 v 时才接受。',
              '工程上不能仅信任签名中自带的公钥列表。调用者应把期望的、有序的成员公钥环作为验证上下文传入，并验证这些公钥与真实身份或证书的绑定关系。否则“某个嵌入的公钥签过名”并不等于“某个预期的人签过名”。'
            ],
            formulas: [
              '\\[y_i=g_i(x_i),\\qquad k=h(m),\\qquad C_{k,v}(y_1,\\ldots,y_r)\\stackrel{?}{=}v.\\]'
            ]
          },
          {
            title: '6. 论文给出的安全直觉',
            paragraphs: [
              '对固定的 k 和 v，环方程恰有 2^{b(r-1)} 组解。论文指出，生成算法会以相同概率得到这些解，且分布不依赖真实签名者的位置，因此 RSA 置换版本具有无条件的签名者模糊性。即使计算能力无限，观察签名本身也不能获得优于 1/r 的身份猜测优势。',
              '不可伪造性则是计算性的，并且不能强于成员所使用的基础签名方案。论文在随机预言机/随机置换预言机模型中论证：若攻击者能在不知道任何环成员私钥时伪造新消息的签名，就能用它反演至少一个陷门单向置换。'
            ],
            note: '匿名性与不可伪造性是两条不同结论：前者讨论有效签名是否泄露签名者位置，后者讨论没有私钥能否制造有效签名。代码实验只能验证功能和基本篡改拒绝，不能代替安全证明。'
          },
          {
            title: '7. Python 复现如何对应论文',
            paragraphs: [
              '下方实现保持论文的结构：extended_map 对应 g_i；WideFeistel.for_message 用 SHA-256(message) 派生公开密钥，并以 10 轮平衡 Feistel/HMAC-SHA-256 构造 b 位置换；combine 对应 C_{k,v}；solve_missing 通过正向前缀和反向后缀解出 y_s；rsa_inverse 用私钥指数完成 g_s^{-1}。',
              '示例只依赖 Python 标准库，默认生成三个 2048 位 RSA 密钥，并依次让每个位置签名。测试同时检查正确消息通过、修改消息被拒绝、修改响应被拒绝。'
            ],
            bullets: [
              '这是论文构造的教学复现，不是标准化、经过审计的生产环签名协议。',
              'Feistel/HMAC-SHA-256 是对论文理想大域置换的具体化，安全性质不能直接等同于论文预言机模型中的结论。',
              '代码中的素数生成、私钥运算和 Python 大整数不是恒定时间实现，不应处理生产密钥。',
              '生产系统还需定义规范编码、域分离、密钥验证、证书绑定、拒绝服务限制和侧信道防护。'
            ]
          },
          {
            title: '动手实践：完整 RSA 环签名 Python 代码',
            paragraphs: [
              '点击源码面板可阅读完整实现。下载后使用 Python 3.10 或更高版本直接运行；无需安装第三方库。默认 2048 位示例会实际生成密钥，运行时间取决于设备性能。'
            ],
            note: '推荐先把 __main__ 中的密钥位数临时改为 512 观察流程，再恢复到 2048 位做功能测试；512 位仅用于调试，没有现实安全性。',
            codeExamples: {
              pythonUrl: 'code/ring-signatures/rsa_ring_signature.py'
            }
          }
        ],
        references: [
          {
            label: 'Rivest, Shamir and Tauman: How to Leak a Secret (ASIACRYPT 2001)',
            url: 'https://doi.org/10.1007/3-540-45682-1_32'
          },
          {
            label: '完整 Python 源码：rsa_ring_signature.py',
            url: 'code/ring-signatures/rsa_ring_signature.py'
          }
        ]
      }
    ]
  };
}());
