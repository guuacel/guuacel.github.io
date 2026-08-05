(function () {
  'use strict';

  window.LATTICE_CHAPTERS_9_12 = [
    {
      id: 'chapter-9',
      number: '第九章',
      title: '对偶格、KZ 基与转移思想',
      source: 'Lattices in Computer Science, Lecture 8: Dual Lattices',
      introduction: '本章从内积的整数约束定义对偶格，推导对偶基、二次对偶和行列式互反关系。接着用逐次最小值说明原格与对偶格的长短如何互相制约，并介绍递归选择最短投影向量的 Korkine–Zolotarev 基。最后说明这些结构怎样产生 GapSVP 的 coNP 证书和近似 SVP 归约。',
      sections: [
        {
          title: '1. 对偶格的定义与第一直觉',
          paragraphs: [
            '对秩为 \\(n\\) 的格 \\(\\Lambda\\)，对偶格由所有与每个原格向量内积都是整数的向量组成。若原格不满秩，还要求对偶向量位于 \\(\\operatorname{span}(\\Lambda)\\) 中，以排除与整个格空间正交的任意连续方向。',
            '一维中，\\(2\\mathbb Z\\) 的对偶是 \\(\\tfrac12\\mathbb Z\\)：原格越稀，对偶格越密。\\(\\mathbb Z^n\\) 与自身对偶，因此称为自对偶格。'
          ],
          formulas: [
            '\\[\\Lambda^*=\\{y\\in\\operatorname{span}(\\Lambda):\\langle x,y\\rangle\\in\\mathbb Z\\ \\text{对所有 }x\\in\\Lambda\\}.\\]',
            '\\[(\\mathbb Z^n)^*=\\mathbb Z^n,\\qquad (2\\mathbb Z^n)^*=\\tfrac12\\mathbb Z^n.\\]'
          ]
        },
        {
          title: '2. 几何图像：每个原格向量施加一族超平面约束',
          paragraphs: [
            '固定非零向量 \\(x\\) 后，满足 \\(\\langle x,y\\rangle\\in\\mathbb Z\\) 的所有 \\(y\\) 位于一族垂直于 \\(x\\) 的平行超平面上，相邻超平面的距离是 \\(1/\\|x\\|\\)。',
            '对偶格要求同时满足原格中所有向量带来的约束。长原格向量对应更密的约束平面，短原格向量对应更疏的平面；这正是原格与对偶格之间“长短互反”的几何来源。'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-9/dual-lattice.png',
              alt: '二维格与其对偶格的超平面几何解释',
              caption: '图 1：原格向量 \\(x\\) 迫使对偶点落在间距 \\(1/\\|x\\|\\) 的超平面上；多个方向的约束相交形成对偶格。'
            }
          ]
        },
        {
          title: '3. 对偶基如何计算',
          paragraphs: [
            '设 \\(B=(b_1,\\ldots,b_n)\\in\\mathbb R^{m\\times n}\\) 列满秩。对偶基 \\(D=(d_1,\\ldots,d_n)\\) 与 \\(B\\) 张成同一子空间，并满足 \\(B^TD=I\\)，也就是 \\(\\langle b_i,d_j\\rangle=\\delta_{ij}\\)。',
            '满秩方阵时 \\(D=B^{-T}\\)；一般列满秩时 \\(D=B(B^TB)^{-1}\\)。任何与全部 \\(b_i\\) 内积为整数的向量，在 \\(D\\) 中的坐标正好就是这些整数，所以 \\(L(D)=L(B)^*\\)。'
          ],
          formulas: [
            '\\[B^TD=I,\\qquad D=B(B^TB)^{-1}.\\]',
            '\\[m=n\\text{ 时 }D=(B^T)^{-1}=B^{-T}.\\]'
          ],
          note: '对偶基依赖所选原基，但由它生成的对偶格只依赖 \\(\\Lambda\\)。更换原格基会相应更换对偶基，却不改变点集。'
        },
        {
          title: '4. 二次对偶与行列式互反',
          paragraphs: [
            '把对偶操作做两次会回到原格：\\((\\Lambda^*)^*=\\Lambda\\)。从基矩阵看，这是因为对 \\(B(B^TB)^{-1}\\) 再取对偶会恢复 \\(B\\)。',
            '基本平行多面体体积满足 \\(\\det(\\Lambda^*)=1/\\det(\\Lambda)\\)。因此原格越密，对偶格越稀；自对偶格的行列式必为 1。这个公式也使原格与对偶格的 Minkowski 界可以相乘并消去行列式。'
          ],
          formulas: [
            '\\[(\\Lambda^*)^*=\\Lambda,\\qquad \\det(\\Lambda^*)=\\frac1{\\det(\\Lambda)}.\\]'
          ]
        },
        {
          title: '5. 两个基础转移不等式',
          paragraphs: [
            'Minkowski 界分别作用于 \\(\\Lambda\\) 和 \\(\\Lambda^*\\)，再利用行列式互反，可得 \\(\\lambda_1(\\Lambda)\\lambda_1(\\Lambda^*)\\le n\\)。它说明原格和对偶格不可能同时没有较短向量。',
            '另一方面，取原格最短向量 \\(v\\) 与对偶格中任意 \\(n\\) 个线性无关向量。至少一个对偶向量与 \\(v\\) 内积非零，该内积又必须是非零整数，绝对值至少为 1。Cauchy–Schwarz 因而给出 \\(\\lambda_1(\\Lambda)\\lambda_n(\\Lambda^*)\\ge1\\)。'
          ],
          formulas: [
            '\\[\\lambda_1(\\Lambda)\\lambda_1(\\Lambda^*)\\le n.\\]',
            '\\[\\lambda_1(\\Lambda)\\lambda_n(\\Lambda^*)\\ge1.\\]'
          ]
        },
        {
          title: '6. 对偶基与 Gram–Schmidt 的反向关系',
          paragraphs: [
            '将原基 \\(b_1,\\ldots,b_n\\) 做 Gram–Schmidt，得到 \\(\\widetilde b_i\\)。把对偶基按反向顺序 \\(d_n,\\ldots,d_1\\) 做 Gram–Schmidt，得到的对应正交向量满足 \\(\\widetilde d_i=\\widetilde b_i/\\|\\widetilde b_i\\|^2\\)。',
            '因此正交长度互为倒数。原基中某一层的高度很小，对偶基逆序中的对应高度就很大。后面的 KZ 基证书正是利用这一关系，把对偶格中的良好基转换为原格中所有 Gram–Schmidt 长度的下界。'
          ],
          formulas: [
            '\\[\\widetilde d_i=\\frac{\\widetilde b_i}{\\|\\widetilde b_i\\|^2},\\qquad \\|\\widetilde d_i\\|=\\frac1{\\|\\widetilde b_i\\|}.\\]'
          ]
        },
        {
          title: '7. Korkine–Zolotarev 基的递归定义',
          paragraphs: [
            'KZ 基试图在每个递归层都做“最优选择”。先令 \\(b_1\\) 为格中真正的最短向量，再把整个格正交投影到 \\(b_1^\\perp\\)，在投影格中递归选择 KZ 基 \\(c_2,\\ldots,c_n\\)。',
            '最后把每个 \\(c_i\\) 沿 \\(b_1\\) 方向抬回原格，选择唯一的系数 \\(\\alpha_i\\in(-1/2,1/2]\\)，令 \\(b_i=c_i+\\alpha_i b_1\\in\\Lambda\\)。与 LLL 不同，KZ 基的定义调用精确 SVP，因此主要是结构工具而非通常意义下的高效算法。'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-9/kz-basis.png',
              alt: '二维格的投影格与 KZ 基构造',
              caption: '图 2：先选择原格最短向量，再在其正交投影格中递归选择最短方向，并抬回原格。'
            }
          ]
        },
        {
          title: '8. 一个关键基存在性引理',
          paragraphs: [
            'Lagarias–Lenstra–Schnorr 引理说明，每个秩 \\(n\\) 的格都有一组基，使所有 Gram–Schmidt 向量的最小长度至少为 \\(\\lambda_1(\\Lambda)/n\\)。证明先在 \\(\\Lambda^*\\) 中选择 KZ 基，再取其逆序对偶基。',
            'KZ 递归保证每个投影层的对偶正交向量足够短；基础转移不等式把它们控制在 \\(n/\\lambda_1(\\Lambda)\\) 内；正交长度互反后，就得到原格每层高度至少为 \\(\\lambda_1(\\Lambda)/n\\)。'
          ],
          formulas: [
            '\\[\\exists\\,b_1,\\ldots,b_n:\\qquad \\min_i\\|\\widetilde b_i\\|\\ge\\frac1n\\lambda_1(\\Lambda).\\]'
          ]
        },
        {
          title: '9. 用良好基作为 GapSVP 的 coNP 证书',
          paragraphs: [
            '对 GapSVP\\(_n\\) 的 NO 实例，\\(\\lambda_1(L(B))>nd\\)。由上面的引理，存在一组基 \\(v_1,\\ldots,v_n\\)，其所有 Gram–Schmidt 长度都大于 \\(d\\)。验证者只需检查它们确实生成同一个格，并计算正交化长度。',
            '对 YES 实例，\\(\\lambda_1\\le d\\)。任意基都满足 \\(\\min_i\\|\\widetilde v_i\\|\\le\\lambda_1\\)，所以不存在能通过验证的伪证书。这就证明 \\(\\mathrm{GapSVP}_n\\in\\mathrm{coNP}\\)。'
          ],
          formulas: [
            '\\[\\text{证书条件： }L(v_1,\\ldots,v_n)=L(B),\\qquad \\min_i\\|\\widetilde v_i\\|>d.\\]'
          ]
        },
        {
          title: '10. 从行列式近似到 SVP 近似',
          paragraphs: [
            '若某算法对任意格都能找到非零向量 \\(u\\)，满足 \\(\\|u\\|\\le f(n)\\det(\\Lambda)^{1/n}\\)，那么分别在 \\(\\Lambda\\) 与 \\(\\Lambda^*\\) 上调用它，得到 \\(\\|u\\|\\|v\\|\\le f(n)^2\\)。',
            '讲义给出递归引理：若能在原格与对偶格中找到乘积长度至多 \\(g(n)\\) 的向量，就能构造一组层层受控的向量并输出一个 \\(g(n)\\) 近似的 SVP 解。因此仅仅达到 Minkowski 型的行列式上界，就已经足以推出 \\(f(n)^2\\) 近似 SVP。'
          ],
          formulas: [
            '\\[\\|u\\|\\le f(n)\\det(\\Lambda)^{1/n},\\quad \\|v\\|\\le f(n)\\det(\\Lambda)^{-1/n}\\Longrightarrow\\|u\\|\\|v\\|\\le f(n)^2.\\]'
          ]
        },
        {
          title: '本章小结',
          paragraphs: [
            '对偶格把“与所有格向量内积为整数”编码为一个新的格。对偶基矩阵、二次对偶和行列式互反给出代数结构；超平面间距、逐次最小值和 Gram–Schmidt 长度互反给出几何结构；KZ 基则把这些关系组织成递归的最优基。',
            '对偶格最重要的用途不是单独计算一个新点集，而是建立转移：原格中的短向量、对偶格中的独立短向量、格层高度和负实例证书可以互相转换。'
          ]
        }
      ]
    },
    {
      id: 'chapter-10',
      number: '第十章',
      title: '傅里叶变换、傅里叶级数与 Poisson 求和公式',
      source: 'Lattices in Computer Science, Lecture 9: Fourier Transform',
      introduction: '本章补齐后续高斯格分析需要的傅里叶工具。我们从一维傅里叶变换及矩形函数、高斯函数的例子出发，整理平移、调制、缩放、卷积和微分等性质，再推广到高维。随后转向周期函数的傅里叶级数，并逐步把 Poisson 求和公式从整数格推广到任意满秩格。',
      sections: [
        {
          title: '1. 傅里叶变换在做什么',
          paragraphs: [
            '傅里叶变换把函数从“位置变量”表示转换为“频率变量”表示。对可积函数 \\(f:\\mathbb R\\to\\mathbb C\\)，频率 \\(y\\) 处的系数是函数与复指数 \\(e^{2\\pi ixy}\\) 的内积。',
            '低频描述缓慢变化，高频描述快速振荡。\\(\\widehat f(0)=\\int f(x)dx\\) 是函数总质量。讲义采用指数中的 \\(2\\pi\\) 规范，使高斯自对偶和 Poisson 求和公式具有最简洁的形式。'
          ],
          formulas: [
            '\\[\\widehat f(y)=\\int_{-\\infty}^{\\infty}f(x)e^{-2\\pi ixy}\\,dx.\\]'
          ]
        },
        {
          title: '2. 矩形函数变成 sinc 波形',
          paragraphs: [
            '令 \\(f(x)=1\\) 当 \\(|x|<a\\)，其他地方为 0。直接积分得到 \\(\\widehat f(y)=\\sin(2\\pi ay)/(\\pi y)\\)。原函数在位置域中紧支撑且有跳跃，频率域中则延伸到无穷并以振荡方式衰减。',
            '这个例子展示基本不确定性直觉：位置域越集中，频率域通常越扩散；尖锐边界会制造高频成分。\\(y=0\\) 处应取连续极限 \\(2a\\)，等于矩形面积。'
          ],
          formulas: [
            '\\[f(x)=\\mathbf1_{(-a,a)}(x),\\qquad \\widehat f(y)=\\frac{\\sin(2\\pi ay)}{\\pi y}.\\]'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-10/rectangle-fourier.png',
              alt: '矩形函数及其傅里叶变换 sinc 曲线',
              caption: '图 1：紧支撑矩形函数的频谱是具有振荡尾部的 sinc 型函数。'
            }
          ]
        },
        {
          title: '3. 高斯函数是傅里叶分析中的核心对象',
          paragraphs: [
            '对 \\(f_s(x)=e^{-\\pi(x/s)^2}\\)，配方并利用复积分平移，可得 \\(\\widehat f_s(y)=s e^{-\\pi(sy)^2}\\)。参数 \\(s\\) 越大，原高斯越宽，而傅里叶变换越窄。',
            '特别地，\\(s=1\\) 时 \\(e^{-\\pi x^2}\\) 在傅里叶变换下保持不变。高斯同时具有快速衰减、光滑和简单变换公式，因而成为连接格与对偶格的理想权函数。'
          ],
          formulas: [
            '\\[f_s(x)=e^{-\\pi(x/s)^2},\\qquad \\widehat f_s(y)=s\\,e^{-\\pi(sy)^2}.\\]'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-10/gaussian-fourier.png',
              alt: '宽高斯与窄傅里叶高斯的对应关系',
              caption: '图 2：尺度放大在频域中变为倒数尺度压缩，并带有归一化因子。'
            }
          ]
        },
        {
          title: '4. 必须掌握的变换规则',
          paragraphs: [
            '傅里叶变换是线性的。位置平移 \\(f(x+z)\\) 在频域中乘相位 \\(e^{2\\pi izy}\\)；位置域乘相位 \\(e^{2\\pi izx}\\) 则让频谱平移。缩放 \\(h(x)=\\lambda f(\\lambda x)\\) 会把频率尺度变成 \\(y/\\lambda\\)。',
            '卷积在频域变成逐点乘法，逐点乘法在频域变成卷积。微分在频域中变成乘以 \\(2\\pi iy\\)。这些规则允许在不重新积分的情况下计算复杂函数的变换。'
          ],
          formulas: [
            '\\[h(x)=f(x+z)\\Longrightarrow\\widehat h(y)=e^{2\\pi izy}\\widehat f(y).\\]',
            '\\[\\widehat{f*g}=\\widehat f\\,\\widehat g,\\qquad \\widehat{f\\,g}=\\widehat f*\\widehat g.\\]',
            '\\[\\widehat{f^{\\prime}}(y)=2\\pi iy\\,\\widehat f(y).\\]'
          ]
        },
        {
          title: '5. 反演公式：频谱没有丢失原函数',
          paragraphs: [
            '在适当的连续性与可积条件下，函数可以从其傅里叶变换恢复。变换使用负号相位，反演使用正号相位。',
            '这说明傅里叶变换不是近似摘要，而是一种可逆坐标变换。后续证明会在位置域和频率域之间来回切换，选择哪一边更容易利用格的离散结构。'
          ],
          formulas: [
            '\\[f(x)=\\int_{-\\infty}^{\\infty}\\widehat f(y)e^{2\\pi ixy}\\,dy.\\]'
          ]
        },
        {
          title: '6. 推广到 \\(n\\) 维',
          paragraphs: [
            '在 \\(\\mathbb R^n\\) 中，把乘积 \\(xy\\) 换成内积 \\(\\langle x,y\\rangle\\)，积分换成 \\(n\\) 重积分。线性、平移、调制、缩放、卷积和偏微分性质全部保留。',
            '若函数可分离为 \\(f(x)=\\prod_{j=1}^{n}f_j(x_j)\\)，则其变换也按坐标分离。多维标准高斯 \\(\\rho(x)=e^{-\\pi\\|x\\|^2}\\) 是一维高斯的乘积，所以仍满足 \\(\\widehat\\rho=\\rho\\)。'
          ],
          formulas: [
            '\\[\\widehat f(y)=\\int_{\\mathbb R^n}f(x)e^{-2\\pi i\\langle x,y\\rangle}\\,dx.\\]',
            '\\[\\rho_s(x)=e^{-\\pi\\|x/s\\|^2}\\Longrightarrow\\widehat\\rho_s(y)=s^n\\rho_{1/s}(y).\\]'
          ]
        },
        {
          title: '7. 周期函数需要傅里叶级数',
          paragraphs: [
            '对周期为 1 的函数，频率只能取整数 \\(k\\in\\mathbb Z\\)。第 \\(k\\) 个傅里叶系数是在一个周期内的积分。反演公式把周期函数写成所有整数频率复指数的和。',
            '与连续傅里叶变换不同，傅里叶级数的频域是离散的。这源于周期性：只有满足 \\(e^{2\\pi ik(x+1)}=e^{2\\pi ikx}\\) 的整数频率与周期 1 相容。'
          ],
          formulas: [
            '\\[\\widehat f(k)=\\int_0^1f(x)e^{-2\\pi ikx}\\,dx,\\qquad k\\in\\mathbb Z.\\]',
            '\\[f(x)=\\sum_{k\\in\\mathbb Z}\\widehat f(k)e^{2\\pi ikx}.\\]'
          ]
        },
        {
          title: '8. Poisson 求和公式的一维推导',
          paragraphs: [
            '把一个非周期函数周期化：\\(\\phi(t)=\\sum_{j\\in\\mathbb Z}f(t+j)\\)。计算它的第 \\(k\\) 个傅里叶系数，分段积分会恰好拼成整条实线上的傅里叶变换 \\(\\widehat f(k)\\)。',
            '在 \\(t=0\\) 处应用傅里叶级数反演，左边是 \\(\\sum_jf(j)\\)，右边是 \\(\\sum_k\\widehat f(k)\\)。这就是 Poisson 求和公式：一个函数在整数格上的总和等于其频谱在对偶整数格上的总和。'
          ],
          formulas: [
            '\\[\\sum_{j\\in\\mathbb Z}f(j)=\\sum_{k\\in\\mathbb Z}\\widehat f(k).\\]'
          ]
        },
        {
          title: '9. 任意一维周期与缩放因子',
          paragraphs: [
            '若周期为 \\(\\lambda\\)，频率集合变成对偶格 \\(\\lambda^{-1}\\mathbb Z\\)。傅里叶系数需要除以周期长度，Poisson 求和公式相应出现 \\(1/\\lambda\\) 因子。',
            '这个缩放因子正是对偶格行列式 \\(\\det((\\lambda\\mathbb Z)^*)=1/\\lambda\\)。一维公式已经预示一般格版本中的 \\(\\det(\\Lambda^*)\\)。'
          ],
          formulas: [
            '\\[\\sum_{x\\in\\lambda\\mathbb Z}f(x)=\\frac1\\lambda\\sum_{y\\in\\lambda^{-1}\\mathbb Z}\\widehat f(y).\\]'
          ]
        },
        {
          title: '10. 格周期函数与对偶格频率',
          paragraphs: [
            '若 \\(f(x+z)=f(x)\\) 对所有 \\(z\\in\\Lambda\\) 成立，则允许的频率必须满足 \\(e^{2\\pi i\\langle z,y\\rangle}=1\\)，也就是 \\(\\langle z,y\\rangle\\in\\mathbb Z\\)。因此频率索引集合恰好是对偶格 \\(\\Lambda^*\\)。',
            '在任一基本平行多面体 \\(P(B)\\) 上积分并除以 \\(\\det(\\Lambda)\\)，得到格周期函数的傅里叶系数。该定义与选择哪一组格基无关。'
          ],
          formulas: [
            '\\[\\widehat f(y)=\\frac1{\\det(\\Lambda)}\\int_{P(B)}f(x)e^{-2\\pi i\\langle x,y\\rangle}\\,dx,\\qquad y\\in\\Lambda^*.\\]',
            '\\[f(x)=\\sum_{y\\in\\Lambda^*}\\widehat f(y)e^{2\\pi i\\langle x,y\\rangle}.\\]'
          ]
        },
        {
          title: '11. 任意满秩格上的 Poisson 求和公式',
          paragraphs: [
            '把 \\(f\\) 在格上周期化为 \\(\\phi(x)=\\sum_{z\\in\\Lambda}f(x+z)\\)。它的格傅里叶系数等于 \\(\\det(\\Lambda^*)\\widehat f(y)\\)。在原点应用反演即可得到一般公式。',
            '对高斯 \\(\\rho_s\\) 使用该公式，傅里叶变换仍为高斯，于是原格上的高斯质量可精确表示为对偶格上的倒数尺度高斯质量。后两章的所有关键估计都从这个等式出发。'
          ],
          formulas: [
            '\\[\\sum_{x\\in\\Lambda}f(x)=\\det(\\Lambda^*)\\sum_{y\\in\\Lambda^*}\\widehat f(y).\\]',
            '\\[\\rho_s(\\Lambda)=s^n\\det(\\Lambda^*)\\rho_{1/s}(\\Lambda^*).\\]'
          ],
          note: 'Poisson 求和公式是“空间格求和”与“对偶格频率求和”之间的桥梁；对偶格不是人为附加的对象，而是周期性允许的全部频率。'
        },
        {
          title: '本章小结',
          paragraphs: [
            '傅里叶变换把位置结构转成频率结构，高斯在两域中保持高斯，周期函数的频率则离散化为对偶格。通过先周期化再做傅里叶级数，Poisson 求和公式把原格上的函数和与对偶格上的傅里叶变换和精确连接起来。',
            '继续学习前应熟记三条式子：高斯变换 \\(\\widehat\\rho_s=s^n\\rho_{1/s}\\)、格周期频率属于 \\(\\Lambda^*\\)、以及 \\(f(\\Lambda)=\\det(\\Lambda^*)\\widehat f(\\Lambda^*)\\)。'
          ]
        }
      ]
    },
    {
      id: 'chapter-11',
      number: '第十一章',
      title: '转移定理、覆盖半径与周期高斯',
      source: 'Lattices in Computer Science, Lecture 11: Transference Theorems',
      introduction: '本章用上一章的 Poisson 求和公式证明原格和对偶格之间更强的几何联系。目标是理解 Banaszczyk 转移定理 \\(1\\le\\lambda_1(\\Lambda)\\lambda_n(\\Lambda^*)\\le n\\)。讲义通过覆盖半径把问题转化为 \\(\\lambda_1(\\Lambda)\\mu(\\Lambda^*)\\) 的上界，并用周期高斯的尾界与“平移后近似均匀”性质完成反证。',
      sections: [
        {
          title: '1. Banaszczyk 转移定理',
          paragraphs: [
            '对任意秩 \\(n\\) 的格，最短向量与对偶格第 \\(n\\) 个逐次最小值的乘积介于 1 和 \\(n\\) 之间。下界来自对偶定义：任意 \\(n\\) 个线性无关对偶向量中，至少一个与原格最短向量有非零整数内积。',
            '上界比简单的 \\(\\lambda_1(\\Lambda)\\lambda_1(\\Lambda^*)\\le n\\) 强得多，因为 \\(\\lambda_n\\) 要求在对偶格中找到 \\(n\\) 个线性无关短向量。更一般的结论还把 \\(\\lambda_i(\\Lambda)\\) 与 \\(\\lambda_{n-i+1}(\\Lambda^*)\\) 配对。'
          ],
          formulas: [
            '\\[1\\le\\lambda_1(\\Lambda)\\lambda_n(\\Lambda^*)\\le n.\\]'
          ]
        },
        {
          title: '2. 应用：GapSVP 的负证书',
          paragraphs: [
            '考虑 GapSVP\\(_n\\)。对 NO 实例 \\(\\lambda_1(\\Lambda)>nd\\)，转移定理推出 \\(\\lambda_n(\\Lambda^*)<1/d\\)。因此存在 \\(n\\) 个线性无关的对偶格向量，长度都小于 \\(1/d\\)。',
            '验证者检查这些向量属于 \\(\\Lambda^*\\)、线性无关且满足长度界。若是 YES 实例 \\(\\lambda_1(\\Lambda)\\le d\\)，转移定理下界给出 \\(\\lambda_n(\\Lambda^*)\\ge1/d\\)，任何证书都无法通过。'
          ]
        },
        {
          title: '3. 覆盖半径是什么',
          paragraphs: [
            '覆盖半径 \\(\\mu(\\Lambda)\\) 是空间中最远点到格的距离，也就是用以每个格点为中心、半径为 \\(\\mu\\) 的球刚好覆盖整个空间所需的最小半径。由于距离对格平移周期，只需在一个基本平行多面体内寻找最远点。',
            '对整数格 \\(\\mathbb Z^n\\)，最远点是立方体中心 \\((1/2,\\ldots,1/2)\\)，所以 \\(\\mu(\\mathbb Z^n)=\\sqrt n/2\\)。覆盖半径衡量格中“最大孔洞”有多大。'
          ],
          formulas: [
            '\\[\\mu(\\Lambda)=\\max_{x\\in\\mathbb R^n}\\operatorname{dist}(x,\\Lambda).\\]'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-11/covering-radius.png',
              alt: '覆盖半径与第 n 个逐次最小值的几何关系',
              caption: '图 1：在全部短格向量所在超平面的法向方向取点，可构造距所有格点至少 \\(\\lambda_n/2\\) 的孔洞。'
            }
          ]
        },
        {
          title: '4. 覆盖半径与 \\(\\lambda_n\\) 的关系',
          paragraphs: [
            '半径小于 \\(\\lambda_n(\\Lambda)\\) 的球内，所有格向量都落在某个 \\((n-1)\\) 维超平面中。取一个垂直该超平面、距原点 \\(\\lambda_n/2\\) 的点，它到球内格点至少有该距离，到球外格点也至少有该距离。',
            '因此 \\(\\mu(\\Lambda)\\ge\\lambda_n(\\Lambda)/2\\)。只要证明 \\(\\lambda_1(\\Lambda)\\mu(\\Lambda^*)\\le n/2\\)，就能推出 Banaszczyk 上界。讲义为简化常数，证明稍弱但同阶的 \\(\\lambda_1(\\Lambda)\\mu(\\Lambda^*)\\le n\\)。'
          ],
          formulas: [
            '\\[\\mu(\\Lambda)\\ge\\frac12\\lambda_n(\\Lambda),\\qquad \\lambda_1(\\Lambda)\\mu(\\Lambda^*)\\le n.\\]'
          ]
        },
        {
          title: '5. Poisson 求和下的平移高斯',
          paragraphs: [
            '记 \\(\\rho_s(x)=e^{-\\pi\\|x/s\\|^2}\\)，并把集合上的高斯质量记为 \\(\\rho_s(S)=\\sum_{x\\in S}\\rho_s(x)\\)。Poisson 求和公式给出原格与对偶格之间的精确等式。',
            '对平移格 \\(\\Lambda+u\\)，频域中多出相位 \\(e^{2\\pi i\\langle y,u\\rangle}\\)。这一相位绝对值为 1，允许用三角不等式比较平移前后的高斯质量。'
          ],
          formulas: [
            '\\[\\rho_s(\\Lambda)=s^n\\det(\\Lambda^*)\\rho_{1/s}(\\Lambda^*).\\]',
            '\\[\\rho_s(\\Lambda+u)=s^n\\det(\\Lambda^*)\\sum_{y\\in\\Lambda^*}\\rho_{1/s}(y)e^{2\\pi i\\langle y,u\\rangle}.\\]'
          ]
        },
        {
          title: '6. 平移不会增加格的高斯质量',
          paragraphs: [
            '对上式取绝对值并用三角不等式，得到 \\(\\rho_s(\\Lambda+u)\\le\\rho_s(\\Lambda)\\)。直觉上，高斯峰值放在格点上时，总质量最大；把格整体错开不会得到更多质量。',
            '进一步，对 \\(s\\ge1\\)，Poisson 公式和 \\(\\rho_{1/s}(y)\\le\\rho(y)\\) 给出 \\(\\rho_s(\\Lambda+u)\\le s^n\\rho(\\Lambda)\\)。稀疏格时这个界很松，稠密格时则接近积分尺度带来的 \\(s^n\\) 放大。'
          ],
          formulas: [
            '\\[\\rho_s(\\Lambda+u)\\le\\rho_s(\\Lambda),\\qquad \\rho_s(\\Lambda+u)\\le s^n\\rho(\\Lambda)\\ (s\\ge1).\\]'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-11/periodic-gaussians.png',
              alt: '不同稠密程度的一维格周期高斯函数',
              caption: '图 2：格越密，周期高斯随平移的波动越小；格稀疏时峰谷更加明显。'
            }
          ]
        },
        {
          title: '7. 高斯尾界：大部分质量集中在 \\(\\sqrt n\\) 球内',
          paragraphs: [
            '讲义证明，对任意平移 \\(u\\)，半径 \\(\\sqrt n\\) 之外的标准高斯质量至多为 \\(2^{-n}\\rho(\\Lambda)\\)。证明技巧是比较尺度 2 与尺度 1 的高斯：远点在宽高斯中相对放大至少 \\(e^{3\\pi n/4}\\)，但总宽高斯质量又至多放大 \\(2^n\\)。',
            '若 \\(\\lambda_1(\\Lambda)>\\sqrt n\\)，那么球内唯一格点是 0，所以所有非零格点的高斯质量满足 \\(\\rho(\\Lambda\\setminus\\{0\\})\\le2^{-n}/(1-2^{-n})\\)，即指数小。'
          ],
          formulas: [
            '\\[\\rho\\big((\\Lambda+u)\\setminus B(0,\\sqrt n)\\big)\\le2^{-n}\\rho(\\Lambda).\\]',
            '\\[\\lambda_1(\\Lambda)>\\sqrt n\\Longrightarrow\\rho(\\Lambda\\setminus\\{0\\})\\le\\frac{2^{-n}}{1-2^{-n}}.\\]'
          ]
        },
        {
          title: '8. 原格稀疏时，对偶格的周期高斯近似常数',
          paragraphs: [
            '若 \\(\\lambda_1(\\Lambda)>\\sqrt n\\)，Poisson 公式把 \\(\\rho(\\Lambda^*+u)\\) 写为对偶行列式乘以原格频率和。零频项贡献 1，全部非零频率的绝对贡献由上一节控制为 \\(2^{-\\Omega(n)}\\)。',
            '因此对任意平移 \\(u\\)，\\(\\rho(\\Lambda^*+u)\\) 都落在 \\((1\\pm2^{-\\Omega(n)})\\det(\\Lambda)\\) 内。直觉是：原格没有短频率，就没有能力让对偶格周期函数产生明显起伏。'
          ],
          formulas: [
            '\\[\\rho(\\Lambda^*+u)\\in\\big(1\\pm2^{-\\Omega(n)}\\big)\\det(\\Lambda).\\]'
          ]
        },
        {
          title: '9. 用反证完成覆盖半径上界',
          paragraphs: [
            '假设存在格使 \\(\\lambda_1(\\Lambda)\\mu(\\Lambda^*)>n\\)。通过缩放，可以令 \\(\\lambda_1(\\Lambda)>\\sqrt n\\) 且 \\(\\mu(\\Lambda^*)>\\sqrt n\\)。前一个条件使周期高斯 \\(\\rho(\\Lambda^*+u)\\) 对所有 \\(u\\) 近似常数。',
            '后一个条件表示存在点 \\(v\\) 距每个对偶格点都大于 \\(\\sqrt n\\)。于是平移格 \\(\\Lambda^*-v\\) 的所有点都在高斯尾部，尾界给出 \\(\\rho(\\Lambda^*-v)<2^{-n}\\rho(\\Lambda^*)\\)。这与“所有平移的质量近似相同”矛盾，故乘积上界成立。'
          ],
          formulas: [
            '\\[\\lambda_1(\\Lambda)>\\sqrt n,\\ \\mu(\\Lambda^*)>\\sqrt n\\Longrightarrow\\text{近似常数性与高斯尾界矛盾}.\\]'
          ]
        },
        {
          title: '10. 证明链条与常见误区',
          bullets: [
            '覆盖半径是空间中最远点到格的距离，不是最短格向量长度的一半；两者只满足不等式关系。',
            '高斯质量 \\(\\rho_s(\\Lambda)\\) 是对所有格点的求和，不是一个归一化概率，必要时还需除以总质量。',
            '周期高斯近似常数的原因是非零对偶频率贡献很小，而不是因为格点真的连续均匀。',
            '缩放格会反向缩放对偶格，因此可以把两个乘积条件同时规范到 \\(\\sqrt n\\) 阈值。',
            '讲义证明的覆盖半径形式常数略弱，但足以展示 Banaszczyk 证明的核心高斯方法。'
          ]
        },
        {
          title: '本章小结',
          paragraphs: [
            '转移定理把原格最短向量与对偶格多个独立短向量联系起来。证明不直接构造这些向量，而是通过覆盖半径描述对偶格最大孔洞，再用 Poisson 求和比较不同平移的周期高斯质量。',
            '整条逻辑是：原格很稀 \\(\\Rightarrow\\) 非零频率高斯质量很小 \\(\\Rightarrow\\) 对偶格周期高斯近似平坦；若对偶格还有过大的孔洞，某个平移的全部质量会落入尾部，从而产生矛盾。'
          ]
        }
      ]
    },
    {
      id: 'chapter-12',
      number: '第十二章',
      title: '平均情形困难性与格上的碰撞抗性哈希',
      source: 'Lattices in Computer Science, Lecture 12: Average-Case Hardness',
      introduction: '本章解释格密码最有代表性的性质：破解随机生成的密码实例，可以被转化为求解任意最坏情况格实例。我们以模子集和碰撞抗性哈希为例，先定义 SIVP 与 CRHF，再引入平滑参数，说明高斯噪声如何把任意格基本平行多面体上的分布“抹平”。最后逐步分析 FINDVECTOR 归约，证明随机碰撞寻找器能够产生一组短且线性无关的格向量。',
      sections: [
        {
          title: '1. 从格密码分析到格密码构造',
          paragraphs: [
            '格最初常作为密码分析工具使用，例如低指数 RSA 攻击。Ajtai 在 1996 年发现，格也能构造具有最坏情形到平均情形安全归约的密码原语：若有人能以不可忽略概率破解随机实例，就能求解任意给定格上的近似问题。',
            '这与经典平均情形假设形成对比。传统方案往往假设某个特定随机分布中的数难以分解，而最坏情形归约不需要猜测“哪些格实例应避免”，因为所有最坏实例都被安全性覆盖。'
          ]
        },
        {
          title: '2. SIVP 要求找到一整组独立短向量',
          paragraphs: [
            'SIVP\\(_\\gamma\\) 输入一个秩 \\(n\\) 格，要求输出 \\(n\\) 个线性无关格向量，每个长度至多 \\(\\gamma\\lambda_n(\\Lambda)\\)。它比只找一个最短向量的 SVP 更强调覆盖全部独立方向。',
            'Banaszczyk 转移定理说明，在对偶格上求解近似 SIVP 可以导出原格上的近似 SVP。因此讲义先把哈希安全性归约到 \\(O(n^3)\\)-SIVP，也能进一步解释为某个多项式因子的 SVP 最坏情形假设。'
          ],
          formulas: [
            '\\[\\mathrm{SIVP}_\\gamma:\\quad v_1,\\ldots,v_n\\in\\Lambda\\text{ 线性无关且 }\\|v_i\\|\\le\\gamma\\lambda_n(\\Lambda).\\]'
          ]
        },
        {
          title: '3. 碰撞抗性哈希函数族',
          paragraphs: [
            '碰撞抗性哈希函数族可以高效随机选择一个函数，也可以高效计算该函数，但任何多项式时间算法都不能以不可忽略概率找到不同输入 \\(x\\ne y\\) 使 \\(f(x)=f(y)\\)。通常输入位数多于输出位数，因此碰撞由鸽巢原理保证存在，安全性要求它们难以被找到。',
            '碰撞抗性比单向性更强：若能对随机输出找到另一个原像，通常可进一步制造碰撞。讲义聚焦碰撞，因为碰撞等式自然变成一个短系数的模线性关系。'
          ]
        },
        {
          title: '4. 模子集和哈希的具体形式',
          paragraphs: [
            '随机选择 \\(a_1,\\ldots,a_m\\in\\mathbb Z_q^n\\)，定义 \\(f_a(b_1,\\ldots,b_m)=\\sum_i b_i a_i\\bmod q\\)，其中每个输入位 \\(b_i\\in\\{0,1\\}\\)。函数描述与计算都很直接。',
            '两个不同输入发生碰撞时，二者相减得到系数 \\(c_i\\in\\{-1,0,1\\}\\)，不全为零，并满足 \\(\\sum_i c_i a_i=0\\pmod q\\)。因此“找碰撞”等价于为随机模方程寻找一个非常短的非零系数向量。'
          ],
          formulas: [
            '\\[f_{a_1,\\ldots,a_m}(b)=\\sum_{i=1}^{m}b_i a_i\\pmod q.\\]',
            '\\[f(x)=f(y)\\Longrightarrow\\sum_{i=1}^{m}(x_i-y_i)a_i=0\\pmod q.\\]'
          ]
        },
        {
          title: '5. 主定理与参数',
          paragraphs: [
            '讲义取 \\(q=2^{2n}\\)、\\(m=4n^2\\)。假设存在 COLLISIONFIND，能对均匀随机的 \\(a_i\\in\\mathbb Z_q^n\\) 以至少 \\(n^{-c_0}\\) 的概率找到不全为零的 \\(\\{-1,0,1\\}\\) 系数组合，使模和为零。',
            '那么存在多项式时间算法，可以在任意格上求解 \\(O(n^3)\\)-SIVP。因为 \\(m>n\\log q\\)，输入空间大于输出空间，碰撞必定存在；定理的内容是随机碰撞寻找能力足以解决所有最坏格实例。'
          ],
          formulas: [
            '\\[q=2^{2n},\\qquad m=4n^2,\\qquad \\sum_{i=1}^{m}b_i a_i=0\\pmod q.\\]'
          ]
        },
        {
          title: '6. 平滑现象：加多少高斯噪声才接近均匀',
          paragraphs: [
            '从格点出发加入很窄的高斯噪声，会看到彼此分离的尖峰；增大尺度后，峰逐渐连成起伏较小的周期表面，最终在基本平行多面体上接近均匀。为了严格描述它，把连续高斯样本模 \\(P(B)\\) 约化。',
            '若高斯密度为 \\(\\nu_s(x)=\\rho_s(x)/s^n\\)，约化后密度是所有格平移高斯的叠加。Poisson 求和公式把它写成对偶格傅里叶级数，其中零频率给出均匀项，非零频率决定剩余波动。'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-12/gaussian-smoothing.png',
              alt: '高斯噪声尺度增大时格周期分布逐渐变平',
              caption: '图 1：从分离尖峰到近似平面。平滑参数刻画分布在模基本平行多面体后何时足够接近均匀。'
            }
          ]
        },
        {
          title: '7. 平滑参数的定义',
          paragraphs: [
            '约化高斯与 \\(P(B)\\) 上均匀分布的统计距离至多为 \\(\\tfrac12\\rho_{1/s}(\\Lambda^*\\setminus\\{0\\})\\)。因此只要倒数尺度下所有非零对偶格点的高斯质量很小，分布就被平滑。',
            '平滑参数 \\(\\eta_\\varepsilon(\\Lambda)\\) 定义为使该非零对偶高斯质量不超过 \\(\\varepsilon\\) 的最小 \\(s\\)。当 \\(s\\ge\\eta_\\varepsilon\\) 时，约化高斯距均匀分布至多 \\(\\varepsilon/2\\)。'
          ],
          formulas: [
            '\\[\\Delta(\\nu_s\\bmod P(B),U(P(B)))\\le\\frac12\\rho_{1/s}(\\Lambda^*\\setminus\\{0\\}).\\]',
            '\\[\\eta_\\varepsilon(\\Lambda)=\\inf\\{s>0:\\rho_{1/s}(\\Lambda^*\\setminus\\{0\\})\\le\\varepsilon\\}.\\]'
          ]
        },
        {
          title: '8. 平滑参数与格的几何尺度',
          paragraphs: [
            '若 \\(s<1/\\lambda_1(\\Lambda^*)\\) 太多，最短对偶向量单独就贡献常数量的高斯质量，所以平滑参数至少约为 \\(1/\\lambda_1(\\Lambda^*)\\)。转移定理进一步给出约 \\(\\lambda_n(\\Lambda)/n\\) 的下界。',
            '利用上一章的高斯尾界，若 \\(\\varepsilon\\ge2^{-n+1}\\)，则 \\(\\eta_\\varepsilon(\\Lambda)\\le\\sqrt n/\\lambda_1(\\Lambda^*)\\le\\sqrt n\\lambda_n(\\Lambda)\\)。对讲义后续选取的 \\(\\varepsilon=n^{-\\log n}\\)，还可改进到 \\(O(\\log n)\\lambda_n(\\Lambda)\\)。'
          ],
          formulas: [
            '\\[\\frac1{\\lambda_1(\\Lambda^*)}\\lesssim\\eta_\\varepsilon(\\Lambda)\\le\\frac{\\sqrt n}{\\lambda_1(\\Lambda^*)}\\le\\sqrt n\\lambda_n(\\Lambda).\\]'
          ]
        },
        {
          title: '9. FINDVECTOR：从随机碰撞得到短格向量',
          paragraphs: [
            '输入一个 LLL 约化基和估计 \\(\\widetilde\\eta\\)，满足 \\(2\\eta_\\varepsilon\\le\\widetilde\\eta\\le4\\eta_\\varepsilon\\)。先独立采样 \\(x_i\\leftarrow\\nu_{\\widetilde\\eta}\\)，再令 \\(y_i=x_i\\bmod P(B)\\)。由于尺度超过平滑参数，\\(y_i\\) 几乎均匀。',
            '把基本平行多面体沿每个基坐标均分成 \\(q\\) 份，共 \\(q^n\\) 个小格。令 \\(a_i=\\lfloor qB^{-1}y_i\\rfloor\\in\\mathbb Z_q^n\\)，并记所在小格左下角 \\(z_i=Ba_i/q\\)。向碰撞寻找器提交 \\(a_1,\\ldots,a_m\\)。',
            '若得到 \\(b_i\\in\\{-1,0,1\\}\\) 且 \\(\\sum_i b_i a_i=0\\pmod q\\)，就输出 \\(\\sum_i b_i(x_i-y_i+z_i)\\)。前半部分 \\(x_i-y_i\\) 是格向量；后半部分 \\(\\sum b_i z_i=B(\\sum b_i a_i/q)\\) 也是格向量，所以输出确实属于 \\(\\Lambda\\)。'
          ],
          formulas: [
            '\\[a_i=\\lfloor qB^{-1}y_i\\rfloor,\\qquad z_i=\\frac{Ba_i}{q}.\\]',
            '\\[v=\\sum_{i=1}^{m}b_i(x_i-y_i+z_i)\\in\\Lambda.\\]'
          ],
          figures: [
            {
              src: 'assets/img/knowledge/lattice/chapter-12/parallelepiped-grid.png',
              alt: '把基本平行多面体划分成细网格并运行 FINDVECTOR',
              caption: '图 2：\\(y_i\\) 所在网格单元编码为 \\(a_i\\)，碰撞关系让对应左下角的线性组合回到格中。'
            }
          ]
        },
        {
          title: '10. 为什么输出向量足够短',
          paragraphs: [
            '三角不等式把输出长度分成两部分：\\(\\sum_i\\|x_i\\|\\) 与 \\(\\sum_i\\|z_i-y_i\\|\\)。高斯尾界说明除指数小概率外，每个 \\(x_i\\) 的长度不超过 \\(\\sqrt n\\widetilde\\eta\\)，第一部分至多约 \\(m\\sqrt n\\widetilde\\eta\\)。',
            '第二部分是量化误差。\\(y_i,z_i\\) 在同一个子平行多面体中，所以距离至多 \\(\\operatorname{diam}(P(B))/q\\)。由于 \\(q=2^{2n}\\) 极大，而 LLL 基的直径可由 \\(n2^n\\lambda_n\\) 控制，这一误差远小于 \\(\\widetilde\\eta\\)。结合 \\(m=4n^2\\) 与平滑参数上界，得到 \\(O(n^3\\lambda_n)\\) 长度。'
          ],
          formulas: [
            '\\[\\|v\\|\\le\\sum_{i=1}^{m}\\|x_i\\|+\\sum_{i=1}^{m}\\|z_i-y_i\\|\\le2m\\sqrt n\\,\\widetilde\\eta.\\]'
          ]
        },
        {
          title: '11. 为什么碰撞寻找器看到的输入近似均匀',
          paragraphs: [
            '每个 \\(y_i\\) 与 \\(P(B)\\) 上均匀分布的统计距离至多 \\(\\varepsilon/2\\)。网格编码函数 \\(f(y)=\\lfloor qB^{-1}y\\rfloor\\) 把真正均匀的 \\(y\\) 恰好映射为均匀的 \\(a\\in\\mathbb Z_q^n\\)，而应用函数不会增加统计距离。',
            '独立的 \\(m\\) 个样本组成联合分布后，总统计距离至多为单样本距离之和，即 \\(m\\varepsilon\\)。取 \\(\\varepsilon=n^{-\\log n}\\) 时，这仍是可忽略量。因此碰撞寻找器在真正均匀输入上具有的 \\(n^{-c_0}\\) 成功率，只损失可忽略量，FINDVECTOR 仍以至少约一半该概率成功。'
          ],
          formulas: [
            '\\[\\Delta((a_1,\\ldots,a_m),U((\\mathbb Z_q^n)^m))\\le m\\varepsilon.\\]'
          ]
        },
        {
          title: '12. 为什么输出不会总落在同一超平面',
          paragraphs: [
            '仅证明输出短且属于格还不够：碰撞寻找器可能总让输出为零或落在固定低维子空间。讲义把采样顺序在分析中改写：先选约化结果 \\(y_i\\)，碰撞寻找器据此选系数，再从条件分布 \\(D_{s,y_i}\\) 中补采样满足 \\(x_i\\bmod P(B)=y_i\\) 的原始点。新过程与真实过程分布相同。',
            '关键引理说明，当 \\(s\\ge2\\eta_\\varepsilon\\) 时，对任意固定的 \\((n-1)\\) 维超平面 \\(H\\)，条件样本落在 \\(H\\) 内的概率小于 0.9。证明再次使用 Poisson 求和，把沿超平面法向额外乘一个高斯后的质量，与原条件高斯质量比较。',
            '碰撞系数不全为零，固定其他样本后，至少一个仍保持这种全维随机性，所以输出落在任意给定超平面的概率至多 0.9。重复调用 FINDVECTOR，每个新向量都有常数概率增加当前张成空间的维数；多项式次调用后即可高概率获得 \\(n\\) 个线性无关短向量。'
          ],
          formulas: [
            '\\[\\Pr_{x\\sim D_{s,y}}[x\\in H]<0.9\\qquad(s\\ge2\\eta_\\varepsilon(\\Lambda)).\\]'
          ]
        },
        {
          title: '13. 如何猜测平滑参数',
          paragraphs: [
            '归约并不知道 \\(\\eta_\\varepsilon(\\Lambda)\\) 的精确值。LLL 最长基向量给出 \\(\\lambda_n\\) 的指数因子近似，再结合平滑参数的上下界，可得到对 \\(\\eta_\\varepsilon\\) 的 \\(n^{3/2}2^n\\) 近似范围。',
            '按 2 的倍数枚举约 \\(n+\\tfrac32\\log n\\) 个候选尺度，其中至少一个满足 FINDVECTOR 所需的 \\([2\\eta,4\\eta]\\) 区间。运行所有候选并验证输出，不会破坏多项式时间。'
          ]
        },
        {
          title: '14. 如何把近似因子从 \\(O(n^3)\\) 改进到 \\(\\widetilde O(n)\\)',
          paragraphs: [
            '第一步使用更紧的平滑参数界 \\(\\eta_\\varepsilon(\\Lambda)\\le O(\\log n)\\lambda_n(\\Lambda)\\)。第二步利用随机向量相加时的抵消，把长度从与 \\(m\\) 成正比改进为与 \\(\\sqrt m\\) 成正比。',
            '第三步采用迭代缩短：不一次生成最终短基，而是从较长向量开始，多轮调用碰撞过程逐渐替换。这样可以把模数降为多项式大小，并令样本数约为 \\(\\widetilde O(n)\\)，最终得到 \\(\\widetilde O(n)\\)-SIVP 近似。代价是归约可能变成自适应的，后续查询依赖前面输出。'
          ],
          bullets: [
            '更紧的 \\(\\eta_\\varepsilon\\) 上界改善几何尺度。',
            '随机抵消把向量和的典型长度从 \\(m\\) 级降到 \\(\\sqrt m\\) 级。',
            '迭代缩短允许减小 \\(q\\) 和 \\(m\\)，进一步降低近似因子。'
          ]
        },
        {
          title: '15. 平滑参数紧界的证明直觉',
          paragraphs: [
            '取 \\(n\\) 个线性无关格向量 \\(v_1,\\ldots,v_n\\)，长度都不超过 \\(\\lambda_n\\)，并令 \\(s=\\log n\\cdot\\lambda_n\\)。对偶格按内积 \\(\\langle v_i,y\\rangle=j\\) 分成平行切片 \\(S_{i,j}\\)。',
            '非零切片到 \\(S_{i,0}\\) 的法向距离至少约为 \\(|j|/\\lambda_n\\)，在尺度 \\(1/s\\) 的高斯下受到 \\(e^{-\\pi j^2\\log^2n}\\) 抑制。因此对每个 \\(i\\)，不与 \\(v_i\\) 正交的对偶点只贡献极小质量。',
            '由于 \\(v_1,\\ldots,v_n\\) 线性无关，同时与它们全部正交的对偶向量只有 0。对 \\(n\\) 个方向做并集界，就得到所有非零对偶向量的总质量不超过 \\(n^{-\\log n}\\)，从而 \\(\\eta_\\varepsilon\\le O(\\log n)\\lambda_n\\)。'
          ]
        },
        {
          title: '16. 初学者常见误区',
          bullets: [
            '最坏情形到平均情形归约不是说“随机格和最坏格一样”，而是说破解特定随机代数实例可用于求解任意格实例。',
            '平滑参数不是高斯标准差本身的固定常数，它依赖格、误差阈值 \\(\\varepsilon\\) 和对偶格的非零向量分布。',
            '模 \\(P(B)\\) 后接近均匀不表示原始高斯在整个空间均匀；均匀性只发生在商空间代表区域。',
            '碰撞关系产生的是小系数模方程；输出格向量还需要用 \\(x_i-y_i\\) 与网格角点 \\(z_i\\) 的组合来构造。',
            '一个短向量不足以解决 SIVP，必须证明重复输出能跨越任意固定超平面，最终形成 \\(n\\) 个独立方向。'
          ]
        },
        {
          title: '本章小结',
          paragraphs: [
            '本章把格密码的核心安全思想分成三座桥。第一座桥把哈希碰撞写成随机模线性方程的小系数解；第二座桥用平滑参数和高斯噪声，把任意格上的模代表元变成近似均匀的随机输入；第三座桥把碰撞系数重新解释为短格向量，并用条件高斯的全维性收集一组线性无关向量。',
            '因此，若存在能在随机模子集和实例上稳定寻找碰撞的算法，就会得到求解任意最坏格实例的算法。这个“平均攻击 \\(\\Rightarrow\\) 最坏格算法”的方向，正是格密码相比许多传统密码假设最独特的理论优势。'
          ]
        }
      ]
    }
  ];
})();
