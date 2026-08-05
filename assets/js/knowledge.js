(function () {
  'use strict';

  const LANG_KEY = 'guuacel-homepage-language';
  const supportedLanguages = ['zh', 'en'];
  let currentLang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh';
  const initialParams = new URLSearchParams(window.location.search);
  let activeBookId = initialParams.get('book') || 'lattice';
  let activeChapterId = initialParams.get('chapter') || 'chapter-1';

  const pageCopy = {
    zh: {
      brand: '基础知识',
      home: '返回主页',
      toggle: 'English',
      eyebrow: 'Digital Library',
      title: '基础知识',
      summary: '精选密码学与网络安全基础书目，整理核心概念、知识结构和阅读建议。',
      shelf: '书籍导航',
      hint: '选择一本书查看内容',
      author: '作者',
      level: '难度',
      overview: '内容概览',
      topics: '核心知识',
      path: '建议阅读路径',
      footer: '阅读 · 理解 · 实践'
    },
    en: {
      brand: 'Fundamentals',
      home: 'Back Home',
      toggle: '中文',
      eyebrow: 'Digital Library',
      title: 'Fundamentals',
      summary: 'A curated library of cryptography and cybersecurity fundamentals, with key concepts, knowledge maps, and reading guidance.',
      shelf: 'Book Navigation',
      hint: 'Choose a book to view its notes',
      author: 'Author',
      level: 'Level',
      overview: 'Overview',
      topics: 'Key Topics',
      path: 'Suggested Reading Path',
      footer: 'Read · Understand · Practice'
    }
  };

  const books = [
    {
      id: 'lattice',
      color: '#276749',
      title: '格',
      subtitle: { zh: '计算机科学中的格基础', en: 'Lattices in Computer Science' },
      author: 'Oded Regev 课程讲义',
      category: { zh: '数学基础', en: 'Mathematical Foundations' },
      level: { zh: '入门至进阶', en: 'Beginner–Intermediate' },
      overview: {
        zh: '从几何直觉、代数定义和计算问题三个层面建立格的基础知识，为后续学习格算法、格密码和复杂性理论打下基础。',
        en: 'A structured introduction to lattices through geometric intuition, algebraic definitions, and computational problems.'
      },
      topics: {
        zh: ['格、基与基本平行多面体', '幺模变换与格的行列式', 'Gram-Schmidt 正交化与逐次最小值', 'Minkowski 定理、SVP 与 CVP'],
        en: ['Lattices, bases, and fundamental parallelepipeds', 'Unimodular transformations and determinants', 'Gram-Schmidt orthogonalization and successive minima', 'Minkowski theorems, SVP, and CVP']
      },
      path: {
        zh: ['建立几何直觉', '掌握核心定义与公式', '理解格上的计算问题'],
        en: ['Build geometric intuition', 'Learn the core definitions', 'Understand computational lattice problems']
      },
      chapters: [
        {
          id: 'chapter-1',
          number: '第一章',
          title: '格的基本概念与计算问题',
          source: 'Lattices in Computer Science, Lecture 1: Introduction',
          introduction: '本章从二维周期点阵出发，依次介绍格、格基、基本平行多面体、格的行列式、Gram-Schmidt 正交化、逐次最小值与 Minkowski 定理，最后给出最短向量问题和最近向量问题的计算定义。',
          sections: [
            {
              title: '1. 从周期点阵到格',
              paragraphs: [
                '格可以直观地理解为欧氏空间中具有周期结构的一组离散点。二维格看起来像规则重复的点阵；三维格则自然出现在晶体结构和球体堆积中。在计算机科学里，格既是算法工具，也是密码学、密码分析和计算复杂性中的重要对象。',
                '设有 \\(n\\) 个线性无关向量 \\(b_1,b_2,\\ldots,b_n\\in\\mathbb{R}^m\\)。它们的所有整数线性组合构成一个格，写作：'
              ],
              formulas: [
                '\\[\\mathcal{L}(b_1,\\ldots,b_n)=\\left\\{\\sum_{i=1}^{n}x_i b_i\\mid x_i\\in\\mathbb{Z}\\right\\}=\\{Bx\\mid x\\in\\mathbb{Z}^n\\}.\\]'
              ],
              note: '矩阵 \\(B=[b_1\\;b_2\\;\\cdots\\;b_n]\\) 称为格的一组基。格的秩是基向量个数 \\(n\\)，所在空间的维数是 \\(m\\)。当 \\(n=m\\) 时称为满秩格。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-1/lattice-in-r2.png',
                  alt: '二维欧氏空间中的周期格点',
                  caption: '图 1：二维空间中的格。格点沿两个独立方向周期性重复。'
                }
              ]
            },
            {
              title: '2. 格基与基本平行多面体',
              paragraphs: [
                '同一个格可以拥有许多不同的基。例如，标准基 \\((1,0)^T,(0,1)^T\\) 与 \\((1,1)^T,(2,1)^T\\) 都能生成 \\(\\mathbb{Z}^2\\)。因此，基描述的是生成格的方式，而不是格本身。',
                '由基 \\(B\\) 生成的基本平行多面体，是把每个基向量的系数限制在半开区间 \\([0,1)\\) 后得到的区域：'
              ],
              formulas: [
                '\\[\\mathcal{P}(B)=\\{Bx\\mid x\\in\\mathbb{R}^n,\\;0\\leq x_i<1\\}.\\]'
              ],
              note: '把基本平行多面体平移到每一个格点，就会无重叠地铺满格的线性张成空间。若一组线性无关的格向量所生成的基本平行多面体中除原点外不含其他格点，那么这组向量正好是一组格基。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-1/lattice-bases.png',
                  alt: '二维格的不同基以及非满秩示例',
                  caption: '图 2：同一个格的不同基、不能生成完整格的向量组，以及非满秩格。灰色区域表示相应的基本平行多面体。'
                }
              ]
            },
            {
              title: '3. 等价基、幺模矩阵与行列式',
              paragraphs: [
                '判断两组基是否生成同一个格，可以转化为整数矩阵问题。如果 \\(B_1\\) 和 \\(B_2\\) 是两组基，那么它们等价当且仅当存在整数幺模矩阵 \\(U\\)，使得 \\(B_2=B_1U\\)。幺模矩阵满足 \\(\\det(U)=\\pm1\\)，其逆矩阵仍是整数矩阵。',
                '格的行列式定义为基本平行多面体的体积。它与具体选择哪一组基无关，因此是格本身的不变量：'
              ],
              formulas: [
                '\\[\\det(\\mathcal{L}(B))=\\sqrt{\\det(B^TB)}.\\]',
                '\\[\\text{若格满秩，则 }\\det(\\mathcal{L}(B))=|\\det(B)|.\\]'
              ],
              note: '行列式反映格点密度：行列式越小，格点通常越密；在足够大的区域 \\(K\\) 中，格点数量大约为 \\(\\operatorname{vol}(K)/\\det(\\Lambda)\\)。'
            },
            {
              title: '4. Gram-Schmidt 正交化',
              paragraphs: [
                '格基往往不是正交的。Gram-Schmidt 过程把线性无关的有序向量组转换为相互正交的向量组，便于分析长度、投影和体积。第 \\(i\\) 个正交向量等于 \\(b_i\\) 去掉它在前面正交向量方向上的投影：'
              ],
              formulas: [
                '\\[\\widetilde b_i=b_i-\\sum_{j=1}^{i-1}\\mu_{i,j}\\widetilde b_j,\\qquad \\mu_{i,j}=\\frac{\\langle b_i,\\widetilde b_j\\rangle}{\\langle\\widetilde b_j,\\widetilde b_j\\rangle}.\\]',
                '\\[\\det(\\mathcal{L}(B))=\\prod_{i=1}^{n}\\|\\widetilde b_i\\|.\\]'
              ],
              note: '正交化向量通常不属于原格，因此它们主要是分析工具，而不是格的一组新基。向量排列顺序不同，得到的正交化结果也会不同。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-1/gram-schmidt.png',
                  alt: '二维格基的 Gram-Schmidt 正交化',
                  caption: '图 3：将 \\(b_2\\) 在 \\(b_1\\) 的正交方向上投影，得到 \\(\\widetilde b_2\\)。'
                }
              ]
            },
            {
              title: '5. 逐次最小值',
              paragraphs: [
                '格中最短非零向量的长度记为 \\(\\lambda_1(\\Lambda)\\)。逐次最小值把这一概念推广到多个线性无关方向：\\(\\lambda_i(\\Lambda)\\) 是使半径为 \\(r\\) 的闭球内出现至少 \\(i\\) 个线性无关格向量的最小半径。',
                '这个定义不仅衡量“最短向量有多短”，还刻画了格在不同独立方向上的几何尺度。'
              ],
              formulas: [
                '\\[\\lambda_i(\\Lambda)=\\inf\\left\\{r\\mid \\dim\\big(\\operatorname{span}(\\Lambda\\cap B(0,r))\\big)\\geq i\\right\\}.\\]',
                '\\[\\lambda_1(\\mathcal{L}(B))\\geq\\min_i\\|\\widetilde b_i\\|>0.\\]'
              ],
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-1/successive-minima.png',
                  alt: '二维格的第一和第二逐次最小值',
                  caption: '图 4：内圆首次包含一个非零方向，外圆进一步包含第二个线性无关方向。图中 \\(\\lambda_1=1\\)，\\(\\lambda_2=2.3\\)。'
                }
              ]
            },
            {
              title: '6. Blichfeldt 与 Minkowski 定理',
              paragraphs: [
                'Blichfeldt 定理说明：当一个可测集合的体积大于格的行列式时，集合中必有两个不同点之差属于该格。Minkowski 凸体定理进一步指出，足够大的中心对称凸体一定包含非零格点。',
                '对满秩 \\(n\\) 维格 \\(\\Lambda\\)，若中心对称凸集 \\(S\\) 满足 \\(\\operatorname{vol}(S)>2^n\\det(\\Lambda)\\)，则 \\(S\\) 中存在非零格点。将该结论用于欧氏球，可以得到最短向量长度的上界：'
              ],
              formulas: [
                '\\[\\lambda_1(\\Lambda)\\leq\\sqrt n\\,\\det(\\Lambda)^{1/n}.\\]',
                '\\[\\left(\\prod_{i=1}^{n}\\lambda_i(\\Lambda)\\right)^{1/n}\\leq\\sqrt n\\,\\det(\\Lambda)^{1/n}.\\]'
              ],
              note: 'Minkowski 定理给出的是存在性保证，并不直接提供寻找短向量的高效算法。这一区别把几何结论自然地引向格上的计算问题。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-1/minkowski-convex-body.png',
                  alt: 'Minkowski 中心对称凸体定理示意图',
                  caption: '图 5：把缩小后的凸体中的两个点作差，得到落在原凸体中的非零格向量。'
                },
                {
                  src: 'assets/img/knowledge/lattice/chapter-1/minkowski-ellipsoid.png',
                  alt: '用于逐次最小值证明的椭球示意图',
                  caption: '图 6：由逐次最小值和正交化方向构造的椭球，用于证明 Minkowski 第二定理。'
                }
              ]
            },
            {
              title: '7. 格上的基本计算问题',
              paragraphs: [
                '最短向量问题（SVP）要求在给定格中找到最短的非零格向量；最近向量问题（CVP）要求找到离目标点最近的格点。两者都可以分为搜索、优化和判定（或承诺）版本，并可允许近似因子 \\(\\gamma\\geq1\\)。',
                '在近似 SVP 中，算法只需找到满足 \\(0<\\|v\\|\\leq\\gamma\\lambda_1(\\Lambda)\\) 的格向量；在近似 CVP 中，目标是找到满足 \\(\\|v-t\\|\\leq\\gamma\\operatorname{dist}(t,\\Lambda)\\) 的格点。几何性质使 SVP 与 CVP 具有较高计算难度，也是格密码安全性的关键来源。'
              ],
              bullets: [
                'Search SVP：输出一个满足长度要求的非零格向量。',
                'Optimization SVP：输出最短向量长度或其近似值。',
                'GapSVP：区分“存在足够短的向量”和“所有非零向量都足够长”两类承诺实例。',
                'CVP：围绕给定目标点，寻找或估计最近格点。',
                '成员判定与基等价判定可借助线性代数高效完成；真正的困难通常来自格的几何结构。'
              ]
            },
            {
              title: '本章小结',
              paragraphs: [
                '本章建立了格论的第一层知识框架：格由整数线性组合定义，但其核心性质同时包含代数结构、几何体积和计算复杂性。格基并不唯一，幺模变换描述等价基；行列式衡量密度；Gram-Schmidt 向量帮助分析几何尺度；逐次最小值和 Minkowski 定理连接体积与短向量；SVP、CVP 则把这些几何概念转化为计算问题。'
              ]
            }
          ]
        },
        {
          id: 'chapter-2',
          number: '第二章',
          title: 'LLL 格基约化算法',
          source: 'Lattices in Computer Science, Lecture 2: LLL Algorithm',
          introduction: '本章研究 LLL 格基约化算法。它把任意整数格基转换为结构更规整的约化基，并从中得到最短向量问题的指数因子近似解。内容依次包括约化基定义、近似保证、算法步骤、正确性和多项式时间分析。',
          sections: [
            {
              title: '1. LLL 算法解决什么问题',
              paragraphs: [
                'LLL 算法由 A. K. Lenstra、H. W. Lenstra Jr. 和 L. Lovász 于 1982 年提出。它可以视为二维 Gauss 格基约化向高维空间的推广：输入一组可能很长、很倾斜的格基，输出一组更短、更接近正交的等价格基。',
                'LLL 并不保证找到真正的最短非零格向量，但会把约化基的第一个向量作为 SVP 的近似解。它在固定维数中给出常数近似，也广泛用于整数与有理数上的多项式分解、代数数最小多项式恢复、整数关系发现、固定维整数规划、CVP 近似以及密码分析。'
              ],
              bullets: [
                '多项式分解：把整数或有理数系数多项式分解为不可约因子。',
                '整数关系：寻找不全为零的整数系数，使若干实数的线性组合为零。',
                '数值恢复：从高精度近似值推断代数数满足的最小多项式。',
                '密码分析：分析背包密码、特殊参数 RSA 等系统中的弱结构。'
              ],
              note: '本章讨论满秩整数格和欧氏范数。非满秩格以及其他范数存在相应扩展。'
            },
            {
              title: '2. \\(\\delta\\)-LLL 约化基',
              paragraphs: [
                '设 \\(B=(b_1,\\ldots,b_n)\\) 的 Gram-Schmidt 正交化为 \\((\\widetilde b_1,\\ldots,\\widetilde b_n)\\)，并记投影系数为 \\(\\mu_{i,j}=\\langle b_i,\\widetilde b_j\\rangle/\\langle\\widetilde b_j,\\widetilde b_j\\rangle\\)。当参数满足 \\(1/4<\\delta<1\\) 时，一组基称为 \\(\\delta\\)-LLL 约化基，需要同时满足两个条件。'
              ],
              formulas: [
                '\\[|\\mu_{i,j}|\\leq\\frac12,\\qquad 1\\leq j<i\\leq n.\\]',
                '\\[\\delta\\|\\widetilde b_i\\|^2\\leq\\|\\mu_{i+1,i}\\widetilde b_i+\\widetilde b_{i+1}\\|^2,\\qquad 1\\leq i<n.\\]',
                '\\[\\|\\widetilde b_{i+1}\\|^2\\geq\\left(\\delta-\\frac14\\right)\\|\\widetilde b_i\\|^2.\\]'
              ],
              note: '第一个条件称为尺寸约化，它限制后续基向量在先前正交方向上的投影。第二个条件通常称为 Lovász 条件，它防止后一个正交化向量比前一个骤然变短。常用参数是 \\(\\delta=3/4\\)。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-2/lll-reduced-definition.png',
                  alt: '原讲义中的 LLL 约化基定义',
                  caption: '图 1：原讲义给出的 Gram-Schmidt 系数和 \\(\\delta\\)-LLL 约化基的两个条件。'
                }
              ]
            },
            {
              title: '3. 约化基的近似质量',
              paragraphs: [
                'LLL 约化基最重要的性质，是第一个基向量不会比格中真正的最短非零向量长太多。Lovász 条件给出了相邻 Gram-Schmidt 长度之间的递推关系，把它从第一个方向一直传递到最后一个方向。再结合 \\(\\lambda_1(\\mathcal L)\\geq\\min_i\\|\\widetilde b_i\\|\\)，即可得到近似界。'
              ],
              formulas: [
                '\\[\\|b_1\\|\\leq\\left(\\delta-\\frac14\\right)^{-(n-1)/2}\\lambda_1(\\mathcal L)=\\left(\\frac{2}{\\sqrt{4\\delta-1}}\\right)^{n-1}\\lambda_1(\\mathcal L).\\]',
                '\\[\\delta=\\frac34\\quad\\Longrightarrow\\quad\\|b_1\\|\\leq2^{(n-1)/2}\\lambda_1(\\mathcal L).\\]'
              ],
              note: '当 \\(\\delta\\) 趋近于 1 时，近似因子接近 \\((2/\\sqrt3)^{n-1}\\)。这仍随维数指数增长，但 LLL 的优势是能在输入长度的多项式时间内得到该保证。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-2/lll-approximation-bound.png',
                  alt: '原讲义中的 LLL 最短向量近似界证明',
                  caption: '图 2：从相邻正交化向量的长度关系推导第一个基向量的近似保证。'
                }
              ]
            },
            {
              title: '4. LLL 的两个核心操作',
              paragraphs: [
                '算法先计算 Gram-Schmidt 数据，然后反复执行“尺寸约化”和“相邻交换”。尺寸约化从后向前处理投影方向，把 \\(b_i\\) 在 \\(\\widetilde b_j\\) 方向上的系数舍入到最近整数并消去，使 \\(|\\mu_{i,j}|\\leq1/2\\)。',
                '如果某对相邻向量违反 Lovász 条件，就交换 \\(b_i\\) 与 \\(b_{i+1}\\)，重新计算相关 Gram-Schmidt 数据并继续。所有尺寸约化都是整数列操作，交换也是幺模操作，所以算法从始至终生成同一个格。'
              ],
              formulas: [
                '\\[c_{i,j}=\\left\\lfloor\\frac{\\langle b_i,\\widetilde b_j\\rangle}{\\langle\\widetilde b_j,\\widetilde b_j\\rangle}\\right\\rceil,\\qquad b_i\\leftarrow b_i-c_{i,j}b_j.\\]',
                '\\[\\text{若 }\\delta\\|\\widetilde b_i\\|^2>\\|\\mu_{i+1,i}\\widetilde b_i+\\widetilde b_{i+1}\\|^2,\\text{ 则交换 }b_i,b_{i+1}.\\]'
              ],
              note: '尺寸约化的内层循环必须按照 \\(j=i-1,i-2,\\ldots,1\\) 的逆序执行，否则后续操作可能重新破坏已经约化的高编号投影。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-2/lll-reduction-step.png',
                  alt: '原讲义中的 LLL 尺寸约化步骤',
                  caption: '图 3：尺寸约化步骤。对每个 \\(b_i\\)，从后向前消去过大的 Gram-Schmidt 投影系数。'
                },
                {
                  src: 'assets/img/knowledge/lattice/chapter-2/lll-swap-step.png',
                  alt: '原讲义中的 LLL 相邻交换步骤',
                  caption: '图 4：若 Lovász 条件不成立，则交换相邻基向量并重新开始检查。'
                }
              ]
            },
            {
              title: '5. 为什么输出一定正确',
              paragraphs: [
                '若算法终止，交换检查保证每一对相邻向量都满足 Lovász 条件；逆序尺寸约化保证所有 \\(|\\mu_{i,j}|\\leq1/2\\)。因此输出满足 \\(\\delta\\)-LLL 约化基的定义。',
                '算法只使用 \\(b_i\\leftarrow b_i+a b_j\\)（其中 \\(a\\in\\mathbb Z\\)）和基向量交换。这些操作对应整数幺模变换，不改变格；因此输出不仅“约化”，而且仍是输入格的一组基。'
              ],
              note: '在尺寸约化中，从 \\(b_i\\) 减去较早基向量的整数倍不会改变其正交剩余量，所以这一阶段无须完整重算 Gram-Schmidt 正交基。'
            },
            {
              title: '6. 势函数与终止性',
              paragraphs: [
                '为了证明算法不会无限交换，讲义为每组基定义一个对前部向量赋予更高权重的势函数。令 \\(\\Lambda_i=\\mathcal L(b_1,\\ldots,b_i)\\)，其行列式为 \\(D_{B,i}\\)，则：'
              ],
              formulas: [
                '\\[D_B=\\prod_{i=1}^{n}\\|\\widetilde b_i\\|^{n-i+1}=\\prod_{i=1}^{n}D_{B,i}.\\]',
                '\\[\\frac{D_B\' }{D_B}=\\frac{\\|\\mu_{i+1,i}\\widetilde b_i+\\widetilde b_{i+1}\\|}{\\|\\widetilde b_i\\|}<\\sqrt\\delta.\\]'
              ],
              note: '尺寸约化不改变 Gram-Schmidt 向量，因此势函数保持不变；每次违反 Lovász 条件的交换都会让势函数至少乘上一个小于 1 的固定因子。初始势函数的对数受输入比特长度的多项式控制，而势函数又有正下界，所以交换次数是多项式级。',
              figures: [
                {
                  src: 'assets/img/knowledge/lattice/chapter-2/lll-potential.png',
                  alt: '原讲义中的 LLL 势函数定义',
                  caption: '图 5：LLL 运行时间分析所用的势函数；越靠前的 Gram-Schmidt 向量权重越大。'
                }
              ]
            },
            {
              title: '7. 为什么还要分析数值大小',
              paragraphs: [
                '多项式次算术操作并不自动意味着多项式时间，因为中间整数或有理数的位数可能迅速膨胀。LLL 的完整分析还必须证明：Gram-Schmidt 向量可以用多项式位数表示，尺寸约化过程中出现的整数系数和基向量也不会变得过大。',
                '证明利用前缀格行列式、Cramer 法则和范数上界，控制 Gram-Schmidt 坐标的分母与大小；再结合 \\(|\\mu_{i,j}|\\leq1/2\\)，控制约化后基向量以及中间更新的位长。由此可知，每轮所需的位运算数和总轮数都为输入规模的多项式。'
              ]
            },
            {
              title: '8. 实际表现与后续方向',
              paragraphs: [
                'LLL 和其推广 BKZ 的最坏情况行为已有较成熟的界，但实验表明，在很多“典型”格上它们通常明显优于最坏情况分析。如何解释这种平均或启发式表现，以及如何针对理想格等特殊格族设计更强的约化算法，仍是重要研究方向。',
                '若需要比 LLL 更好的高维近似质量，可以使用 Schnorr 的分块思想以及 BKZ。它们通过在更大的局部块中执行更强的约化，用更多计算时间换取更短的输出向量。'
              ]
            },
            {
              title: '本章小结',
              paragraphs: [
                'LLL 的核心是一种“局部整理、全局下降”的机制：尺寸约化压低投影系数，Lovász 检查纠正不合理的向量顺序，势函数保证交换不能无限发生。最终得到的等价基既具有可证明的短向量近似质量，又能在输入比特长度的多项式时间内计算，是格算法和格密码工具链中的基础算法。'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'understanding-cryptography',
      color: '#2c6faa',
      title: 'Understanding Cryptography',
      subtitle: { zh: '密码学工程的清晰入门', en: 'A clear introduction to cryptographic engineering' },
      author: 'Christof Paar · Jan Pelzl',
      category: { zh: '密码学入门', en: 'Cryptography Primer' },
      level: { zh: '入门', en: 'Beginner' },
      overview: {
        zh: '本书从工程视角串联对称密码、公钥密码、数字签名与密钥交换，强调算法背后的直觉、数学基础和现实应用，适合作为系统学习现代密码学的第一本书。',
        en: 'This book connects symmetric encryption, public-key cryptography, digital signatures, and key exchange from an engineering perspective. It emphasizes intuition, mathematical foundations, and practical use.'
      },
      topics: {
        zh: ['流密码与分组密码的基本结构', 'AES、DES 与常见工作模式', 'RSA、离散对数与椭圆曲线密码', '哈希函数、消息认证码与数字签名'],
        en: ['Core structures of stream and block ciphers', 'AES, DES, and common modes of operation', 'RSA, discrete logarithms, and elliptic-curve cryptography', 'Hash functions, message authentication codes, and digital signatures']
      },
      path: {
        zh: ['先掌握模运算与有限域', '理解对称密码的构造思路', '进入公钥密码与协议应用'],
        en: ['Start with modular arithmetic and finite fields', 'Understand symmetric-cipher construction', 'Move to public-key systems and protocols']
      }
    },
    {
      id: 'modern-cryptography',
      color: '#795548',
      title: 'Introduction to Modern Cryptography',
      subtitle: { zh: '从形式化定义到可证明安全', en: 'From formal definitions to provable security' },
      author: 'Jonathan Katz · Yehuda Lindell',
      category: { zh: '现代密码学', en: 'Modern Cryptography' },
      level: { zh: '进阶', en: 'Intermediate' },
      overview: {
        zh: '本书以严格的安全定义、攻击模型和归约证明为主线，帮助读者建立“方案为何安全”的形式化思维。适合已经了解基础算法、希望进一步学习可证明安全的读者。',
        en: 'Centered on rigorous security definitions, attack models, and reductions, this book develops a formal understanding of why cryptographic constructions are secure.'
      },
      topics: {
        zh: ['计算安全与可忽略函数', '伪随机生成器、函数与置换', '选择明文攻击下的安全加密', '消息认证、哈希与数字签名的安全定义'],
        en: ['Computational security and negligible functions', 'Pseudorandom generators, functions, and permutations', 'Encryption secure against chosen-plaintext attacks', 'Security definitions for authentication, hashing, and signatures']
      },
      path: {
        zh: ['熟悉概率论与算法复杂度', '逐个拆解安全实验', '练习用归约证明连接原语与方案'],
        en: ['Review probability and algorithmic complexity', 'Deconstruct each security experiment', 'Practice reductions from primitives to schemes']
      }
    },
    {
      id: 'applied-cryptography-course',
      color: '#2f855a',
      title: 'A Graduate Course in Applied Cryptography',
      subtitle: { zh: '现代密码协议与应用体系', en: 'Modern cryptographic protocols and applications' },
      author: 'Dan Boneh · Victor Shoup',
      category: { zh: '应用密码学', en: 'Applied Cryptography' },
      level: { zh: '研究生', en: 'Graduate' },
      overview: {
        zh: '这套开放教材覆盖密码学核心原语、协议和安全证明，兼顾理论严谨性与应用场景。内容跨度大，可作为研究生课程主线，也适合按主题查阅。',
        en: 'This open textbook covers core primitives, protocols, and security proofs while balancing rigor with applications. Its broad scope makes it useful as a graduate course or a topic-by-topic reference.'
      },
      topics: {
        zh: ['认证加密与真实协议设计', '公钥加密、签名与密钥交换', '椭圆曲线、双线性映射与相关假设', '零知识证明、多方计算与后量子基础'],
        en: ['Authenticated encryption and real protocol design', 'Public-key encryption, signatures, and key exchange', 'Elliptic curves, bilinear maps, and related assumptions', 'Zero knowledge, multiparty computation, and post-quantum foundations']
      },
      path: {
        zh: ['按前置知识选择对应章节', '推导关键定理与安全边界', '结合论文或代码完成专题实践'],
        en: ['Choose chapters based on prerequisites', 'Derive key theorems and security boundaries', 'Pair topics with papers or implementation practice']
      }
    },
    {
      id: 'serious-cryptography',
      color: '#b7791f',
      title: 'Serious Cryptography',
      subtitle: { zh: '面向实践的现代加密指南', en: 'A practical guide to modern encryption' },
      author: 'Jean-Philippe Aumasson',
      category: { zh: '密码工程', en: 'Cryptographic Engineering' },
      level: { zh: '入门至进阶', en: 'Beginner–Intermediate' },
      overview: {
        zh: '本书聚焦现实系统中如何正确使用密码技术，既解释常用原语，也讨论随机数、实现风险和协议选择。它适合希望把理论知识落到软件与系统安全实践中的读者。',
        en: 'Focused on using cryptography correctly in real systems, this book explains common primitives while discussing randomness, implementation risks, and protocol choices.'
      },
      topics: {
        zh: ['现代加密原语的选择与组合', '安全随机数与密钥生命周期', 'TLS 等安全协议中的密码组件', '侧信道、错误消息与常见实现陷阱'],
        en: ['Selecting and composing modern primitives', 'Secure randomness and the key lifecycle', 'Cryptographic components in protocols such as TLS', 'Side channels, error messages, and implementation pitfalls']
      },
      path: {
        zh: ['建立威胁模型与原语地图', '对照标准理解安全参数', '通过代码审查识别错误用法'],
        en: ['Build a threat model and primitive map', 'Use standards to understand security parameters', 'Identify misuse through code review']
      }
    },
    {
      id: 'real-world-cryptography',
      color: '#805ad5',
      title: 'Real-World Cryptography',
      subtitle: { zh: '协议、产品与真实世界案例', en: 'Protocols, products, and real-world cases' },
      author: 'David Wong',
      category: { zh: '实用密码学', en: 'Practical Cryptography' },
      level: { zh: '入门至进阶', en: 'Beginner–Intermediate' },
      overview: {
        zh: '本书通过常见产品、协议和工程案例说明现代密码系统如何组合工作，帮助读者把零散的算法知识连接为完整的安全系统视图。',
        en: 'Using familiar products, protocols, and engineering examples, this book shows how modern cryptographic systems fit together and turns isolated algorithm knowledge into a system-level view.'
      },
      topics: {
        zh: ['认证加密、哈希和密钥派生', '用户认证、安全传输与端到端加密', '硬件密码、秘密管理与密钥轮换', '区块链、共识与新型密码应用'],
        en: ['Authenticated encryption, hashing, and key derivation', 'Authentication, secure transport, and end-to-end encryption', 'Hardware cryptography, secret management, and key rotation', 'Blockchains, consensus, and emerging cryptographic applications']
      },
      path: {
        zh: ['先理解核心原语的职责', '沿一个真实协议追踪数据流', '绘制系统信任边界并复盘风险'],
        en: ['Understand the role of each core primitive', 'Trace data flow through a real protocol', 'Map trust boundaries and review system risks']
      }
    }
  ];

  const elements = {
    brand: document.getElementById('knowledgeBrand'),
    home: document.getElementById('knowledgeHomeLink'),
    toggle: document.getElementById('knowledgeLangToggle'),
    eyebrow: document.getElementById('knowledgeEyebrow'),
    title: document.getElementById('knowledgeTitle'),
    summary: document.getElementById('knowledgeSummary'),
    shelfTitle: document.getElementById('bookShelfTitle'),
    shelfHint: document.getElementById('bookShelfHint'),
    list: document.getElementById('bookList'),
    content: document.getElementById('bookContent'),
    footer: document.getElementById('knowledgeFooter')
  };

  function escapeHTML(value) {
    const node = document.createElement('div');
    node.textContent = value == null ? '' : String(value);
    return node.innerHTML;
  }

  function getBook(bookId) {
    return books.find(function (book) { return book.id === bookId; }) || books[0];
  }

  function getChapter(book, chapterId) {
    if (!book.chapters || !book.chapters.length) return null;
    return book.chapters.find(function (chapter) { return chapter.id === chapterId; }) || book.chapters[0];
  }

  function renderPageCopy() {
    const copy = pageCopy[currentLang];
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.title = copy.title + ' | ' + (currentLang === 'zh' ? 'Fundamentals' : 'Academic Homepage');
    elements.brand.textContent = copy.brand;
    elements.home.textContent = copy.home;
    elements.toggle.textContent = copy.toggle;
    elements.eyebrow.textContent = copy.eyebrow;
    elements.title.textContent = copy.title;
    elements.summary.textContent = copy.summary;
    elements.shelfTitle.textContent = copy.shelf;
    elements.shelfHint.textContent = copy.hint;
    elements.footer.textContent = copy.footer;
  }

  function renderBookList() {
    elements.list.innerHTML = books.map(function (book) {
      const isActive = book.id === activeBookId;
      const chapterList = isActive && book.chapters ?
        '<div class="knowledge-chapter-list" aria-label="' + escapeHTML(book.title) + '章节">' +
          book.chapters.map(function (chapter) {
            const chapterIsActive = chapter.id === activeChapterId;
            return '<button class="knowledge-chapter' + (chapterIsActive ? ' is-active' : '') + '"' +
              ' type="button" data-book-id="' + escapeHTML(book.id) + '" data-chapter-id="' + escapeHTML(chapter.id) + '"' +
              ' aria-current="' + (chapterIsActive ? 'page' : 'false') + '">' +
              '<span>' + escapeHTML(chapter.number) + '</span>' +
              '<strong>' + escapeHTML(chapter.title) + '</strong>' +
            '</button>';
          }).join('') +
        '</div>' : '';

      return '<div class="knowledge-book-entry">' +
        '<button class="knowledge-book' + (isActive ? ' is-active' : '') + '"' +
          ' type="button" role="tab" aria-selected="' + isActive + '"' +
          ' aria-controls="bookContent" data-book-id="' + escapeHTML(book.id) + '"' +
          ' style="--book-color:' + escapeHTML(book.color) + '">' +
          '<span class="knowledge-book-title">' + escapeHTML(book.title) + '</span>' +
          '<span class="knowledge-book-author">' + escapeHTML(book.author) + '</span>' +
        '</button>' +
        chapterList +
      '</div>';
    }).join('');
  }

  function renderChapterSection(section) {
    const paragraphs = (section.paragraphs || []).map(function (paragraph) {
      return '<p>' + escapeHTML(paragraph) + '</p>';
    }).join('');
    const formulas = (section.formulas || []).map(function (formula) {
      return '<div class="knowledge-equation">' + escapeHTML(formula) + '</div>';
    }).join('');
    const bullets = section.bullets && section.bullets.length ?
      '<ul>' + section.bullets.map(function (item) { return '<li>' + escapeHTML(item) + '</li>'; }).join('') + '</ul>' : '';
    const note = section.note ? '<div class="knowledge-note">' + escapeHTML(section.note) + '</div>' : '';
    const figures = section.figures && section.figures.length ?
      '<div class="knowledge-figure-grid' + (section.figures.length > 1 ? ' is-multiple' : '') + '">' +
        section.figures.map(function (figure) {
          return '<figure class="knowledge-figure">' +
            '<img src="' + escapeHTML(figure.src) + '" alt="' + escapeHTML(figure.alt) + '" loading="lazy">' +
            '<figcaption>' + escapeHTML(figure.caption) + '</figcaption>' +
          '</figure>';
        }).join('') +
      '</div>' : '';

    return '<section class="knowledge-content-section knowledge-article-section">' +
      '<h2>' + escapeHTML(section.title) + '</h2>' +
      paragraphs + formulas + note + bullets + figures +
    '</section>';
  }

  function renderChapterContent(book, chapter) {
    const copy = pageCopy[currentLang];
    return '<header class="knowledge-reader-header">' +
        '<div class="knowledge-category">' + escapeHTML(book.category.zh) + ' · ' + escapeHTML(chapter.number) + '</div>' +
        '<h2 class="knowledge-reader-title">' + escapeHTML(book.title) + '</h2>' +
        '<p class="knowledge-reader-subtitle knowledge-chapter-title">' + escapeHTML(chapter.title) + '</p>' +
        '<div class="knowledge-book-meta">' +
          '<span>' + escapeHTML(copy.author) + ' · ' + escapeHTML(book.author) + '</span>' +
          '<span>' + escapeHTML(copy.level) + ' · ' + escapeHTML(book.level.zh) + '</span>' +
        '</div>' +
      '</header>' +
      '<div class="knowledge-reader-body knowledge-chapter-body">' +
        '<div class="knowledge-chapter-lead">' +
          '<p>' + escapeHTML(chapter.introduction) + '</p>' +
          '<div class="knowledge-source-note"><strong>资料来源</strong><span>' + escapeHTML(chapter.source) + '</span><span>中文学习笔记，插图截取自原讲义。</span></div>' +
        '</div>' +
        chapter.sections.map(renderChapterSection).join('') +
      '</div>';
  }

  function renderOverviewContent(book) {
    const copy = pageCopy[currentLang];
    return '<header class="knowledge-reader-header">' +
      '<div class="knowledge-category">' + escapeHTML(book.category[currentLang]) + '</div>' +
      '<h2 class="knowledge-reader-title">' + escapeHTML(book.title) + '</h2>' +
      '<p class="knowledge-reader-subtitle">' + escapeHTML(book.subtitle[currentLang]) + '</p>' +
      '<div class="knowledge-book-meta">' +
        '<span>' + escapeHTML(copy.author) + ' · ' + escapeHTML(book.author) + '</span>' +
        '<span>' + escapeHTML(copy.level) + ' · ' + escapeHTML(book.level[currentLang]) + '</span>' +
      '</div>' +
    '</header>' +
    '<div class="knowledge-reader-body">' +
        '<section class="knowledge-content-section">' +
          '<h2>' + escapeHTML(copy.overview) + '</h2>' +
          '<p>' + escapeHTML(book.overview[currentLang]) + '</p>' +
        '</section>' +
        '<section class="knowledge-content-section">' +
          '<h2>' + escapeHTML(copy.topics) + '</h2>' +
          '<ul>' + book.topics[currentLang].map(function (topic) { return '<li>' + escapeHTML(topic) + '</li>'; }).join('') + '</ul>' +
        '</section>' +
        '<section class="knowledge-content-section">' +
          '<h2>' + escapeHTML(copy.path) + '</h2>' +
          '<div class="knowledge-reading-path">' + book.path[currentLang].map(function (step) { return '<p class="knowledge-reading-step">' + escapeHTML(step) + '</p>'; }).join('') + '</div>' +
        '</section>' +
      '</div>';
  }

  function typesetMath() {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise([elements.content]).catch(function (error) {
        console.warn('MathJax typesetting failed:', error);
      });
    }
  }

  function renderBookContent() {
    const book = getBook(activeBookId);
    const chapter = getChapter(book, activeChapterId);
    activeBookId = book.id;
    if (chapter) activeChapterId = chapter.id;
    elements.content.style.setProperty('--book-color', book.color);
    elements.content.innerHTML = chapter ? renderChapterContent(book, chapter) : renderOverviewContent(book);
    typesetMath();
  }

  function updateLocation() {
    const url = new URL(window.location.href);
    url.searchParams.set('book', activeBookId);
    const book = getBook(activeBookId);
    if (book.chapters && book.chapters.length) {
      url.searchParams.set('chapter', activeChapterId);
    } else {
      url.searchParams.delete('chapter');
    }
    window.history.replaceState({}, '', url);
  }

  function render() {
    renderPageCopy();
    renderBookList();
    renderBookContent();
  }

  elements.list.addEventListener('click', function (event) {
    const button = event.target.closest('[data-book-id]');
    if (!button) return;
    activeBookId = button.getAttribute('data-book-id');
    const book = getBook(activeBookId);
    if (button.hasAttribute('data-chapter-id')) {
      activeChapterId = button.getAttribute('data-chapter-id');
    } else if (book.chapters && book.chapters.length) {
      activeChapterId = book.chapters[0].id;
    }
    updateLocation();
    renderBookList();
    renderBookContent();
    if (window.innerWidth <= 880) {
      elements.content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  elements.list.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const currentIndex = books.findIndex(function (book) { return book.id === activeBookId; });
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + direction + books.length) % books.length;
    activeBookId = books[nextIndex].id;
    if (books[nextIndex].chapters && books[nextIndex].chapters.length) {
      activeChapterId = books[nextIndex].chapters[0].id;
    }
    updateLocation();
    renderBookList();
    renderBookContent();
    const activeButton = elements.list.querySelector('.is-active');
    if (activeButton) activeButton.focus();
  });

  elements.toggle.addEventListener('click', function () {
    currentLang = supportedLanguages[(supportedLanguages.indexOf(currentLang) + 1) % supportedLanguages.length];
    localStorage.setItem(LANG_KEY, currentLang);
    render();
  });

  render();
})();
