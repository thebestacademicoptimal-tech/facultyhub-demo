/* IM // TERMINAL · Registro de laboratorio completado (suma al Pasaporte Exportador)
   Se agrega a la barra superior de cada laboratorio (#im-back). */
(function(){
  const CFG = window.JUEGOS_CONFIG || {};
  const m = location.pathname.match(/sem(\d)-(\d)-/); if (!m || !CFG.url) return;
  const SEM = +m[1], LAB = m[1] + '.' + m[2];
  const bar = document.getElementById('im-back'); if (!bar) return;
  const get = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const css = document.createElement('style');
  css.textContent = `
  #imlab-btn{margin-left:auto;display:inline-flex;align-items:center;gap:7px;border:0;cursor:pointer;font:700 12.5px/1 system-ui,'Segoe UI',sans-serif;letter-spacing:.02em;
    padding:8px 13px;border-radius:999px;color:#1d1300;background:linear-gradient(135deg,#ffe08a,#ffb020);box-shadow:0 4px 14px rgba(255,176,32,.35);white-space:nowrap;}
  #imlab-btn:hover{filter:brightness(1.06)}
  #imlab-btn.done{color:#03251c;background:linear-gradient(135deg,#86efac,#34d399);box-shadow:0 4px 14px rgba(52,211,153,.35)}
  #imlab-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}
  #imlab-pop{position:fixed;top:52px;right:12px;z-index:100000;width:min(340px,calc(100vw - 24px));padding:18px;border-radius:16px;
    background:#0b1430;color:#eef3ff;box-shadow:0 0 0 1px rgba(120,160,220,.25),0 24px 60px rgba(0,0,0,.5);font:15px/1.5 system-ui,'Segoe UI',sans-serif}
  #imlab-pop[hidden]{display:none}
  #imlab-pop h4{font-size:16px;margin:0 0 4px}
  #imlab-pop p{margin:0 0 12px;color:#a9b6d3;font-size:13.5px}
  #imlab-pop label{display:block;font-size:12.5px;font-weight:600;color:#a9b6d3;margin:8px 0 4px}
  #imlab-pop input[type=text],#imlab-pop input[type=password]{width:100%;box-sizing:border-box;font:inherit;font-size:16px;color:#eef3ff;background:#050a18;border:1px solid rgba(120,160,220,.3);border-radius:10px;padding:10px 12px}
  #imlab-pop .rec{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px;color:#a9b6d3}
  #imlab-pop .acts{display:flex;gap:8px;margin-top:14px}
  #imlab-pop button{font:700 14px system-ui,sans-serif;border:0;border-radius:10px;padding:10px 14px;cursor:pointer}
  #imlab-pop .ok{flex:1;color:#1d1300;background:linear-gradient(135deg,#ffe08a,#ffb020)}
  #imlab-pop .no{color:#eef3ff;background:rgba(255,255,255,.08)}
  #imlab-pop .err{color:#f87171;font-size:13px;font-weight:600;min-height:18px;margin-top:8px}
  #imlab-toast{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:100001;display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:16px;
    background:#0b1430;color:#eef3ff;box-shadow:0 0 0 1px rgba(255,201,77,.45),0 24px 60px rgba(0,0,0,.5);font:15px/1.4 system-ui,sans-serif;max-width:calc(100vw - 24px);animation:imlabIn .5s cubic-bezier(.3,1.5,.5,1)}
  #imlab-toast b{color:#ffc94d}
  #imlab-toast svg{width:54px;height:54px;flex:none;color:#ffc94d;animation:imlabStamp .6s .15s cubic-bezier(.3,1.7,.5,1) backwards}
  @keyframes imlabIn{from{opacity:0;transform:translate(-50%,-14px)}}
  @keyframes imlabStamp{from{transform:scale(2.2) rotate(-25deg);opacity:0}}
  @media print{#imlab-btn,#imlab-pop,#imlab-toast{display:none!important}}
  @media (max-width:520px){#im-back span{display:none}}`;
  document.head.appendChild(css);

  const btn = document.createElement('button'); btn.id = 'imlab-btn'; btn.type = 'button';
  bar.appendChild(btn);
  const pp = get('im_pp');
  const cache = () => (pp && get('im_labs_' + String(pp.c).toUpperCase())) || [];
  function pintarBtn(done){ btn.classList.toggle('done', done);
    btn.innerHTML = done ? '✓ Laboratorio ' + LAB + ' completado' : '✓ Marcar laboratorio ' + LAB + ' como completado';
    btn.title = done ? 'Ya está en tu Pasaporte Exportador' : 'Suma 100 puntos y avanza tu Pasaporte Exportador'; }
  pintarBtn(cache().includes(LAB));

  const pop = document.createElement('form'); pop.id = 'imlab-pop'; pop.hidden = true; pop.autocomplete = 'off';
  pop.innerHTML = `<h4>Registrar laboratorio ${LAB}</h4><p>Ingresa tu código y el PIN que usas en Habilidades. Suma <b style="color:#ffc94d">100 puntos</b> la primera vez.</p>
    <label for="imlabCod">Código de alumno</label><input type="text" id="imlabCod" autocapitalize="characters" required>
    <label for="imlabPin">PIN de 4 dígitos</label><input type="password" id="imlabPin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required>
    <label class="rec"><input type="checkbox" id="imlabRec" checked> Recordar en este dispositivo</label>
    <div class="err" id="imlabErr" role="status"></div>
    <div class="acts"><button type="button" class="no" id="imlabNo">Cancelar</button><button type="submit" class="ok" id="imlabOk">Registrar</button></div>`;
  document.body.appendChild(pop);
  const $ = id => document.getElementById(id);
  if (pp && pp.c) $('imlabCod').value = pp.c;

  const SELLO = '<svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="44" fill="none" stroke="currentColor" stroke-width="4"/><circle r="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4"/><path d="M-16 1 -4 13 18-12" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function toast(html){ const old = $('imlab-toast'); if (old) old.remove(); const t = document.createElement('div'); t.id = 'imlab-toast'; t.setAttribute('role','status'); t.innerHTML = SELLO + '<div>' + html + '</div>'; document.body.appendChild(t); setTimeout(() => t.remove(), 5200); }

  async function registrar(c, k, recordar){
    $('imlabErr').textContent = ''; $('imlabOk').disabled = true; btn.disabled = true;
    try {
      const r = await fetch(CFG.url + '/rest/v1/rpc/juego_lab_completar', { method:'POST', headers:{ apikey:CFG.anonKey, Authorization:'Bearer ' + CFG.anonKey, 'Content-Type':'application/json' },
        body: JSON.stringify({ p_codigo:c, p_clave:k, p_lab:LAB, p_semana:SEM }) });
      const d = await r.json();
      if (!d.ok){ pop.hidden = false; $('imlabErr').textContent = d.error === 'bloqueado' ? 'Demasiados intentos. Espera 10 minutos o pide a tu docente que reinicie tu PIN.' : 'Código o PIN incorrecto. Si aún no tienes PIN, créalo entrando a un juego de Habilidades.'; if (get('im_pp')) try { localStorage.removeItem('im_pp'); } catch(e){} return; }
      if (recordar) set('im_pp', { c, k });
      set('im_labs_' + String(c).toUpperCase(), d.labs || []);
      pop.hidden = true; pintarBtn(true);
      toast(d.nuevo ? `<b>¡Laboratorio ${LAB} registrado!</b><br>+100 puntos para ${esc(d.empresa || d.nombre)}. Ya está en tu Pasaporte Exportador.` : `<b>Laboratorio ${LAB} ya estaba registrado</b><br>Llevas ${(d.labs || []).length} laboratorios completados.`);
    } catch(e){ pop.hidden = false; $('imlabErr').textContent = 'No se pudo conectar. Revisa tu internet e inténtalo otra vez.'; }
    finally { $('imlabOk').disabled = false; btn.disabled = false; }
  }
  btn.addEventListener('click', () => { const g = get('im_pp'); if (g && g.c && g.k) registrar(g.c, g.k, true); else { pop.hidden = !pop.hidden; if (!pop.hidden) $(pp && pp.c ? 'imlabPin' : 'imlabCod').focus(); } });
  $('imlabNo').onclick = () => { pop.hidden = true; };
  pop.addEventListener('submit', e => { e.preventDefault(); registrar($('imlabCod').value.trim(), $('imlabPin').value.trim(), $('imlabRec').checked); });
})();
