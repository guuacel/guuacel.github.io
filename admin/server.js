const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PROFILE_PATH = path.join(ROOT, 'assets', 'data', 'profile.json');
const CODE_DIR = path.join(ROOT, 'code');
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 8787);
const BODY_LIMIT = 50 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

function send(res, status, payload, type = 'application/json; charset=utf-8') {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendError(res, status, message) {
  send(res, status, { error: message });
}

function readProfile() {
  return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
}

function writeProfile(profile) {
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2) + '\n', 'utf8');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(new Error('Request body is too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(text ? JSON.parse(text) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

function assertId(value, label) {
  const text = String(value || '').trim();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(text)) {
    throw new Error(`${label} must use lowercase letters, numbers, and hyphens.`);
  }
  return text;
}

function safeFileName(value, fallback) {
  const name = String(value || fallback || '').trim();
  if (!/^[\w.-]+$/.test(name) || name === '.' || name === '..') {
    throw new Error(`Unsafe file name: ${name}`);
  }
  return name;
}

function safeCodeFolder(value) {
  const folder = assertId(value, 'Code folder');
  const target = path.resolve(CODE_DIR, folder);
  if (!target.startsWith(path.resolve(CODE_DIR) + path.sep)) {
    throw new Error('Unsafe code folder path.');
  }
  return { folder, target };
}

function splitSteps(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function upsert(items, item, originalId) {
  const oldId = originalId || item.id;
  const index = items.findIndex((entry) => entry.id === oldId || entry.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }
}

function getImplementationItems(profile) {
  return {
    zh: profile.zh.implementations.items || [],
    en: profile.en.implementations.items || []
  };
}

function buildLanguageItem(payload, lang) {
  const meta = payload.meta || {};
  const langData = payload[lang] || {};
  const algorithms = (payload.algorithms || []).map((algorithm, index) => {
    const langAlgorithm = algorithm[lang] || {};
    const codeContent = algorithm.codeContent || '';
    const readme = algorithm.readme || '';
    const fallbackId = `algorithm-${index + 1}`;
    return {
      id: assertId(algorithm.id || fallbackId, 'Algorithm id'),
      title: langAlgorithm.title || algorithm.id || fallbackId,
      readmeTitle: langAlgorithm.readmeTitle || langAlgorithm.title || 'README',
      codeTitle: algorithm.codeTitle || algorithm.codeFileName || 'code.py',
      readme,
      steps: splitSteps(langAlgorithm.stepsText),
      code: {
        language: algorithm.codeLanguage || 'python',
        content: codeContent
      }
    };
  });

  const firstCode = algorithms[0] && algorithms[0].code
    ? algorithms[0].code
    : { language: 'text', content: '' };

  return {
    id: payload.id,
    title: langData.title || payload.id,
    authors: meta.authors || '',
    venue: meta.venue || '',
    year: meta.year ? Number(meta.year) : '',
    volume: meta.volume || '',
    pages: meta.pages || '',
    doi: meta.doi || '',
    code: firstCode,
    abstract: langData.abstract || '',
    algorithmSections: algorithms.map((algorithm) => ({
      title: algorithm.title,
      steps: algorithm.steps
    })),
    algorithms
  };
}

function generateFolderReadme(payload) {
  const title = payload.en && payload.en.title ? payload.en.title : payload.id;
  const algorithms = payload.algorithms || [];
  const lines = [
    `# ${title}`,
    '',
    'This folder stores files managed by the local homepage admin tool.',
    '',
    '## Files',
    ''
  ];

  algorithms.forEach((algorithm) => {
    if (algorithm.codeFileName) lines.push(`- \`${algorithm.codeFileName}\`: ${algorithm.codeTitle || algorithm.id}.`);
    if (algorithm.readmeFileName) lines.push(`- \`${algorithm.readmeFileName}\`: README notes for ${algorithm.id}.`);
  });

  return lines.join('\n') + '\n';
}

function writeImplementationFiles(payload) {
  if (!payload.writeFiles) return;
  const { target } = safeCodeFolder(payload.codeFolder || payload.id);
  fs.mkdirSync(target, { recursive: true });

  (payload.algorithms || []).forEach((algorithm) => {
    if (algorithm.codeContent) {
      const codeName = safeFileName(algorithm.codeFileName, `${algorithm.id || 'algorithm'}.py`);
      fs.writeFileSync(path.join(target, codeName), algorithm.codeContent, 'utf8');
    }
    if (algorithm.readme) {
      const readmeName = safeFileName(algorithm.readmeFileName, `README_${algorithm.id || 'algorithm'}.md`);
      fs.writeFileSync(path.join(target, readmeName), algorithm.readme, 'utf8');
    }
  });

  fs.writeFileSync(path.join(target, 'README.md'), generateFolderReadme(payload), 'utf8');
}

function removeCodeFolder(folder) {
  const safe = safeCodeFolder(folder);
  if (fs.existsSync(safe.target)) {
    fs.rmSync(safe.target, { recursive: true, force: true });
  }
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: ROOT, shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function gitStatus() {
  const result = await run('git', ['status', '--short']);
  if (result.code !== 0) throw new Error(result.stderr || 'git status failed');
  return result.stdout.trim();
}

async function publish(message) {
  const commitMessage = String(message || 'Update homepage content').trim().slice(0, 120);
  const before = await gitStatus();
  if (!before) return { skipped: true, message: 'No local changes to publish.' };

  const add = await run('git', ['add', '--', 'assets/data/profile.json', 'code']);
  if (add.code !== 0) throw new Error(add.stderr || 'git add failed');

  const afterAdd = await run('git', ['diff', '--cached', '--quiet']);
  if (afterAdd.code === 0) return { skipped: true, message: 'No staged content changes.' };

  const commit = await run('git', ['commit', '-m', commitMessage]);
  if (commit.code !== 0) throw new Error(commit.stderr || 'git commit failed');

  const push = await run('git', ['push', 'origin', 'HEAD']);
  if (push.code !== 0) throw new Error(push.stderr || 'git push failed');

  return { skipped: false, before, commit: commit.stdout.trim(), push: push.stdout.trim() || push.stderr.trim() };
}

function serveStatic(res, pathname) {
  const target = path.resolve(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname.slice(1));
  if (!target.startsWith(PUBLIC_DIR + path.sep) && target !== path.join(PUBLIC_DIR, 'index.html')) {
    sendError(res, 403, 'Forbidden');
    return;
  }
  fs.readFile(target, (error, data) => {
    if (error) {
      sendError(res, 404, 'Not found');
      return;
    }
    send(res, 200, data.toString(), MIME[path.extname(target).toLowerCase()] || 'application/octet-stream');
  });
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    send(res, 200, { ok: true, root: ROOT });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/implementations') {
    const profile = readProfile();
    const items = getImplementationItems(profile);
    send(res, 200, items);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/implementations') {
    const payload = await readBody(req);
    payload.id = assertId(payload.id, 'Implementation id');
    if (payload.codeFolder) safeCodeFolder(payload.codeFolder);
    if (!Array.isArray(payload.algorithms) || !payload.algorithms.length) {
      throw new Error('At least one algorithm is required.');
    }

    const profile = readProfile();
    const items = getImplementationItems(profile);
    const zhItem = buildLanguageItem(payload, 'zh');
    const enItem = buildLanguageItem(payload, 'en');

    upsert(items.zh, zhItem, payload.originalId);
    upsert(items.en, enItem, payload.originalId);
    writeProfile(profile);
    writeImplementationFiles(payload);
    send(res, 200, { ok: true, id: payload.id });
    return;
  }

  const deleteMatch = url.pathname.match(/^\/api\/implementations\/([a-z0-9-]+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const id = assertId(deleteMatch[1], 'Implementation id');
    const profile = readProfile();
    const items = getImplementationItems(profile);
    const before = items.zh.length + items.en.length;
    items.zh = items.zh.filter((entry) => entry.id !== id);
    items.en = items.en.filter((entry) => entry.id !== id);
    profile.zh.implementations.items = items.zh;
    profile.en.implementations.items = items.en;
    writeProfile(profile);
    if (url.searchParams.get('deleteCode') === 'true') removeCodeFolder(url.searchParams.get('codeFolder') || id);
    send(res, 200, { ok: true, removedEntries: before - items.zh.length - items.en.length });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/git/status') {
    send(res, 200, { status: await gitStatus() });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/publish') {
    const payload = await readBody(req);
    send(res, 200, await publish(payload.message));
    return;
  }

  sendError(res, 404, 'Unknown API route');
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(res, url.pathname);
  } catch (error) {
    sendError(res, 400, error.message || String(error));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Homepage admin running at http://${HOST}:${PORT}`);
});
