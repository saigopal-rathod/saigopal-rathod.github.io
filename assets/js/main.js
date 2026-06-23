// ==========================================================================
//  Sai Gopal Rathod — Portfolio
//  Data-driven rendering + Neural Dark interactions
// ==========================================================================

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function setEyebrow(sectionId, text) {
  const el = document.querySelector(`#${sectionId} .section-eyebrow`);
  if (el && text) el.textContent = text;
}

function initials(name) {
  const first = String(name).trim().split(/\s+/)[0] || "";
  if (first.length <= 4) return first.toUpperCase();
  return first.slice(0, 2).toUpperCase();
}

// Parse a stat string like "4+", "88%", "0.72" into counter parts.
function parseStat(str) {
  const m = String(str).match(/^([^\d.-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { plain: true, text: str };
  const numStr = m[2];
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return {
    plain: false,
    prefix: m[1] || "",
    target: parseFloat(numStr),
    decimals,
    suffix: m[3] || "",
  };
}

// ==========================================================================
// Site config (meta tags + branding)
// ==========================================================================
async function loadSiteConfig() {
  try {
    const config = await (await fetch("data/site-config.json")).json();
    document.title = config.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", config.meta.description);
    document
      .querySelector('meta[name="author"]')
      ?.setAttribute("content", config.meta.author);
    document
      .querySelector('meta[name="keywords"]')
      ?.setAttribute("content", config.meta.keywords);

    if (config.branding?.monogram) {
      document.querySelectorAll(".nav-monogram, .headshot-monogram").forEach((el) => {
        el.textContent = config.branding.monogram;
      });
    }
  } catch (error) {
    console.error("Error loading site config:", error);
  }
}

// ==========================================================================
// Navigation
// ==========================================================================
async function loadNavigation() {
  try {
    const navData = await (await fetch("data/navigation.json")).json();

    const navLink = document.querySelector(".nav-brand a");
    if (navLink) navLink.setAttribute("href", navData.brand.href);
    const navName = document.querySelector(".nav-name");
    if (navName) navName.textContent = navData.brand.name;

    const navMenu = document.getElementById("navMenu");
    if (navMenu) {
      navMenu.innerHTML = "";
      navData.menuItems.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${item.href}" class="nav-link">${item.label}</a>`;
        navMenu.appendChild(li);
      });
      navMenu.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => closeMobileMenu());
      });
    }
  } catch (error) {
    console.error("Error loading navigation:", error);
  }
}

// ==========================================================================
// Hero
// ==========================================================================
async function loadHero() {
  try {
    const hero = await (await fetch("data/hero.json")).json();

    document.getElementById("heroEyebrow").textContent = hero.eyebrow || "";
    document.getElementById("heroGreeting").textContent = hero.greeting || "";
    document.getElementById("heroName").textContent = hero.name || "";
    document.getElementById("heroTitle").textContent = hero.title || "";
    document.getElementById("heroSummary").innerHTML = hero.summary || "";

    // Headshot
    const frame = document.getElementById("headshotFrame");
    const img = document.getElementById("heroHeadshot");
    if (hero.headshot && frame && img) {
      img.src = hero.headshot;
      img.onload = () => frame.classList.remove("is-placeholder");
      img.onerror = () => frame.classList.add("is-placeholder");
    }

    const highlights = document.getElementById("heroHighlights");
    if (highlights) {
      highlights.innerHTML = "";
      (hero.highlights || []).forEach((h) => {
        const div = document.createElement("div");
        div.className = "highlight-item";
        div.innerHTML = `<i class="${h.icon}"></i><span>${h.text}</span>`;
        highlights.appendChild(div);
      });
    }

    const cta = document.getElementById("heroCTA");
    if (cta) {
      cta.innerHTML = "";
      (hero.cta?.buttons || []).forEach((button) => {
        const a = document.createElement("a");
        a.href = button.href;
        a.className = `btn btn-${button.type}`;
        if (button.external) {
          a.target = "_blank";
          a.rel = "noopener";
        }
        if (button.download) a.setAttribute("download", "");
        a.innerHTML = button.icon
          ? `<span>${button.text}</span> <i class="${button.icon}"></i>`
          : button.text;
        cta.appendChild(a);
      });
    }

    const social = document.getElementById("heroSocial");
    if (social) {
      social.innerHTML = "";
      (hero.socialLinks || []).forEach((s) => {
        const a = document.createElement("a");
        a.href = s.url;
        if (!s.url.startsWith("mailto:")) a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("aria-label", s.platform);
        a.innerHTML = `<i class="${s.icon}"></i>`;
        social.appendChild(a);
      });
    }

    const availability = document.getElementById("heroAvailability");
    if (availability && hero.availability) {
      availability.innerHTML = `<span class="avail-dot" aria-hidden="true"></span> ${hero.availability}`;
    }
  } catch (error) {
    console.error("Error loading hero data:", error);
  }
}

