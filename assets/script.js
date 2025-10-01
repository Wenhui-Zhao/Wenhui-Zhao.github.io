// assets/script.js
// Renders the full publications list (no bold titles) from data/publications.json
async function renderPublications(){
  const container = document.getElementById('pubs');
  if(!container) return;
  try{
    const resp = await fetch('data/publications.json', {cache:'no-store'});
    let items = await resp.json();

    // Optional: hide items by adding "hidden": true in publications.json
    items = items.filter(it => !it.hidden);

    // Sort: year desc, then journal, then title
    items.sort((a,b)=> (b.year||0)-(a.year||0)
      || String(a.journal||'').localeCompare(String(b.journal||''))
      || String(a.title||'').localeCompare(String(b.title||'')));

    const ul = document.createElement('ul');
    ul.className = 'publist';

    for(const it of items){
      const title = it.title || '';
      const link = it.link ? `<a href="${it.link}" target="_blank" rel="noopener">${title}</a>` : title;
      const doi = it.doi ? ` <span class="small">• <a href="https://doi.org/${it.doi}" target="_blank" rel="noopener">doi:${it.doi}</a></span>` : '';
      const note = it.note ? ` <span class="small">• ${it.note}</span>` : '';
      const meta = [
        it.authors || '',
        it.year ? `(${it.year})` : '',
        `<em>${it.journal || ''}</em>`,
        it.volume ? `, ${it.volume}` : '',
        it.issue ? `(${it.issue})` : '',
        it.pages ? `, ${it.pages}` : ''
      ].join('');

      const li = document.createElement('li');
      li.innerHTML = `<div class="pub-line">${link}. ${meta}.${doi}${note}</div>`;
      ul.appendChild(li);
    }

    container.innerHTML = '';
    container.appendChild(ul);
  }catch(e){
    container.textContent = 'Could not load publications. ' + e;
  }
}
document.addEventListener('DOMContentLoaded', renderPublications);
