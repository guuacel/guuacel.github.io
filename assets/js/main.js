(function () {
  "use strict";

  const STORAGE_KEY = "guuacel-homepage-language";
  const DATA_PATH = "assets/data/profile.json";
  const sections = ["about", "research", "publications", "projects", "patents", "awards", "contact"];
  let profile;
  let lang = "zh";

  const $ = (id) => document.getElementById(id);
  const safe = (value, fallback = "TODO") => {
    if (arguments.length === 0 || value == void 0 || value === "") return fallback;
    return String(value);
  };
  const esc = (value) => {
    const span = document.createElement("span");
    span.textContent = safe(value);
    return span.innerHTML;
  };
  const current = () => profile[lang] || profile.zh || profile.en;

  async function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      lang = saved === "en" || saved === "zh" ? saved : "zh";
      const response = await fetch(DATA_PATH);
      if (!response.ok) throw new Error(`${DATA_PATH} returned ${response.status}`);
      profile = await response.json();
      renderAll();
      bindGlobalEvents();
    } catch (error) {
      document.querySelector("main").innerHTML = `
        <section class="error container">
          <h1>Profile data failed to load</h1>
          <p>Please check that <code>${DATA_PATH}</code> exists and is valid JSON.</p>
          <p class="muted">${esc(error.message)}</p>
        </section>`;
      console.error(error);
    }
  }

  function setLanguage(nextLang) {
    lang = nextLang === "en" ? "en" : "zh";
    localStorage.setItem(STORAGE_KEY, lang);
    renderAll();
  }

  function renderAll() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    const data = current();
    document.title = safe(data.site?.title, "Chuanda Cai | Academic Homepage");
    renderNav(data);
    renderHero(data);
    renderAbout(data);
    renderResearch(data);
    renderPublications(data);
    renderProjects(data);
    renderPatents(data);
    renderAwards(data);
    renderContact(data);
    renderFooter(data);
    highlightActiveNav();
  }

  function renderNav(data) {
    const nav = data.site.nav;
    const navHtml = sections.map((key) => `<a href="#${key}">${esc(nav[key])}</a>`).join("");
    $("siteNav").innerHTML = `
      <a href="#home">${esc(nav.home)}</a>
      ${navHtml}
      <button class="language-toggle" id="languageToggle" type="button">${lang === "zh" ? "English" : "中文"}</button>`;
    const brand = document.querySelector("[data-bind='site.brand']");
    if (brand) brand.textContent = safe(data.site.brand, "Chuanda Cai");
    $("languageToggle").addEventListener("click", () => setLanguage(lang === "zh" ? "en" : "zh"));
  }

  function renderHero(data) {
    const hero = data.hero;
    const links = hero.links || {};
    $("hero").innerHTML = `
      <div class="container hero-grid">
        <img class="avatar" src="${esc(hero.avatar)}" alt="${esc(hero.name)}">
        <div>
          <p class="kicker">${esc(hero.kicker)}</p>
          <h1 id="heroTitle">${esc(hero.name)}</h1>
          <p class="lead">${esc(hero.title)}</p>
          <p class="muted">${esc(hero.affiliation)}</p>
          <p>${esc(hero.bio)}</p>
          <div class="button-row">
            ${linkButton(links.email ? `mailto:${links.email}` : "#", "Email")}
            ${linkButton(links.github, "GitHub")}
            ${linkButton(links.googleScholar, "Google Scholar")}
            ${linkButton(links.orcid, "ORCID")}
            ${linkButton(links.researchGate, "ResearchGate")}
            ${linkButton(links.cv, "CV")}
          </div>
        </div>
      </div>`;
  }

  function linkButton(href, label) {
    const link = safe(href, "#");
    return `<a class="button secondary" href="${esc(link)}" ${link !== "#" ? 'target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)}</a>`;
  }

  function renderAbout(data) {
    const about = data.about;
    const education = (about.education || []).map((item) => `
      <div class="timeline-item">
        <h3>${esc(item.degree)}</h3>
        <p class="muted">${esc(item.school)} | ${esc(item.period)}</p>
      </div>`).join("");
    const interests = (about.interests || []).map((item) => `<li class="tag">${esc(item)}</li>`).join("");
    $("about").innerHTML = `
      <div class="container grid-2">
        <div>
          <h2 id="aboutTitle">${esc(about.title)}</h2>
          <p>${esc(about.bio)}</p>
        </div>
        <div>
          <h3>${esc(about.educationTitle)}</h3>
          ${education || `<p class="muted">TODO</p>`}
          <h3>${esc(about.interestsTitle)}</h3>
          <ul class="tag-list">${interests || `<li class="tag">TODO</li>`}</ul>
        </div>
      </div>`;
  }

  function renderResearch(data) {
    const research = data.research;
    const cards = (research.items || []).map((item) => `
      <article class="card">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
        <ul class="tag-list">${(item.keywords || ["TODO"]).map((k) => `<li class="tag">${esc(k)}</li>`).join("")}</ul>
      </article>`).join("");
    $("research").innerHTML = `
      <div class="container">
        <h2 id="researchTitle">${esc(research.title)}</h2>
        <p class="lead">${esc(research.description)}</p>
        <div class="card-grid">${cards || `<article class="card">TODO</article>`}</div>
      </div>`;
  }

  function renderPublications(data) {
    const publications = data.publications;
    const papers = (publications.items || []).map((paper, index) => `
      <article class="paper">
        <p class="paper-title">${esc(paper.title)}</p>
        <p class="paper-meta">${esc(paper.authors)}</p>
        <p class="paper-meta"><em>${esc(paper.venue)}</em>, ${esc(paper.year)}</p>
        <div class="paper-actions">
          ${paper.doi ? `<a class="small-link" href="https://doi.org/${esc(paper.doi)}" target="_blank" rel="noopener noreferrer">DOI</a>` : ""}
          ${paper.pdf && paper.pdf !== "#" ? `<a class="small-link" href="${esc(paper.pdf)}" target="_blank" rel="noopener noreferrer">PDF</a>` : ""}
          ${paper.bibtex ? `<button class="small-link bibtex-button" type="button" data-bibtex="bibtex-${index}">BibTeX</button>` : ""}
        </div>
        ${paper.bibtex ? `<pre class="bibtex" id="bibtex-${index}"><code>${esc(paper.bibtex)}</code></pre>` : ""}
      </article>`).join("");
    $("publications").innerHTML = `
      <div class="container">
        <h2 id="publicationsTitle">${esc(publications.title)}</h2>
        ${papers || `<p class="muted">TODO</p>`}
      </div>`;
    document.querySelectorAll(".bibtex-button").forEach((button) => {
      button.addEventListener("click", () => {
        const target = $(button.dataset.bibtex);
        if (target) target.classList.toggle("open");
      });
    });
  }

  function renderProjects(data) {
    const projects = data.projects;
    const items = (projects.items || []).map((item) => `
      <article class="project">
        <h3>${esc(item.title)}</h3>
        <p class="muted">${esc(item.period)} | ${esc(item.role)}</p>
        <p>${esc(item.description)}</p>
      </article>`).join("");
    $("projects").innerHTML = `<div class="container"><h2 id="projectsTitle">${esc(projects.title)}</h2>${items || `<p class="muted">TODO</p>`}</div>`;
  }

  function renderPatents(data) {
    const patents = data.patents;
    const items = (patents.items || []).map((item) => `
      <article class="timeline-item">
        <h3>${esc(item.title)}</h3>
        <p class="muted">${esc(item.type)} | ${esc(item.status)} | ${esc(item.year)}</p>
        <p>${esc(item.note)}</p>
      </article>`).join("");
    $("patents").innerHTML = `<div class="container"><h2 id="patentsTitle">${esc(patents.title)}</h2>${items || `<p class="muted">TODO</p>`}</div>`;
  }

  function renderAwards(data) {
    const awards = data.awards;
    const items = (awards.items || []).map((item) => `
      <article class="timeline-item">
        <h3>${esc(item.title)}</h3>
        <p class="muted">${esc(item.organization)} | ${esc(item.year)}</p>
        <p>${esc(item.description)}</p>
      </article>`).join("");
    $("awards").innerHTML = `<div class="container"><h2 id="awardsTitle">${esc(awards.title)}</h2>${items || `<p class="muted">TODO</p>`}</div>`;
  }

  function renderContact(data) {
    const contact = data.contact;
    const items = [
      ["Email", contact.email, contact.email ? `mailto:${contact.email}` : "#"],
      ["GitHub", contact.github, contact.github],
      ["Google Scholar", contact.googleScholar, contact.googleScholar],
      ["ORCID", contact.orcid, contact.orcid],
      ["ResearchGate", contact.researchGate, contact.researchGate],
      [contact.addressLabel, contact.address, "#"]
    ].map(([label, value, href]) => `
      <div class="contact-item">
        <strong>${esc(label)}</strong><br>
        ${href && href !== "#" ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(value)}</a>` : `<span>${esc(value)}</span>`}
      </div>`).join("");
    $("contact").innerHTML = `<div class="container"><h2 id="contactTitle">${esc(contact.title)}</h2><div class="contact-list">${items}</div></div>`;
  }

  function renderFooter(data) {
    $("footer").innerHTML = `<div class="container">${esc(data.site.footer)}</div>`;
  }

  function bindGlobalEvents() {
    $("menuButton").addEventListener("click", () => {
      const nav = $("siteNav");
      const open = nav.classList.toggle("open");
      $("menuButton").setAttribute("aria-expanded", String(open));
    });

    $("backToTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
      $("backToTop").classList.toggle("visible", window.scrollY > 500);
      highlightActiveNav();
    });
  }

  function highlightActiveNav() {
    const y = window.scrollY + 100;
    let active = "home";
    document.querySelectorAll("main section[id]").forEach((section) => {
      if (section.offsetTop <= y) active = section.id;
    });
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const id = link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("active", id === active);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