// ==========================================================================
// About
// ==========================================================================
async function loadAbout() {
  try {
    const about = await (await fetch("data/about.json")).json();
    const title = document.querySelector("#about .section-title");
    if (title) title.textContent = about.sectionTitle;
    setEyebrow("about", about.eyebrow);

    const text = document.getElementById("aboutText");
    if (text) {
      text.innerHTML = "";
      (about.paragraphs || []).forEach((p) => {
        const el = document.createElement("p");
        el.textContent = p;
        text.appendChild(el);
      });
    }

    const stats = document.getElementById("aboutStats");
    if (stats) {
      stats.innerHTML = "";
      (about.statistics || []).forEach((stat) => {
        const div = document.createElement("div");
        div.className = "stat-item";
        const s = parseStat(stat.value);
        if (s.plain) {
          div.innerHTML = `<h3 class="stat-value">${s.text}</h3><p>${stat.label}</p>`;
        } else {
          div.innerHTML = `<h3 class="stat-value js-counter" data-target="${s.target}" data-decimals="${s.decimals}" data-prefix="${s.prefix}" data-suffix="${s.suffix}">0</h3><p>${stat.label}</p>`;
        }
        stats.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Error loading about data:", error);
  }
}

// ==========================================================================
// Experience
// ==========================================================================
async function loadExperience() {
  try {
    const data = await (await fetch("data/experience.json")).json();
    const title = document.querySelector("#experience .section-title");
    if (title) title.textContent = data.sectionTitle;
    setEyebrow("experience", data.eyebrow);

    const timeline = document.getElementById("experienceTimeline");
    timeline.innerHTML = "";
    (data.experiences || []).forEach((exp) => {
      if (exp._instructions) return;

      const item = document.createElement("div");
      item.className = "timeline-item";

      const logo = exp.logo
        ? `<div class="timeline-logo"><img src="${exp.logo}" alt="${exp.company} logo" loading="lazy" width="48" height="48" onerror="this.parentElement.classList.add('timeline-logo--text');this.remove();this.parentElement.textContent='${initials(
            exp.company
          )}';"></div>`
        : `<div class="timeline-logo timeline-logo--text">${initials(exp.company)}</div>`;

      const responsibilities = exp.responsibilities
        ? `<ul>${exp.responsibilities.map((r) => `<li>${r}</li>`).join("")}</ul>`
        : "";

      const location = exp.location
        ? `<p class="timeline-location">${exp.location}</p>`
        : "";

      item.innerHTML = `
        <div class="timeline-content">
          <div class="timeline-header">
            <div class="timeline-headline">
              ${logo}
              <div>
                <h3 class="timeline-title">${exp.title}</h3>
                <p class="timeline-company">${exp.company}</p>
                ${location}
              </div>
            </div>
            <span class="timeline-period">${exp.period}</span>
          </div>
          <div class="timeline-description">
            <p>${exp.description}</p>
            ${responsibilities}
          </div>
        </div>`;
      timeline.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading experience data:", error);
  }
}

// ==========================================================================
// Skills
// ==========================================================================
async function loadSkills() {
  try {
    const data = await (await fetch("data/skills.json")).json();
    const title = document.querySelector("#skills .section-title");
    if (title) title.textContent = data.sectionTitle;
    setEyebrow("skills", data.eyebrow);

    // Marquee ribbon (duplicated track for a seamless loop)
    const marquee = document.getElementById("skillsMarquee");
    if (marquee && Array.isArray(data.marquee) && data.marquee.length) {
      const items = data.marquee
        .map((t) => `<span class="marquee-item">${t}</span>`)
        .join("");
      marquee.innerHTML = `<div class="marquee-track">${items}${items}</div>`;
    }

    const grid = document.getElementById("skillsGrid");
    grid.innerHTML = "";
    (data.categories || []).forEach((category) => {
      if (category._instructions) return;
      const div = document.createElement("div");
      div.className = "skill-category";
      const tags = category.skills
        .map((skill) => `<span class="skill-tag">${skill}</span>`)
        .join("");
      div.innerHTML = `
        <h3><i class="${category.icon}"></i> ${category.category}</h3>
        <div class="skill-list">${tags}</div>`;
      grid.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading skills data:", error);
  }
}

// ==========================================================================
// Projects (case studies + repo grid + filtering)
// ==========================================================================
async function loadProjects() {
  try {
    const data = await (await fetch("data/projects.json")).json();
    const title = document.querySelector("#projects .section-title");
    if (title) title.textContent = data.sectionTitle;
    setEyebrow("projects", data.eyebrow);

    const all = (data.projects || []).filter((p) => !p._instructions);
    const featured = all.filter((p) => p.featured);
    const repos = all.filter((p) => !p.featured);

    // --- Case studies ---
    const caseWrap = document.getElementById("caseStudies");
    caseWrap.innerHTML = "";
    featured.forEach((p) => {
      const card = document.createElement("article");
      card.className = "case-card";
      card.dataset.category = p.category || "";

      const badge =
        p.status === "private"
          ? `<span class="case-badge"><i class="fas fa-lock"></i> Private case study</span>`
          : "";

      const metrics = (p.metrics || [])
        .map(
          (m) => `
          <div class="case-metric">
            <span class="metric-value js-counter" data-target="${m.value}" data-decimals="${
            m.decimals || 0
          }" data-suffix="${m.suffix || ""}">0</span>
            <div class="metric-label">${m.label}</div>
          </div>`
        )
        .join("");

      const award = p.award
        ? `<div class="case-award"><i class="fas fa-trophy"></i> ${p.award}</div>`
        : "";

      const tech = (p.technologies || [])
        .map((t) => `<span class="tech-badge">${t}</span>`)
        .join("");

      const cover = p.image
        ? `<div class="case-cover"><img src="${p.image}" alt="${p.title} cover" loading="lazy">${badge}</div>`
        : "";

      card.innerHTML = `
        ${cover}
        <div class="case-body">
          ${
            p.image
              ? ""
              : `<div class="case-top"><div class="case-icon"><i class="${
                  p.icon || "fas fa-brain"
                }"></i></div>${badge}</div>`
          }
          <h3 class="case-title">${p.title}</h3>
          <p class="case-description">${p.description}</p>
          ${metrics ? `<div class="case-metrics">${metrics}</div>` : ""}
          ${award}
          <div class="case-tech">${tech}</div>
        </div>`;
      caseWrap.appendChild(card);
    });

    // --- Repo grid ---
    const grid = document.getElementById("projectsGrid");
    grid.innerHTML = "";
    repos.forEach((p) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.dataset.category = p.category || "";

      const tech = (p.technologies || [])
        .map((t) => `<span class="tech-badge">${t}</span>`)
        .join("");

      const links = [];
      if (p.github) {
        links.push(
          `<a href="${p.github}" target="_blank" rel="noopener" class="project-link"><i class="fab fa-github"></i> View Code</a>`
        );
      }
      if (p.demo) {
        links.push(
          `<a href="${p.demo}" target="_blank" rel="noopener" class="project-link"><i class="fas fa-arrow-up-right-from-square"></i> Live Demo</a>`
        );
      }

      card.innerHTML = `
        <div class="project-image">${
          p.image
            ? `<img src="${p.image}" alt="${p.title} cover" loading="lazy">`
            : `<i class="${p.icon || "fas fa-code"}"></i>`
        }</div>
        <div class="project-content">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-description">${p.description}</p>
          <div class="project-tech">${tech}</div>
          <div class="project-links">${links.join("")}</div>
        </div>`;

      if (p.github) {
        card.classList.add("is-clickable");
        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${p.title} — view code on GitHub`);
        const open = () => window.open(p.github, "_blank", "noopener");
        card.addEventListener("click", (e) => {
          if (!e.target.closest("a")) open();
        });
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter") open();
        });
      }

      grid.appendChild(card);
    });

    // --- Filters ---
    buildFilters(data.filters);
  } catch (error) {
    console.error("Error loading projects data:", error);
  }
}

function buildFilters(filters) {
  const bar = document.getElementById("projectFilters");
  if (!bar || !Array.isArray(filters) || !filters.length) return;
  bar.innerHTML = "";

  filters.forEach((f, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-pill" + (i === 0 ? " is-active" : "");
    btn.textContent = f;
    btn.dataset.filter = f;
    btn.addEventListener("click", () => applyFilter(f, btn));
    bar.appendChild(btn);
  });
}

function applyFilter(filter, btn) {
  document
    .querySelectorAll(".filter-pill")
    .forEach((p) => p.classList.toggle("is-active", p === btn));

  document.querySelectorAll("[data-category]").forEach((card) => {
    const show = filter === "All" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !show);
  });
}

