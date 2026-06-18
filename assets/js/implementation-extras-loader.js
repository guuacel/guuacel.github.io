(function () {
  'use strict';

  const EXTRA_URL = 'assets/data/implementation-extras.json?v=20260618-kzg-implementation';
  const nativeFetch = window.fetch.bind(window);

  function isProfileRequest(input) {
    const url = typeof input === 'string' ? input : input && input.url;
    return typeof url === 'string' && url.indexOf('assets/data/profile.json') !== -1;
  }

  function sortByYearDesc(items) {
    return items.slice().sort(function (a, b) {
      const yearA = Number(a.year) || 0;
      const yearB = Number(b.year) || 0;
      if (yearA !== yearB) return yearB - yearA;
      return String(a.title || '').localeCompare(String(b.title || ''));
    });
  }

  function upsertItems(profile, lang, extraItems) {
    if (!profile[lang] || !profile[lang].implementations || !Array.isArray(extraItems)) return;
    const items = Array.isArray(profile[lang].implementations.items)
      ? profile[lang].implementations.items.slice()
      : [];

    extraItems.forEach(function (extraItem) {
      const index = items.findIndex(function (item) { return item.id === extraItem.id; });
      if (index >= 0) {
        items[index] = extraItem;
      } else {
        items.push(extraItem);
      }
    });

    profile[lang].implementations.items = sortByYearDesc(items);
  }

  function mergeExtras(profile, extras) {
    upsertItems(profile, 'zh', extras.zh && extras.zh.items);
    upsertItems(profile, 'en', extras.en && extras.en.items);
    return profile;
  }

  async function readText(path) {
    const response = await nativeFetch(path + '?v=20260618-kzg-implementation');
    if (!response.ok) throw new Error('Failed to load ' + path + ': ' + response.status);
    return response.text();
  }

  async function hydrateAlgorithm(algorithm) {
    if (algorithm.readmePath && !algorithm.readme) {
      algorithm.readme = await readText(algorithm.readmePath);
    }
    if (algorithm.codePath && (!algorithm.code || !algorithm.code.content)) {
      algorithm.code = {
        language: algorithm.codeLanguage || 'python',
        content: await readText(algorithm.codePath)
      };
    }
  }

  async function hydrateItem(item) {
    if (item.codePath && (!item.code || !item.code.content)) {
      item.code = {
        language: item.codeLanguage || 'python',
        content: await readText(item.codePath)
      };
    }
    if (Array.isArray(item.algorithms)) {
      for (const algorithm of item.algorithms) {
        await hydrateAlgorithm(algorithm);
      }
    }
  }

  async function hydrateExtras(extras) {
    for (const lang of ['zh', 'en']) {
      const items = extras[lang] && extras[lang].items;
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        await hydrateItem(item);
      }
    }
    return extras;
  }

  window.fetch = async function (input, init) {
    const response = await nativeFetch(input, init);
    if (!isProfileRequest(input)) return response;

    try {
      const profile = await response.clone().json();
      const extrasResponse = await nativeFetch(EXTRA_URL);
      if (!extrasResponse.ok) return response;
      const extras = await hydrateExtras(await extrasResponse.json());
      const merged = mergeExtras(profile, extras);
      return new Response(JSON.stringify(merged), {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    } catch (error) {
      console.warn('Could not merge implementation extras:', error);
      return response;
    }
  };
})();
