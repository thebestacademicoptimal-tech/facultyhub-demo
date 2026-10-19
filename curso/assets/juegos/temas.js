/* Imperio Global · Temas por carrera
   Cada tema dibuja el ranking a su manera. La lógica del juego es la misma.
   Uso: IG_TEMAS[id].ranking(el, lista, ctx)
   lista: [{id,title,sub,color,score,gain,rank,prev,streak,me,hits,hist:[...]}]
   ctx:   {qi, total, titulo, tone(f,d,type,v,w)} */
(function(){
const MAPA={"W": 144, "H": 62, "lat0": 80, "lat1": -58, "d": "AAAAAjvP//8ADwAAAAHAAAAAAAABiG+P//4AAAAAIAD4AAAAAAAAIAQAf/8AAAADAD/wAAAAAAADfY/AP/wAAAAEGf//8PAAAf4AfyN4P/4AAPAAG/////8If////////////ADQBAAAAAAAj///////////+EMAAAAAAAAAAf////AcDgAAH3//////////A////8BwBgAAPn////////z4AeB//8B6AAAAPn///////4CAAIAf//h+AAACFP///////gOAAAAP//7/gAANE////////gMAAAAH//7/wAALv////////4AAAAAH///4QAAA/////////0AAAAAD///84AAB/////////wAAAAAD////AAAA//Xn/////gAAAAAD///wAAAP6eDn/////MAAAAAD///gAAAPAu7z////8IAAAAAB///AAAAPAp/z///+IIAAAAAB///AAAAEcAf/////MQAAAAAA//+AAAAH8AP/////CgAAAAAAf/8AAAAP/IP/////iAAAAAAAH/AAAAAP///v////gAAAAAAAL4EAAAAf//v3////AAAAAAAAH4EAAAA///36////AAAAAAAAB4AAAAA///3/D//+gAAAAAAAA4hAAAB///7/D+fgAAAAAAAAA9gYAAA///7+B8PQAAAAAAAAAPgAAAB///94B4PggAAAAAAAAB4AAAB////wAwHwgAAAAAAAAAYQAAB///+AAwFwAAAAAAAAAAIuAAA////wAQEhAAAAAAAAAAF/AAAf///wAIAAIAAAAAAAAAB/4AAPP//gAACDAAAAAAAAAAB/8AAAD//gAAEGAAAAAAAAAAD/8AAAD//AAACPgAAAAAAAAAD//AAAD/+AAADOjAAAAAAAAAD//wAAD/8AAABCp4AAAAAAAAD//8AAB/8AAAAAAfgAAAAAAAD//8AAB/8AAAAMAeAAAAAAAAB//8AAB/8AAAAAQBAAAAAAAAB//4AAB/8AAAAADgAAAAAAAAA//wAAB/8QAAAALEAAAAAAAAAf/wAAB/8wAAAAfsABAAAAAAAP/wAAB/wwAAAAf+AAAAAAAAAP/wAAB/xgAAAD//AAAAAAAAAP/AAAA/xgAAAH//AAAAAAAAAP+AAAA/gAAAAD//gAAAAAAAAP+AAAA/gAAAAD//gAAAAAAAAf8AAAAfAAAAAD//gAAAAAAAAf4AAAAeAAAAADw/gAAAAAAAAfwAAAAAAAAAACAfAAAAAAAAAfgAAAAAAAAAAAAPAAAAAAAAAeAAAAAAAAAAAAAAACAAAAAAA8AAAAAAAAAAAAACAEAAAAAAAcAAAAAAAAAAAAACAIAAAAAAA4AAAAAAAAAAAAAAAQAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Math.round(Number(n || 0)).toLocaleString('es-PE');
const ini = s => String(s || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const av = p => `<span class="av" style="background:${esc(p.color)}">${esc(ini(p.title))}</span>`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLAME = '<svg class="flame" viewBox="0 0 12 14" aria-label="racha"><path d="M6 0C7 3 10 4.5 10 8.5A4 4 0 0 1 2 8.5C2 6.5 3.3 5.4 4 4c.4 1.3 1 2 2 2.2C5.4 4 5.6 2 6 0z" fill="#ffb02e"/><path d="M6 6.5c.8 1 1.8 1.7 1.8 3A1.8 1.8 0 0 1 4.2 9.5c0-.9.6-1.5 1-2 .2.5.5.8.8.9 0-.7-.1-1.3 0-1.9z" fill="#ffe27a"/></svg>';
const sinTilde = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const ticker = s => { const w = sinTilde(s).toUpperCase().replace(/[^A-Z ]/g, '').split(/\s+/).filter(Boolean); return ((w[0] || 'XX').slice(0, 2) + (w[1] || w[0] || 'XX').slice(w[1] ? 0 : 2, w[1] ? 2 : 4)).padEnd(4, 'X'); };
const handle = s => '@' + sinTilde(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function rng(seed){ let a = seed || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function head(eyebrow, title, sub){ return `<div class="rankhead"><div><div class="eyebrow">${eyebrow}</div><h2 class="sec-h" style="font-size:24px;margin-top:4px">${title}</h2></div><span class="sub">${sub}</span></div>`; }
const vivo = el => el.isConnected;

/* ============ IMPERIO GLOBAL (barras de valor de mercado) ============ */
function rkImperio(el, L, ctx){
  const H = 56, list = L.slice(0, 12), maxS = Math.max(1, ...list.map(p => p.score));
  const before = list.slice().sort((a, b) => a.prev - b.prev);
  const pos = p => Math.min(p.prev, list.length - 1);
  el.innerHTML = head(`Después de la pregunta ${ctx.qi + 1} · ${esc(ctx.titulo)}`, 'Valor de mercado de las empresas', 'Las barras crecen con cada acierto. Racha de 3 = bono +150.') +
    `<div class="board" style="height:${list.length * H}px">${before.map(p => { const mv = p.prev - p.rank;
      return `<div class="rrow ${p.me ? 'me' : ''}" data-id="${esc(p.id)}" style="transform:translateY(${pos(p) * H}px)"><span class="rpos">${p.rank + 1}</span>${av(p)}
        <div class="rmain"><span class="rname">${esc(p.title)} ${p.streak >= 3 ? FLAME : ''}<em>${esc(p.sub)}</em></span><span class="rbar"><i style="width:${(p.score - p.gain) / maxS * 100}%" data-w="${p.score / maxS * 100}"></i></span></div>
        <span class="rpts">${fmt(p.score)}<span class="delta ${mv > 0 ? 'up' : mv < 0 ? 'down' : ''}">${p.gain ? '+' + fmt(p.gain) : '—'} ${mv > 0 ? '▲' + mv : mv < 0 ? '▼' + (-mv) : ''}</span></span></div>`; }).join('')}</div>` +
    (L.length > list.length ? `<p class="note" style="margin:0">+ ${L.length - list.length} empresas más</p>` : '');
  setTimeout(() => el.querySelectorAll('.rrow').forEach(r => { const p = list.find(x => String(x.id) === r.dataset.id); r.style.transform = `translateY(${p.rank * H}px)`; r.classList.toggle('top1', p.rank === 0); const i = r.querySelector('.rbar i'); i.style.width = i.dataset.w + '%'; }), 350);
}

/* ============ RUTA GLOBAL (mapa con banderas) ============ */
const LIMA = { n: 'Lima', la: -12.05, lo: -77.04 };
const MERCADOS = [['Shanghái',31.2,121.5],['Los Ángeles',34,-118.2],['Rotterdam',51.9,4.5],['Tokio',35.7,139.7],['Dubái',25.2,55.3],['São Paulo',-23.5,-46.6],['Hamburgo',53.5,10],['Singapur',1.3,103.8],['Madrid',40.4,-3.7],['Bombay',19,72.8],['Sídney',-33.9,151.2],['Toronto',43.7,-79.4],['Seúl',37.6,127],['Johannesburgo',-26.2,28],['Ciudad de México',19.4,-99.1],['Nueva York',40.7,-74],['Santiago',-33.4,-70.6],['Lagos',6.5,3.4],['Yakarta',-6.2,106.8],['Moscú',55.8,37.6]].map(([n, la, lo]) => ({ n, la, lo }));
let LAND = null;
function land(){ if (LAND) return LAND; const al = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; const bits = [];
  for (const ch of MAPA.d) { const v = al.indexOf(ch); for (let k = 5; k >= 0; k--) bits.push((v >> k) & 1); }
  const per = Math.ceil(MAPA.W / 6) * 6; LAND = []; for (let r = 0; r < MAPA.H; r++) for (let c = 0; c < MAPA.W; c++) if (bits[r * per + c]) LAND.push([c, r]); return LAND; }
function rkRuta(el, L, ctx){
  const list = L.slice(0, 10);
  list.forEach(p => { const r = rng(hash(p.id)); const ord = MERCADOS.map((m, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]); p._mk = ord.slice(0, Math.min(p.hits || 0, MERCADOS.length)); });
  const abiertos = new Set(list.flatMap(p => p._mk));
  el.innerHTML = head(`Después de la pregunta ${ctx.qi + 1} · ${esc(ctx.titulo)}`, 'Ruta Global · mercados conquistados', `${abiertos.size} mercados abiertos desde Lima. Cada acierto planta una bandera.`) +
    `<div class="tm-ruta"><div class="map-wrap"><canvas class="map" aria-label="Mapa mundial con los mercados abiertos por cada empresa"></canvas></div>
     <ol class="tm-list">${list.map(p => `<li class="${p.me ? 'me' : ''}"><span class="rpos mono">${p.rank + 1}</span>${av(p)}<div><b>${esc(p.title)}</b><span>${p._mk.length} ${p._mk.length === 1 ? 'mercado' : 'mercados'}${p.gain ? ` · <em class="up">+1 bandera</em>` : ''}</span></div><span class="mono">${fmt(p.score)}</span></li>`).join('')}</ol></div>`;
  const cv = el.querySelector('canvas.map'), g = cv.getContext('2d'); const dpr = Math.min(devicePixelRatio || 1, 2); let w, h;
  const size = () => { w = cv.clientWidth; h = w * (MAPA.lat0 - MAPA.lat1) / 360; cv.style.height = h + 'px'; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const P = (la, lo) => [(lo + 180) / 360 * w, (MAPA.lat0 - la) / (MAPA.lat0 - MAPA.lat1) * h];
  const pts = land(); const t0 = performance.now();
  const flags = []; list.forEach((p, pi) => p._mk.forEach((mi, k) => { const ang = (pi / Math.max(1, list.length)) * Math.PI * 2; flags.push({ p, m: MERCADOS[mi], nuevo: p.gain > 0 && k === p._mk.length - 1, dx: Math.cos(ang) * 5, dy: Math.sin(ang) * 3, delay: p.rank * 140 }); }));
  let plantado = false;
  function draw(now){ if (!vivo(cv)) { removeEventListener('resize', size); return; } const t = now - t0; g.clearRect(0, 0, w, h);
    const cw = w / MAPA.W, ch = h / MAPA.H, rr = Math.max(1, Math.min(cw, ch) * .32);
    g.fillStyle = 'rgba(120,170,255,.35)'; for (const [c, r] of pts) { g.beginPath(); g.arc((c + .5) * cw, (r + .5) * ch, rr, 0, 7); g.fill(); }
    const [lx, ly] = P(LIMA.la, LIMA.lo);
    flags.forEach((f, i) => { const [x, y] = P(f.m.la, f.m.lo); const k = f.nuevo ? Math.min(1, Math.max(0, (t - 400 - f.delay) / 900)) : 1; if (k <= 0) return;
      const mx = (lx + x) / 2, my = (ly + y) / 2 - Math.hypot(x - lx, y - ly) * .28;
      g.strokeStyle = f.p.color; g.globalAlpha = .55; g.lineWidth = f.p.rank === 0 ? 2 : 1.2; g.setLineDash([4, 5]); g.lineDashOffset = reduce ? 0 : -t / 40;
      g.beginPath(); g.moveTo(lx, ly); const steps = 30; for (let s = 1; s <= steps * k; s++) { const u = s / steps; g.lineTo((1 - u) * (1 - u) * lx + 2 * (1 - u) * u * mx + u * u * x, (1 - u) * (1 - u) * ly + 2 * (1 - u) * u * my + u * u * y); } g.stroke(); g.setLineDash([]); g.globalAlpha = 1; });
    flags.forEach(f => { const [x0, y0] = P(f.m.la, f.m.lo); const x = x0 + f.dx, y = y0 + f.dy; let drop = 0, a = 1;
      if (f.nuevo) { const k = (t - 1200 - f.delay) / 600; if (k < 0) return; const e = Math.min(1, k); drop = (1 - e) * -40 + (e >= 1 ? 0 : Math.sin(e * Math.PI) * -6); a = Math.min(1, e * 2);
        if (k > 0 && k < 1.6) { g.strokeStyle = f.p.color; g.globalAlpha = Math.max(0, 1 - k / 1.6); g.beginPath(); g.arc(x, y, 4 + k * 16, 0, 7); g.stroke(); g.globalAlpha = 1; }
        if (!plantado && k > 0 && ctx.tone) { plantado = true; ctx.tone(880, .12, 'triangle', .08); ctx.tone(1320, .16, 'triangle', .07, .08); } }
      const big = f.p.rank === 0 ? 1.35 : 1; g.globalAlpha = a; g.strokeStyle = '#eaf2ff'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + drop); g.lineTo(x, y + drop - 14 * big); g.stroke();
      g.fillStyle = f.p.color; g.beginPath(); g.moveTo(x, y + drop - 14 * big); g.lineTo(x + 10 * big, y + drop - 11 * big); g.lineTo(x, y + drop - 8 * big); g.closePath(); g.fill(); g.globalAlpha = 1; });
    const pu = (Math.sin(t / 300) + 1) / 2; g.fillStyle = '#ffc94d'; g.shadowColor = '#ffc94d'; g.shadowBlur = 14; g.beginPath(); g.arc(lx, ly, 4, 0, 7); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = 'rgba(255,201,77,.7)'; g.beginPath(); g.arc(lx, ly, 6 + pu * 6, 0, 7); g.stroke();
    g.fillStyle = '#ffe9a8'; g.font = '600 11px JetBrains Mono, monospace'; g.fillText('LIMA', lx + 9, ly + 4);
    abiertos.forEach(i => { const m = MERCADOS[i]; const [x, y] = P(m.la, m.lo); g.fillStyle = 'rgba(234,242,255,.75)'; g.font = '500 10px Manrope, sans-serif'; g.fillText(m.n, x + 6, y + 12); });
    requestAnimationFrame(draw); }
  requestAnimationFrame(draw);
}

/* ============ CARRERA DE CONTENEDORES (barcos y aduanas) ============ */
const PUERTOS = ['Callao','Panamá','Cartagena','Miami','Algeciras','Rotterdam','Hamburgo','Amberes','Le Havre','Shanghái','Busan','Yokohama','Singapur','Dubái','Durban'];
const ship = c => `<svg viewBox="0 0 70 34" aria-hidden="true"><path d="M2 20h66l-7 11H9z" fill="${esc(c)}"/><path d="M2 20h66l-1.6 2.6H3.6z" fill="rgba(255,255,255,.35)"/><rect x="10" y="12" width="10" height="8" fill="#ff8a3d"/><rect x="21" y="12" width="10" height="8" fill="#3fe1ff"/><rect x="32" y="12" width="10" height="8" fill="#ffc94d"/><rect x="15" y="4" width="10" height="8" fill="#2cf0c2"/><rect x="26" y="4" width="10" height="8" fill="#8c6bff"/><rect x="50" y="6" width="9" height="14" rx="1" fill="#eaf2ff"/><rect x="52" y="9" width="5" height="3" fill="#0a1c48"/><rect x="54" y="1" width="3" height="5" fill="#ff4d6d"/></svg>`;
const avion = c => `<svg viewBox="0 0 70 34" aria-hidden="true"><path d="M25 19 37 32h6l-5-13z" fill="${esc(c)}" opacity=".85"/><path d="M6 17c0-2.4 2-4 4.5-4H52c6 0 12 2.2 15 4-3 1.8-9 4-15 4H10.5C8 21 6 19.4 6 17z" fill="#eaf2ff"/><path d="M10.5 13.2 4.5 3h6.5l9 10.2z" fill="${esc(c)}"/><rect x="12" y="17.6" width="42" height="1.8" fill="${esc(c)}"/>${[20,25,30,35,40,45].map(x => `<rect x="${x}" y="14.6" width="2.6" height="1.8" rx=".6" fill="#7fb0ff"/>`).join('')}<path d="M58.5 14.2c2.6.3 4.6 1 5.8 1.9h-7z" fill="#0a1c48"/><path d="M27 16 38 5h5l-5 11z" fill="${esc(c)}" opacity=".55"/></svg>`;
const camion = c => `<svg viewBox="0 0 70 34" aria-hidden="true"><rect x="2" y="5" width="40" height="19" rx="1" fill="${esc(c)}"/>${[8,14,20,26,32,38].map(x => `<line x1="${x}" y1="6.5" x2="${x}" y2="22.5" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`).join('')}<rect x="2" y="24" width="58" height="3" fill="#3a4766"/><path d="M44 10h12.5l8 7.5V27H44z" fill="#eaf2ff"/><path d="M56 12.2h.4l6 5.3H56z" fill="#0a1c48"/><rect x="44" y="20" width="21" height="2" fill="${esc(c)}"/><circle cx="10" cy="28.5" r="4" fill="#0b0f1a" stroke="#8fa7d8" stroke-width="1.4"/><circle cx="19" cy="28.5" r="4" fill="#0b0f1a" stroke="#8fa7d8" stroke-width="1.4"/><circle cx="50" cy="28.5" r="4" fill="#0b0f1a" stroke="#8fa7d8" stroke-width="1.4"/><circle cx="60" cy="28.5" r="4" fill="#0b0f1a" stroke="#8fa7d8" stroke-width="1.4"/><rect x="63" y="22" width="3" height="2" fill="#ffc94d"/></svg>`;
const AEROPUERTOS = ['Lima','Bogotá','Panamá','Miami','Nueva York','Madrid','París','Fráncfort','Dubái','Delhi','Shanghái','Tokio','Seúl','Sídney','Los Ángeles'];
const CIUDADES = ['Callao','Lima','Huacho','Chimbote','Trujillo','Chiclayo','Piura','Tumbes','Huaquillas','Guayaquil','Quito','Cali','Bogotá','Caracas','Panamá'];
const RUTAS = {
  contenedores: { stops: PUERTOS, veh: ship, pista: 'sea', obst: 'ADUANA', held: 'Retenido en aduana', titulo: 'Carrera de Contenedores', etapa: 'Tramo',
    sub: 'Cada acierto acerca tu barco al puerto final. Sin acierto, te retienen en aduana.', resto: 'barcos más en ruta', lugar: ['puerto','puertos'], va: 'Navegando hacia', para: 'Detenido cerca de', fin: '¡llegaste al puerto final!',
    sonido: t => { t(98, 1.2, 'sawtooth', .06); t(131, 1.2, 'sawtooth', .05); } },
  viral: { stops: AEROPUERTOS, veh: avion, pista: 'sky', obst: 'CONTROL', held: 'En espera de pista', titulo: 'Carga Aérea', etapa: 'Vuelo',
    sub: 'Cada acierto lleva tu avión al siguiente aeropuerto. Sin acierto, quedas en espera de pista.', resto: 'aviones más en vuelo', lugar: ['aeropuerto','aeropuertos'], va: 'Volando hacia', para: 'En espera en', fin: '¡aterrizaste en el destino final!',
    sonido: t => { t(180, 1.4, 'sawtooth', .035, 0, 520); t(240, 1.2, 'triangle', .03, .1, 700); } },
  bolsa: { stops: CIUDADES, veh: camion, pista: 'road', obst: 'PEAJE', held: 'Detenido en el peaje', titulo: 'Ruta por Carretera', etapa: 'Tramo',
    sub: 'Cada acierto lleva tu camión a la siguiente ciudad. Sin acierto, te detienen en el peaje.', resto: 'camiones más en carretera', lugar: ['ciudad','ciudades'], va: 'Rodando hacia', para: 'Detenido cerca de', fin: '¡llegaste a la ciudad final!',
    sonido: t => { t(330, .35, 'square', .05); t(415, .35, 'square', .04); t(330, .5, 'square', .05, .45); t(415, .5, 'square', .04, .45); } }
};
function rkCarrera(k){ return function(el, L, ctx){ const R = RUTAS[k];
  const list = L.slice(0, 8), T = Math.max(1, ctx.total), MAX = T * 1050;
  const pct = s => 3 + 82 * Math.min(1, s / MAX); const nP = Math.min(R.stops.length, T + 1);
  const ports = Array.from({ length: nP }, (_, i) => ({ n: R.stops[i], x: 3 + 82 * i / (nP - 1) + 4 }));
  const obst = [1 / 3, 2 / 3].map(f => 3 + 82 * (Math.max(.5, Math.round((nP - 1) * f) - .5)) / (nP - 1) + 4);
  el.innerHTML = head(`${R.etapa} ${ctx.qi + 1} de ${T} · ${esc(ctx.titulo)}`, R.titulo, R.sub) +
    `<div class="tm-cont tm-${R.pista}"><div class="ports">${ports.map((p, i) => `<span style="left:${p.x}%" class="${i === 0 ? 'o' : i === nP - 1 ? 'f' : ''}">${esc(p.n)}</span>`).join('')}</div>
    ${list.map((p, li) => `<div class="lane ${li === 0 ? 'first' : ''} ${p.me ? 'me' : ''}"><div class="lane-l"><span class="rpos mono">${p.rank + 1}</span>${av(p)}<b>${esc(p.title)}</b></div>
      <div class="sea pista-${R.pista}">${ports.map(q => `<i class="pt" style="left:${q.x}%"></i>`).join('')}${obst.map(a => `<i class="aduana" style="left:${a}%"><span>${R.obst}</span></i>`).join('')}
        <div class="ship veh-${R.pista} ${p.gain || ctx.qi < 0 ? '' : 'held'}" data-x="${pct(p.score)}" style="left:${pct(p.score - p.gain)}%">${R.veh(p.color)}${p.gain ? `<em class="sg">+${fmt(p.gain)}</em>` : (ctx.qi >= 0 ? `<em class="sh">${R.held}</em>` : '')}</div></div>
      <div class="lane-r mono">${fmt(p.score)}</div></div>`).join('')}</div>` +
    (L.length > list.length ? `<p class="note" style="margin:0">+ ${L.length - list.length} ${R.resto}</p>` : '');
  setTimeout(() => el.querySelectorAll('.ship').forEach(s => s.style.left = s.dataset.x + '%'), 300);
  if (ctx.tone) R.sonido(ctx.tone);
}; }
const rkCont = rkCarrera('contenedores');

/* ============ MODO VIRAL (seguidores y likes) ============ */
const SEG = 17;
const compact = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + ' M' : n >= 1e4 ? (n / 1e3).toFixed(1).replace('.0', '') + ' K' : fmt(n);
const HEART = '<svg viewBox="0 0 24 22"><path d="M12 21.6 10.3 20C4.2 14.5 0 10.7 0 6.2A6 6 0 0 1 6.1 0c2.3 0 4.4 1.1 5.9 2.8A7.9 7.9 0 0 1 17.9 0 6 6 0 0 1 24 6.2c0 4.5-4.2 8.3-10.3 13.8z"/></svg>';
function rkViral(el, L, ctx){
  const list = L.slice(0, 9);
  el.innerHTML = head(`Después de la pregunta ${ctx.qi + 1} · ${esc(ctx.titulo)}`, 'Modo Viral · ranking de marcas', 'Cada acierto suma seguidores. La marca líder es tendencia.') +
    `<div class="tm-viral">${list.map(p => { const f = p.score * SEG, f0 = (p.score - p.gain) * SEG;
      return `<div class="vcard ${p.rank === 0 && p.score > 0 ? 'trend' : ''} ${p.me ? 'me' : ''}" data-g="${p.gain}">
        ${p.rank === 0 && p.score > 0 ? '<span class="tbadge">TENDENCIA #1</span>' : `<span class="vpos mono">#${p.rank + 1}</span>`}
        <div class="vtop"><span class="vring"><span class="av" style="background:${esc(p.color)}">${esc(ini(p.title))}</span></span>
          <div style="min-width:0"><b>${esc(p.title)}</b><span class="hd">${esc(handle(p.title))}</span></div></div>
        <div class="vnum mono" data-from="${f0}" data-to="${f}">${compact(f0)}</div><span class="vlbl">seguidores</span>
        <div class="vstats"><span>${HEART} ${compact(p.score * 3)}</span><span>${p.gain ? `<em class="vgain">+${compact(p.gain * SEG)}</em>` : '<em class="vflat">sin alcance</em>'}</span></div>
        <div class="hearts"></div></div>`; }).join('')}</div>`;
  el.querySelectorAll('.vnum').forEach(n => { const a = +n.dataset.from, b = +n.dataset.to; if (a === b || reduce) { n.textContent = compact(b); return; } const t0 = performance.now() + 400;
    const step = now => { const k = Math.min(1, Math.max(0, (now - t0) / 1400)); const e = 1 - Math.pow(1 - k, 3); n.textContent = compact(a + (b - a) * e); if (k < 1 && vivo(n)) requestAnimationFrame(step); }; requestAnimationFrame(step); });
  if (!reduce) el.querySelectorAll('.vcard').forEach((c, ci) => { if (+c.dataset.g <= 0) return; const box = c.querySelector('.hearts');
    for (let i = 0; i < 10; i++) { const s = document.createElement('i'); s.innerHTML = HEART; s.style.left = (10 + Math.random() * 80) + '%'; s.style.animationDelay = (400 + ci * 90 + i * 110) + 'ms'; s.style.setProperty('--dx', ((Math.random() - .5) * 60) + 'px'); s.style.color = ['#ff4d8d', '#ff8fb1', '#ffc94d', '#3fe1ff'][i % 4]; box.appendChild(s); } });
  if (ctx.tone) [0, 1, 2, 3, 4].forEach(i => ctx.tone(900 + i * 140, .07, 'sine', .06, .45 + i * .11));
}

/* ============ BOLSA DE VALORES (gráfico de acciones) ============ */
const precio = s => 10 + s / 100;
function rkBolsa(el, L, ctx){
  const list = L.slice(0, 6); const n = Math.max(2, ...L.map(p => (p.hist || []).length));
  const serie = p => { const h = (p.hist && p.hist.length ? p.hist : [0, p.score]).slice(); while (h.length < n) h.unshift(0); return h.map(precio); };
  const chg = p => { const s = serie(p), a = s[s.length - 2] || 10, b = s[s.length - 1]; return (b - a) / a * 100; };
  const allMax = Math.max(12, ...list.map(p => precio(p.score))); const raw = (allMax - 10) / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))); const step = [1, 2, 5, 10].find(m => m * mag >= raw) * mag; const yMax = 10 + step * Math.ceil((allMax - 10) / step);
  const W = 640, H = 300, pl = 46, pr = 86, pt = 14, pb = 26; const X = i => pl + (W - pl - pr) * i / (n - 1), Y = v => pt + (H - pt - pb) * (1 - (v - 10) / (yMax - 10));
  const ticks = []; for (let v = 10; v <= yMax + 1e-9; v += step) ticks.push(v);
  const ends = list.map(p => ({ p, y: Y(precio(p.score)) })).sort((a, b) => a.y - b.y); for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
  const tape = L.map(p => { const c = chg(p); return `<span><b>${ticker(p.title)}</b> S/ ${precio(p.score).toFixed(2)} <em class="${c > 0 ? 'up' : c < 0 ? 'down' : ''}">${c > 0 ? '▲' : c < 0 ? '▼' : '■'} ${Math.abs(c).toFixed(1)}%</em></span>`; }).join('');
  el.innerHTML = `<div class="tape" aria-hidden="true"><div>${tape}${tape}</div></div>` + head(`Sesión ${ctx.qi + 1} de ${ctx.total} · ${esc(ctx.titulo)}`, 'Bolsa de Valores · cotización en vivo', 'Cada acierto sube el precio de tu acción. Todas abren en S/ 10.00.') +
    `<div class="tm-bolsa"><div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de cotización por empresa">
      ${ticks.map(v => `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end" class="ax">${step < 1 ? v.toFixed(1) : v.toFixed(0)}</text>`).join('')}
      ${Array.from({ length: n }, (_, i) => `<text x="${X(i)}" y="${H - 6}" text-anchor="middle" class="ax">${i === 0 ? 'Apertura' : 'P' + i}</text>`).join('')}
      ${list.slice().reverse().map(p => { const s = serie(p); const d = s.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
        return `<path d="${d}" pathLength="1" class="ln ${p.rank === 0 ? 'lead' : ''}" style="stroke:${esc(p.color)}"/><circle cx="${X(n - 1)}" cy="${Y(s[n - 1])}" r="${p.rank === 0 ? 5 : 3.5}" fill="${esc(p.color)}" class="dot"/>`; }).join('')}
      ${ends.map(e => `<text x="${W - pr + 8}" y="${e.y + 4}" class="lb" style="fill:${esc(e.p.color)}">${ticker(e.p.title)} ${precio(e.p.score).toFixed(2)}</text>`).join('')}
    </svg></div>
    <table class="quotes"><thead><tr><th>#</th><th>Acción</th><th>Precio</th><th>Var.</th></tr></thead><tbody>${list.map(p => { const c = chg(p);
      return `<tr class="${p.me ? 'me' : ''}"><td class="mono">${p.rank + 1}</td><td><span class="tk" style="border-color:${esc(p.color)}">${ticker(p.title)}</span><span class="nm">${esc(p.title)}</span></td><td class="mono">${precio(p.score).toFixed(2)}</td><td class="mono ${c > 0 ? 'up' : c < 0 ? 'down' : ''}">${c > 0 ? '▲' : c < 0 ? '▼' : '■'} ${Math.abs(c).toFixed(1)}%</td></tr>`; }).join('')}</tbody></table></div>`;
  requestAnimationFrame(() => el.querySelectorAll('.ln').forEach((l, i) => { l.style.transitionDelay = (i * 120) + 'ms'; l.classList.add('on'); }));
}
function campana(tone){ if (!tone) return; [0, .45, .9].forEach(w => { tone(1568, 1.4, 'sine', .09, w); tone(2349, 1, 'sine', .04, w); tone(784, 1.6, 'triangle', .05, w); }); }


/* ============ MINI VISTAS PARA EL CELULAR ============
   me: {id,title,color,score,gain,hits,hist,rank,jugadores}  ctx: {qi,total} */
function marketsOf(id, n){ const r = rng(hash(id)); return MERCADOS.map((m, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, Math.min(n || 0, MERCADOS.length)); }
function miniRuta(el, me){
  const mk = marketsOf(me.id, me.hits); const nuevo = me.gain > 0 && mk.length ? MERCADOS[mk[mk.length - 1]].n : '';
  el.innerHTML = `<div class="mini-map"><canvas aria-label="Tu mapa de mercados abiertos"></canvas></div>
    <div class="mini-cap"><b>${mk.length}</b> ${mk.length === 1 ? 'mercado abierto' : 'mercados abiertos'}${nuevo ? ` · nueva bandera en <b>${esc(nuevo)}</b>` : ''}</div>`;
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
  const w = cv.clientWidth || 280, h = w * (MAPA.lat0 - MAPA.lat1) / 360; cv.style.height = h + 'px'; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const P = (la, lo) => [(lo + 180) / 360 * w, (MAPA.lat0 - la) / (MAPA.lat0 - MAPA.lat1) * h]; const pts = land(); const t0 = performance.now();
  const [lx, ly] = P(LIMA.la, LIMA.lo);
  function draw(now){ if (!vivo(cv)) return; const t = now - t0; g.clearRect(0, 0, w, h); const cw = w / MAPA.W, ch = h / MAPA.H;
    g.fillStyle = 'rgba(120,170,255,.35)'; for (const [c, r] of pts) g.fillRect(c * cw, r * ch, Math.max(1, cw * .55), Math.max(1, ch * .55));
    mk.forEach((mi, k) => { const m = MERCADOS[mi]; const [x, y] = P(m.la, m.lo); const nw = me.gain > 0 && k === mk.length - 1; const e = nw ? Math.min(1, Math.max(0, (t - 300) / 700)) : 1; if (e <= 0) return;
      const mx = (lx + x) / 2, my = (ly + y) / 2 - Math.hypot(x - lx, y - ly) * .28; g.strokeStyle = me.color; g.globalAlpha = .6; g.lineWidth = 1; g.beginPath(); g.moveTo(lx, ly);
      for (let s = 1; s <= 24 * e; s++) { const u = s / 24; g.lineTo((1 - u) * (1 - u) * lx + 2 * (1 - u) * u * mx + u * u * x, (1 - u) * (1 - u) * ly + 2 * (1 - u) * u * my + u * u * y); } g.stroke(); g.globalAlpha = 1;
      const d = nw ? (1 - e) * -26 : 0; g.strokeStyle = '#eaf2ff'; g.beginPath(); g.moveTo(x, y + d); g.lineTo(x, y + d - 11); g.stroke(); g.fillStyle = me.color; g.beginPath(); g.moveTo(x, y + d - 11); g.lineTo(x + 8, y + d - 8.5); g.lineTo(x, y + d - 6); g.closePath(); g.fill();
      if (nw && e >= 1) { const k2 = Math.min(1, (t - 1000) / 900); if (k2 > 0 && k2 < 1) { g.strokeStyle = me.color; g.globalAlpha = 1 - k2; g.beginPath(); g.arc(x, y, 3 + k2 * 14, 0, 7); g.stroke(); g.globalAlpha = 1; } } });
    g.fillStyle = '#ffc94d'; g.beginPath(); g.arc(lx, ly, 3.5, 0, 7); g.fill();
    if (t < 2200) requestAnimationFrame(draw); }
  requestAnimationFrame(draw);
}
function miniCarrera(k){ return function(el, me, ctx){ const R = RUTAS[k];
  const T = Math.max(1, ctx.total), MAX = T * 1050, nP = Math.min(R.stops.length, T + 1); const f = s => Math.min(1, s / MAX); const pct = s => 3 + 78 * f(s);
  const idx = Math.min(nP - 1, Math.floor(f(me.score) * (nP - 1) + 1e-9)); const falta = nP - 1 - idx;
  el.innerHTML = `<div class="sea mini-sea pista-${R.pista}">${Array.from({ length: nP }, (_, i) => `<i class="pt" style="left:${3 + 78 * i / (nP - 1) + 4}%"></i>`).join('')}
      <div class="ship veh-${R.pista} ${me.gain || ctx.qi < 0 ? '' : 'held'}" data-x="${pct(me.score)}" style="left:${pct(me.score - me.gain)}%">${R.veh(me.color)}</div></div>
    <div class="mini-cap">${me.gain ? R.va : R.para} <b>${esc(R.stops[Math.min(nP - 1, idx + (me.gain ? 1 : 0))])}</b> · ${falta ? `faltan ${falta} ${falta === 1 ? R.lugar[0] : R.lugar[1]} para ${esc(R.stops[nP - 1])}` : R.fin}</div>`;
  setTimeout(() => { const s = el.querySelector('.ship'); if (s) s.style.left = s.dataset.x + '%'; }, 250);
}; }
const miniCont = miniCarrera('contenedores');
function miniViral(el, me){
  const f = me.score * SEG, f0 = (me.score - me.gain) * SEG;
  el.innerHTML = `<div class="vcard ${me.rank === 0 && me.score > 0 ? 'trend' : ''} mini-v">${me.rank === 0 && me.score > 0 ? '<span class="tbadge">TENDENCIA #1</span>' : `<span class="vpos mono">#${me.rank + 1}</span>`}
    <div class="vtop"><span class="vring"><span class="av" style="background:${esc(me.color)}">${esc(ini(me.title))}</span></span><div style="min-width:0"><b>${esc(me.title)}</b><span class="hd">${esc(handle(me.title))}</span></div></div>
    <div class="vnum mono">${compact(f0)}</div><span class="vlbl">seguidores</span>
    <div class="vstats"><span>${HEART} ${compact(me.score * 3)}</span><span>${me.gain ? `<em class="vgain">+${compact(me.gain * SEG)}</em>` : '<em class="vflat">sin alcance</em>'}</span></div><div class="hearts"></div></div>`;
  const n = el.querySelector('.vnum'); if (f !== f0 && !reduce) { const t0 = performance.now() + 250; const step = now => { const k = Math.min(1, Math.max(0, (now - t0) / 1300)); n.textContent = compact(f0 + (f - f0) * (1 - Math.pow(1 - k, 3))); if (k < 1 && vivo(n)) requestAnimationFrame(step); }; requestAnimationFrame(step); } else n.textContent = compact(f);
  if (me.gain > 0 && !reduce) { const box = el.querySelector('.hearts'); for (let i = 0; i < 12; i++) { const s = document.createElement('i'); s.innerHTML = HEART; s.style.left = (8 + Math.random() * 84) + '%'; s.style.animationDelay = (300 + i * 100) + 'ms'; s.style.setProperty('--dx', ((Math.random() - .5) * 50) + 'px'); s.style.color = ['#ff4d8d', '#ffc94d', '#3fe1ff', '#8c6bff'][i % 4]; box.appendChild(s); } }
}
function miniBolsa(el, me){
  const h = (me.hist && me.hist.length > 1 ? me.hist : [0, me.score]).map(precio); const n = h.length; const W = 300, H = 96, p = 6;
  const lo = 10, hi = Math.max(12, ...h) * 1.05; const X = i => p + (W - 2 * p) * i / (n - 1), Y = v => p + (H - 2 * p) * (1 - (v - lo) / (hi - lo));
  const a = h[n - 2] ?? 10, b = h[n - 1]; const c = (b - a) / a * 100; const d = h.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  el.innerHTML = `<div class="mini-stock"><div><span class="tk" style="border-color:${esc(me.color)}">${ticker(me.title)}</span><b class="mono">S/ ${b.toFixed(2)}</b><em class="mono ${c > 0 ? 'up' : c < 0 ? 'down' : ''}">${c > 0 ? '▲' : c < 0 ? '▼' : '■'} ${Math.abs(c).toFixed(1)}%</em></div>
    <svg viewBox="0 0 ${W} ${H}" aria-label="Cotización de tu acción"><path d="${d} L${X(n - 1)} ${H} L${X(0)} ${H}Z" fill="${esc(me.color)}" opacity=".14"/><path d="${d}" pathLength="1" class="ln" style="stroke:${esc(me.color)}"/><circle cx="${X(n - 1)}" cy="${Y(b)}" r="4" fill="${esc(me.color)}" class="dot"/></svg>
    <span class="mini-cap">Apertura S/ 10.00 · puesto ${me.rank + 1} de ${me.jugadores}</span></div>`;
  requestAnimationFrame(() => { const l = el.querySelector('.ln'); if (l) l.classList.add('on'); });
}
function miniImperio(el, me, ctx){
  const pct = Math.min(100, me.score / (Math.max(1, ctx.total) * 1150) * 100);
  el.innerHTML = `<div class="mini-cap" style="display:flex;justify-content:space-between"><span>Valor de mercado</span><b class="mono">${fmt(me.score)}</b></div><div class="rbar mini-bar"><i style="width:${me.gain ? Math.max(0, (me.score - me.gain) / (Math.max(1, ctx.total) * 1150) * 100) : pct}%" data-w="${pct}"></i></div>`;
  setTimeout(() => { const i = el.querySelector('.mini-bar i'); if (i) i.style.width = i.dataset.w + '%'; }, 250);
}

/* ============ LAS 4 CARRERAS (rotativo) ============ */
const MIX = ['ruta','contenedores','viral','bolsa'];
function rkMixto(el, L, ctx){ const k = MIX[((ctx.qi % 4) + 4) % 4], t = window.IG_TEMAS[k];
  el.innerHTML = `<div class="mix-banner" style="--tc:${t.color}"><span class="ti">${t.ico}</span><span>Escenario ${MIX.indexOf(k) + 1} de 4 · <b>${esc(t.carrera)}</b> · ${esc(t.nombre)}</span><span class="mix-dots">${MIX.map(x => `<i class="${x === k ? 'on' : ''}" style="--c:${window.IG_TEMAS[x].color}"></i>`).join('')}</span></div><div class="tema-body"></div>`;
  const body = el.querySelector('.tema-body'); body.style.setProperty('--tm', t.color); t.ranking(body, L, ctx); }
window.IG_TEMA_PARA = (temaSala, carrera, qi) => { const T = window.IG_TEMAS; if (temaSala !== 'mixto') return T[temaSala] || T.imperio; if (carrera && T[carrera]) return T[carrera]; return T[MIX[((qi || 0) % 4 + 4) % 4]]; };
window.IG_CARRERAS = MIX;

window.IG_TEMAS = {
  imperio:      { id:'imperio', mini:miniImperio, detalle:(g,s)=>`Valor de mercado: ${fmt(s)}`, ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg>', nombre:'Imperio Global', carrera:'Todas las carreras', color:'#ffc94d', desc:'Cada estudiante funda una empresa que crece con sus aciertos.', ranking:rkImperio,
                  ok:'¡Tu empresa crece!', mal:'Tu empresa no avanzó', unidad:'pts', podio:'Las empresas más valiosas' },
  ruta:         { id:'ruta', mini:miniRuta, detalle:(g,s)=>g?'Plantaste una bandera en un mercado nuevo':'Tu bandera espera la siguiente pregunta', ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>', nombre:'Ruta Global', carrera:'Negocios Internacionales', color:'#3fe1ff', desc:'Cada acierto abre un mercado y planta tu bandera en el mapa.', ranking:rkRuta,
                  ok:'¡Mercado abierto!', mal:'No abriste mercado', unidad:'pts', podio:'Conquistadores de mercados' },
  contenedores: { id:'contenedores', mini:miniCont, detalle:(g,s)=>g?'Tu barco avanza hacia el siguiente puerto':'Tu barco se quedó en aduana esta ronda', ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 15h20l-3 5H5zM5 15V9h4v6M10 15V7h4v8M15 15v-5h4v5"/></svg>', nombre:'Carrera de Contenedores', carrera:'Logística', color:'#ff8a3d', desc:'Barcos que avanzan de puerto en puerto. Sin acierto, te retienen en aduana.', ranking:rkCont,
                  ok:'¡Avanzas al siguiente puerto!', mal:'Retenido en aduana', unidad:'pts', podio:'Primeros en llegar a puerto' },
  viral:        { id:'viral', mini:miniCarrera('viral'), detalle:(g,s)=>g?'Tu avión vuela al siguiente aeropuerto':'Tu avión quedó en espera de pista', ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 13.5 21 8.5c.9-.2 1.6.9.8 1.5L11 17l-4 4-1-1 1.5-4.5-4.6-1.2z"/><path d="M9 11 6.5 5.5 8 5l5 4.6"/></svg>', nombre:'Carga Aérea', carrera:'Marketing', color:'#a98bff', desc:'Aviones de carga que vuelan de aeropuerto en aeropuerto. Sin acierto, quedas en espera de pista.', ranking:rkCarrera('viral'),
                  ok:'¡Despegaste al siguiente destino!', mal:'En espera de pista', unidad:'pts', podio:'Primeros en aterrizar' },
  bolsa:        { id:'bolsa', mini:miniCarrera('bolsa'), detalle:(g,s)=>g?'Tu camión avanza a la siguiente ciudad':'Tu camión se quedó en el peaje', ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>', nombre:'Ruta por Carretera', carrera:'Administración', color:'#2cf0c2', desc:'Camiones con contenedor que avanzan por la Panamericana. Sin acierto, te detienen en el peaje.', ranking:rkCarrera('bolsa'),
                  ok:'¡Avanzas por la carretera!', mal:'Detenido en el peaje', unidad:'pts', podio:'Primeros en llegar a destino' }
};
window.IG_TEMAS.mixto = { id:'mixto', mini:null, ico:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>',
  nombre:'Las 4 carreras', carrera:'Clase mixta', color:'#7fb0ff', desc:'El ranking cambia de escenario en cada pregunta: mapa, barcos, aviones y camiones. Cada estudiante elige su carrera.', ranking:rkMixto,
  ok:'¡Respuesta correcta!', mal:'Esta vez no', unidad:'pts', podio:'Campeones de las 4 carreras', detalle:(g,s)=>`Puntaje: ${fmt(s)}`, apertura:campana, cierre:campana };
window.IG_TEMAS_ORDEN = ['mixto','imperio','ruta','contenedores','viral','bolsa'];
window.IG_TEMA_SEG = SEG;
})();
