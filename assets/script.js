// assets/script.js

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function formatAuthors(authors = "") {
  // Bold your APA-style author name.
  return escapeHTML(authors).replace(
    /Zhao, W\./g,
    "<strong>Zhao, W.</strong>"
  );
}

function doiToUrl(doi = "") {
  const clean = String(doi)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  return `https://doi.org/${encodeURI(clean)}`;
}

function formatApaCitation(it) {
  const authors = formatAuthors(it.authors || "");
  const year = it.year ? `(${escapeHTML(it.year)}).` : "(n.d.).";
  const title = it.title ? `${escapeHTML(it.title)}.` : "";

  const journal = it.journal
    ? `<strong><em>${escapeHTML(it.journal)}</em></strong>`
    : "";

  const volume = it.volume ? `, <em>${escapeHTML(it.volume)}</em>` : "";
  const issue = it.issue ? `(${escapeHTML(it.issue)})` : "";
  const pages = it.pages ? `, ${escapeHTML(it.pages)}` : "";

  const source = journal
    ? `${journal}${volume}${issue}${pages}.`
    : "";

  let doiOrLink = "";
  if (it.doi) {
    const url = doiToUrl(it.doi);
    doiOrLink = ` <a href="${url}" target="_blank" rel="noopener">${url}</a>`;
  } else if (it.link) {
    doiOrLink = ` <a href="${escapeHTML(it.link)}" target="_blank" rel="noopener">${escapeHTML(it.link)}</a>`;
  }

  const authorNote = it.authorNote
    ? `<div class="pub-note">${escapeHTML(it.authorNote)}</div>`
    : "";

  return `
    <span class="pub-authors">${authors}</span>
    ${year}
    <span class="pub-title">${title}</span>
    ${source}${doiOrLink}
    ${authorNote}
  `;
}

async function renderPublications() {
  const container = document.getElementById("pubs");
  if (!container) return;

  try {
    const resp = await fetch("data/publications.json", { cache: "no-store" });
    let items = await resp.json();

    items = items.filter((it) => !it.hidden);
    items.sort((a, b) =>
      (b.year || 0) - (a.year || 0) ||
      String(a.journal || "").localeCompare(String(b.journal || "")) ||
      String(a.title || "").localeCompare(String(b.title || ""))
    );

    const ul = document.createElement("ul");
    ul.className = "publist";

    for (const it of items) {
      const li = document.createElement("li");
      li.innerHTML = formatApaCitation(it);
      ul.appendChild(li);
    }

    container.replaceChildren(ul);
  } catch (e) {
    container.textContent = "Could not load publications. " + e;
  }
}

document.addEventListener("DOMContentLoaded", renderPublications);