// ==========================================================================
// Education
// ==========================================================================
async function loadEducation() {
  try {
    const data = await (await fetch("data/education.json")).json();
    const title = document.querySelector("#education .section-title");
    if (title) title.textContent = data.sectionTitle;
    setEyebrow("education", data.eyebrow);

    const certTitle = document.querySelector("#education .certifications h3");
    if (certTitle) certTitle.textContent = data.certificationsTitle || "Certifications";

    const grid = document.getElementById("educationGrid");
    grid.innerHTML = "";
    (data.education || []).forEach((edu) => {
      if (edu._instructions) return;
      const item = document.createElement("div");
      item.className = "education-item";

      const logo = edu.logo
        ? `<div class="education-logo"><img src="${edu.logo}" alt="${edu.school} logo" loading="lazy" width="52" height="52" onerror="this.parentElement.classList.add('education-logo--text');this.remove();this.parentElement.textContent='${initials(
            edu.school
          )}';"></div>`
        : `<div class="education-logo education-logo--text">${initials(edu.school)}</div>`;

      item.innerHTML = `
        <div class="education-header">
          ${logo}
          <div>
            <h3 class="education-degree">${edu.degree}</h3>
            <p class="education-school">${edu.school}</p>
            <p class="education-period">${edu.period}</p>
          </div>
        </div>
        ${edu.details ? `<p class="timeline-description">${edu.details}</p>` : ""}`;
      grid.appendChild(item);
    });

    const certWrap = document.querySelector("#education .certifications");
    const certGrid = document.getElementById("certGrid");
    certGrid.innerHTML = "";
    if (!data.certifications || data.certifications.length === 0) {
      certWrap?.classList.add("is-empty");
    } else {
      certWrap?.classList.remove("is-empty");
      data.certifications.forEach((cert) => {
        const div = document.createElement("div");
        div.className = "cert-item";
        div.innerHTML = `<strong>${cert.name}</strong>${
          cert.issuer ? `<p>${cert.issuer}</p>` : ""
        }`;
        certGrid.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Error loading education data:", error);
  }
}

// ==========================================================================
// Contact
// ==========================================================================
async function loadContact() {
  try {
    const contact = await (await fetch("data/contact.json")).json();
    const title = document.querySelector("#contact .section-title");
    if (title) title.textContent = contact.sectionTitle;
    setEyebrow("contact", contact.eyebrow);

    const intro = document.getElementById("contactIntro");
    if (intro) intro.textContent = contact.intro || "";

    const info = document.getElementById("contactInfo");
    if (info) {
      info.innerHTML = "";
      (contact.contactInfo || []).forEach((c) => {
        const div = document.createElement("div");
        div.className = "contact-item";
        const value = c.href
          ? `<a href="${c.href}">${c.value}</a>`
          : `<p>${c.value}</p>`;
        div.innerHTML = `<i class="${c.icon}"></i><div><h3>${c.label}</h3>${value}</div>`;
        info.appendChild(div);
      });
    }

    const formWrap = document.getElementById("contactFormContainer");
    if (formWrap) {
      const form = contact.form;
      const fields = form.fields
        .map((field) => {
          const label = field.label
            ? `<label for="${field.id}">${field.label}</label>`
            : "";
          const input =
            field.type === "textarea"
              ? `<textarea id="${field.id}" name="${field.id}" rows="${field.rows || 5}" placeholder="${field.placeholder}" ${
                  field.required ? "required" : ""
                }></textarea>`
              : `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder}" ${
                  field.required ? "required" : ""
                }>`;
          return `<div class="form-group">${label}${input}</div>`;
        })
        .join("");

      const mailto = form.mailtoFallback || "";
      formWrap.innerHTML = `
        <form class="contact-form" id="contactForm" novalidate>
          ${fields}
          <button type="submit" class="btn btn-${form.submitButton.type}">${form.submitButton.text}</button>
          <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
          ${
            mailto
              ? `<p class="form-note">Prefer email? <a href="mailto:${mailto}">Write to me directly</a>.</p>`
              : ""
          }
        </form>`;

      const formEl = document.getElementById("contactForm");
      formEl.addEventListener("submit", (e) => handleContactSubmit(e, form));
    }
  } catch (error) {
    console.error("Error loading contact data:", error);
  }
}

function showFormStatus(msg, kind) {
  const status = document.getElementById("formStatus");
  if (!status) return;
  status.textContent = msg;
  status.className = `form-status is-visible is-${kind}`;
}

async function handleContactSubmit(e, form) {
  e.preventDefault();
  const formEl = e.target;
  if (!formEl.checkValidity()) {
    formEl.reportValidity();
    return;
  }

  // Formspree (or any POST endpoint) when configured.
  if (form.action) {
    try {
      const res = await fetch(form.action, {
        method: form.method || "POST",
        body: new FormData(formEl),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        showFormStatus(form.successMessage, "success");
        formEl.reset();
      } else {
        showFormStatus(form.errorMessage || "Something went wrong.", "error");
      }
    } catch (err) {
      showFormStatus(form.errorMessage || "Something went wrong.", "error");
    }
    return;
  }

  // Mailto fallback — open the user's mail client pre-filled.
  const data = new FormData(formEl);
  const name = data.get("name") || "";
  const email = data.get("email") || "";
  const message = data.get("message") || "";
  const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${form.mailtoFallback}?subject=${subject}&body=${body}`;
  showFormStatus(form.successMessage, "success");
  formEl.reset();
}

// ==========================================================================
// Footer
// ==========================================================================
async function loadFooter() {
  try {
    const footer = await (await fetch("data/footer.json")).json();

    const tagline = document.getElementById("footerTagline");
    if (tagline) tagline.textContent = footer.tagline || "";

    const copyright = document.getElementById("footerCopyright");
    if (copyright) {
      copyright.textContent = `© ${footer.copyright.year} ${footer.copyright.name}. ${footer.copyright.text}`;
    }

    const disclaimer = document.getElementById("footerDisclaimer");
    if (disclaimer) disclaimer.textContent = footer.disclaimer || "";

    const links = document.getElementById("footerLinks");
    if (links) {
      links.innerHTML = "";
      (footer.links || []).forEach((link) => {
        const a = document.createElement("a");
        a.href = link.url;
        if (!link.url.startsWith("mailto:")) a.target = "_blank";
        a.rel = "noopener";
        a.textContent = link.text;
        links.appendChild(a);
      });
    }
  } catch (error) {
    console.error("Error loading footer data:", error);
  }
}

// ==========================================================================
// Mobile navigation
// ==========================================================================
const navToggle = document.getElementById("navToggle");
const navMenuEl = document.getElementById("navMenu");

function closeMobileMenu() {
  navMenuEl?.classList.remove("active");
  navToggle?.classList.remove("active");
  navToggle?.setAttribute("aria-expanded", "false");
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = navMenuEl.classList.toggle("active");
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

// ==========================================================================
// Scroll reveal (IntersectionObserver, staggered)
// ==========================================================================
function initReveal() {
  const targets = document.querySelectorAll(
    ".section-head, .stat-item, .timeline-item, .skill-category, .case-card, .project-card, .education-item, .cert-item, .contact-item, .contact-form"
  );

  if (prefersReducedMotion) {
    targets.forEach((t) => t.classList.add("reveal", "is-visible"));
    return;
  }

  targets.forEach((t) => {
    t.classList.add("reveal");
    const siblings = t.parentElement ? Array.from(t.parentElement.children) : [t];
    const idx = Math.max(0, siblings.indexOf(t));
    t.style.setProperty("--reveal-delay", `${Math.min(idx, 6) * 70}ms`);
  });

  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          o.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((t) => obs.observe(t));
}

// ==========================================================================
// Animated counters
// ==========================================================================
function animateCount(el) {
  const target = parseFloat(el.dataset.target) || 0;
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";

  const format = (v) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  if (prefersReducedMotion) {
    el.textContent = format(target);
    return;
  }

  const duration = 1300;
  let startTime = null;
  function frame(ts) {
    if (startTime === null) startTime = ts;
    const p = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(target * eased);
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = format(target);
  }
  requestAnimationFrame(frame);
}

function initCounters() {
  const counters = document.querySelectorAll(".js-counter");
  if (prefersReducedMotion) {
    counters.forEach(animateCount);
    return;
  }
  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          o.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => obs.observe(c));
}

// ==========================================================================
// Active nav link on scroll
// ==========================================================================
function initNavObserver() {
  const links = document.querySelectorAll(".nav-link");
  const map = {};
  links.forEach((l) => (map[l.getAttribute("href")] = l));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          links.forEach((l) => l.classList.remove("active"));
          if (map[id]) map[id].classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  document.querySelectorAll("section[id]").forEach((s) => obs.observe(s));
}

// ==========================================================================
// Scroll progress bar + back-to-top
// ==========================================================================
function initScrollUI() {
  const bar = document.getElementById("scrollProgress");
  const toBtn = document.getElementById("backToTop");
  let ticking = false;

  const update = () => {
    const st = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (st / max) * 100 : 0;
    if (bar) bar.style.width = `${pct}%`;
    if (toBtn) toBtn.classList.toggle("is-visible", st > 600);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  if (toBtn) {
    toBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  update();
}

// ==========================================================================
// Init
// ==========================================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadSiteConfig();
  await loadNavigation();
  await loadHero();
  await loadAbout();
  await loadExperience();
  await loadSkills();
  await loadProjects();
  await loadEducation();
  await loadContact();
  await loadFooter();

  // Interactions run after content is in the DOM.
  initReveal();
  initCounters();
  initNavObserver();
  initScrollUI();
});
