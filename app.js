import { MENU } from './menu.js';
const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = n => `${Number(n).toLocaleString('es-PY')} ${esc(MENU.currency)}`;
const mq = matchMedia('(max-width:760px)');
const book = $('#book');
let pages = [], sheets = [], page = 0, single = mq.matches;

/* ---------- Páginas ---------- */
function buildPages() {
  const list = [];
  list.push(`<div class="paper cover"><div class="frame"><p class="since">${esc(MENU.since)}</p><h1>${esc(MENU.name)}</h1><div class="orn">❦</div><p class="tag">${esc(MENU.tagline)}</p><p class="open">Menú de comidas y bebidas</p></div></div>`);
  list.push(`<div class="paper"><h2>Índice</h2><ol class="toc">${MENU.sections.map((s, i) => `<li><button type="button" data-go="${i + 2}"><span>${esc(s.title)}</span><i class="dots"></i><b>${i + 3}</b></button></li>`).join('')}</ol></div>`);
  MENU.sections.forEach((s, i) => list.push(`<div class="paper"><h2>${esc(s.title)}</h2>${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}<ul class="items">${s.items.map(it => `<li><div class="n">${esc(it.name)}${it.desc ? `<small>${esc(it.desc)}</small>` : ''}</div><i class="dots"></i><span class="p">${money(it.price)}</span></li>`).join('')}</ul><span class="num">${i + 3}</span></div>`));
  if ((list.length + 1) % 2) list.push(`<div class="paper"><div class="orn big">❦</div><p class="note foot">${esc(MENU.footer || '')}</p></div>`);
  list.push(`<div class="paper cover back"><div class="frame"><div class="orn">❦</div><p class="tag">¡Gracias por visitarnos!</p><p class="open">${esc(MENU.footer || '')}</p></div></div>`);
  return list;
}

/* ---------- Libro ---------- */
function render() {
  single = mq.matches;
  book.className = 'book' + (single ? ' single' : '');
  book.innerHTML = '';
  sheets = [];
  const step = single ? 1 : 2;
  for (let i = 0; i < pages.length; i += step) {
    const sh = document.createElement('div');
    sh.className = 'sheet';
    sh.innerHTML = `<div class="face front">${pages[i]}</div><div class="face backf">${single ? '<div class="paper"></div>' : pages[i + 1]}</div>`;
    book.appendChild(sh); sheets.push(sh);
  }
  update();
}
const maxPage = () => single ? pages.length - 1 : pages.length;
function update() {
  const flipped = single ? page : page / 2, n = sheets.length;
  sheets.forEach((s, j) => { s.classList.toggle('flipped', j < flipped); s.style.zIndex = j < flipped ? j : n - j; });
  book.classList.toggle('atcover', !single && page === 0);
  book.classList.toggle('atend', !single && page >= pages.length);
  $('#prev').disabled = page <= 0; $('#next').disabled = page >= maxPage();
  const L = pages.length;
  $('#count').textContent = single ? `${page + 1} / ${L}` : page === 0 ? 'Portada' : page >= L ? 'Contraportada' : `${page}–${page + 1} / ${L}`;
}
function go(p) { page = Math.max(0, Math.min(maxPage(), p)); update(); }
const next = () => go(page + (single ? 1 : 2)), prev = () => go(page - (single ? 1 : 2));

/* ---------- Controles ---------- */
$('#next').onclick = next; $('#prev').onclick = prev;
addEventListener('keydown', e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });
let x0 = null;
book.addEventListener('pointerdown', e => { x0 = e.clientX; });
book.addEventListener('pointerup', e => {
  if (x0 === null) return; const dx = e.clientX - x0; x0 = null;
  if (Math.abs(dx) > 45) return dx < 0 ? next() : prev();
  const jump = e.target.closest('[data-go]');
  if (jump) { const p = +jump.dataset.go; return go(single || p % 2 === 0 ? p : p + 1); }
  const r = book.getBoundingClientRect();
  e.clientX > r.left + r.width / 2 ? next() : prev();
});
book.addEventListener('pointercancel', () => { x0 = null; });
mq.addEventListener('change', () => { page = single ? page - (page % 2) : page; render(); });

pages = buildPages();
render();
