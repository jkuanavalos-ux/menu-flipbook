import { MENU } from './menu.js';
const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = n => `${Number(n).toLocaleString('es-PY')} ${esc(MENU.currency)}`;
const book = $('#book');
let pages = [], flip;

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

/* ---------- Libro con giro de hoja realista (StPageFlip, MIT) ---------- */
pages = buildPages();
book.innerHTML = pages.map((p, i) => `<div class="page" data-density="${i === 0 || i === pages.length - 1 ? 'hard' : 'soft'}">${p}</div>`).join('');
flip = new St.PageFlip(book, {
  width: 400, height: 533, size: 'stretch', minWidth: 280, maxWidth: 700, minHeight: 373, maxHeight: 934,
  showCover: true, usePortrait: true, drawShadow: true, maxShadowOpacity: .55,
  flippingTime: 1000, mobileScrollSupport: false, swipeDistance: 25, clickEventForward: true
});
flip.loadFromHTML(book.querySelectorAll('.page'));

const L = pages.length;
function update() {
  const p = flip.getCurrentPageIndex(), portrait = flip.getOrientation() === 'portrait';
  const box = $('#bookbox'); box.classList.toggle('atcover', !portrait && p === 0); box.classList.toggle('atend', !portrait && p >= L - 1);
  $('#prev').disabled = p <= 0;
  $('#next').disabled = portrait ? p >= L - 1 : p >= L - 2;
  $('#count').textContent = p === 0 ? 'Portada' : p >= L - 1 ? 'Contraportada' : portrait ? `${p + 1} / ${L}` : `${p}–${p + 1} / ${L}`;
}
flip.on('flip', update); flip.on('changeOrientation', update); flip.on('init', update);
update();
$('#next').onclick = () => flip.flipNext();
$('#prev').onclick = () => flip.flipPrev();
addEventListener('keydown', e => { if (e.key === 'ArrowRight') flip.flipNext(); if (e.key === 'ArrowLeft') flip.flipPrev(); });
book.addEventListener('click', e => { const j = e.target.closest('[data-go]'); if (j) flip.flip(+j.dataset.go); });
