// assets/script.js
// Render publications from data/publications.json
// Titles are NOT links; only the DOI (if present) is linked.

async function renderPublications(){
  const container = document.getElementById('pubs');
  if(!container) return;
  try{
    const resp = await fetch('data/publications.json', {cache:'no-store'});
    let items = await resp.json();

    // Optional: hide items by adding "hidden": true in publications.json
    items = items.filter(it => !it.hidden);

    // Sort: newest first
    items.sort((a,b)=> (b.year||0)-(a.year||0)
      || String(a.journal||'').localeCompare(String(b.journal||''))
      || String(a.title||'').localeCompare(String(b.title||'')));

    const ul = document.createElement('ul');
    ul.className = 'publist';

    for(const it of items){
      const title = it.title || '';
      const authors = it.authors || '';
      const year = it.year ? `(${it.year})` : '';
      const journal = it.journal ? `<em>${it.journal}</em>` : '';
      const vol = it.volume ? `, ${it.volume}` : '';
      const issue = it.issue ? `(${it.issue})` : '';
      const pages = it.pages ? `, ${it.pages}` : '';
      const doiLink = it.doi
        ? ` <span class="small">• <a href="https://doi.org/${it.doi}" target="_blank" rel="noopener">doi:${it.doi}</a></span>`
        : '';

      const li = document.createElement('li');
      // Title is plain text (not a link); only DOI is linked
      li.innerHTML = `<div class="pub-line">${title}. ${authors} ${year}. ${journal}${vol}${issue}${pages}.${doiLink}${it.note ? ' <span class="small">• ' + it.note + '</span>' : ''}</div>`;
      ul.appendChild(li);
    }

    container.replaceChildren(ul);
  }catch(e){
    container.textContent = 'Could not load publications. ' + e;
  }
}
document.addEventListener('DOMContentLoaded', renderPublications);
