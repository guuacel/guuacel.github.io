const state = {
  zhItems: [],
  enItems: [],
  currentId: '',
  originalId: ''
};

const form = document.getElementById('implementationForm');
const listEl = document.getElementById('implementationList');
const algorithmsEl = document.getElementById('algorithms');
const template = document.getElementById('algorithmTemplate');
const toastEl = document.getElementById('toast');
const gitStatusEl = document.getElementById('gitStatus');

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  window.setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function byId(items, id) {
  return items.find((item) => item.id === id);
}

function setField(name, value) {
  const el = form.elements[name];
  if (el) el.value = value == null ? '' : value;
}

function getField(name) {
  const el = form.elements[name];
  return el ? el.value.trim() : '';
}

function addAlgorithm(algorithm = {}) {
  const node = template.content.firstElementChild.cloneNode(true);
  algorithmsEl.appendChild(node);

  const set = (field, value) => {
    const el = node.querySelector(`[data-field="${field}"]`);
    if (el) el.value = value == null ? '' : value;
  };

  set('id', algorithm.id || '');
  set('codeTitle', algorithm.codeTitle || '');
  set('zhTitle', algorithm.zhTitle || algorithm.title || '');
  set('enTitle', algorithm.enTitle || algorithm.title || '');
  set('zhReadmeTitle', algorithm.zhReadmeTitle || algorithm.readmeTitle || '');
  set('enReadmeTitle', algorithm.enReadmeTitle || algorithm.readmeTitle || '');
  set('zhStepsText', algorithm.zhStepsText || '');
  set('enStepsText', algorithm.enStepsText || '');
  set('readmeFileName', algorithm.readmeFileName || '');
  set('codeFileName', algorithm.codeFileName || algorithm.codeTitle || '');
  set('readme', algorithm.readme || '');
  set('codeContent', algorithm.codeContent || '');

  node.querySelector('.removeAlgorithm').addEventListener('click', () => {
    if (algorithmsEl.children.length <= 1) {
      showToast('至少保留一个算法。');
      return;
    }
    node.remove();
  });

  bindFileInput(node, 'readmeFile', 'readme', 'readmeFileName');
  bindFileInput(node, 'codeFile', 'codeContent', 'codeFileName');
}

function bindFileInput(node, fileField, contentField, nameField) {
  const fileInput = node.querySelector(`[data-field="${fileField}"]`);
  const content = node.querySelector(`[data-field="${contentField}"]`);
  const fileName = node.querySelector(`[data-field="${nameField}"]`);
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    content.value = await file.text();
    if (!fileName.value) fileName.value = file.name;
  });
}

function collectAlgorithms() {
  return Array.from(algorithmsEl.querySelectorAll('.algorithm')).map((node) => {
    const get = (field) => node.querySelector(`[data-field="${field}"]`)?.value.trim() || '';
    return {
      id: get('id'),
      codeTitle: get('codeTitle'),
      codeFileName: get('codeFileName'),
      readmeFileName: get('readmeFileName'),
      codeLanguage: 'python',
      readme: get('readme'),
      codeContent: node.querySelector('[data-field="codeContent"]')?.value || '',
      zh: {
        title: get('zhTitle'),
        readmeTitle: get('zhReadmeTitle'),
        stepsText: node.querySelector('[data-field="zhStepsText"]')?.value || ''
      },
      en: {
        title: get('enTitle'),
        readmeTitle: get('enReadmeTitle'),
        stepsText: node.querySelector('[data-field="enStepsText"]')?.value || ''
      }
    };
  });
}

function renderList() {
  listEl.innerHTML = '';
  state.zhItems.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'implementation-item' + (item.id === state.currentId ? ' is-active' : '');
    button.innerHTML = `<strong>${escapeHtml(item.title || item.id)}</strong><span>${escapeHtml(item.id)}</span>`;
    button.addEventListener('click', () => loadItem(item.id));
    listEl.appendChild(button);
  });
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function clearForm() {
  state.currentId = '';
  state.originalId = '';
  form.reset();
  algorithmsEl.innerHTML = '';
  addAlgorithm({
    id: 'basic-algorithm',
    zhTitle: '基础算法',
    enTitle: 'Basic Algorithm',
    codeFileName: 'basic_algorithm.py',
    readmeFileName: 'README_basic_algorithm.md'
  });
  renderList();
}

