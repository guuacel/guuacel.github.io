(function () {
  'use strict';

  const LANG_KEY = 'guuacel-homepage-language';
  const LEGACY_LANG_KEY = 'homepageLang';
  const ASSET_VERSION = '20260607-paper-implementations';
  const supported = ['zh', 'en'];

  let profileData = null;
  let currentLang = 'zh';

  const app = document.getElementById('implementationApp');
  const brand = document.getElementById('implementationBrand');
  const homeLink = document.getElementById('implementationHomeLink');
  const toggle = document.getElementById('implementationLangToggle');
  const itemId = new URLSearchParams(window.location.search).get('id') || '';

  const labels = {
    zh: {
      brand: '论文实现',
      home: '返回主页',
      toggle: 'English',
      toc: '目录',
      abstract: '摘要介绍',
      steps: '算法详细步骤',
      code: '算法代码',
      copy: '复制',
      copied: '已复制',
      failed: '复制失败',
      notFoundTitle: '未找到论文实现',
      notFoundText: '请返回主页，在“论文实现”栏目中选择已有条目；或者在 profile.json 中补充 implementations.items。',
      paper: '论文',
      authors: '作者',
      venue: '期刊',
      year: '年份',
      volume: '卷期',
      pages: '页码',
      doi: 'DOI',
      codePlaceholder: '// 请在 profile.json 的 implementation.code.content 中补充算法代码。',
      stepPlaceholder: '请在 profile.json 的 implementation.algorithmSteps 中补充算法详细步骤。'
    },
    en: {
      brand: 'Paper Implementation',
      home: 'Back Home',
      toggle: '中文',
      toc: 'Contents',
      abstract: 'Abstract',
      steps: 'Algorithm Steps',
      code: 'Algorithm Code',
      copy: 'Copy',
      copied: 'Copied',
      failed: 'Failed',
      notFoundTitle: 'Paper Implementation Not Found',
      notFoundText: 'Return to the homepage and choose an existing item under Paper Implementations, or add entries to implementations.items in profile.json.',
      paper: 'Paper',
      authors: 'Authors',
      venue: 'Journal',
      year: 'Year',
      volume: 'Volume',
      pages: 'Pages',
      doi: 'DOI',
      codePlaceholder: '// Add algorithm code in implementation.code.content in profile.json.',
      stepPlaceholder: 'Add detailed algorithm steps in implementation.algorithmSteps in profile.json.'
    }
  };

  function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function formatInline(value) {
    return String(value == null ? '' : value)
      .split(/`([^`]*)`/g)
      .map(function (part, index) {
        return index % 2 === 1 ? '<code>' + escapeHTML(part) + '</code>' : escapeHTML(part);
      })
      .join('');
  }

  function resolveInitialLang() {
    const stored = localStorage.getItem(LANG_KEY) || localStorage.getItem(LEGACY_LANG_KEY);
    if (supported.includes(stored)) return stored;
    return document.documentElement.lang === 'en' ? 'en' : 'zh';
  }

  function getItems() {
    const section = profileData && profileData[currentLang] && profileData[currentLang].implementations;
    return section && Array.isArray(section.items) ? section.items : [];
  }

  function findItem() {
    return getItems().find(function (item) {
      return String(item.id || '') === itemId;
    });
  }

  function getCode(item) {
    if (!item || item.code == null) return { language: 'text', content: labels[currentLang].codePlaceholder };
    if (typeof item.code === 'string') return { language: 'text', content: item.code };
    return {
      language: item.code.language || 'text',
      content: item.code.content || labels[currentLang].codePlaceholder
    };
  }

  function renderNotFound() {
    const text = labels[currentLang];
    app.innerHTML = `
      <div class="container">
        <section class="guide-hero">
          <div class="guide-eyebrow">${escapeHTML(text.brand)}</div>
          <h1 class="guide-title">${escapeHTML(text.notFoundTitle)}</h1>
          <p class="guide-summary">${escapeHTML(text.notFoundText)}</p>
        </section>
      </div>
    `;
  }

  function renderItem(item) {
    const text = labels[currentLang];
    const abstractText = item.abstract || '';
    const sections = Array.isArray(item.algorithmSections) && item.algorithmSections.length
      ? item.algorithmSections
      : [{ title: text.steps, steps: Array.isArray(item.algorithmSteps) && item.algorithmSteps.length ? item.algorithmSteps : [text.stepPlaceholder] }];
    const code = getCode(item);

    app.innerHTML = `
      <article class="guide-article is-active">
        <div class="container">
          <section class="guide-hero">
            <div class="guide-eyebrow">${escapeHTML(text.paper)}</div>
            <h1 class="guide-title">${escapeHTML(item.title || text.notFoundTitle)}</h1>
            <p class="guide-summary">${formatInline(abstractText)}</p>
            <div class="guide-meta">
              ${item.authors ? `<span class="guide-pill">${escapeHTML(text.authors)}: ${escapeHTML(item.authors)}</span>` : ''}
              ${item.venue ? `<span class="guide-pill">${escapeHTML(text.venue)}: ${escapeHTML(item.venue)}</span>` : ''}
              ${item.year ? `<span class="guide-pill">${escapeHTML(text.year)}: ${escapeHTML(item.year)}</span>` : ''}
              ${item.volume ? `<span class="guide-pill">${escapeHTML(text.volume)}: ${escapeHTML(item.volume)}</span>` : ''}
              ${item.pages ? `<span class="guide-pill">${escapeHTML(text.pages)}: ${escapeHTML(item.pages)}</span>` : ''}
              ${item.doi ? `<a class="guide-pill" href="https://doi.org/${escapeHTML(item.doi)}" target="_blank" rel="noopener">${escapeHTML(text.doi)}: ${escapeHTML(item.doi)}</a>` : ''}
            </div>
          </section>

          <div class="guide-layout">
            <aside class="guide-toc">
              <div class="guide-toc-title">${escapeHTML(text.toc)}</div>
              <a href="#implementation-steps">${escapeHTML(text.steps)}</a>
              <a href="#implementation-code">${escapeHTML(text.code)}</a>
            </aside>

            <div class="guide-content">
              <section class="guide-section">
                <h2>${escapeHTML(text.abstract)}</h2>
                <p>${formatInline(abstractText)}</p>
              </section>

              <section class="guide-section" id="implementation-steps">
                <h2>${escapeHTML(text.steps)}</h2>
                ${sections.map(function (section) {
                  const steps = Array.isArray(section.steps) && section.steps.length ? section.steps : [text.stepPlaceholder];
                  return `
                    <h3>${escapeHTML(section.title || '')}</h3>
                    <ol>
                      ${steps.map(function (step) { return '<li>' + formatInline(step) + '</li>'; }).join('')}
                    </ol>
                  `;
                }).join('')}
              </section>

              <section class="guide-section" id="implementation-code">
                <h2>${escapeHTML(text.code)}</h2>
                <div class="code-panel">
                  <div class="code-panel-header">
                    <span>${escapeHTML(code.language)}</span>
                    <button class="copy-code" data-copied="${escapeHTML(text.copied)}" data-failed="${escapeHTML(text.failed)}">${escapeHTML(text.copy)}</button>
                  </div>
                  <pre><code>${escapeHTML(code.content)}</code></pre>
                </div>
              </section>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function bindCopyButtons() {
    document.querySelectorAll('.copy-code').forEach(function (button) {
      button.addEventListener('click', async function () {
        const panel = button.closest('.code-panel');
        const code = panel ? panel.querySelector('code') : null;
        if (!code) return;
        const original = button.textContent;
        try {
          await navigator.clipboard.writeText(code.textContent.trim());
          button.textContent = button.dataset.copied || labels[currentLang].copied;
        } catch (error) {
          button.textContent = button.dataset.failed || labels[currentLang].failed;
        }
        window.setTimeout(function () {
          button.textContent = original;
        }, 1600);
      });
    });
  }

  function renderMath() {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise([app]).catch(function (error) {
        console.error(error);
      });
    }
  }

  function render() {
    const text = labels[currentLang];
    document.documentElement.lang = currentLang;
    if (brand) brand.textContent = text.brand;
    if (homeLink) homeLink.textContent = text.home;
    if (toggle) {
      toggle.textContent = text.toggle;
      toggle.setAttribute('aria-label', currentLang === 'zh' ? 'Switch to English' : '切换到中文');
    }

    const item = findItem();
    if (!item) {
      renderNotFound();
    } else {
      renderItem(item);
      bindCopyButtons();
    }
    renderMath();
  }

  function setLanguage(lang) {
    currentLang = supported.includes(lang) ? lang : 'zh';
    localStorage.setItem(LANG_KEY, currentLang);
    render();
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setLanguage(currentLang === 'zh' ? 'en' : 'zh');
    });
  }

  async function init() {
    try {
      const resp = await fetch('assets/data/profile.json?v=' + ASSET_VERSION);
      if (!resp.ok) throw new Error('Failed to load profile.json: ' + resp.status);
      profileData = await resp.json();
      currentLang = resolveInitialLang();
      render();
    } catch (error) {
      app.innerHTML = `
        <div class="container">
          <section class="guide-hero">
            <div class="guide-eyebrow">Paper Implementation</div>
            <h1 class="guide-title">Failed to load profile data.</h1>
          </section>
        </div>
      `;
      // Keep the error visible for local debugging without interrupting page load.
      console.error(error);
    }
  }

  init();
})();
