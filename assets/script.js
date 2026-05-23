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
  return escapeHTML(authors).replace(
    /Wenhui Zhao/g,
    "<strong>Wenhui Zhao</strong>"
  );
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
      const title = escapeHTML(it.title || "");
      const authors = formatAuthors(it.authors || "");
      const year = it.year ? `(${escapeHTML(it.year)})` : "";
      const journal = it.journal ? `<em>${escapeHTML(it.journal)}</em>` : "";
      const vol = it.volume ? `, ${escapeHTML(it.volume)}` : "";
      const issue = it.issue ? `(${escapeHTML(it.issue)})` : "";
      const pages = it.pages ? `, ${escapeHTML(it.pages)}` : "";
      const note = it.note ? ` • ${escapeHTML(it.note)}` : "";

      const doi = it.doi
        ? ` • <a href="https://doi.org/${encodeURI(it.doi)}" target="_blank" rel="noopener">doi:${escapeHTML(it.doi)}</a>`
        : "";

      const li = document.createElement("li");
      li.innerHTML = `
        <span class="pub-authors">${authors}</span> ${year}.
        <span class="pub-title">${title}</span>.
        ${journal}${vol}${issue}${pages}.${doi}${note}
      `;
      ul.appendChild(li);
    }

    container.replaceChildren(ul);
  } catch (e) {
    container.textContent = "Could not load publications. " + e;
  }
}

document.addEventListener("DOMContentLoaded", renderPublications);