function loadItem(id) {
  const zh = byId(state.zhItems, id);
  const en = byId(state.enItems, id) || zh;
  if (!zh) return;

  state.currentId = id;
  state.originalId = id;
  setField('id', id);
  setField('codeFolder', id);
  setField('authors', zh.authors || en.authors || '');
  setField('venue', zh.venue || en.venue || '');
  setField('year', zh.year || en.year || '');
  setField('doi', zh.doi || en.doi || '');
  setField('volume', zh.volume || en.volume || '');
  setField('pages', zh.pages || en.pages || '');
  setField('zhTitle', zh.title || '');
  setField('enTitle', en.title || '');
  setField('zhAbstract', zh.abstract || '');
  setField('enAbstract', en.abstract || '');

  algorithmsEl.innerHTML = '';
  const zhAlgorithms = Array.isArray(zh.algorithms) ? zh.algorithms : [];
  const enAlgorithms = Array.isArray(en.algorithms) ? en.algorithms : [];
  zhAlgorithms.forEach((algorithm, index) => {
    const enAlgorithm = enAlgorithms[index] || algorithm;
    addAlgorithm({
      id: algorithm.id,
      codeTitle: algorithm.codeTitle,
      zhTitle: algorithm.title,
      enTitle: enAlgorithm.title,
      zhReadmeTitle: algorithm.readmeTitle,
      enReadmeTitle: enAlgorithm.readmeTitle,
      zhStepsText: (algorithm.steps || []).join('\n'),
      enStepsText: (enAlgorithm.steps || []).join('\n'),
      readme: algorithm.readme || enAlgorithm.readme || '',
      codeContent: algorithm.code && algorithm.code.content ? algorithm.code.content : '',
      codeFileName: algorithm.codeTitle || `${algorithm.id}.py`,
      readmeFileName: algorithm.readmeTitle && algorithm.readmeTitle.endsWith('.md') ? algorithm.readmeTitle : `README_${algorithm.id}.md`
    });
  });
  if (!zhAlgorithms.length) addAlgorithm();
  renderList();
}

function buildPayload() {
  const id = getField('id');
  return {
    originalId: state.originalId || id,
    id,
    codeFolder: getField('codeFolder') || id,
    writeFiles: form.elements.writeFiles.checked,
    meta: {
      authors: getField('authors'),
      venue: getField('venue'),
      year: getField('year'),
      doi: getField('doi'),
      volume: getField('volume'),
      pages: getField('pages')
    },
    zh: {
      title: getField('zhTitle'),
      abstract: form.elements.zhAbstract.value
    },
    en: {
      title: getField('enTitle'),
      abstract: form.elements.enAbstract.value
    },
    algorithms: collectAlgorithms()
  };
}

async function loadAll() {
  const data = await api('/api/implementations');
  state.zhItems = data.zh || [];
  state.enItems = data.en || [];
  renderList();
  if (state.currentId && byId(state.zhItems, state.currentId)) {
    loadItem(state.currentId);
  } else if (state.zhItems.length) {
    loadItem(state.zhItems[0].id);
  } else {
    clearForm();
  }
  await refreshGitStatus();
}

async function refreshGitStatus() {
  const data = await api('/api/git/status');
  gitStatusEl.textContent = data.status || '工作区干净';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = buildPayload();
  await api('/api/implementations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  state.currentId = payload.id;
  state.originalId = payload.id;
  showToast('已保存到本地仓库。');
  await loadAll();
});

document.getElementById('newBtn').addEventListener('click', clearForm);
document.getElementById('reloadBtn').addEventListener('click', loadAll);
document.getElementById('addAlgorithmBtn').addEventListener('click', () => addAlgorithm());

document.getElementById('deleteBtn').addEventListener('click', async () => {
  const id = getField('id');
  if (!id) return;
  const deleteCode = window.confirm(`删除 ${id} 的同时删除 code 目录吗？\n选择“确定”会删除代码目录，选择“取消”只删除主页条目。`);
  const confirmed = window.confirm(`确认删除论文实现 ${id}？`);
  if (!confirmed) return;
  const codeFolder = getField('codeFolder') || id;
  await api(`/api/implementations/${encodeURIComponent(id)}?deleteCode=${deleteCode ? 'true' : 'false'}&codeFolder=${encodeURIComponent(codeFolder)}`, {
    method: 'DELETE'
  });
  showToast('已删除。');
  await loadAll();
});

document.getElementById('publishBtn').addEventListener('click', async () => {
  const message = window.prompt('提交信息', 'Update homepage content');
  if (!message) return;
  const result = await api('/api/publish', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  showToast(result.skipped ? result.message : '已提交并推送到 GitHub。');
  await refreshGitStatus();
});

loadAll().catch((error) => {
  console.error(error);
  showToast(error.message);
});
