(function () {
  'use strict';

  const LANG_KEY = 'guuacel-homepage-language';
  const supportedLanguages = ['zh', 'en'];
  let currentLang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh';
  let activeBookId = new URLSearchParams(window.location.search).get('book') || 'understanding-cryptography';

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
      return '<button class="knowledge-book' + (isActive ? ' is-active' : '') + '"' +
        ' type="button" role="tab" aria-selected="' + isActive + '"' +
        ' aria-controls="bookContent" data-book-id="' + escapeHTML(book.id) + '"' +
        ' style="--book-color:' + escapeHTML(book.color) + '">' +
        '<span class="knowledge-book-title">' + escapeHTML(book.title) + '</span>' +
        '<span class="knowledge-book-author">' + escapeHTML(book.author) + '</span>' +
      '</button>';
    }).join('');
  }

  function renderBookContent() {
    const copy = pageCopy[currentLang];
    const book = getBook(activeBookId);
    activeBookId = book.id;
    elements.content.style.setProperty('--book-color', book.color);
    elements.content.innerHTML =
      '<header class="knowledge-reader-header">' +
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

  function render() {
    renderPageCopy();
    renderBookList();
    renderBookContent();
  }

  elements.list.addEventListener('click', function (event) {
    const button = event.target.closest('[data-book-id]');
    if (!button) return;
    activeBookId = button.getAttribute('data-book-id');
    const url = new URL(window.location.href);
    url.searchParams.set('book', activeBookId);
    window.history.replaceState({}, '', url);
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
