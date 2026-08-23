(function () {
  'use strict';

  function code(lines) {
    return lines.join('\n');
  }

  const commonLibraryNote = '公开算法示例统一选用 GmSSL 3 及其官方 Python、Java 绑定。C++ 示例直接调用 GmSSL 的 C 接口；编译时链接 libgmssl。示例用于学习与接口验证，生产系统还需完成密钥保护、错误处理、随机数质量、侧信道防护与合规检测。';

  window.GUOMI_BOOK = {
    id: 'guomi-cryptography',
    color: '#b8322c',
    title: '中国商用密码算法基础',
    subtitle: {
      zh: 'SM 系列与祖冲之算法公开标准讲义',
      en: 'A standards-based guide to Chinese commercial cryptography'
    },
    author: '依据公开国家标准、行业标准与 GmSSL 文档整理',
    category: { zh: '中国商用密码', en: 'Chinese Commercial Cryptography' },
    level: { zh: '入门至进阶', en: 'Beginner–Intermediate' },
    overview: {
      zh: '以 SM1、SM2、SM3、SM4、SM7、SM9 与 ZUC 为主线，区分分组密码、公钥密码、杂凑函数、标识密码和序列密码，讲清算法职责、核心结构、标准边界、工程用法与常见风险。',
      en: 'A structured guide to SM1, SM2, SM3, SM4, SM7, SM9, and ZUC, covering roles, structures, standards, engineering use, and common risks.'
    },
    topics: {
      zh: ['算法家族与安全功能分工', '公开标准中的核心结构与公式', '密钥、随机数、工作模式与身份绑定', 'GmSSL、SDF 与厂商密码设备接口'],
      en: ['Roles across the algorithm family', 'Core structures and formulas in public standards', 'Keys, randomness, modes, and identity binding', 'GmSSL, SDF, and vendor device interfaces']
    },
    path: {
      zh: ['先按算法职责建立全景图', '再学习公开算法的内部结构', '最后通过库接口完成可复现实验'],
      en: ['Map each algorithm to its role', 'Study the internals of public algorithms', 'Reproduce experiments through maintained libraries']
    },
    chapters: [
      {
        id: 'sm1',
        number: '第一章',
        title: 'SM1：设备内使用的分组密码',
        source: '公开密码标准目录、GM/T 0018 密码设备应用接口规范与 GmSSL SoftSDF 文档',
        introduction: 'SM1 是中国商用密码体系中的对称分组密码。公开资料能够确认它以密码设备能力的形式被调用，但本次检索没有发现可公开审计的算法细节或通用软件实现。因此，本章不臆造轮函数、S 盒或密钥扩展，而是从可验证的分组密码知识、设备接口和安全使用边界出发。',
        sections: [
          {
            title: '1. 能确认什么，不能推断什么',
            paragraphs: [
              'SM1 属于对称分组密码：加密方和解密方持有同一秘密密钥，数据按固定长度分组进入密码变换。SDF 的算法标识为 SM1 预留了 ECB、CBC、CFB、OFB 和 MAC 等模式，这说明应用通常通过密码卡、服务器密码机或厂商软件模块使用它。',
              '算法名称和接口标识并不等于算法公开。没有标准文本或经授权的实现时，不能根据网上零散描述自行拼装所谓“SM1 源码”，也不能拿 SM4、AES 的轮函数替代后仍称为 SM1。讲义因此只讨论公开可验证的调用边界。'
            ],
            note: '知识边界：公开接口可以互操作，内部算法仍由合规密码模块或厂商 SDK 提供。代码审查时应把“调用成功”和“算法实现可审计”视为两件不同的事。'
          },
          {
            title: '2. 分组密码与工作模式',
            paragraphs: [
              '裸分组密码只定义单个分组上的可逆置换。真实消息通常长于一个分组，因此必须选择工作模式。ECB 会泄露重复分组模式，不适合普通消息；CBC 需要不可预测的 IV，并且只提供机密性；CFB 与 OFB 把分组密码转成类似序列密码的用法，但仍需单独解决完整性。',
              '如果设备只提供传统加密模式，应用应采用“加密后认证”的组合，并使用独立的加密密钥与 MAC 密钥。不要把固定 IV、全零 IV 或重复 IV 当作默认值，也不要让应用层直接接触设备内部的长期密钥。'
            ],
            formulas: [
              '\\[C_i=E_K(P_i\\oplus C_{i-1}),\\qquad C_0=IV.\\]',
              '\\[P_i=D_K(C_i)\\oplus C_{i-1}.\\]'
            ]
          },
          {
            title: '3. SDF 调用模型',
            paragraphs: [
              '典型 SDF 流程为：打开设备、建立会话、按权限获得或导入会话密钥句柄、调用 SDF_Encrypt 或 SDF_Decrypt、销毁会话密钥、关闭会话和设备。密钥句柄代表设备内对象，应用不应假设它就是裸密钥字节。',
              '工程接入时必须使用设备厂商随产品提供的头文件、动态库和算法能力说明。即使函数名相同，不同厂商在结构体布局、扩展算法标识和错误码行为上也可能存在差异。'
            ],
            bullets: [
              '启动时查询设备能力，确认 SM1 与目标工作模式确实受支持。',
              '每次调用都检查返回码，并在所有失败路径释放会话与密钥句柄。',
              'IV 与密文一起保存，但不能在同一密钥下违规复用。',
              '生产密钥应在密码设备内生成、使用和销毁，示例中的外部缓冲区只代表待处理数据。'
            ]
          },
          {
            title: '动手实践：三语言设备接口示例',
            paragraphs: [
              '下面三段代码都只展示同一件事：把已由合规流程取得的会话句柄与密钥句柄交给 SDF_Encrypt。Python 通过 ctypes、Java 通过 JNA 绑定厂商动态库；它们没有重新实现 SM1。'
            ],
            note: '运行前提：将厂商 SDF 动态库、头文件和密钥取得流程接入项目。SoftSDF 可用于学习标准接口，但其公开实现并不提供真实 SM1 算法。',
            codeExamples: {
              python: code([
                'from ctypes import CDLL, POINTER, byref, c_uint, c_ubyte, c_void_p',
                '',
                'sdf = CDLL("./vendor_sdf.so")  # 换成设备厂商提供的库',
                'SGD_SM1_CBC = 0x00000102',
                '',
                'def encrypt_sm1(session: c_void_p, key_handle: c_void_p,',
                '                iv: bytes, plaintext: bytes) -> bytes:',
                '    if len(iv) != 16:',
                '        raise ValueError("IV 长度以厂商 SM1 参数说明为准")',
                '    iv_buf = (c_ubyte * len(iv)).from_buffer_copy(iv)',
                '    src = (c_ubyte * len(plaintext)).from_buffer_copy(plaintext)',
                '    out = (c_ubyte * (len(plaintext) + 32))()',
                '    out_len = c_uint(len(out))',
                '    rv = sdf.SDF_Encrypt(session, key_handle, SGD_SM1_CBC,',
                '                         iv_buf, src, len(src), out, byref(out_len))',
                '    if rv != 0:',
                '        raise RuntimeError(f"SDF_Encrypt failed: 0x{rv:08x}")',
                '    return bytes(out[:out_len.value])'
              ]),
              cpp: code([
                '#include <stdexcept>',
                '#include <vector>',
                '#include "sdf.h"   // 必须使用设备厂商提供的头文件',
                '#include "sgd.h"',
                '',
                'std::vector<unsigned char> encryptSm1(',
                '    void* session, void* keyHandle,',
                '    std::vector<unsigned char> iv,',
                '    const std::vector<unsigned char>& plaintext) {',
                '  std::vector<unsigned char> out(plaintext.size() + 32);',
                '  unsigned int outLen = static_cast<unsigned int>(out.size());',
                '  int rv = SDF_Encrypt(session, keyHandle, SGD_SM1_CBC, iv.data(),',
                '      const_cast<unsigned char*>(plaintext.data()),',
                '      static_cast<unsigned int>(plaintext.size()), out.data(), &outLen);',
                '  if (rv != SDR_OK) throw std::runtime_error("SDF SM1 encryption failed");',
                '  out.resize(outLen);',
                '  return out;',
                '}'
              ]),
              java: code([
                'import com.sun.jna.*;',
                'import com.sun.jna.ptr.IntByReference;',
                '',
                'interface SdfLibrary extends Library {',
                '  SdfLibrary INSTANCE = Native.load("vendor_sdf", SdfLibrary.class);',
                '  int SDF_Encrypt(Pointer session, Pointer keyHandle, int algorithm,',
                '                  byte[] iv, byte[] input, int inputLen,',
                '                  byte[] output, IntByReference outputLen);',
                '}',
                '',
                'static byte[] encryptSm1(Pointer session, Pointer key, byte[] iv, byte[] plain) {',
                '  final int SGD_SM1_CBC = 0x00000102;',
                '  byte[] out = new byte[plain.length + 32];',
                '  IntByReference outLen = new IntByReference(out.length);',
                '  int rv = SdfLibrary.INSTANCE.SDF_Encrypt(',
                '      session, key, SGD_SM1_CBC, iv, plain, plain.length, out, outLen);',
                '  if (rv != 0) throw new IllegalStateException("SDF error: " + rv);',
                '  return java.util.Arrays.copyOf(out, outLen.getValue());',
                '}'
              ])
            }
          },
          {
            title: '本章小结',
            paragraphs: [
              '学习 SM1 的关键不是背诵未经验证的内部结构，而是理解它是设备内的对称分组密码能力：应用选择工作模式，设备保管密钥并执行运算，接口负责互操作。没有公开标准与授权实现时，应停留在合规接口层。'
            ]
          }
        ],
        references: [
          { label: 'GM/T 0018 密码设备应用接口规范', url: 'https://www.oscca.gov.cn/sca/xxgk/2017-05/04/content_1012602.shtml' },
          { label: 'GmSSL SoftSDF：标准 SDF 软件接口实现', url: 'https://github.com/GmSSL/SoftSDF' },
          { label: 'SoftSDF 算法标识与 SDF API', url: 'https://github.com/GmSSL/SoftSDF/blob/main/sgd.h' }
        ]
      },
      {
        id: 'sm2',
        number: '第二章',
        title: 'SM2：椭圆曲线公钥密码体系',
        source: 'GB/T 32918、GM/T 0003、GM/T 0009 与 GmSSL 多语言接口文档',
        introduction: 'SM2 不是单一的“加密函数”，而是一组建立在椭圆曲线上的公钥密码机制，包括数字签名、公钥加密和密钥交换。理解 SM2 要同时掌握椭圆曲线点运算、用户身份 Z 值、签名方程与混合加密的工程边界。',
        sections: [
          {
            title: '1. 椭圆曲线群与密钥',
            paragraphs: [
              '在素域上的椭圆曲线可写为 \\(y^2=x^3+ax+b\\pmod p\\)。曲线点加法构成有限交换群，公开基点 \\(G\\) 的阶为 \\(n\\)。私钥是区间 \\([1,n-2]\\) 内的随机整数 \\(d\\)，公钥为曲线点 \\(P=[d]G\\)。',
              '由 \\(d\\) 计算 \\(P\\) 容易，而由 \\(P\\) 恢复 \\(d\\) 被认为困难，这就是椭圆曲线离散对数问题。标准推荐曲线是 256 位曲线；参数必须使用标准值，不能自行挑选。'
            ],
            formulas: [
              '\\[P=[d]G,\\qquad 1\\le d\\le n-2.\\]',
              '\\[y^2\\equiv x^3+ax+b\\pmod p.\\]'
            ]
          },
          {
            title: '2. 数字签名与身份绑定',
            paragraphs: [
              'SM2 签名先把用户身份、曲线参数、基点与公钥编码为 Z 值，再计算 \\(e=H(Z\\parallel M)\\)。这使签名不仅绑定消息和密钥，还绑定签名者身份字符串。双方若使用不同 ID，即使消息和密钥完全相同，验签也会失败。',
              '签名时生成一次性随机数 \\(k\\)，计算点 \\([k]G=(x_1,y_1)\\)，再得到 \\(r=(e+x_1)\\bmod n\\) 与 \\(s=((1+d)^{-1}(k-rd))\\bmod n\\)。随机数泄露或复用会危及私钥，因此应让成熟密码库负责生成。'
            ],
            formulas: [
              '\\[Z=H(ENTL\\parallel ID\\parallel a\\parallel b\\parallel x_G\\parallel y_G\\parallel x_P\\parallel y_P).\\]',
              '\\[r=(e+x_1)\\bmod n,\\qquad s=((1+d)^{-1}(k-rd))\\bmod n.\\]'
            ],
            note: '互操作检查的第一项通常是 ID 与签名编码。GmSSL 的完整消息签名接口会处理 Z 值，签名输出采用 DER 编码而不是固定 64 字节拼接。'
          },
          {
            title: '3. 公钥加密与混合加密',
            paragraphs: [
              'SM2 公钥加密使用随机数产生临时曲线点 C1，再由共享点坐标经过 KDF 生成掩码，C2 承载被掩码的消息，C3 是完整性校验值。不同实现或协议可能使用不同密文封装，交换数据前必须确认是 ASN.1 DER 还是裸 C1、C2、C3 排列。',
              '公钥密码不适合直接加密大文件。工程上应随机生成 SM4-GCM 会话密钥，用 SM4-GCM 加密业务数据，再用 SM2 加密短会话密钥，形成数字信封。'
            ],
            formulas: [
              '\\[C_1=[k]G,\\qquad (x_2,y_2)=[k]P_B.\\]',
              '\\[t=KDF(x_2\\parallel y_2,klen),\\quad C_2=M\\oplus t,\\quad C_3=H(x_2\\parallel M\\parallel y_2).\\]'
            ]
          },
          {
            title: '动手实践：三语言签名与验签',
            paragraphs: [
              commonLibraryNote,
              '示例对字符串 abc 做完整 SM2 消息签名与验签，并显式使用标准默认 ID。真实系统应把私钥保存到加密 PEM、密码设备或密钥管理系统中。'
            ],
            codeExamples: {
              python: code([
                'from gmssl import Sm2Key, Sm2Signature, SM2_DEFAULT_ID, DO_SIGN, DO_VERIFY',
                '',
                'key = Sm2Key()',
                'key.generate_key()',
                '',
                'signer = Sm2Signature(key, SM2_DEFAULT_ID, DO_SIGN)',
                'signer.update(b"abc")',
                'signature = signer.sign()',
                '',
                'verifier = Sm2Signature(key, SM2_DEFAULT_ID, DO_VERIFY)',
                'verifier.update(b"abc")',
                'assert verifier.verify(signature)',
                'print(signature.hex())'
              ]),
              cpp: code([
                '#include <gmssl/sm2.h>',
                '#include <cstring>',
                '#include <iostream>',
                '',
                'int main() {',
                '  SM2_KEY key;',
                '  SM2_SIGN_CTX signCtx;',
                '  SM2_VERIFY_CTX verifyCtx;',
                '  const uint8_t msg[] = "abc";',
                '  uint8_t sig[SM2_MAX_SIGNATURE_SIZE];',
                '  size_t sigLen = 0;',
                '  if (sm2_key_generate(&key) != 1) return 1;',
                '  sm2_sign_init(&signCtx, &key, SM2_DEFAULT_ID, SM2_DEFAULT_ID_LENGTH);',
                '  sm2_sign_update(&signCtx, msg, sizeof(msg) - 1);',
                '  if (sm2_sign_finish(&signCtx, sig, &sigLen) != 1) return 1;',
                '  sm2_verify_init(&verifyCtx, &key, SM2_DEFAULT_ID, SM2_DEFAULT_ID_LENGTH);',
                '  sm2_verify_update(&verifyCtx, msg, sizeof(msg) - 1);',
                '  std::cout << (sm2_verify_finish(&verifyCtx, sig, sigLen) == 1) << "\\n";',
                '}'
              ]),
              java: code([
                'import org.gmssl.Sm2Key;',
                'import org.gmssl.Sm2Signature;',
                'import java.nio.charset.StandardCharsets;',
                '',
                'Sm2Key key = new Sm2Key();',
                'key.generateKey();',
                'byte[] message = "abc".getBytes(StandardCharsets.UTF_8);',
                '',
                'Sm2Signature signer = new Sm2Signature(key, Sm2Key.DEFAULT_ID, true);',
                'signer.update(message);',
                'byte[] signature = signer.sign();',
                '',
                'Sm2Signature verifier = new Sm2Signature(key, Sm2Key.DEFAULT_ID, false);',
                'verifier.update(message);',
                'if (!verifier.verify(signature)) throw new SecurityException("bad signature");'
              ])
            }
          },
          {
            title: '4. 常见误区与小结',
            bullets: [
              '把 SM2 等同于普通 ECDSA：两者签名方程、身份绑定和参数体系不同。',
              '遗漏或误配用户 ID，导致跨库验签失败。',
              '把私钥写死在源码，或自行生成签名随机数。',
              '直接用 SM2 加密大文件，而不是采用 SM2 + SM4-GCM 数字信封。',
              '忽略 DER 与 C1C3C2、C1C2C3 等密文或签名编码差异。'
            ],
            paragraphs: [
              'SM2 的主线是“椭圆曲线难题 + 身份绑定 + 标准编码”。正确实现不仅要算对点乘，还要处理 ID、随机数、KDF、完整性校验、证书与序列化。'
            ]
          }
        ],
        references: [
          { label: '国家密码管理局：SM2 椭圆曲线公钥密码算法', url: 'https://oscca.gov.cn/sca/xxgk/2010-12/17/content_1002386.shtml' },
          { label: '国家标准全文系统：SM2 系列标准', url: 'https://openstd.samr.gov.cn/bzgk/std/std_list?p.p2=SM2' },
          { label: 'GmSSL-Python：SM2 接口', url: 'https://github.com/GmSSL/GmSSL-Python#sm2' },
          { label: 'GmSSL-Java：SM2 接口', url: 'https://github.com/GmSSL/GmSSL-Java#sm2' }
        ]
      },
      {
        id: 'sm3',
        number: '第三章',
        title: 'SM3：256 位密码杂凑函数',
        source: 'GB/T 32905、GM/T 0004 与 GmSSL SM3 接口文档',
        introduction: 'SM3 把任意长度消息映射为 256 位摘要。它不使用密钥，主要服务于完整性校验、数字签名预处理、消息认证码和密钥派生。学习 SM3 的核心是理解填充、消息扩展、迭代压缩，以及“摘要不等于认证”的边界。',
        sections: [
          {
            title: '1. 安全目标与适用位置',
            paragraphs: [
              '密码杂凑函数希望具备原像抗性、第二原像抗性和碰撞抗性。摘要长度为 256 位并不意味着所有攻击都需要 \\(2^{256}\\) 次工作；理想碰撞攻击受生日界影响，复杂度约为 \\(2^{128}\\)。',
              'SM3 常用于 SM2 签名、HMAC-SM3、证书和协议 transcript。裸 SM3 只能发现偶然变化或对照已可信摘要，不能阻止能同时修改消息和摘要的主动攻击者。需要认证时使用 HMAC-SM3 或数字签名。'
            ]
          },
          {
            title: '2. 填充与消息分组',
            paragraphs: [
              '设消息长度为 \\(l\\) 比特。先附加一个 1，再附加最少数量的 0，使长度与 448 模 512 同余，最后附加 64 位的大端消息长度。填充后的消息被切分为 512 位分组。',
              '长度字段记录原消息长度而不是填充后长度。字符串编码、换行符和字节序都会改变输入比特串，所以跨语言测试应从明确的字节数组开始。'
            ],
            formulas: [
              '\\[l+1+k\\equiv448\\pmod{512},\\qquad 0\\le k<512.\\]',
              '\\[M^{\\prime}=M\\parallel1\\parallel0^k\\parallel[l]_{64}.\\]'
            ]
          },
          {
            title: '3. 消息扩展与压缩',
            paragraphs: [
              '每个 512 位分组先拆成 16 个 32 位字，再扩展为 68 个字 \\(W_j\\) 与 64 个字 \\(W_j^{\\prime}\\)。扩展使用循环移位和置换 \\(P_1\\)，让局部输入差异扩散到后续轮次。',
              '压缩函数维护八个 32 位寄存器 A 到 H，运行 64 轮布尔函数、常量、模 \\(2^{32}\\) 加法和循环移位。分组输出与输入链值异或，最后八个字拼接为 256 位摘要。'
            ],
            formulas: [
              '\\[W_j=P_1(W_{j-16}\\oplus W_{j-9}\\oplus(W_{j-3}\\lll15))\\oplus(W_{j-13}\\lll7)\\oplus W_{j-6}.\\]',
              '\\[W_j^{\\prime}=W_j\\oplus W_{j+4}.\\]'
            ],
            note: '实现者最容易在 32 位溢出、循环左移、大端装载和最终序列化上出错。教学可以手写轮函数，业务代码应调用维护良好的库。'
          },
          {
            title: '动手实践：三语言摘要示例',
            paragraphs: [
              commonLibraryNote,
              '标准测试向量 SM3("abc") 应得到 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0。'
            ],
            codeExamples: {
              python: code([
                'from gmssl import Sm3',
                '',
                'sm3 = Sm3()',
                'sm3.update(b"abc")',
                'digest = sm3.digest()',
                'print(digest.hex())',
                'assert digest.hex() == (',
                '    "66c7f0f462eeedd9d1f2d46bdc10e4e2"',
                '    "4167c4875cf2f7a2297da02b8f4ba8e0"',
                ')'
              ]),
              cpp: code([
                '#include <gmssl/sm3.h>',
                '#include <iomanip>',
                '#include <iostream>',
                '',
                'int main() {',
                '  const uint8_t message[] = "abc";',
                '  uint8_t digest[SM3_DIGEST_SIZE];',
                '  SM3_CTX ctx;',
                '  sm3_init(&ctx);',
                '  sm3_update(&ctx, message, sizeof(message) - 1);',
                '  sm3_finish(&ctx, digest);',
                '  for (uint8_t b : digest)',
                '    std::cout << std::hex << std::setw(2) << std::setfill(\'0\') << int(b);',
                '  std::cout << "\\n";',
                '}'
              ]),
              java: code([
                'import org.gmssl.Sm3;',
                'import java.nio.charset.StandardCharsets;',
                'import java.util.HexFormat;',
                '',
                'Sm3 sm3 = new Sm3();',
                'sm3.update("abc".getBytes(StandardCharsets.UTF_8));',
                'String digest = HexFormat.of().formatHex(sm3.digest());',
                'System.out.println(digest);',
                'if (!digest.equals("66c7f0f462eeedd9d1f2d46bdc10e4e2" +',
                '                   "4167c4875cf2f7a2297da02b8f4ba8e0"))',
                '  throw new AssertionError("SM3 test vector failed");'
              ])
            }
          },
          {
            title: '本章小结',
            paragraphs: [
              'SM3 通过 Merkle–Damgård 式分组迭代，把填充后的消息送入扩展与压缩函数，输出 256 位摘要。它能作为签名、MAC 与 KDF 的基础组件，但裸哈希不提供身份认证，也不应直接充当口令加密方案。'
            ]
          }
        ],
        references: [
          { label: '国家密码管理局：SM3 密码杂凑算法标准文本', url: 'https://oscca.gov.cn/sca/xxgk/2010-12/17/1002389/files/302a3ada057c4a73830536d03e683110.pdf' },
          { label: '国家标准全文系统：GB/T 32905-2016', url: 'https://openstd.samr.gov.cn/bzgk/std/std_list?p.p2=SM3' },
          { label: 'GmSSL-Python：SM3 示例与测试向量', url: 'https://github.com/GmSSL/GmSSL-Python#sm3哈希' }
        ]
      },
      {
        id: 'sm4',
        number: '第四章',
        title: 'SM4：128 位分组密码',
        source: 'GB/T 32907、GM/T 0002 与 GmSSL SM4-GCM 接口文档',
        introduction: 'SM4 是公开标准化的对称分组密码，分组长度和密钥长度均为 128 位，采用 32 轮迭代结构。算法核心只负责单分组置换；实际安全性还取决于工作模式、IV 或 nonce、认证标签和密钥管理。',
        sections: [
          {
            title: '1. 数据表示与轮结构',
            paragraphs: [
              '128 位输入被拆成四个 32 位字 \\(X_0,X_1,X_2,X_3\\)。每轮把后三个字与轮密钥异或，经过非线性变换 T 后再与最早的字异或，产生新状态。完成 32 轮后反序输出。',
              '加密与解密使用相同轮函数，区别只是轮密钥顺序相反。这种结构便于复用硬件和软件实现，但并不意味着业务层可以直接把多个分组独立加密。'
            ],
            formulas: [
              '\\[X_{i+4}=X_i\\oplus T(X_{i+1}\\oplus X_{i+2}\\oplus X_{i+3}\\oplus rk_i).\\]',
              '\\[(Y_0,Y_1,Y_2,Y_3)=(X_{35},X_{34},X_{33},X_{32}).\\]'
            ]
          },
          {
            title: '2. 合成置换与密钥扩展',
            paragraphs: [
              '合成置换 \\(T=L\\circ\\tau\\)。非线性层 \\(\\tau\\) 对一个 32 位字的四个字节分别查同一 S 盒；线性层把结果与多个循环左移副本异或，实现扩散。密钥扩展使用相似但不同的线性变换 \\(L^{\\prime}\\)，并加入系统参数 FK 与固定参数 CK。',
              '轮函数与密钥扩展必须严格区分。若误把两个线性变换混用，程序仍会输出看似随机的密文，却无法通过标准测试向量。'
            ],
            formulas: [
              '\\[L(B)=B\\oplus(B\\lll2)\\oplus(B\\lll10)\\oplus(B\\lll18)\\oplus(B\\lll24).\\]',
              '\\[L^{\\prime}(B)=B\\oplus(B\\lll13)\\oplus(B\\lll23).\\]'
            ]
          },
          {
            title: '3. 从单分组到认证加密',
            paragraphs: [
              'ECB 对相同明文块给出相同密文块，会泄露结构；CBC 和 CTR 只提供机密性，若没有 MAC，攻击者可能修改密文并影响解密结果。新系统优先采用 SM4-GCM 等认证加密模式，让一次操作同时产生密文和认证标签。',
              'GCM 的 nonce 在同一密钥下绝不能重复。AAD 可以认证不加密的协议头、版本号或路由信息。接收方必须先完成标签验证，再把明文交给业务逻辑。'
            ],
            bullets: [
              '密钥必须来自密码安全随机数生成器或合规密钥派生过程。',
              'nonce/IV 可以公开，但生成和唯一性规则必须符合所选模式。',
              '认证失败时只返回统一错误，不泄露部分明文或细分原因。',
              '记录算法、模式、参数和密文格式版本，便于后续轮换与迁移。'
            ]
          },
          {
            title: '动手实践：三语言 SM4-GCM 示例',
            paragraphs: [
              commonLibraryNote,
              '示例把认证标签附在密文末尾。固定 key 和 iv 只为展示接口；生产代码必须随机生成密钥，并确保同一密钥下 iv 唯一。'
            ],
            codeExamples: {
              python: code([
                'from gmssl import (Sm4Gcm, SM4_KEY_SIZE, SM4_GCM_DEFAULT_IV_SIZE,',
                '                   SM4_GCM_DEFAULT_TAG_SIZE, DO_ENCRYPT, DO_DECRYPT)',
                'from gmssl import rand_bytes',
                '',
                'key = rand_bytes(SM4_KEY_SIZE)',
                'iv = rand_bytes(SM4_GCM_DEFAULT_IV_SIZE)',
                'aad = b"header-v1"',
                'plain = b"confidential payload"',
                '',
                'enc = Sm4Gcm(key, iv, aad, SM4_GCM_DEFAULT_TAG_SIZE, DO_ENCRYPT)',
                'ciphertext = enc.update(plain) + enc.finish()',
                'dec = Sm4Gcm(key, iv, aad, SM4_GCM_DEFAULT_TAG_SIZE, DO_DECRYPT)',
                'assert dec.update(ciphertext) + dec.finish() == plain'
              ]),
              cpp: code([
                '#include <gmssl/sm4.h>',
                '#include <array>',
                '#include <cstring>',
                '',
                'int main() {',
                '  std::array<uint8_t, 16> rawKey{}; // 教学值；生产环境随机生成',
                '  std::array<uint8_t, 12> iv{};',
                '  const uint8_t aad[] = "header-v1";',
                '  const uint8_t plain[] = "confidential payload";',
                '  uint8_t cipher[sizeof(plain) - 1], tag[16], recovered[sizeof(plain) - 1];',
                '  SM4_KEY key;',
                '  sm4_set_encrypt_key(&key, rawKey.data());',
                '  if (sm4_gcm_encrypt(&key, iv.data(), iv.size(), aad, sizeof(aad)-1,',
                '      plain, sizeof(plain)-1, cipher, sizeof(tag), tag) != 1) return 1;',
                '  if (sm4_gcm_decrypt(&key, iv.data(), iv.size(), aad, sizeof(aad)-1,',
                '      cipher, sizeof(cipher), tag, sizeof(tag), recovered) != 1) return 1;',
                '  return std::memcmp(plain, recovered, sizeof(recovered));',
                '}'
              ]),
              java: code([
                'import org.gmssl.Random;',
                'import org.gmssl.Sm4Gcm;',
                'import java.nio.charset.StandardCharsets;',
                'import java.util.Arrays;',
                '',
                'Random rng = new Random();',
                'byte[] key = rng.randBytes(Sm4Gcm.KEY_SIZE);',
                'byte[] iv = rng.randBytes(Sm4Gcm.DEFAULT_IV_SIZE);',
                'byte[] aad = "header-v1".getBytes(StandardCharsets.UTF_8);',
                'byte[] plain = "confidential payload".getBytes(StandardCharsets.UTF_8);',
                'byte[] cipher = new byte[plain.length + Sm4Gcm.MAX_TAG_SIZE];',
                '',
                'Sm4Gcm gcm = new Sm4Gcm();',
                'gcm.init(key, iv, aad, Sm4Gcm.MAX_TAG_SIZE, true);',
                'int cipherLen = gcm.update(plain, 0, plain.length, cipher, 0);',
                'cipherLen += gcm.doFinal(cipher, cipherLen);',
                '',
                'byte[] recovered = new byte[plain.length];',
                'gcm.init(key, iv, aad, Sm4Gcm.MAX_TAG_SIZE, false);',
                'int plainLen = gcm.update(cipher, 0, cipherLen, recovered, 0);',
                'plainLen += gcm.doFinal(recovered, plainLen);',
                'if (!Arrays.equals(plain, Arrays.copyOf(recovered, plainLen)))',
                '  throw new SecurityException("authentication failed");'
              ])
            }
          },
          {
            title: '本章小结',
            paragraphs: [
              'SM4 的算法层是 128 位分组上的 32 轮可逆变换；应用层安全则来自正确的工作模式与密钥生命周期。掌握 T 变换和密钥扩展可以理解标准，实际开发应优先调用认证加密接口。'
            ]
          }
        ],
        references: [
          { label: '国家标准全文系统：GB/T 32907-2016', url: 'https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=7803DE42D3BC5E80B0C3E5D8E873D56A' },
          { label: '国家密码管理局：GM/T 0002 SM4 分组密码算法', url: 'https://www.oscca.gov.cn/sca/xxgk/201705/1012583.shtml' },
          { label: 'GmSSL SM4 头文件与 GCM 接口', url: 'https://github.com/guanzhi/GmSSL/blob/master/include/gmssl/sm4.h' }
        ]
      },
      {
        id: 'sm7',
        number: '第五章',
        title: 'SM7：面向受限芯片场景的对称密码',
        source: 'GM/T 0035.2 公开应用要求、国家密码管理局公开题库与厂商密码模块接口边界',
        introduction: '公开资料把 SM7 描述为用于电子标签芯片等受限环境的对称密码能力。本次检索没有找到公开算法标准或可公开审计的通用实现库，因此本章聚焦其可验证应用语境：RFID 标签、挑战响应、消息鉴别码、密钥分散与厂商 SDK 集成。',
        sections: [
          {
            title: '1. 应用定位与知识边界',
            paragraphs: [
              'SM7 出现在射频识别系统的密码应用要求中，用于资源受限的电子标签芯片。公开材料能够确认它属于对称算法，并用于鉴别相关流程；但这不足以推导内部轮函数、S 盒、分组长度或密钥扩展。',
              '因此学习 SM7 时应把重点放在协议角色和系统安全上：标签与读写器如何证明持有共享秘密、随机挑战如何阻止简单重放、后台系统如何分散与更新每个标签的密钥。'
            ],
            note: '本章不提供所谓纯软件 SM7 实现。若没有芯片或厂商 SDK，正确结果是“不可运行”，而不是用另一种算法冒充。'
          },
          {
            title: '2. 挑战响应鉴别',
            paragraphs: [
              '挑战响应协议由验证方生成随机数 \\(R\\)，证明方用共享密钥计算响应。验证方独立计算期望值并做常数时间比较。随机挑战必须新鲜且不可预测，否则旧响应可能被重放。',
              '双向鉴别时，标签和读写器分别证明密钥持有权，并把双方随机数、方向标识和上下文纳入 MAC 输入，防止反射攻击和跨协议复用。'
            ],
            formulas: [
              '\\[T=MAC_K(\\text{domain}\\parallel UID\\parallel R_R\\parallel R_T\\parallel context).\\]'
            ],
            bullets: [
              'domain 区分标签到读写器与读写器到标签两个方向。',
              'UID 只能作为身份索引，不能代替随机密钥。',
              '通信超时、计数器或会话状态需要与随机挑战共同抵御重放。',
              '认证成功不自动等于后续数据已加密，协议必须明确机密性与完整性保护范围。'
            ]
          },
          {
            title: '3. 密钥分散与生命周期',
            paragraphs: [
              '大规模标签系统不应让所有标签共享同一个长期密钥。后台可从受保护的主密钥和标签唯一标识派生设备密钥，再通过安全生产流程注入芯片。主密钥应保存在密码机或专用安全环境中。',
              '标签丢失、克隆嫌疑、读写器泄露和批次迁移都需要可执行的密钥轮换方案。协议设计还应考虑标签算力、存储、功耗和无线链路长度限制。'
            ],
            formulas: [
              '\\[K_{tag}=KDF(K_{master},\\;\\text{system-id}\\parallel UID\\parallel\\text{version}).\\]'
            ],
            note: '上式是通用密钥分散结构说明，不是 SM7 标准公式。实际 KDF、输入编码和密钥注入流程必须遵循芯片与系统规范。'
          },
          {
            title: '动手实践：三语言厂商 SDK 适配模板',
            paragraphs: [
              '下面定义一个最小适配器边界。业务代码只依赖 encryptBlock；真正的实现必须由通过验证的芯片或厂商库提供，并在启动时报告算法、固件和密钥槽版本。默认实现主动抛错，防止测试替身误入生产。'
            ],
            codeExamples: {
              python: code([
                'from typing import Protocol',
                '',
                'class Sm7Provider(Protocol):',
                '    def encrypt_block(self, key_slot: int, block: bytes) -> bytes: ...',
                '',
                'class MissingVendorSm7:',
                '    def encrypt_block(self, key_slot: int, block: bytes) -> bytes:',
                '        raise RuntimeError(',
                '            "未配置经授权的 SM7 芯片/厂商 SDK；禁止用其他算法代替"',
                '        )',
                '',
                'def challenge_response(provider: Sm7Provider, key_slot: int, challenge: bytes):',
                '    # 分组长度、填充和协议域分隔以厂商规范为准',
                '    return provider.encrypt_block(key_slot, challenge)'
              ]),
              cpp: code([
                '#include <cstdint>',
                '#include <span>',
                '#include <stdexcept>',
                '#include <vector>',
                '',
                'class Sm7Provider {',
                'public:',
                '  virtual ~Sm7Provider() = default;',
                '  virtual std::vector<uint8_t> encryptBlock(',
                '      unsigned keySlot, std::span<const uint8_t> block) = 0;',
                '};',
                '',
                'class MissingVendorSm7 final : public Sm7Provider {',
                'public:',
                '  std::vector<uint8_t> encryptBlock(',
                '      unsigned, std::span<const uint8_t>) override {',
                '    throw std::runtime_error(',
                '        "Configure an authorized SM7 device SDK; do not substitute a cipher");',
                '  }',
                '};'
              ]),
              java: code([
                'public interface Sm7Provider {',
                '  byte[] encryptBlock(int keySlot, byte[] block);',
                '}',
                '',
                'public final class MissingVendorSm7 implements Sm7Provider {',
                '  @Override',
                '  public byte[] encryptBlock(int keySlot, byte[] block) {',
                '    throw new UnsupportedOperationException(',
                '        "未配置经授权的 SM7 芯片/厂商 SDK；禁止用其他算法代替");',
                '  }',
                '}',
                '',
                '// 生产实现应封装厂商 JNI/JNA SDK，并校验设备、固件、算法能力和错误码。'
              ])
            }
          },
          {
            title: '本章小结',
            paragraphs: [
              'SM7 的公开学习重点是其受限设备应用与协议设计，而不是杜撰内部算法。安全实现必须依赖经授权的芯片或厂商库，并把随机挑战、域分隔、设备级密钥、轮换和失败处理作为完整系统的一部分。'
            ]
          }
        ],
        references: [
          { label: '国家密码管理局公开题库：SM7 的 RFID 与对称算法定位', url: 'https://www.oscca.gov.cn/sca/xwdt/2023-06/29/1061081/files/53b33c6e02894f99922b31f926d39a87.pdf' },
          { label: '国家标准全文系统：射频识别与密码标准检索', url: 'https://openstd.samr.gov.cn/bzgk/std/std_list?p.p2=%E5%B0%84%E9%A2%91%E8%AF%86%E5%88%AB%20%E5%AF%86%E7%A0%81' }
        ]
      },
      {
        id: 'sm9',
        number: '第六章',
        title: 'SM9：基于标识的公钥密码',
        source: 'GB/T 38635、GM/T 0044（含 2025 修订版公告）与 GmSSL SM9 接口文档',
        introduction: 'SM9 是基于标识的公钥密码体系。用户的邮箱、域名或账号等字符串可参与形成公钥语义，密钥生成中心根据主秘密为用户提取私钥。它减少了传统证书分发负担，同时引入主密钥托管、身份规范化和撤销管理等新问题。',
        sections: [
          {
            title: '1. 从证书公钥到标识公钥',
            paragraphs: [
              '传统 PKI 需要证书把身份绑定到随机生成的公钥。SM9 中，系统主公钥与用户 ID、功能标识 HID 共同确定用户公钥语义；密钥生成中心 KGC 持有主秘密并为该 ID 提取用户私钥。',
              '发送方只需获得可信的系统参数和接收方规范化 ID，就能进行加密或验签。减少证书并不等于消除信任：信任从 CA 证书签发转移到 KGC 主密钥保护、用户鉴别和私钥安全分发。'
            ],
            formulas: [
              '\\[Q_{ID}=H_1(ID\\parallel HID)P_1+P_{pub}.\\]',
              '\\[d_{ID}=Extract(msk,ID,HID).\\]'
            ],
            note: 'HID 用于区分签名、密钥交换和加密用途。不同用途的主密钥与用户私钥不能混用。'
          },
          {
            title: '2. 双线性对与安全基础',
            paragraphs: [
              'SM9 使用两个加法群与一个乘法群之间的双线性对 \\(e:G_1\\times G_2\\rightarrow G_T\\)。双线性意味着标量乘可被映射为目标群中的指数关系，这使身份字符串、主公钥和用户私钥能够在验证或解密方程中配合。',
              '配对运算涉及扩域算术和复杂点运算，手写实现极易出现正确性、性能和侧信道问题。学习时理解群、H1/H2、KDF 与协议数据流即可，工程中应使用经过测试的库。'
            ],
            formulas: [
              '\\[e([a]P,[b]Q)=e(P,Q)^{ab}.\\]'
            ]
          },
          {
            title: '3. 加密、签名与系统治理',
            paragraphs: [
              'SM9 加密由主公钥和接收方 ID 完成，只有对应用户私钥可以解密。SM9 签名由用户签名私钥完成，验证方使用系统签名主公钥与签名者 ID。加密主密钥与签名主密钥是两套不同对象。',
              'KGC 能够生成所有用户私钥，天然存在密钥托管能力。一旦主秘密泄露，整个域内用户都会受影响，因此应采用密码机、多方控制、分权审批、备份恢复和全量换代方案。身份还必须规范化，例如邮箱大小写、Unicode 与租户域都要有唯一编码规则。'
            ],
            bullets: [
              '系统参数必须绑定机构、租户、用途和版本，防止跨域误用。',
              '私钥分发前必须强鉴别用户，并通过安全通道或密码设备交付。',
              '撤销可通过带有效期的 ID、版本化 ID 或密钥更新机制实现。',
              '主秘密不应出现在应用内存、日志、测试数据或源代码中。'
            ]
          },
          {
            title: '动手实践：三语言标识加密示例',
            paragraphs: [
              commonLibraryNote,
              '示例在内存中生成加密主密钥，为 Alice 提取用户私钥，并完成短消息加解密。生产系统必须把 KGC 与普通业务服务分离。'
            ],
            codeExamples: {
              python: code([
                'from gmssl import Sm9EncMasterKey',
                '',
                'identity = "alice@example.com"',
                'master = Sm9EncMasterKey()',
                'master.generate_master_key()',
                'alice_key = master.extract_key(identity)',
                '',
                'ciphertext = master.encrypt(b"session-key", identity)',
                'plaintext = alice_key.decrypt(ciphertext)',
                'assert plaintext == b"session-key"'
              ]),
              cpp: code([
                '#include <gmssl/sm9.h>',
                '#include <cstring>',
                '',
                'int main() {',
                '  const char id[] = "alice@example.com";',
                '  const uint8_t msg[] = "session-key";',
                '  SM9_ENC_MASTER_KEY master;',
                '  SM9_ENC_KEY userKey;',
                '  uint8_t cipher[SM9_MAX_CIPHERTEXT_SIZE]; size_t cipherLen = 0;',
                '  uint8_t plain[SM9_MAX_PLAINTEXT_SIZE]; size_t plainLen = 0;',
                '  if (sm9_enc_master_key_generate(&master) != 1) return 1;',
                '  if (sm9_enc_master_key_extract_key(&master, id, sizeof(id)-1, &userKey) != 1) return 1;',
                '  if (sm9_encrypt(&master, id, sizeof(id)-1, msg, sizeof(msg)-1,',
                '                  cipher, &cipherLen) != 1) return 1;',
                '  if (sm9_decrypt(&userKey, id, sizeof(id)-1, cipher, cipherLen,',
                '                  plain, &plainLen) != 1) return 1;',
                '  return plainLen == sizeof(msg)-1 &&',
                '         std::memcmp(msg, plain, plainLen) == 0 ? 0 : 1;',
                '}'
              ]),
              java: code([
                'import org.gmssl.Sm9EncMasterKey;',
                'import org.gmssl.Sm9EncKey;',
                'import java.nio.charset.StandardCharsets;',
                'import java.util.Arrays;',
                '',
                'String id = "alice@example.com";',
                'Sm9EncMasterKey master = new Sm9EncMasterKey();',
                'master.generateMasterKey();',
                'Sm9EncKey aliceKey = master.extractKey(id);',
                '',
                'byte[] message = "session-key".getBytes(StandardCharsets.UTF_8);',
                'byte[] ciphertext = master.encrypt(message, id);',
                'byte[] plaintext = aliceKey.decrypt(ciphertext);',
                'if (!Arrays.equals(message, plaintext))',
                '  throw new SecurityException("SM9 decryption failed");'
              ])
            }
          },
          {
            title: '本章小结',
            paragraphs: [
              'SM9 用双线性对把身份直接纳入公钥密码机制，适合身份空间清晰、中心化治理严格的系统。它降低证书管理成本，却把安全重心集中到 KGC、主秘密、身份规范化、私钥分发与撤销机制上。'
            ]
          }
        ],
        references: [
          { label: '国家标准全文系统：GB/T 38635 SM9', url: 'https://openstd.samr.gov.cn/bzgk/std/std_list?p.p2=SM9' },
          { label: '国家密码管理局：SM9 标识密码算法公告', url: 'https://oscca.gov.cn/sca/xxgk/2016-03/28/content_1002407.shtml' },
          { label: '国家密码管理局：GM/T 0044-2025 修订公告', url: 'https://www.oscca.gov.cn/sca/xwdt/2026-01/05/content_1061311.shtml' },
          { label: 'GmSSL-Python：SM9 接口与示例', url: 'https://github.com/GmSSL/GmSSL-Python#sm9基于身份的密码' }
        ]
      },
      {
        id: 'zuc',
        number: '第七章',
        title: 'ZUC：祖冲之序列密码',
        source: 'GB/T 33133、GM/T 0001、3GPP 公开规范与 GmSSL ZUC 接口文档',
        introduction: 'ZUC 是面向序列数据的密码算法，以密钥和 IV 初始化内部状态，持续产生 32 位密钥字，再与数据异或。它已用于移动通信中的 128-EEA3 机密性算法与 128-EIA3 完整性算法；理解时必须区分底层 ZUC 密钥流与上层通信算法。',
        sections: [
          {
            title: '1. 序列密码模型',
            paragraphs: [
              '序列密码生成伪随机密钥流 \\(Z\\)，加密与解密都通过异或完成。密文长度等于明文长度，适合连续链路和长度敏感场景。其最重要的使用规则是：同一密钥与 IV 组合不能重复。',
              '如果两条消息复用同一密钥流，两个密文异或会消去密钥流并暴露两个明文的异或关系。仅靠 ZUC 密钥流也不能检测篡改，完整性必须由 EIA3、HMAC-SM3 或协议规定的认证机制提供。'
            ],
            formulas: [
              '\\[C=P\\oplus Z,\\qquad P=C\\oplus Z.\\]',
              '\\[C_1\\oplus C_2=P_1\\oplus P_2\\quad\\text{（密钥流复用时）}.\\]'
            ]
          },
          {
            title: '2. 内部状态与初始化',
            paragraphs: [
              'ZUC-128 的核心状态由 16 个 31 位线性反馈移位寄存器单元、两个 32 位非线性函数记忆字 R1/R2 构成。位重组从 LFSR 不同位置抽取片段，形成四个 32 位字供非线性函数与输出函数使用。',
              '装入 128 位密钥、128 位 IV 与固定常量后，算法执行 32 轮初始化，把非线性函数输出反馈到 LFSR。随后进入工作模式，先丢弃一个准备阶段输出，再逐字生成密钥流。'
            ],
            bullets: [
              'LFSR 提供长周期线性状态演化。',
              '位重组把分散状态拼成非线性函数输入。',
              'F 函数通过模加、异或、线性变换和 S 盒提供非线性。',
              '输出字由位重组结果与 F 函数结果组合得到。'
            ]
          },
          {
            title: '3. ZUC、EEA3 与 EIA3',
            paragraphs: [
              '底层 ZUC 接口通常只接受 key、IV 并输出密钥流或完成异或。移动通信中的 128-EEA3 则按 COUNT、BEARER、DIRECTION 等字段构造 IV，用于机密性保护；128-EIA3 使用相关结构生成消息认证码，用于完整性保护。',
              '不能把通用 Zuc(key, iv) 调用直接标记为完整的 EEA3 或 EIA3 实现。协议实现还必须遵循比特长度、字段编码、方向位和 MAC 截断等规范。'
            ],
            note: 'GmSSL 的 Python 与 Java Zuc 类提供基础 ZUC 加解密，不实现完整 128-EEA3/128-EIA3 协议封装。'
          },
          {
            title: '动手实践：三语言基础 ZUC 示例',
            paragraphs: [
              commonLibraryNote,
              '示例复用相同 key、iv 仅用于对刚生成的密文立即解密。实际系统必须为每条独立消息按协议生成唯一 IV，并为密文增加完整性保护。'
            ],
            codeExamples: {
              python: code([
                'from gmssl import Zuc, ZUC_KEY_SIZE, ZUC_IV_SIZE, rand_bytes',
                '',
                'key = rand_bytes(ZUC_KEY_SIZE)',
                'iv = rand_bytes(ZUC_IV_SIZE)',
                'plain = b"stream payload"',
                '',
                'enc = Zuc(key, iv)',
                'ciphertext = enc.update(plain) + enc.finish()',
                'dec = Zuc(key, iv)',
                'recovered = dec.update(ciphertext) + dec.finish()',
                'assert recovered == plain'
              ]),
              cpp: code([
                '#include <gmssl/zuc.h>',
                '#include <array>',
                '#include <cstring>',
                '',
                'int main() {',
                '  std::array<uint8_t, ZUC_KEY_SIZE> key{}; // 教学值',
                '  std::array<uint8_t, ZUC_IV_SIZE> iv{};',
                '  const uint8_t plain[] = "stream payload";',
                '  uint8_t cipher[sizeof(plain)-1], recovered[sizeof(plain)-1];',
                '  ZUC_STATE enc, dec;',
                '  zuc_init(&enc, key.data(), iv.data());',
                '  zuc_encrypt(&enc, plain, sizeof(plain)-1, cipher);',
                '  zuc_init(&dec, key.data(), iv.data());',
                '  zuc_encrypt(&dec, cipher, sizeof(cipher), recovered);',
                '  return std::memcmp(plain, recovered, sizeof(recovered));',
                '}'
              ]),
              java: code([
                'import org.gmssl.Random;',
                'import org.gmssl.Zuc;',
                'import java.nio.charset.StandardCharsets;',
                'import java.util.Arrays;',
                '',
                'Random rng = new Random();',
                'byte[] key = rng.randBytes(Zuc.KEY_SIZE);',
                'byte[] iv = rng.randBytes(Zuc.IV_SIZE);',
                'byte[] plain = "stream payload".getBytes(StandardCharsets.UTF_8);',
                'byte[] cipher = new byte[plain.length + Zuc.BLOCK_SIZE];',
                'Zuc zuc = new Zuc();',
                'zuc.init(key, iv);',
                'int cipherLen = zuc.update(plain, 0, plain.length, cipher, 0);',
                'cipherLen += zuc.doFinal(cipher, cipherLen);',
                '',
                'byte[] recovered = new byte[cipherLen + Zuc.BLOCK_SIZE];',
                'zuc.init(key, iv);',
                'int plainLen = zuc.update(cipher, 0, cipherLen, recovered, 0);',
                'plainLen += zuc.doFinal(recovered, plainLen);',
                'if (!Arrays.equals(plain, Arrays.copyOf(recovered, plainLen)))',
                '  throw new SecurityException("ZUC round trip failed");'
              ])
            }
          },
          {
            title: '本章小结',
            paragraphs: [
              'ZUC 通过 LFSR、位重组和非线性函数生成 32 位密钥字，适合连续数据保护。安全使用的核心是唯一的 key/IV 组合、明确区分基础算法与 EEA3/EIA3 协议封装，并为数据提供完整性认证。'
            ]
          }
        ],
        references: [
          { label: '国家密码管理局：祖冲之序列密码算法公告', url: 'https://www.oscca.gov.cn/sca/xxgk/2012-03/21/content_1002392.shtml' },
          { label: '国家密码管理局：ZUC 成为 ISO/IEC 国际标准', url: 'https://oscca.gov.cn/sca/xwdt/2020-05/11/content_1060747.shtml' },
          { label: 'GmSSL-Python：ZUC 接口与安全提示', url: 'https://github.com/GmSSL/GmSSL-Python#zuc序列密码' },
          { label: 'GmSSL ZUC 接口文档', url: 'https://gmssl-docs.readthedocs.io/zh-cn/latest/stream_cipher/zuc.html' }
        ]
      }
    ]
  };
})();
