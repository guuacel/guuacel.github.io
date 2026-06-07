/**
 * Academic Personal Homepage — Main JavaScript
 *
 * Responsibilities:
 *  - Load profile.json
 *  - Render all sections dynamically
 *  - Language switching (zh / en)
 *  - Mobile navigation
 *  - Publication filtering
 *  - BibTeX expand/collapse
 *  - Smooth scrolling
 *  - Back-to-top button
 */

(function () {
  'use strict';

  /* ======================================================================
     State
     ====================================================================== */
  let profileData = null;
  let currentLang = 'zh';
  const ASSET_VERSION = '20260607-remove-projects-patents';

  /* ======================================================================
     DOM References
     ====================================================================== */
  const DOM = {};

  function cacheDom() {
    DOM.navbar = document.getElementById('navbar');
    DOM.navBrand = document.getElementById('navBrand');
    DOM.navLinks = document.getElementById('navLinks');
    DOM.menuToggle = document.getElementById('menuToggle');
    DOM.langToggle = document.getElementById('langToggle');
    DOM.backToTop = document.getElementById('backToTop');
    DOM.heroSection = document.getElementById('hero');
    DOM.aboutSection = document.getElementById('about');
    DOM.pubSection = document.getElementById('publications');
    DOM.projectsSection = document.getElementById('projects');
    DOM.patentsSection = document.getElementById('patents');
    DOM.toolsSection = document.getElementById('tools');
    DOM.contactSection = document.getElementById('contact');
    DOM.footer = document.getElementById('footer');
    DOM.html = document.documentElement;
  }

  /* ======================================================================
     Helpers
     ====================================================================== */
  function t(path) {
    // Access nested property: "site.nav.home" -> profileData[lang].site.nav.home
    const keys = path.split('.');
    let val = profileData[currentLang];
    for (const k of keys) {
      if (val == null) return path;
      val = val[k];
    }
    return val != null ? val : path;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getPublicationTagClass(tag) {
    const normalized = String(tag || '').toLowerCase().replace(/\s+/g, '');
    const classes = ['pub-tag'];

    if (/中科院|cas|xinrui|新锐/.test(normalized)) {
      if (/1区|q1/.test(normalized)) classes.push('pub-tag-cas-q1');
      if (/2区|q2/.test(normalized)) classes.push('pub-tag-cas-q2');
      if (/3区|q3/.test(normalized)) classes.push('pub-tag-cas-q3');
      if (/4区|q4/.test(normalized)) classes.push('pub-tag-cas-q4');
      if (/top/.test(normalized)) classes.push('pub-tag-cas-top');
    } else if (/ccf/.test(normalized)) {
      if (/ccfa|a类/.test(normalized)) classes.push('pub-tag-ccf-a');
      if (/ccfb|b类/.test(normalized)) classes.push('pub-tag-ccf-b');
      if (/ccfc|c类/.test(normalized)) classes.push('pub-tag-ccf-c');
    } else if (/北大|pku/.test(normalized)) {
      classes.push('pub-tag-pku');
    } else if (/cscd/.test(normalized)) {
      classes.push('pub-tag-cscd');
    } else if (/swjtu|西南交大|西南交通/.test(normalized)) {
      classes.push('pub-tag-swjtu');
    } else if (/online|网络首发/.test(normalized)) {
      classes.push('pub-tag-online');
    }

    return classes.join(' ');
  }

  /* ======================================================================
     Language
     ====================================================================== */
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('guuacel-homepage-language', lang);
    updateLangToggle();
    renderAll();
  }

  function updateLangToggle() {
    if (DOM.langToggle) {
      DOM.langToggle.textContent = t('site.languageLabel');
    }
    // Update HTML lang attribute
    DOM.html.lang = currentLang;
  }

  /* ======================================================================
     Navigation
     ====================================================================== */
  function initNav() {
    // Mobile menu toggle
    DOM.menuToggle.addEventListener('click', function () {
      const isOpen = DOM.navLinks.classList.toggle('open');
      DOM.menuToggle.classList.toggle('active');
      // Update aria
      DOM.menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu on link click
    DOM.navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        DOM.navLinks.classList.remove('open');
        DOM.menuToggle.classList.remove('active');
        DOM.menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Highlight active nav on scroll
    let scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        requestAnimationFrame(function () {
          highlightNav();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });
  }

  function highlightNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    let currentId = '';
    sections.forEach(function (sec) {
      const top = sec.offsetTop - 80;
      if (scrollPos >= top) {
        currentId = sec.getAttribute('id');
      }
    });

    DOM.navLinks.querySelectorAll('a').forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  /* ======================================================================
     Back to Top
     ====================================================================== */
  function initBackToTop() {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        DOM.backToTop.classList.add('visible');
      } else {
        DOM.backToTop.classList.remove('visible');
      }
    });

    DOM.backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ======================================================================
     Rendering — Navigation
     ====================================================================== */
  function renderNav() {
    const nav = profileData[currentLang].site.nav;
    const langLabel = t('site.languageLabel');
    const brand = t('hero.name');
    const projects = profileData[currentLang].projects;
    const patents = profileData[currentLang].patents;
    const hasProjects = projects && Array.isArray(projects.items) && projects.items.length > 0;
    const hasPatents = patents && Array.isArray(patents.items) && patents.items.length > 0;

    if (DOM.navBrand) {
      DOM.navBrand.textContent = brand;
      DOM.navBrand.setAttribute('aria-label', nav.home);
    }

    DOM.navLinks.innerHTML = `
      <a href="#hero">${escapeHTML(nav.home)}</a>
      <a href="#about">${escapeHTML(nav.about)}</a>
      <a href="#publications">${escapeHTML(nav.publications)}</a>
      ${hasProjects ? `<a href="#projects">${escapeHTML(nav.projects)}</a>` : ''}
      ${hasPatents ? `<a href="#patents">${escapeHTML(nav.patents)}</a>` : ''}
      <a href="#tools">${escapeHTML(nav.tools)}</a>
      <a href="#contact">${escapeHTML(nav.contact)}</a>
      <button class="lang-toggle" id="langToggle" aria-label="Switch language">${escapeHTML(langLabel)}</button>
    `;

    // Re-cache the dynamically created button.
    DOM.langToggle = document.getElementById('langToggle');
  }

  /* ======================================================================
     Rendering — Hero
     ====================================================================== */
  function renderHero() {
    DOM.heroSection.innerHTML = `
      <div class="container">
        <div class="hero-avatar">
          <img src="assets/img/avatar-placeholder.png" alt="${escapeHTML(t('hero.name'))}" width="160" height="160">
        </div>
        <div class="hero-info">
          <h1 class="hero-name">${escapeHTML(t('hero.name'))}</h1>
          <p class="hero-title">${escapeHTML(t('hero.title'))}</p>
          <p class="hero-affiliation">${escapeHTML(t('hero.affiliation'))}</p>
          <p class="hero-bio">${escapeHTML(t('hero.bio'))}</p>
          <div class="hero-links" id="heroLinks"></div>
        </div>
      </div>
    `;

    const linksContainer = document.getElementById('heroLinks');
    const links = profileData[currentLang].hero.links;

    const linkDefs = [
      { key: 'email', icon: '📧', label: 'Email', href: links.email ? 'mailto:' + links.email : '#' },
      { key: 'github', icon: '🔗', label: 'GitHub', href: links.github },
      { key: 'googleScholar', icon: '🎓', label: 'Google Scholar', href: links.googleScholar },
      { key: 'orcid', icon: '🆔', label: 'ORCID', href: links.orcid },
    ];

    linkDefs.forEach(function (def) {
      const a = document.createElement('a');
      a.className = 'hero-link';
      a.href = def.href;
      if (def.key === 'email') {
        // handled via mailto
      } else if (def.href === '#' || def.href.indexOf('TODO') > -1) {
        a.setAttribute('data-todo', 'true');
      }
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `<span class="icon">${def.icon}</span> ${def.label}`;
      linksContainer.appendChild(a);
    });
  }

  /* ======================================================================
     Rendering — About
     ====================================================================== */
  function renderAbout() {
    const about = profileData[currentLang].about;
    const researchLabel = currentLang === 'zh' ? '研究方向' : 'Research Directions';
    const researchText = currentLang === 'zh'
      ? '应用密码学、工业物联网安全、车联网安全等。'
      : 'Applied cryptography, Industrial IoT security, Internet of Vehicles security, etc.';

    let eduHTML = '';
    about.education.forEach(function (edu) {
      eduHTML += `
        <div class="edu-item">
          <div class="edu-degree">${escapeHTML(edu.degree)}</div>
          <div class="edu-school">${escapeHTML(edu.school)}</div>
          <div class="edu-year">${escapeHTML(edu.year)}</div>
        </div>
      `;
    });

    DOM.aboutSection.innerHTML = `
      <div class="container">
        <h2 class="section-title">${escapeHTML(about.title)}</h2>
        <div class="about-content">
          <div class="about-bio">
            <p>${escapeHTML(about.bio)}</p>
            <div class="about-research-text">
              <h3>${escapeHTML(researchLabel)}</h3>
              <p>${escapeHTML(researchText)}</p>
            </div>
          </div>
          <div class="about-details">
            <h3>${currentLang === 'zh' ? '教育背景' : 'Education'}</h3>
            ${eduHTML}
          </div>
        </div>
      </div>
    `;
  }

  /* ======================================================================
     Rendering — Publications
     ====================================================================== */
  function renderPublications() {
    const pub = profileData[currentLang].publications;
    const papers = pub.papers;

    DOM.pubSection.innerHTML = `
      <div class="container">
        <h2 class="section-title">${escapeHTML(pub.title)}</h2>
        <div class="pub-filters" id="pubFilters">
          <button class="pub-filter active" data-filter="all">${escapeHTML(pub.filterAll)}</button>
          <button class="pub-filter" data-filter="journal">${escapeHTML(pub.filterJournal)}</button>
          <button class="pub-filter" data-filter="conference">${escapeHTML(pub.filterConference)}</button>
          <button class="pub-filter" data-filter="preprint">${escapeHTML(pub.filterPreprint)}</button>
        </div>
        <div id="pubContainer"></div>
      </div>
    `;

    renderPubList(papers, 'all');

    // Filter events
    document.getElementById('pubFilters').addEventListener('click', function (e) {
      if (e.target.classList.contains('pub-filter')) {
        document.querySelectorAll('.pub-filter').forEach(function (btn) {
          btn.classList.remove('active');
        });
        e.target.classList.add('active');
        renderPubList(papers, e.target.dataset.filter);
      }
    });
  }

  function renderPubList(papers, filter) {
    const container = document.getElementById('pubContainer');
    if (!container) return;

    const filtered = filter === 'all'
      ? papers
      : papers.filter(function (p) { return p.type === filter; });

    // Group by year (descending)
    const byYear = {};
    filtered.forEach(function (p) {
      if (!byYear[p.year]) byYear[p.year] = [];
      byYear[p.year].push(p);
    });

    const years = Object.keys(byYear).sort(function (a, b) { return b - a; });

    let html = '';
    years.forEach(function (year) {
      html += `<div class="pub-year-group">
        <h3 class="pub-year">${year}</h3>
        <div class="pub-list">`;

      byYear[year].forEach(function (paper, idx) {
        const typeLabels = {
          journal: { zh: '期刊', en: 'Journal' },
          conference: { zh: '会议', en: 'Conf' },
          preprint: { zh: '预印本', en: 'Preprint' },
        };

        const typeLabel = typeLabels[paper.type]
          ? typeLabels[paper.type][currentLang]
          : paper.type;

        const bibtexId = 'bibtex-' + year + '-' + idx;

        html += `
          <div class="pub-item">
            <div class="pub-title">${escapeHTML(paper.title)}</div>
            <div class="pub-authors">${escapeHTML(paper.authors)}</div>
            <div class="pub-venue">${escapeHTML(paper.venue)}</div>
            <div class="pub-meta">
              <span class="pub-type-badge pub-type-${paper.type}">${typeLabel}</span>`;

        if (paper.doi) {
          html += `<a href="https://doi.org/${escapeHTML(paper.doi)}" class="pub-btn" target="_blank" rel="noopener">📎 ${escapeHTML(t('publications.doiLabel'))}</a>`;
        }
        if (paper.pdf && paper.pdf !== '#') {
          html += `<a href="${escapeHTML(paper.pdf)}" class="pub-btn" target="_blank" rel="noopener">📄 ${escapeHTML(t('publications.pdfLabel'))}</a>`;
        }
        if (paper.code && paper.code !== '#') {
          const codeTitle = currentLang === 'zh' ? '下载代码' : 'Download code';
          html += `<a href="${escapeHTML(paper.code)}" class="pub-btn pub-btn-code" target="_blank" rel="noopener" title="${escapeHTML(codeTitle)}">💻 ${escapeHTML(t('publications.codeLabel'))}</a>`;
        }
        if (paper.bibtex) {
          html += `<button class="pub-btn bibtex-toggle" data-target="${bibtexId}">📋 ${escapeHTML(t('publications.bibtexLabel'))}</button>`;
        }

        html += `</div>`;

        if (Array.isArray(paper.tags) && paper.tags.length) {
          html += `<div class="pub-tags">${paper.tags.map(function (tag) {
            return '<span class="' + getPublicationTagClass(tag) + '">' + escapeHTML(tag) + '</span>';
          }).join('')}</div>`;
        }

        if (paper.bibtex) {
          html += `<pre class="bibtex-content" id="${bibtexId}"><code>${escapeHTML(paper.bibtex)}</code></pre>`;
        }

        html += `</div>`;
      });

      html += `</div></div>`;
    });

    if (filtered.length === 0) {
      html = '<p style="text-align:center;color:var(--color-text-muted);padding:2rem 0;">No publications found in this category.</p>';
    }

    container.innerHTML = html;

    // Bind BibTeX toggles
    container.querySelectorAll('.bibtex-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = document.getElementById(btn.dataset.target);
        if (target) {
          target.classList.toggle('open');
        }
      });
    });
  }

  /* ======================================================================
     Rendering — Projects
     ====================================================================== */
  function renderProjects() {
    const proj = profileData[currentLang].projects;

    if (!proj || !Array.isArray(proj.items) || proj.items.length === 0) {
      DOM.projectsSection.hidden = true;
      DOM.projectsSection.innerHTML = '';
      return;
    }

    DOM.projectsSection.hidden = false;

    let itemsHTML = '';
    proj.items.forEach(function (item) {
      itemsHTML += `
        <div class="project-item">
          <div class="project-header">
            <h3 class="project-name">${escapeHTML(item.name)}</h3>
            <span class="project-period">${escapeHTML(item.period)}</span>
          </div>
          <p class="project-desc">${escapeHTML(item.description)}</p>
          <div class="project-meta">
            <span><strong>${escapeHTML(proj.roleLabel)}:</strong> ${escapeHTML(item.role)}</span>
            <span><strong>${escapeHTML(proj.techLabel)}:</strong> ${escapeHTML(proj.periodLabel)} ${escapeHTML(item.period)}</span>
          </div>
          <div class="project-tech">
            ${item.tech.map(function (t) { return '<span>' + escapeHTML(t) + '</span>'; }).join('')}
          </div>
          ${item.link && item.link !== '#' ? `<a class="project-link" href="${escapeHTML(item.link)}" target="_blank" rel="noopener">🔗 View Project</a>` : ''}
        </div>
      `;
    });

    DOM.projectsSection.innerHTML = `
      <div class="container">
        <h2 class="section-title">${escapeHTML(proj.title)}</h2>
        <div class="project-list">${itemsHTML}</div>
      </div>
    `;
  }

  /* ======================================================================
     Rendering — Patents
     ====================================================================== */
  function renderPatents() {
    const pat = profileData[currentLang].patents;

    if (!pat || !Array.isArray(pat.items) || pat.items.length === 0) {
      DOM.patentsSection.hidden = true;
      DOM.patentsSection.innerHTML = '';
      return;
    }

    DOM.patentsSection.hidden = false;

    const statusClasses = {
      '已授权': 'status-granted',
      'Granted': 'status-granted',
      '实质审查': 'status-review',
      'Under Review': 'status-review',
      '已登记': 'status-registered',
      'Registered': 'status-registered',
    };

    let rowsHTML = '';
    pat.items.forEach(function (item) {
      const statusClass = statusClasses[item.status] || '';
      rowsHTML += `
        <tr>
          <td class="patent-name">${escapeHTML(item.name)}</td>
          <td>${escapeHTML(item.type)}</td>
          <td><span class="patent-status ${statusClass}">${escapeHTML(item.status)}</span></td>
          <td>${item.year}</td>
          <td>${escapeHTML(item.role)}</td>
          <td>${escapeHTML(item.note)}</td>
        </tr>
      `;
    });

    const headings = currentLang === 'zh'
      ? ['名称', '类型', '状态', '年份', '个人角色', '备注']
      : ['Name', 'Type', 'Status', 'Year', 'Role', 'Note'];

    DOM.patentsSection.innerHTML = `
      <div class="container">
        <h2 class="section-title">${escapeHTML(pat.title)}</h2>
        <div class="patent-table-wrap">
          <table class="patent-table">
            <thead>
              <tr>
                ${headings.map(function (h) { return '<th>' + escapeHTML(h) + '</th>'; }).join('')}
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ======================================================================
     Rendering — Tools
     ====================================================================== */
  function renderTools() {
    const tools = profileData[currentLang].tools;

    let itemsHTML = '';
    tools.items.forEach(function (item) {
      const iconMap = {
        code: '</>',
        python: 'Py',
        scholar: 'GS',
        id: 'ID',
      };
      const tagsHTML = Array.isArray(item.tags) && item.tags.length
        ? `<div class="tool-tags">${item.tags.map(function (tag) { return `<span class="tool-tag">${escapeHTML(tag)}</span>`; }).join('')}</div>`
        : '';
      const target = item.target || '_blank';
      const rel = target === '_blank' ? ' rel="noopener"' : '';
      itemsHTML += `
        <article class="tool-item">
          <div class="tool-icon">${escapeHTML(iconMap[item.icon] || item.icon || '↗')}</div>
          <div class="tool-info">
            <div class="tool-title-row">
              <h3 class="tool-name">${escapeHTML(item.name)}</h3>
              ${tagsHTML}
            </div>
            <p class="tool-desc">${escapeHTML(item.description)}</p>
            <a class="tool-link" href="${escapeHTML(item.link)}" target="${escapeHTML(target)}"${rel}>${escapeHTML(item.action)}</a>
          </div>
        </article>
      `;
    });

    DOM.toolsSection.innerHTML = `
      <div class="container">
        <h2 class="section-title">${escapeHTML(tools.title)}</h2>
        <div class="tools-grid">${itemsHTML}</div>
      </div>
    `;
  }

  /* ======================================================================
     Rendering — Contact
     ====================================================================== */
  function renderContact() {
    const contact = profileData[currentLang].contact;

    const items = [
      { icon: '📧', label: 'Email', value: contact.email, href: 'mailto:' + contact.email },
      { icon: '🔗', label: 'GitHub', value: contact.github.replace('https://', ''), href: contact.github },
      { icon: '🎓', label: 'Google Scholar', value: 'Google Scholar Profile', href: contact.googleScholar },
      { icon: '🆔', label: 'ORCID', value: contact.orcid, href: contact.orcid },
      { icon: '🏛️', label: currentLang === 'zh' ? '所属机构' : 'Institution', value: contact.institution, href: null },
      { icon: '📍', label: currentLang === 'zh' ? '地址' : 'Address', value: contact.address, href: null },
    ];

    let gridHTML = '';
    items.forEach(function (item) {
      gridHTML += `
        <div class="contact-item">
          <span class="contact-icon">${item.icon}</span>
          <div>
            <div class="contact-label">${item.label}</div>
            ${item.href ? `<a class="contact-value" href="${escapeHTML(item.href)}" target="_blank" rel="noopener">${escapeHTML(item.value)}</a>` : `<div class="contact-value">${escapeHTML(item.value)}</div>`}
          </div>
        </div>
      `;
    });

    DOM.contactSection.innerHTML = `
      <div class="container">
        <h2 class="section-title">${escapeHTML(contact.title)}</h2>
        <div class="contact-grid">${gridHTML}</div>
      </div>
    `;
  }

  /* ======================================================================
     Rendering — Footer
     ====================================================================== */
  function renderFooter() {
    const labels = currentLang === 'zh'
      ? {
          statsTitle: '主页访问统计',
          visitsLabel: '访问数量',
          mapTitle: '访问来源地图',
          mapDescription: '世界地图展示最近访问来源的地理分布。IP 来源由第三方服务根据访问请求估算。',
          counterAlt: '主页访问数量',
          mapAlt: '主页访问来源世界地图',
          poweredBy: 'Visitor map by SmallCounter',
        }
      : {
          statsTitle: 'Homepage Stats',
          visitsLabel: 'Visit Count',
          mapTitle: 'Visitor Source Map',
          mapDescription: 'A world map showing the recent geographic distribution of visitors. Source locations are estimated by a third-party service.',
          counterAlt: 'Homepage visit count',
          mapAlt: 'Homepage visitor source world map',
          poweredBy: 'Visitor map by SmallCounter',
        };
    DOM.footer.innerHTML = `
      <div class="container">
        <div class="footer-stats" aria-label="${escapeHTML(labels.statsTitle)}">
          <div class="footer-stat-card">
            <div class="footer-stat-label">${escapeHTML(labels.visitsLabel)}</div>
            <img
              class="visitor-badge"
              src="https://visitor-badge.laobi.icu/badge?page_id=guuacel.github.io&left_text=visitors&left_color=%23595f72&right_color=%232c6faa&format=true"
              alt="${escapeHTML(labels.counterAlt)}"
              loading="lazy"
            >
          </div>
          <div class="footer-stat-card footer-map-card">
            <div class="footer-map-copy">
              <div class="footer-stat-label">${escapeHTML(labels.mapTitle)}</div>
              <p class="footer-map-desc">${escapeHTML(labels.mapDescription)}</p>
            </div>
            <div class="visitor-map-frame">
              <img
                class="visitor-world-map"
                src="https://smallcounter.com/map/view.php?type=250&id=1780722537"
                alt="${escapeHTML(labels.mapAlt)}"
                loading="lazy"
              >
            </div>
            <a class="visitor-map-credit" href="https://smallcounter.com/map/" target="_blank" rel="noopener">${escapeHTML(labels.poweredBy)}</a>
          </div>
        </div>
        <p class="footer-copyright">${escapeHTML(t('site.footer.copyright'))}</p>
        <p class="footer-powered">${escapeHTML(t('site.footer.poweredBy'))}</p>
      </div>
    `;
  }

  /* ======================================================================
     Render All
     ====================================================================== */
  function renderAll() {
    document.title = t('site.title');
    DOM.html.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    renderNav();
    renderHero();
    renderAbout();
    renderPublications();
    renderProjects();
    renderPatents();
    renderTools();
    renderContact();
    renderFooter();
    updateLangToggle();
  }

  /* ======================================================================
     Initialization
     ====================================================================== */
  async function init() {
    cacheDom();

    // Load profile data
    try {
      const resp = await fetch('assets/data/profile.json?v=' + ASSET_VERSION);
      if (!resp.ok) throw new Error('Failed to load profile.json: ' + resp.status);
      profileData = await resp.json();
    } catch (err) {
      console.error('Could not load profile data:', err);
      // Display an error message
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML = '<div class="container" style="padding:6rem 1.5rem;text-align:center;"><p>Failed to load profile data. Please check that <code>assets/data/profile.json</code> exists and is valid JSON.</p></div>';
      }
      return;
    }

    // Restore language preference (default: zh)
    const savedLang = localStorage.getItem('guuacel-homepage-language');
    if (savedLang === 'en' || savedLang === 'zh') {
      currentLang = savedLang;
    }

    // Initial render
    renderAll();

    // Event listeners — use delegation since nav buttons are recreated on language switch
    DOM.navLinks.addEventListener('click', function (e) {
      if (e.target.id === 'langToggle' || e.target.closest('#langToggle')) {
        setLanguage(currentLang === 'zh' ? 'en' : 'zh');
      }
      if (e.target.closest('a')) {
        DOM.navLinks.classList.remove('open');
        DOM.menuToggle.classList.remove('active');
        DOM.menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    initNav();
    initBackToTop();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
