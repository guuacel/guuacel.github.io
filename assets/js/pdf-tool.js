(function () {
  'use strict';

  const LANG_KEY = 'guuacel-homepage-language';
  const LEGACY_LANG_KEY = 'homepageLang';
  const supported = ['zh', 'en'];
  const pdfWorkerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  const state = {
    lang: 'zh',
    mode: 'merge',
    mergeFiles: [],
    splitFile: null,
    splitPageCount: 0,
    wordFile: null,
    pdfWordFile: null,
    outputUrls: []
  };

  const labels = {
    zh: {
      brand: '文档工具',
      home: '返回主页',
      toggle: 'English',
      eyebrow: 'Browser Document Tool',
      title: '文档转换与 PDF 处理',
      summary: '本地处理文件，支持 PDF 合并、拆分、Word 转 PDF 和 PDF 转 Word。',
      mergeTab: 'PDF 合并',
      splitTab: 'PDF 拆分',
      wordToPdfTab: 'Word 转 PDF',
      pdfToWordTab: 'PDF 转 Word',
      mergeTitle: '合并 PDF',
      splitTitle: '拆分 PDF',
      wordToPdfTitle: 'Word 转 PDF',
      pdfToWordTitle: 'PDF 转 Word',
      mergeBadge: '多文件',
      splitBadge: '单文件',
      wordToPdfBadge: 'DOCX',
      pdfToWordBadge: 'DOCX',
      mergeDropText: '选择 PDF 文件',
      splitDropText: '选择 PDF 文件',
      wordDropText: '选择 Word 文件（.docx）',
      pdfWordDropText: '选择 PDF 文件',
      wordToPdfNote: '浏览器端转换会提取 Word 文本并生成 PDF，复杂排版和图片不会完全保留。',
      pdfToWordNote: 'PDF 转 Word 会提取文本生成 .docx，扫描件或复杂版式可能无法完整还原。',
      rangeLabel: '页码范围',
      rangePlaceholder: '1,3-5,8',
      mergeButton: '合并并下载',
      extractButton: '提取范围',
      splitPagesButton: '拆成单页',
      wordToPdfButton: '转换并下载 PDF',
      pdfToWordButton: '转换并下载 Word',
      clear: '清空',
      remove: '删除',
      up: '上移',
      down: '下移',
      pages: '页',
      noFiles: '至少选择 2 个 PDF 文件。',
      noSplitFile: '请先选择 1 个 PDF 文件。',
      noWordFile: '请先选择 1 个 .docx 文件。',
      noPdfWordFile: '请先选择 1 个 PDF 文件。',
      emptyRange: '请输入页码范围。',
      invalidRange: '页码范围无效。',
      loading: '正在处理...',
      merged: '已生成合并文件。',
      extracted: '已生成范围提取文件。',
      splitDone: '已生成单页 PDF。',
      wordPdfDone: '已生成 PDF 文件。',
      pdfWordDone: '已生成 Word 文件。',
      encrypted: '无法处理加密或受保护的 PDF。',
      pdfLibMissing: 'PDF 处理库加载失败，请刷新页面后重试。',
      mammothMissing: 'Word 解析库加载失败，请刷新页面后重试。',
      pdfjsMissing: 'PDF 文本提取库加载失败，请刷新页面后重试。',
      docxMissing: 'Word 生成库加载失败，请刷新页面后重试。',
      emptyDocument: '未提取到可转换的文本内容。',
      outputTitle: '输出文件',
      download: '下载',
      mergedName: 'merged.pdf',
      extractedName: 'extracted-pages.pdf'
    },
    en: {
      brand: 'Document Tool',
      home: 'Back Home',
      toggle: '中文',
      eyebrow: 'Browser Document Tool',
      title: 'Document Conversion and PDF Processing',
      summary: 'Process files locally with PDF merge, PDF split, Word to PDF, and PDF to Word.',
      mergeTab: 'Merge PDF',
      splitTab: 'Split PDF',
      wordToPdfTab: 'Word to PDF',
      pdfToWordTab: 'PDF to Word',
      mergeTitle: 'Merge PDFs',
      splitTitle: 'Split PDF',
      wordToPdfTitle: 'Word to PDF',
      pdfToWordTitle: 'PDF to Word',
      mergeBadge: 'Multiple files',
      splitBadge: 'Single file',
      wordToPdfBadge: 'DOCX',
      pdfToWordBadge: 'DOCX',
      mergeDropText: 'Choose PDF files',
      splitDropText: 'Choose a PDF file',
      wordDropText: 'Choose a Word file (.docx)',
      pdfWordDropText: 'Choose a PDF file',
      wordToPdfNote: 'Browser conversion extracts Word text and generates a PDF; complex layout and images are not fully preserved.',
      pdfToWordNote: 'PDF to Word extracts text into a .docx file; scans and complex layouts may not be fully restored.',
      rangeLabel: 'Page ranges',
      rangePlaceholder: '1,3-5,8',
      mergeButton: 'Merge and Download',
      extractButton: 'Extract Range',
      splitPagesButton: 'Split Pages',
      wordToPdfButton: 'Convert and Download PDF',
      pdfToWordButton: 'Convert and Download Word',
      clear: 'Clear',
      remove: 'Remove',
      up: 'Up',
      down: 'Down',
      pages: 'pages',
      noFiles: 'Choose at least 2 PDF files.',
      noSplitFile: 'Choose 1 PDF file first.',
      noWordFile: 'Choose 1 .docx file first.',
      noPdfWordFile: 'Choose 1 PDF file first.',
      emptyRange: 'Enter page ranges.',
      invalidRange: 'Invalid page range.',
      loading: 'Processing...',
      merged: 'Merged file generated.',
      extracted: 'Extracted PDF generated.',
      splitDone: 'Single-page PDFs generated.',
      wordPdfDone: 'PDF file generated.',
      pdfWordDone: 'Word file generated.',
      encrypted: 'Encrypted or protected PDFs cannot be processed.',
      pdfLibMissing: 'PDF library failed to load. Refresh and try again.',
      mammothMissing: 'Word parser failed to load. Refresh and try again.',
      pdfjsMissing: 'PDF text extraction library failed to load. Refresh and try again.',
      docxMissing: 'Word generator failed to load. Refresh and try again.',
      emptyDocument: 'No convertible text content was extracted.',
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
    wordToPdfTab: document.getElementById('wordToPdfTab'),
    pdfToWordTab: document.getElementById('pdfToWordTab'),
    mergePanel: document.getElementById('mergePanel'),
    splitPanel: document.getElementById('splitPanel'),
    wordToPdfPanel: document.getElementById('wordToPdfPanel'),
    pdfToWordPanel: document.getElementById('pdfToWordPanel'),
    mergeTitle: document.getElementById('mergeTitle'),
    splitTitle: document.getElementById('splitTitle'),
    wordToPdfTitle: document.getElementById('wordToPdfTitle'),
    pdfToWordTitle: document.getElementById('pdfToWordTitle'),
    mergeBadge: document.getElementById('mergeBadge'),
    splitBadge: document.getElementById('splitBadge'),
    wordToPdfBadge: document.getElementById('wordToPdfBadge'),
    pdfToWordBadge: document.getElementById('pdfToWordBadge'),
    mergeInput: document.getElementById('mergeInput'),
    splitInput: document.getElementById('splitInput'),
    wordInput: document.getElementById('wordInput'),
    pdfWordInput: document.getElementById('pdfWordInput'),
    mergeDropText: document.getElementById('mergeDropText'),
    splitDropText: document.getElementById('splitDropText'),
    wordDropText: document.getElementById('wordDropText'),
    pdfWordDropText: document.getElementById('pdfWordDropText'),
    mergeFileList: document.getElementById('mergeFileList'),
    splitFileInfo: document.getElementById('splitFileInfo'),
    wordFileInfo: document.getElementById('wordFileInfo'),
    pdfWordFileInfo: document.getElementById('pdfWordFileInfo'),
    wordToPdfNote: document.getElementById('wordToPdfNote'),
    pdfToWordNote: document.getElementById('pdfToWordNote'),
    rangeLabel: document.getElementById('rangeLabel'),
    pageRanges: document.getElementById('pageRanges'),
    mergeButton: document.getElementById('mergeButton'),
    extractButton: document.getElementById('extractButton'),
    splitPagesButton: document.getElementById('splitPagesButton'),
    wordToPdfButton: document.getElementById('wordToPdfButton'),
    pdfToWordButton: document.getElementById('pdfToWordButton'),
    mergeClearButton: document.getElementById('mergeClearButton'),
    splitClearButton: document.getElementById('splitClearButton'),
    wordClearButton: document.getElementById('wordClearButton'),
    pdfWordClearButton: document.getElementById('pdfWordClearButton'),
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
    return String(file && file.name ? file.name : 'document')
      .replace(/\.(pdf|docx)$/i, '')
      .replace(/[\\/:*?"<>|]+/g, '-');
  }

  function setStatus(message, type) {
    els.status.textContent = message || '';
    els.status.dataset.type = type || '';
  }

  function setBusy(isBusy) {
    [
      els.mergeButton,
      els.extractButton,
      els.splitPagesButton,
      els.wordToPdfButton,
      els.pdfToWordButton
    ].forEach(function (button) {
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
    if (!window.PDFLib || !window.PDFLib.PDFDocument) throw new Error(text().pdfLibMissing);
    return window.PDFLib;
  }

  function getMammoth() {
    if (!window.mammoth || !window.mammoth.extractRawText) throw new Error(text().mammothMissing);
    return window.mammoth;
  }

  function getPdfJs() {
    if (!window.pdfjsLib || !window.pdfjsLib.getDocument) throw new Error(text().pdfjsMissing);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    return window.pdfjsLib;
  }

  function getDocx() {
    if (!window.docx || !window.docx.Document || !window.docx.Packer) throw new Error(text().docxMissing);
    return window.docx;
  }

  async function loadPDF(file) {
    try {
      const buffer = await file.arrayBuffer();
      return await getPDFLib().PDFDocument.load(buffer);
    } catch (error) {
      throw new Error(text().encrypted);
    }
  }

  function downloadBlob(blob, filename) {
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

  function downloadBytes(bytes, filename, type) {
    downloadBlob(new Blob([bytes], { type: type || 'application/pdf' }), filename);
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

  function renderFileInfo(target, file, extraText) {
    if (!file) {
      target.innerHTML = '';
      return;
    }
    const detail = [formatBytes(file.size), extraText].filter(Boolean).join(' · ');
    target.innerHTML = `
      <strong>${escapeHTML(file.name)}</strong>
      <span>${escapeHTML(detail)}</span>
    `;
  }

  function renderAllFileInfo() {
    const t = text();
    const pageText = state.splitPageCount ? state.splitPageCount + ' ' + t.pages : '';
    renderSplitFile();
    renderFileInfo(els.wordFileInfo, state.wordFile, '');
    renderFileInfo(els.pdfWordFileInfo, state.pdfWordFile, '');

    function renderSplitFile() {
      renderFileInfo(els.splitFileInfo, state.splitFile, pageText);
    }
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
      ${outputs.map(function (output) {
        const blob = new Blob([output.bytes], { type: output.type || 'application/pdf' });
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
      for (let page = start; page <= end; page += 1) pages.push(page - 1);
    });
    return pages;
  }

  function wrapText(ctx, textValue, maxWidth) {
    const lines = [];
    const paragraphs = String(textValue || '').replace(/\r/g, '').split('\n');
    paragraphs.forEach(function (paragraph) {
      const textLine = paragraph.trim();
      if (!textLine) {
        lines.push('');
        return;
      }
      const hasSpaces = /\s/.test(textLine);
      const tokens = hasSpaces ? textLine.split(/\s+/) : Array.from(textLine);
      let current = '';
      tokens.forEach(function (token) {
        const separator = hasSpaces && current ? ' ' : '';
        const candidate = current + separator + token;
        if (ctx.measureText(candidate).width <= maxWidth) {
          current = candidate;
          return;
        }
        if (current) lines.push(current);
        if (ctx.measureText(token).width <= maxWidth) {
          current = token;
          return;
        }
        let segment = '';
        Array.from(token).forEach(function (char) {
          const next = segment + char;
          if (ctx.measureText(next).width > maxWidth && segment) {
            lines.push(segment);
            segment = char;
          } else {
            segment = next;
          }
        });
        current = segment;
      });
      if (current) lines.push(current);
    });
    return lines;
  }

  async function textToPdfBytes(rawText) {
    const t = text();
    const content = String(rawText || '').trim();
    if (!content) throw new Error(t.emptyDocument);

    const PDFDocument = getPDFLib().PDFDocument;
    const pdf = await PDFDocument.create();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const pixelRatio = 2;
    const pageWidth = 794;
    const pageHeight = 1123;
    const margin = 72;
    const fontSize = 18;
    const lineHeight = 30;
    const maxWidth = pageWidth - margin * 2;
    const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight);

    canvas.width = pageWidth * pixelRatio;
    canvas.height = pageHeight * pixelRatio;
    canvas.style.width = pageWidth + 'px';
    canvas.style.height = pageHeight + 'px';
    ctx.scale(pixelRatio, pixelRatio);
    ctx.font = `${fontSize}px "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif`;

    const lines = wrapText(ctx, content, maxWidth);
    for (let start = 0; start < lines.length; start += maxLines) {
      ctx.clearRect(0, 0, pageWidth, pageHeight);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageWidth, pageHeight);
      ctx.fillStyle = '#1f2937';
      ctx.font = `${fontSize}px "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif`;
      lines.slice(start, start + maxLines).forEach(function (line, index) {
        ctx.fillText(line, margin, margin + index * lineHeight);
      });
      const dataUrl = canvas.toDataURL('image/png');
      const pngBytes = await fetch(dataUrl).then(function (response) {
        return response.arrayBuffer();
      });
      const png = await pdf.embedPng(pngBytes);
      const page = pdf.addPage([595.28, 841.89]);
      page.drawImage(png, { x: 0, y: 0, width: 595.28, height: 841.89 });
    }
    return await pdf.save();
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
    els.wordToPdfTab.textContent = t.wordToPdfTab;
    els.pdfToWordTab.textContent = t.pdfToWordTab;
    els.mergeTitle.textContent = t.mergeTitle;
    els.splitTitle.textContent = t.splitTitle;
    els.wordToPdfTitle.textContent = t.wordToPdfTitle;
    els.pdfToWordTitle.textContent = t.pdfToWordTitle;
    els.mergeBadge.textContent = t.mergeBadge;
    els.splitBadge.textContent = t.splitBadge;
    els.wordToPdfBadge.textContent = t.wordToPdfBadge;
    els.pdfToWordBadge.textContent = t.pdfToWordBadge;
    els.mergeDropText.textContent = t.mergeDropText;
    els.splitDropText.textContent = t.splitDropText;
    els.wordDropText.textContent = t.wordDropText;
    els.pdfWordDropText.textContent = t.pdfWordDropText;
    els.wordToPdfNote.textContent = t.wordToPdfNote;
    els.pdfToWordNote.textContent = t.pdfToWordNote;
    els.rangeLabel.textContent = t.rangeLabel;
    els.pageRanges.placeholder = t.rangePlaceholder;
    els.mergeButton.textContent = t.mergeButton;
    els.extractButton.textContent = t.extractButton;
    els.splitPagesButton.textContent = t.splitPagesButton;
    els.wordToPdfButton.textContent = t.wordToPdfButton;
    els.pdfToWordButton.textContent = t.pdfToWordButton;
    els.mergeClearButton.textContent = t.clear;
    els.splitClearButton.textContent = t.clear;
    els.wordClearButton.textContent = t.clear;
    els.pdfWordClearButton.textContent = t.clear;
    renderMergeFiles();
    renderAllFileInfo();
  }

  function setMode(mode) {
    state.mode = ['merge', 'split', 'wordToPdf', 'pdfToWord'].includes(mode) ? mode : 'merge';
    [
      ['merge', els.mergeTab, els.mergePanel],
      ['split', els.splitTab, els.splitPanel],
      ['wordToPdf', els.wordToPdfTab, els.wordToPdfPanel],
      ['pdfToWord', els.pdfToWordTab, els.pdfToWordPanel]
    ].forEach(function (entry) {
      const isActive = state.mode === entry[0];
      entry[1].classList.toggle('is-active', isActive);
      entry[2].classList.toggle('is-active', isActive);
    });
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
      downloadBytes(bytes, t.mergedName, 'application/pdf');
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
      downloadBytes(bytes, baseName(state.splitFile) + '-' + t.extractedName, 'application/pdf');
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
          bytes: await output.save(),
          type: 'application/pdf'
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

  async function convertWordToPdf() {
    const t = text();
    if (!state.wordFile) {
      setStatus(t.noWordFile, 'error');
      return;
    }
    setBusy(true);
    setStatus(t.loading);
    try {
      const buffer = await state.wordFile.arrayBuffer();
      const result = await getMammoth().extractRawText({ arrayBuffer: buffer });
      const bytes = await textToPdfBytes(result.value);
      downloadBytes(bytes, baseName(state.wordFile) + '.pdf', 'application/pdf');
      setStatus(t.wordPdfDone, 'success');
    } catch (error) {
      setStatus(error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function convertPdfToWord() {
    const t = text();
    if (!state.pdfWordFile) {
      setStatus(t.noPdfWordFile, 'error');
      return;
    }
    setBusy(true);
    setStatus(t.loading);
    try {
      const pdfjs = getPdfJs();
      const buffer = await state.pdfWordFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const paragraphs = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const textItems = content.items.map(function (item) {
          return item.str || '';
        }).filter(Boolean);
        paragraphs.push(textItems.join(' ').trim());
      }
      const fullText = paragraphs.join('\n').trim();
      if (!fullText) throw new Error(t.emptyDocument);
      const docxLib = getDocx();
      const children = paragraphs.map(function (paragraph, index) {
        const textValue = paragraph || ' ';
        const runs = [new docxLib.TextRun(textValue)];
        return new docxLib.Paragraph({
          children: runs,
          spacing: { after: index === paragraphs.length - 1 ? 0 : 240 }
        });
      });
      const doc = new docxLib.Document({
        sections: [{ properties: {}, children }]
      });
      const blob = await docxLib.Packer.toBlob(doc);
      downloadBlob(blob, baseName(state.pdfWordFile) + '.docx');
      setStatus(t.pdfWordDone, 'success');
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
      if (action === 'remove') state.mergeFiles.splice(index, 1);
      if (action === 'up' && index > 0) {
        [state.mergeFiles[index - 1], state.mergeFiles[index]] = [state.mergeFiles[index], state.mergeFiles[index - 1]];
      }
      if (action === 'down' && index < state.mergeFiles.length - 1) {
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
      renderAllFileInfo();
    });

    els.wordInput.addEventListener('change', function () {
      state.wordFile = (els.wordInput.files || [])[0] || null;
      renderAllFileInfo();
      setStatus('');
    });

    els.pdfWordInput.addEventListener('change', function () {
      state.pdfWordFile = (els.pdfWordInput.files || [])[0] || null;
      renderAllFileInfo();
      setStatus('');
    });

    els.mergeButton.addEventListener('click', mergeFiles);
    els.extractButton.addEventListener('click', extractRange);
    els.splitPagesButton.addEventListener('click', splitEachPage);
    els.wordToPdfButton.addEventListener('click', convertWordToPdf);
    els.pdfToWordButton.addEventListener('click', convertPdfToWord);

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
      renderAllFileInfo();
      setStatus('');
    });

    els.wordClearButton.addEventListener('click', function () {
      state.wordFile = null;
      els.wordInput.value = '';
      renderAllFileInfo();
      setStatus('');
    });

    els.pdfWordClearButton.addEventListener('click', function () {
      state.pdfWordFile = null;
      els.pdfWordInput.value = '';
      renderAllFileInfo();
      setStatus('');
    });
  }

  state.lang = resolveInitialLang();
  renderLanguage();
  bindEvents();
  setMode('merge');
})();
