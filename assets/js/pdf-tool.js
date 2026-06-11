(function () {
  'use strict';

  const LANG_KEY = 'guuacel-homepage-language';
  const LEGACY_LANG_KEY = 'homepageLang';
  const supported = ['zh', 'en'];
  const state = {
    lang: 'zh',
    mode: 'merge',
    mergeFiles: [],
    splitFile: null,
    splitPageCount: 0,
    outputUrls: []
  };

  const labels = {
    zh: {
      brand: 'PDF 工具',
      home: '返回主页',
      toggle: 'English',
      eyebrow: 'Browser PDF Tool',
      title: 'PDF 合并与拆分',
      summary: '本地处理 PDF 文件，适合论文、报告和材料整理。',
      mergeTab: '合并',
      splitTab: '拆分',
      mergeTitle: '合并 PDF',
      splitTitle: '拆分 PDF',
      mergeBadge: '多文件',
      splitBadge: '单文件',
      mergeDropText: '选择 PDF 文件',
      splitDropText: '选择 PDF 文件',
      rangeLabel: '页码范围',
      rangePlaceholder: '1,3-5,8',
      mergeButton: '合并并下载',
      extractButton: '提取范围',
      splitPagesButton: '拆成单页',
      clear: '清空',
      remove: '删除',
      up: '上移',
      down: '下移',
      selected: '已选择',
      pages: '页',
      noFiles: '至少选择 2 个 PDF 文件。',
      noSplitFile: '请先选择 1 个 PDF 文件。',
      emptyRange: '请输入页码范围。',
      invalidRange: '页码范围无效。',
      loading: '正在处理...',
      merged: '已生成合并文件。',
      extracted: '已生成范围提取文件。',
      splitDone: '已生成单页 PDF。',
      encrypted: '无法处理加密或受保护的 PDF。',
      libraryMissing: 'PDF 处理库加载失败，请刷新页面后重试。',
      outputTitle: '输出文件',
      download: '下载',
      mergedName: 'merged.pdf',
      extractedName: 'extracted-pages.pdf'
    },
    en: {
      brand: 'PDF Tool',
      home: 'Back Home',
      toggle: '中文',
      eyebrow: 'Browser PDF Tool',
      title: 'Merge and Split PDFs',
      summary: 'Process PDF files locally in the browser for papers, reports, and documents.',
      mergeTab: 'Merge',
      splitTab: 'Split',
      mergeTitle: 'Merge PDFs',
      splitTitle: 'Split PDF',
      mergeBadge: 'Multiple files',
      splitBadge: 'Single file',
      mergeDropText: 'Choose PDF files',
      splitDropText: 'Choose a PDF file',
      rangeLabel: 'Page ranges',
      rangePlaceholder: '1,3-5,8',
      mergeButton: 'Merge and Download',
      extractButton: 'Extract Range',
      splitPagesButton: 'Split Pages',
      clear: 'Clear',
      remove: 'Remove',
      up: 'Up',
      down: 'Down',
      selected: 'Selected',
      pages: 'pages',
      noFiles: 'Choose at least 2 PDF files.',
      noSplitFile: 'Choose 1 PDF file first.',
      emptyRange: 'Enter page ranges.',
      invalidRange: 'Invalid page range.',
      loading: 'Processing...',
      merged: 'Merged file generated.',
      extracted: 'Extracted PDF generated.',
      splitDone: 'Single-page PDFs generated.',
      encrypted: 'Encrypted or protected PDFs cannot be processed.',
      libraryMissing: 'PDF library failed to load. Refresh and try again.',
      outputTitle: 'Output Files',
      download: 'Download',
      mergedName: 'merged.pdf',
      extractedName: 'extracted-pages.pdf'
    }
  };

  const els = {
    brand: document.getElementById('pdfToolBrand'),
    home: document.getElementById('pdfToolHomeLink'),
    toggle: document.getElementById('pdfToolLangToggle'),
    eyebrow: document.getElementById('pdfToolEyebrow'),
    title: document.getElementById('pdfToolTitle'),
    summary: document.getElementById('pdfToolSummary'),
    mergeTab: document.getElementById('mergeTab'),
    splitTab: document.getElementById('splitTab'),
    mergePanel: document.getElementById('mergePanel'),
    splitPanel: document.getElementById('splitPanel'),
    mergeTitle: document.getElementById('mergeTitle'),
    splitTitle: document.getElementById('splitTitle'),
    mergeBadge: document.getElementById('mergeBadge'),
    splitBadge: document.getElementById('splitBadge'),
    mergeInput: document.getElementById('mergeInput'),
    splitInput: document.getElementById('splitInput'),
    mergeDropText: document.getElementById('mergeDropText'),
    splitDropText: document.getElementById('splitDropText'),
    mergeFileList: document.getElementById('mergeFileList'),
    splitFileInfo: document.getElementById('splitFileInfo'),
    rangeLabel: document.getElementById('rangeLabel'),
    pageRanges: document.getElementById('pageRanges'),
    mergeButton: document.getElementById('mergeButton'),
    extractButton: document.getElementById('extractButton'),
    splitPagesButton: document.getElementById('splitPagesButton'),
    mergeClearButton: document.getElementById('mergeClearButton'),
    splitClearButton: document.getElementById('splitClearButton'),
    splitOutputList: document.getElementById('splitOutputList'),
    status: document.getElementById('pdfToolStatus')
  };

  function text() {
    return labels[state.lang];
  }

  function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function resolveInitialLang() {
    const stored = localStorage.getItem(LANG_KEY) || localStorage.getItem(LEGACY_LANG_KEY);
    if (supported.includes(stored)) return stored;
    return document.documentElement.lang === 'en' ? 'en' : 'zh';
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function baseName(file) {
    return String(file && file.name ? file.name : 'document.pdf').replace(/\.pdf$/i, '');
  }

  function setStatus(message, type) {
    els.status.textContent = message || '';
    els.status.dataset.type = type || '';
  }

  function setBusy(isBusy) {
    [els.mergeButton, els.extractButton, els.splitPagesButton].forEach(function (button) {
      button.disabled = isBusy;
    });
  }

  function clearOutputUrls() {
    state.outputUrls.forEach(function (url) {
      URL.revokeObjectURL(url);
    });
    state.outputUrls = [];
  }

  function getPDFLib() {
    if (!window.PDFLib || !window.PDFLib.PDFDocument) {
      throw new Error(text().libraryMissing);
    }
    return window.PDFLib;
  }

  async function loadPDF(file) {
    try {
      const buffer = await file.arrayBuffer();
      return await getPDFLib().PDFDocument.load(buffer);
    } catch (error) {
      throw new Error(text().encrypted);
    }
  }

  function downloadBytes(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function renderMergeFiles() {
    const t = text();
    if (!state.mergeFiles.length) {
      els.mergeFileList.innerHTML = '';
      return;
    }

    els.mergeFileList.innerHTML = state.mergeFiles.map(function (file, index) {
      return `
        <div class="pdf-file-row">
          <div class="pdf-file-main">
            <strong>${escapeHTML(file.name)}</strong>
            <span>${escapeHTML(formatBytes(file.size))}</span>
          </div>
          <div class="pdf-file-actions">
            <button type="button" data-action="up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>${escapeHTML(t.up)}</button>
            <button type="button" data-action="down" data-index="${index}" ${index === state.mergeFiles.length - 1 ? 'disabled' : ''}>${escapeHTML(t.down)}</button>
            <button type="button" data-action="remove" data-index="${index}">${escapeHTML(t.remove)}</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSplitFile() {
    const t = text();
    if (!state.splitFile) {
      els.splitFileInfo.innerHTML = '';
      return;
    }
    const pageText = state.splitPageCount ? ' · ' + state.splitPageCount + ' ' + t.pages : '';
    els.splitFileInfo.innerHTML = `
      <strong>${escapeHTML(state.splitFile.name)}</strong>
      <span>${escapeHTML(formatBytes(state.splitFile.size) + pageText)}</span>
    `;
  }

  function renderOutputs(outputs) {
    const t = text();
    clearOutputUrls();
    if (!outputs || !outputs.length) {
      els.splitOutputList.innerHTML = '';
      return;
    }
    els.splitOutputList.innerHTML = `
      <h3>${escapeHTML(t.outputTitle)}</h3>
      ${outputs.map(function (output, index) {
        const blob = new Blob([output.bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        state.outputUrls.push(url);
        return `
          <a class="pdf-output-link" href="${escapeHTML(url)}" download="${escapeHTML(output.name)}">
            <span>${escapeHTML(output.name)}</span>
            <strong>${escapeHTML(t.download)}</strong>
          </a>
        `;
      }).join('')}
    `;
  }

  function parseRanges(value, pageCount) {
    const t = text();
    const input = String(value || '').trim();
    if (!input) throw new Error(t.emptyRange);

    const pages = [];
    input.split(',').forEach(function (part) {
      const token = part.trim();
      if (!token) throw new Error(t.invalidRange);
      const match = token.match(/^(\d+)(?:-(\d+))?$/);
      if (!match) throw new Error(t.invalidRange);
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : start;
      if (start < 1 || end < start || end > pageCount) throw new Error(t.invalidRange);
      for (let page = start; page <= end; page += 1) {
        pages.push(page - 1);
      }
    });
    return pages;
  }

  function renderLanguage() {
    const t = text();
    document.documentElement.lang = state.lang;
    els.brand.textContent = t.brand;
    els.home.textContent = t.home;
    els.toggle.textContent = t.toggle;
    els.eyebrow.textContent = t.eyebrow;
    els.title.textContent = t.title;
    els.summary.textContent = t.summary;
    els.mergeTab.textContent = t.mergeTab;
    els.splitTab.textContent = t.splitTab;
    els.mergeTitle.textContent = t.mergeTitle;
    els.splitTitle.textContent = t.splitTitle;
    els.mergeBadge.textContent = t.mergeBadge;
    els.splitBadge.textContent = t.splitBadge;
    els.mergeDropText.textContent = t.mergeDropText;
    els.splitDropText.textContent = t.splitDropText;
    els.rangeLabel.textContent = t.rangeLabel;
    els.pageRanges.placeholder = t.rangePlaceholder;
    els.mergeButton.textContent = t.mergeButton;
    els.extractButton.textContent = t.extractButton;
    els.splitPagesButton.textContent = t.splitPagesButton;
    els.mergeClearButton.textContent = t.clear;
    els.splitClearButton.textContent = t.clear;
    renderMergeFiles();
    renderSplitFile();
  }

  function setMode(mode) {
    state.mode = mode === 'split' ? 'split' : 'merge';
    els.mergeTab.classList.toggle('is-active', state.mode === 'merge');
    els.splitTab.classList.toggle('is-active', state.mode === 'split');
    els.mergePanel.classList.toggle('is-active', state.mode === 'merge');
    els.splitPanel.classList.toggle('is-active', state.mode === 'split');
  }

  async function mergeFiles() {
    const t = text();
    if (state.mergeFiles.length < 2) {
      setStatus(t.noFiles, 'error');
      return;
    }
    setBusy(true);
    setStatus(t.loading);
    try {
      const PDFDocument = getPDFLib().PDFDocument;
      const merged = await PDFDocument.create();
      for (const file of state.mergeFiles) {
        const source = await loadPDF(file);
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach(function (page) {
          merged.addPage(page);
        });
      }
      const bytes = await merged.save();
      downloadBytes(bytes, t.mergedName);
      setStatus(t.merged, 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function extractRange() {
    const t = text();
    if (!state.splitFile) {
      setStatus(t.noSplitFile, 'error');
      return;
    }
    setBusy(true);
    setStatus(t.loading);
    try {
      const PDFDocument = getPDFLib().PDFDocument;
      const source = await loadPDF(state.splitFile);
      const pages = parseRanges(els.pageRanges.value, source.getPageCount());
      const output = await PDFDocument.create();
      const copiedPages = await output.copyPages(source, pages);
      copiedPages.forEach(function (page) {
        output.addPage(page);
      });
      const bytes = await output.save();
      const filename = baseName(state.splitFile) + '-' + t.extractedName;
      downloadBytes(bytes, filename);
      setStatus(t.extracted, 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function splitEachPage() {
    const t = text();
    if (!state.splitFile) {
      setStatus(t.noSplitFile, 'error');
      return;
    }
    setBusy(true);
    setStatus(t.loading);
    try {
      const PDFDocument = getPDFLib().PDFDocument;
      const source = await loadPDF(state.splitFile);
      const outputs = [];
      for (let index = 0; index < source.getPageCount(); index += 1) {
        const output = await PDFDocument.create();
        const pages = await output.copyPages(source, [index]);
        output.addPage(pages[0]);
        outputs.push({
          name: baseName(state.splitFile) + '-page-' + String(index + 1).padStart(3, '0') + '.pdf',
          bytes: await output.save()
        });
      }
      renderOutputs(outputs);
      setStatus(t.splitDone, 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  function bindEvents() {
    els.toggle.addEventListener('click', function () {
      state.lang = state.lang === 'zh' ? 'en' : 'zh';
      localStorage.setItem(LANG_KEY, state.lang);
      renderLanguage();
    });

    document.querySelectorAll('[data-mode]').forEach(function (button) {
      button.addEventListener('click', function () {
        setMode(button.dataset.mode);
      });
    });

    els.mergeInput.addEventListener('change', function () {
      state.mergeFiles = state.mergeFiles.concat(Array.from(els.mergeInput.files || []));
      els.mergeInput.value = '';
      renderMergeFiles();
      setStatus('');
    });

    els.mergeFileList.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const index = Number(button.dataset.index);
      const action = button.dataset.action;
      if (action === 'remove') {
        state.mergeFiles.splice(index, 1);
      } else if (action === 'up' && index > 0) {
        [state.mergeFiles[index - 1], state.mergeFiles[index]] = [state.mergeFiles[index], state.mergeFiles[index - 1]];
      } else if (action === 'down' && index < state.mergeFiles.length - 1) {
        [state.mergeFiles[index + 1], state.mergeFiles[index]] = [state.mergeFiles[index], state.mergeFiles[index + 1]];
      }
      renderMergeFiles();
    });

    els.splitInput.addEventListener('change', async function () {
      state.splitFile = (els.splitInput.files || [])[0] || null;
      state.splitPageCount = 0;
      clearOutputUrls();
      els.splitOutputList.innerHTML = '';
      if (state.splitFile) {
        try {
          const doc = await loadPDF(state.splitFile);
          state.splitPageCount = doc.getPageCount();
        } catch (error) {
          setStatus(error.message, 'error');
        }
      }
      renderSplitFile();
    });

    els.mergeButton.addEventListener('click', mergeFiles);
    els.extractButton.addEventListener('click', extractRange);
    els.splitPagesButton.addEventListener('click', splitEachPage);

    els.mergeClearButton.addEventListener('click', function () {
      state.mergeFiles = [];
      renderMergeFiles();
      setStatus('');
    });

    els.splitClearButton.addEventListener('click', function () {
      state.splitFile = null;
      state.splitPageCount = 0;
      els.splitInput.value = '';
      els.pageRanges.value = '';
      clearOutputUrls();
      els.splitOutputList.innerHTML = '';
      renderSplitFile();
      setStatus('');
    });
  }

  state.lang = resolveInitialLang();
  renderLanguage();
  bindEvents();
  setMode('merge');
})();
