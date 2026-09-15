// assets/script.js
// Loads publication metadata from data/publications.json and renders APA-style references.

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function formatAuthors(authors = "") {
  let formatted = escapeHTML(authors);

  // Emphasize Wenhui Zhao in every reference.
  formatted = formatted.replace(
    /Zhao, W\./g,
    "<strong>Zhao, W.</strong>"
  );

  // Convert the co-first-author marker into an accessible superscript.
  formatted = formatted.replace(
    /#/g,
    '<sup class="equal-marker" aria-label="co-first author">#</sup>'
  );

  return formatted;
}

function doiToURL(doi = "") {
  const cleanedDOI = String(doi)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");

  return `https://doi.org/${encodeURI(cleanedDOI)}`;
}

function formatLocator(publication) {
  if (publication.pages) {
    return `, ${escapeHTML(publication.pages)}`;
  }

  if (publication.articleNumber) {
    return `, Article ${escapeHTML(publication.articleNumber)}`;
  }

  return "";
}

function formatAPACitation(publication) {
  const authors = formatAuthors(publication.authors || "");
  const year = publication.year
    ? `(${escapeHTML(publication.year)}).`
    : "(n.d.).";
  const title = publication.title
    ? `<span class="pub-title">${escapeHTML(publication.title)}.</span>`
    : "";

  const journal = publication.journal
    ? `<strong><em>${escapeHTML(publication.journal)}</em></strong>`
    : "";
  const volume = publication.volume
    ? `, <em>${escapeHTML(publication.volume)}</em>`
    : "";
  const issue = publication.issue
    ? `(${escapeHTML(publication.issue)})`
    : "";
  const locator = formatLocator(publication);
  const source = journal
    ? `${journal}${volume}${issue}${locator}.`
    : "";

  let link = "";
  if (publication.doi) {
    const doiURL = doiToURL(publication.doi);
    link = `<a class="doi-link" href="${doiURL}" target="_blank" rel="noopener noreferrer">${escapeHTML(doiURL)}</a>`;
  } else if (publication.link) {
    const safeLink = escapeHTML(publication.link);
    link = `<a class="doi-link" href="${safeLink}" target="_blank" rel="noopener noreferrer">View article</a>`;
  }

  const note = publication.authorNote
    ? `<div class="pub-note">${escapeHTML(publication.authorNote)}</div>`
    : "";

  return `
    <div class="citation">
      <span class="pub-authors">${authors}</span>
      ${year}
      ${title}
      ${source}
      ${link}
    </div>
    ${note}
  `;
}

function sortPublications(publications) {
  return [...publications].sort((a, b) => {
    const yearDifference = (b.year || 0) - (a.year || 0);
    if (yearDifference !== 0) return yearDifference;

    const orderDifference = (a.sortOrder || 0) - (b.sortOrder || 0);
    if (orderDifference !== 0) return orderDifference;

    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

function renderPublicationList(target, publications) {
  const requestedLimit = Number.parseInt(target.dataset.limit || "", 10);
  const visiblePublications = Number.isFinite(requestedLimit)
    ? publications.slice(0, requestedLimit)
    : publications;

  const list = document.createElement("ol");
  list.className = "publist";

  visiblePublications.forEach((publication) => {
    const item = document.createElement("li");
    item.innerHTML = formatAPACitation(publication);
    list.appendChild(item);
  });

  target.replaceChildren(list);
}

async function loadPublications() {
  const targets = document.querySelectorAll("[data-publications]");
  if (!targets.length) return;

  try {
    const response = await fetch("data/publications.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Publication data returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new TypeError("Publication data must be a JSON array.");
    }

    const publications = sortPublications(
      data.filter((publication) => !publication.hidden)
    );

    targets.forEach((target) => renderPublicationList(target, publications));
  } catch (error) {
    console.error("Unable to load publications:", error);

    targets.forEach((target) => {
      target.innerHTML = `
        <p class="error-message">
          Publications could not be loaded. Please refresh the page or view the
          <a href="https://scholar.google.com/citations?user=Yo9WTIUAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">Google Scholar profile</a>.
        </p>
      `;
    });
  }
}

document.addEventListener("DOMContentLoaded", loadPublications);
