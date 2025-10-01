
async function renderPublications(){
  const container = document.getElementById('pubs'); if(!container) return;
  try{
    const resp = await fetch('data/publications.json', {cache:'no-store'});
    const items = await resp.json();
    items.sort((a,b)=> (b.year||0)-(a.year||0) || (a.journal||'').localeCompare(b.journal||'') || (a.title||'').localeCompare(b.title||''));
    const ul = document.createElement('ul'); ul.className = 'publist';
    for(const it of items){
      const li = document.createElement('li');
      const titleLink = it.link ? `<a href="${it.link}" rel="noopener" target="_blank">${it.title}</a>` : it.title;
      const doi = it.doi ? ` <span class="small">• <a href="https://doi.org/${it.doi}" target="_blank" rel="noopener">doi:${it.doi}</a></span>` : '';
      const extra = it.note ? ` <span class="small">• ${it.note}</span>` : '';
      li.innerHTML = `<div><strong>${titleLink}</strong></div><div class="pub-meta">${it.authors||''} ${it.year? '('+it.year+')' : ''}. <em>${it.journal||''}</em>${it.volume? ', '+it.volume : ''}${it.issue? '('+it.issue+')' : ''}${it.pages? ', '+it.pages : ''}.${doi}${extra}</div>`;
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }catch(e){
    const pre = document.createElement('pre'); pre.textContent = 'Could not load publications. ' + e; container.appendChild(pre);
  }
}
document.addEventListener('DOMContentLoaded', renderPublications);
