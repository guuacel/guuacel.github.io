(function () {
  'use strict';

  const LANG_KEY = 'homepageLang';
  const supported = ['zh', 'en'];
  const articles = Array.from(document.querySelectorAll('[data-guide-lang]'));
  const toggle = document.getElementById('guideLangToggle');

  function resolveInitialLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (supported.includes(stored)) {
      return stored;
    }
    return document.documentElement.lang === 'en' ? 'en' : 'zh';
  }

  function setLanguage(lang) {
    const next = supported.includes(lang) ? lang : 'zh';
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next;
    articles.forEach(function (article) {
      article.classList.toggle('is-active', article.dataset.guideLang === next);
    });
    if (toggle) {
      toggle.textContent = next === 'zh' ? 'English' : '中文';
      toggle.setAttribute('aria-label', next === 'zh' ? 'Switch to English' : '切换到中文');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setLanguage(document.documentElement.lang === 'zh' ? 'en' : 'zh');
    });
  }

  document.querySelectorAll('.copy-code').forEach(function (button) {
    button.addEventListener('click', async function () {
      const panel = button.closest('.code-panel');
      const code = panel ? panel.querySelector('code') : null;
      if (!code) {
        return;
      }
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        button.textContent = button.dataset.copied || 'Copied';
      } catch (error) {
        button.textContent = button.dataset.failed || 'Failed';
      }
      window.setTimeout(function () {
        button.textContent = original;
      }, 1600);
    });
  });

  setLanguage(resolveInitialLang());
})();
