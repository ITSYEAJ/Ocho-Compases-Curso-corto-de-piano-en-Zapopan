(() => {
  'use strict';

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const punteroFino = window.matchMedia('(pointer: fine)');
  const dinero = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 });
  const PRECIO = { curso: 86000, pago: 46000, renta: 9500 };
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const NS = 'http://www.w3.org/2000/svg';
  const fechaLarga = fecha => `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  const mayuscula = texto => texto.charAt(0).toUpperCase() + texto.slice(1);
  const inicioDia = fecha => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const limitar = (v, min, max) => Math.min(max, Math.max(min, v));
  const svgEl = (etiqueta, atributos = {}) => {
    const el = document.createElementNS(NS, etiqueta);
    Object.entries(atributos).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  const capsula = $('#capsula');
  const avancePagina = $('#avancePagina');
  const menuBoton = $('#menuBoton');
  const menu = $('#menu');

  function cerrarMenu() {
    menu.classList.remove('abierto');
    menuBoton.setAttribute('aria-expanded', 'false');
    menuBoton.setAttribute('aria-label', 'Abrir menú');
  }

  menuBoton.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    menuBoton.setAttribute('aria-expanded', String(abierto));
    menuBoton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  menu.addEventListener('click', evento => {
    if (evento.target.closest('a')) cerrarMenu();
  });

  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && menu.classList.contains('abierto')) {
      cerrarMenu();
      menuBoton.focus();
    }
  });

  let cuadroScroll = 0;
  function alHacerScroll() {
    cuadroScroll = 0;
    const maximo = document.documentElement.scrollHeight - window.innerHeight;
    avancePagina.style.setProperty('--avance', maximo > 0 ? (window.scrollY / maximo).toFixed(4) : '0');
    capsula.classList.toggle('compacta', window.scrollY > 40);
  }
  window.addEventListener('scroll', () => {
    if (!cuadroScroll) cuadroScroll = requestAnimationFrame(alHacerScroll);
  }, { passive: true });
  alHacerScroll();

  const enlacesNav = $$('.nav__lista a[href^="#"]');
  const observadorNav = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) enlacesNav.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === `#${entrada.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  enlacesNav.forEach(a => {
    const seccion = document.querySelector(a.getAttribute('href'));
    if (seccion) observadorNav.observe(seccion);
  });

  const logo = $('#logo');
  const ctxLogo = logo.getContext('2d');
  const estadoLogo = { pulso: 0, destello: 0, cuadro: 0 };

  const hexARgb = hex => {
    const n = parseInt(hex.replace('#', '').trim(), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  function coloresPaleta() {
    const estilos = getComputedStyle(document.body);
    return ['--color-1', '--color-2', '--color-3'].map(v => estilos.getPropertyValue(v).trim());
  }

  function dibujarLogo() {
    const tam = 56;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (logo.width !== Math.round(tam * dpr)) {
      logo.width = Math.round(tam * dpr);
      logo.height = Math.round(tam * dpr);
    }
    const [c1, c2, c3] = coloresPaleta();
    const ctx = ctxLogo;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, tam, tam);

    ctx.beginPath();
    ctx.arc(28, 28, 27.5, 0, Math.PI * 2);
    ctx.fillStyle = c1;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(28, 28, 24.5, 0, Math.PI * 2);
    ctx.strokeStyle = c3;
    ctx.lineWidth = 1.6 + estadoLogo.pulso * 2.4;
    ctx.globalAlpha = 0.75 + estadoLogo.pulso * 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    const a = hexARgb(c2);
    const b = hexARgb(c3);
    const t = estadoLogo.destello;
    const color = `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(', ')})`;
    ctx.save();
    ctx.translate(0, -3.5 * t);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.ellipse(24.2, 36.2, 6.6, 4.7, -0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30.3, 35);
    ctx.lineTo(30.3, 13.5);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(30.3, 13.8);
    ctx.bezierCurveTo(31.5, 18.5, 38.5, 19.5, 38.2, 25.5);
    ctx.bezierCurveTo(38, 28, 36.8, 29.6, 35.6, 30.6);
    ctx.stroke();
    ctx.restore();
  }

  function animarLogo() {
    estadoLogo.pulso *= 0.86;
    estadoLogo.destello *= 0.88;
    dibujarLogo();
    if (estadoLogo.pulso > 0.02 || estadoLogo.destello > 0.02) {
      estadoLogo.cuadro = requestAnimationFrame(animarLogo);
    } else {
      estadoLogo.pulso = 0;
      estadoLogo.destello = 0;
      estadoLogo.cuadro = 0;
      dibujarLogo();
    }
  }

  function avisarLogo(tipo, fuerza = 1) {
    if (movimientoReducido.matches) return;
    if (tipo === 'pulso') estadoLogo.pulso = fuerza;
    else estadoLogo.destello = fuerza;
    if (!estadoLogo.cuadro) estadoLogo.cuadro = requestAnimationFrame(animarLogo);
  }

  dibujarLogo();
  if (document.fonts) document.fonts.ready.then(dibujarLogo);

  let audio = null;
  function contextoAudio() {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return null;
    if (!audio) audio = new Contexto();
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  const frecuencia = midi => 440 * Math.pow(2, (midi - 69) / 12);

  function sonarNota(midi, cuando = 0, forzar = false) {
    if (!forzar && !$('#conSonido').checked) return;
    const ac = contextoAudio();
    if (!ac) return;
    const t = Math.max(ac.currentTime, cuando || ac.currentTime);
    const f = frecuencia(midi);
    const salida = ac.createGain();
    salida.gain.setValueAtTime(0.0001, t);
    salida.gain.exponentialRampToValueAtTime(0.3, t + 0.008);
    salida.gain.exponentialRampToValueAtTime(0.1, t + 0.35);
    salida.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    const filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(Math.min(9000, f * 9), t);
    filtro.frequency.exponentialRampToValueAtTime(Math.max(500, f * 2.2), t + 1.2);
    filtro.connect(salida).connect(ac.destination);
    [[1, 'triangle', 0.6], [2, 'sine', 0.24], [3, 'sine', 0.09], [4.01, 'sine', 0.04]].forEach(([multiplo, forma, volumen]) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = forma;
      osc.frequency.setValueAtTime(f * multiplo, t);
      g.gain.value = volumen;
      osc.connect(g).connect(filtro);
      osc.start(t);
      osc.stop(t + 1.9);
    });
  }

  const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const SOLFEO = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
  const SEMITONO = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const aMidi = nota => {
    const [, letra, sostenido, octava] = nota.match(/^([A-G])(#?)(\d)$/);
    return 12 * (Number(octava) + 1) + SEMITONO[letra] + (sostenido ? 1 : 0);
  };
  const nombreNota = nota => {
    const [, letra, sostenido] = nota.match(/^([A-G])(#?)(\d)$/);
    return `${SOLFEO[letra]}${sostenido ? ' sostenido' : ''}`;
  };
  const nombreCorto = nota => {
    const [, letra, sostenido] = nota.match(/^([A-G])(#?)(\d)$/);
    return `${SOLFEO[letra]}${sostenido ? '♯' : ''}`;
  };
  const pasoDiatonico = nota => {
    const [, letra, , octava] = nota.match(/^([A-G])(#?)(\d)$/);
    return Number(octava) * 7 + LETRAS.indexOf(letra) - (4 * 7 + 2);
  };
  const midiDesdePaso = paso => {
    const tabla = [0, 1, 3, 5, 7, 8, 10];
    const octava = Math.floor(paso / 7);
    return 64 + octava * 12 + tabla[((paso % 7) + 7) % 7];
  };
  const CLAVE_SOL = 'M34 128C26 132 18 124 24 118M30 126 36 30C38 16 50 20 44 34 38 48 18 60 16 78 14 96 30 104 42 98 54 90 50 72 36 74 26 76 24 88 32 92';
  const CORCHEA = '<svg viewBox="0 0 26 34" aria-hidden="true"><ellipse cx="9" cy="27" rx="7.5" ry="5.4" transform="rotate(-22 9 27)" fill="currentColor"/><path d="M15.5 26V3c3 4 10 6 9 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

  const partituraPortada = $('#partituraPortada');
  (function dibujarPortada() {
    const lineas = [70, 92, 114, 136, 158];
    lineas.forEach(y => partituraPortada.append(svgEl('line', { class: 'pp-linea', x1: 10, x2: 630, y1: y, y2: y })));
    const clave = svgEl('path', { class: 'pp-clave', d: CLAVE_SOL, transform: 'translate(4 -8) scale(1.45)' });
    partituraPortada.append(clave);
    const notas = ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'];
    notas.forEach((nota, i) => {
      const paso = pasoDiatonico(nota);
      const x = 120 + i * 62;
      const y = 158 - paso * 11;
      const g = svgEl('g', { class: 'pp-nota' });
      g.style.setProperty('--n', i);
      if (y > 158) g.append(svgEl('line', { x1: x - 20, x2: x + 20, y1: 180, y2: 180, 'stroke-width': 2 }));
      g.append(svgEl('ellipse', { cx: x, cy: y, rx: 13, ry: 9.5, transform: `rotate(-20 ${x} ${y})`, stroke: 'none' }));
      g.append(svgEl('line', { x1: x + 12, x2: x + 12, y1: y - 3, y2: y - 62, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      const texto = svgEl('text', { class: 'pp-texto', x, y: 222 });
      texto.textContent = nombreCorto(nota);
      g.append(texto);
      partituraPortada.append(g);
    });
  })();

  const tecladoPortada = $('#tecladoPortada');
  const notasFlotantes = $('#notasFlotantes');
  const pistaPortada = $('#pistaPortada');
  const teclasPortada = new Map();
  (function crearPortada() {
    const blancas = [];
    for (let o = 3; o <= 5; o++) LETRAS.forEach(l => blancas.push(`${l}${o}`));
    const ancho = 1470 / blancas.length;
    const grupoNegras = svgEl('g');
    blancas.forEach((nota, i) => {
      const x = i * ancho;
      const rect = svgEl('rect', { class: 'tp-blanca', x: x.toFixed(2), y: 0, width: ancho.toFixed(2), height: 170 });
      rect.dataset.nota = nota;
      tecladoPortada.append(rect);
      teclasPortada.set(nota, rect);
      const letra = nota[0];
      if (i < blancas.length - 1 && letra !== 'E' && letra !== 'B') {
        const negra = `${letra}#${nota.slice(-1)}`;
        const r = svgEl('rect', { class: 'tp-negra', x: (x + ancho * 0.68).toFixed(2), y: 0, width: (ancho * 0.64).toFixed(2), height: 104, rx: 4 });
        r.dataset.nota = negra;
        grupoNegras.append(r);
        teclasPortada.set(negra, r);
      }
    });
    tecladoPortada.append(grupoNegras);
  })();

  let notasActivas = 0;
  function lanzarNota(elemento) {
    if (movimientoReducido.matches || notasActivas > 24) return;
    const caja = tecladoPortada.getBoundingClientRect();
    const r = elemento.getBoundingClientRect();
    const nota = document.createElement('span');
    nota.className = 'nota-flotante';
    nota.innerHTML = CORCHEA;
    nota.style.left = `${r.left - caja.left + r.width / 2}px`;
    nota.style.setProperty('--deriva', `${Math.round((Math.random() - 0.5) * 70)}px`);
    notasActivas++;
    nota.addEventListener('animationend', () => {
      nota.remove();
      notasActivas--;
    });
    notasFlotantes.append(nota);
  }

  function tocarPortada(nota) {
    const elemento = teclasPortada.get(nota);
    if (!elemento) return;
    sonarNota(aMidi(nota), 0, true);
    elemento.classList.add('pulsada');
    setTimeout(() => elemento.classList.remove('pulsada'), 220);
    lanzarNota(elemento);
    avisarLogo('nota', 1);
    pistaPortada.classList.add('oculta');
  }

  let punteroPortada = null;
  tecladoPortada.addEventListener('pointerdown', evento => {
    const tecla = evento.target.closest('[data-nota]');
    if (!tecla) return;
    evento.preventDefault();
    punteroPortada = tecla.dataset.nota;
    tocarPortada(punteroPortada);
  });
  tecladoPortada.addEventListener('pointerover', evento => {
    if (punteroPortada === null || evento.buttons === 0) return;
    const tecla = evento.target.closest('[data-nota]');
    if (tecla && tecla.dataset.nota !== punteroPortada) {
      punteroPortada = tecla.dataset.nota;
      tocarPortada(punteroPortada);
    }
  });

  const BLANCAS = [];
  for (let o = 4; o <= 5; o++) LETRAS.forEach(l => BLANCAS.push(`${l}${o}`));
  BLANCAS.push('C6');
  const ATAJOS = {
    a: 'C4', w: 'C#4', s: 'D4', e: 'D#4', d: 'E4', f: 'F4', t: 'F#4', g: 'G4', y: 'G#4', h: 'A4', u: 'A#4', j: 'B4',
    k: 'C5', o: 'C#5', l: 'D5', p: 'D#5', 'ñ': 'E5', ';': 'E5'
  };
  const ETIQUETA_ATAJO = {};
  Object.entries(ATAJOS).forEach(([tecla, nota]) => {
    if (!ETIQUETA_ATAJO[nota] && tecla !== ';') ETIQUETA_ATAJO[nota] = tecla.toUpperCase();
  });
  const subirOctava = nota => nota.replace(/(\d)$/, d => String(Number(d) + 1));
  ['F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'].forEach(nota => {
    const alta = subirOctava(nota);
    if (!ETIQUETA_ATAJO[alta]) ETIQUETA_ATAJO[alta] = `⇧${ETIQUETA_ATAJO[nota]}`;
  });

  const teclado = $('#teclado');
  const ANCHO_BLANCA = 700 / BLANCAS.length;
  const elementosTecla = new Map();

  function prepararTecla(elemento, nota) {
    elemento.dataset.nota = nota;
    elemento.setAttribute('role', 'button');
    elemento.setAttribute('tabindex', '-1');
    elemento.setAttribute('aria-label', `${nombreNota(nota)} ${nota.slice(-1)}`);
    elementosTecla.set(nota, elemento);
  }

  (function crearTeclado() {
    const grupoBlancas = svgEl('g');
    const grupoNegras = svgEl('g');
    BLANCAS.forEach((nota, i) => {
      const x = i * ANCHO_BLANCA;
      const g = svgEl('g');
      const rect = svgEl('rect', { x: (x + 0.5).toFixed(2), y: '0.5', width: (ANCHO_BLANCA - 1).toFixed(2), height: '219', rx: '5', class: 'tecla tecla--blanca' });
      prepararTecla(rect, nota);
      const nombre = svgEl('text', { x: (x + ANCHO_BLANCA / 2).toFixed(2), y: '188', class: 'tecla__nombre' });
      nombre.textContent = SOLFEO[nota[0]];
      const atajo = svgEl('text', { x: (x + ANCHO_BLANCA / 2).toFixed(2), y: '206', class: 'tecla__atajo' });
      atajo.textContent = ETIQUETA_ATAJO[nota] || '';
      g.append(rect, nombre, atajo);
      grupoBlancas.append(g);
      const letra = nota[0];
      if (i < BLANCAS.length - 1 && letra !== 'E' && letra !== 'B') {
        const negra = `${letra}#${nota.slice(-1)}`;
        const ancho = ANCHO_BLANCA * 0.58;
        const r = svgEl('rect', { x: (x + ANCHO_BLANCA - ancho / 2).toFixed(2), y: '0', width: ancho.toFixed(2), height: '132', rx: '3', class: 'tecla tecla--negra' });
        prepararTecla(r, negra);
        grupoNegras.append(r);
        const etiqueta = ETIQUETA_ATAJO[negra];
        if (etiqueta) {
          const t = svgEl('text', { x: (x + ANCHO_BLANCA).toFixed(2), y: '120', class: 'tecla__atajo' });
          t.textContent = etiqueta;
          grupoNegras.append(t);
        }
      }
    });
    teclado.append(grupoBlancas, grupoNegras);
    elementosTecla.get('C4').setAttribute('tabindex', '0');
  })();

  const ordenTeclas = Array.from(elementosTecla.keys()).sort((a, b) => aMidi(a) - aMidi(b));

  const MELODIAS = {
    oda: { nombre: 'Oda a la alegría', notas: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4', tiempos: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 2] },
    estrellita: { nombre: 'Estrellita', notas: 'C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4', tiempos: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2] },
    cumple: { nombre: 'Cumpleaños feliz', notas: 'G4 G4 A4 G4 C5 B4 G4 G4 A4 G4 D5 C5 G4 G4 G5 E5 C5 B4 A4 F5 F5 E5 C5 D5 C5', tiempos: [0.75, 0.25, 1, 1, 1, 2, 0.75, 0.25, 1, 1, 1, 2, 0.75, 0.25, 1, 1, 1, 1, 2, 0.75, 0.25, 1, 1, 1, 2] }
  };
  Object.values(MELODIAS).forEach(m => { m.notas = m.notas.split(' '); });

  const leccion = { clave: 'oda', indice: 0, errores: 0, inicio: 0, historial: [], reproduciendo: false, temporizadores: [] };
  const estadoTexto = $('#estadoLeccion');
  const progreso = $('#progresoLeccion');
  const pentagrama = $('#pentagrama');
  const panel = $('.piano-panel');

  function dibujarPentagrama() {
    const partes = [];
    const visibles = pentagrama.clientWidth && pentagrama.clientWidth < 560 ? 7 : 14;
    const anchoVista = 90 + visibles * 61 + 10;
    pentagrama.setAttribute('viewBox', `0 0 ${anchoVista} 150`);
    for (let i = 0; i < 5; i++) partes.push(`<line class="pentagrama__linea" x1="10" x2="${anchoVista - 10}" y1="${45 + i * 15}" y2="${45 + i * 15}"/>`);
    partes.push(`<path class="pentagrama__clave" d="${CLAVE_SOL}"/>`);
    const libre = leccion.clave === 'libre';
    const lista = libre ? leccion.historial.slice(-visibles) : MELODIAS[leccion.clave].notas;
    const desde = libre ? 0 : Math.max(0, Math.min(leccion.indice - (visibles > 7 ? 4 : 2), lista.length - visibles));
    const tramo = lista.slice(desde, desde + visibles);
    tramo.forEach((nota, k) => {
      const i = desde + k;
      const x = 90 + k * 61;
      const paso = pasoDiatonico(nota);
      const y = 105 - paso * 7.5;
      let clase = 'pentagrama__nota';
      if (!libre && i < leccion.indice) clase += ' pentagrama__nota--hecha';
      if (!libre && i === leccion.indice) clase += ' pentagrama__nota--actual';
      if (libre && k === tramo.length - 1) clase += ' pentagrama__nota--actual';
      let s = `<g class="${clase}">`;
      for (let yl = 120; yl <= y + 0.1; yl += 15) s += `<line x1="${x - 15}" x2="${x + 15}" y1="${yl}" y2="${yl}" stroke-width="1.6"/>`;
      for (let yl = 30; yl >= y - 0.1; yl -= 15) s += `<line x1="${x - 15}" x2="${x + 15}" y1="${yl}" y2="${yl}" stroke-width="1.6"/>`;
      if (nota.includes('#')) s += `<text x="${x - 24}" y="${y + 5}" font-size="16" style="stroke:none">♯</text>`;
      s += `<ellipse class="pentagrama__cabeza" cx="${x}" cy="${y}" rx="9" ry="6.6" transform="rotate(-20 ${x} ${y})" style="stroke:none"/>`;
      s += paso < 4 ? `<line x1="${x + 8.2}" x2="${x + 8.2}" y1="${y - 2}" y2="${y - 40}" stroke-width="2"/>` : `<line x1="${x - 8.2}" x2="${x - 8.2}" y1="${y + 2}" y2="${y + 40}" stroke-width="2"/>`;
      s += `<text class="pentagrama__texto" x="${x}" y="146" text-anchor="middle" style="stroke:none">${nombreCorto(nota)}</text>`;
      s += '</g>';
      partes.push(s);
    });
    if (!tramo.length) partes.push(`<text class="pentagrama__texto" x="${anchoVista / 2}" y="80" text-anchor="middle" style="stroke:none">Las notas que toques aparecerán aquí</text>`);
    pentagrama.innerHTML = partes.join('');
  }

  function centrarTecla(nota) {
    const caja = $('.teclado-caja');
    if (caja.scrollWidth <= caja.clientWidth + 2) return;
    const tecla = elementosTecla.get(nota).getBoundingClientRect();
    const marco = caja.getBoundingClientRect();
    if (tecla.left > marco.left + 24 && tecla.right < marco.right - 24) return;
    caja.scrollBy({ left: tecla.left - marco.left - marco.width / 2 + tecla.width / 2, behavior: movimientoReducido.matches ? 'auto' : 'smooth' });
  }

  function marcarObjetivo() {
    elementosTecla.forEach(el => el.classList.remove('tecla--objetivo'));
    if (leccion.clave === 'libre' || leccion.reproduciendo) return;
    const nota = MELODIAS[leccion.clave].notas[leccion.indice];
    if (nota) {
      elementosTecla.get(nota).classList.add('tecla--objetivo');
      centrarTecla(nota);
    }
  }

  function actualizarEstado(mensaje) {
    const barra = progreso.querySelector('span');
    if (leccion.clave === 'libre') {
      estadoTexto.textContent = mensaje || 'Toca lo que quieras.';
      barra.style.transform = 'scaleX(0)';
      progreso.setAttribute('aria-valuenow', '0');
      return;
    }
    const melodia = MELODIAS[leccion.clave];
    const avance = Math.round((leccion.indice / melodia.notas.length) * 100);
    barra.style.transform = `scaleX(${avance / 100})`;
    progreso.setAttribute('aria-valuenow', String(avance));
    const siguiente = melodia.notas[leccion.indice];
    estadoTexto.textContent = mensaje || (siguiente ? `Toca ${nombreNota(siguiente)}.` : 'Listo.');
  }

  function detenerReproduccion() {
    leccion.temporizadores.forEach(clearTimeout);
    leccion.temporizadores = [];
    if (leccion.reproduciendo) {
      leccion.reproduciendo = false;
      $('#escuchar').textContent = 'Escuchar la melodía';
    }
  }

  function reiniciarLeccion() {
    detenerReproduccion();
    leccion.indice = 0;
    leccion.errores = 0;
    leccion.inicio = 0;
    leccion.historial = [];
    $('#logro').hidden = true;
    marcarObjetivo();
    dibujarPentagrama();
    actualizarEstado();
  }

  function pulsarVisual(elemento) {
    elemento.classList.add('pulsada');
    setTimeout(() => elemento.classList.remove('pulsada'), 180);
  }

  function terminarLeccion() {
    const melodia = MELODIAS[leccion.clave];
    const segundos = Math.max(1, Math.round((performance.now() - leccion.inicio) / 1000));
    actualizarEstado(`Tocaste ${melodia.nombre} completa.`);
    $('#logroTitulo').textContent = `${melodia.nombre}, completa`;
    const errores = leccion.errores === 0 ? 'sin equivocarte ni una vez' : leccion.errores === 1 ? 'con una sola equivocación' : `con ${leccion.errores} equivocaciones`;
    $('#logroTexto').textContent = `La tocaste en ${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}, ${errores}. Así se siente la primera clase. En la semana ${leccion.clave === 'oda' ? '3 la tocarás con las dos manos' : '2 aprenderás a darle ritmo'}.`;
    $('#logro').hidden = false;
    avisarLogo('pulso', 1);
  }

  function tocar(nota) {
    const elemento = elementosTecla.get(nota);
    if (!elemento) return;
    sonarNota(aMidi(nota));
    pulsarVisual(elemento);
    avisarLogo('nota', 1);
    if (leccion.reproduciendo) return;

    if (leccion.clave === 'libre') {
      leccion.historial.push(nota);
      if (leccion.historial.length > 40) leccion.historial.shift();
      dibujarPentagrama();
      actualizarEstado(`Tocaste ${nombreNota(nota)}.`);
      return;
    }

    const melodia = MELODIAS[leccion.clave];
    const esperada = melodia.notas[leccion.indice];
    if (!esperada) return;
    if (!leccion.inicio) leccion.inicio = performance.now();
    if (nota === esperada) {
      leccion.indice++;
      marcarObjetivo();
      dibujarPentagrama();
      if (leccion.indice >= melodia.notas.length) terminarLeccion();
      else actualizarEstado();
    } else {
      leccion.errores++;
      elemento.classList.add('tecla--error');
      setTimeout(() => elemento.classList.remove('tecla--error'), 350);
      actualizarEstado(`Esa fue ${nombreNota(nota)}. Busca ${nombreNota(esperada)}, la tecla que brilla.`);
    }
  }

  function reproducirMelodia() {
    if (leccion.clave === 'libre') {
      actualizarEstado('Elige una melodía para escucharla.');
      return;
    }
    if (leccion.reproduciendo) {
      detenerReproduccion();
      marcarObjetivo();
      actualizarEstado();
      return;
    }
    const melodia = MELODIAS[leccion.clave];
    const ac = $('#conSonido').checked ? contextoAudio() : null;
    const pulso = 60 / 100;
    let acumulado = 0.15;
    leccion.reproduciendo = true;
    $('#escuchar').textContent = 'Detener';
    marcarObjetivo();
    estadoTexto.textContent = `Escucha ${melodia.nombre}. Después tócala tú.`;
    const base = ac ? ac.currentTime : 0;
    melodia.notas.forEach((nota, i) => {
      const momento = acumulado;
      if (ac) sonarNota(aMidi(nota), base + momento);
      leccion.temporizadores.push(setTimeout(() => {
        pulsarVisual(elementosTecla.get(nota));
        avisarLogo('nota', 0.8);
      }, momento * 1000));
      acumulado += melodia.tiempos[i] * pulso;
    });
    leccion.temporizadores.push(setTimeout(() => {
      leccion.reproduciendo = false;
      $('#escuchar').textContent = 'Escuchar la melodía';
      marcarObjetivo();
      actualizarEstado();
    }, acumulado * 1000 + 300));
  }

  let punteroActivo = null;
  teclado.addEventListener('pointerdown', evento => {
    const tecla = evento.target.closest('.tecla');
    if (!tecla) return;
    evento.preventDefault();
    punteroActivo = tecla.dataset.nota;
    tocar(punteroActivo);
  });
  teclado.addEventListener('pointerover', evento => {
    if (punteroActivo === null || evento.buttons === 0) return;
    const tecla = evento.target.closest('.tecla');
    if (tecla && tecla.dataset.nota !== punteroActivo) {
      punteroActivo = tecla.dataset.nota;
      tocar(punteroActivo);
    }
  });
  window.addEventListener('pointerup', () => {
    punteroActivo = null;
    punteroPortada = null;
  });

  teclado.addEventListener('keydown', evento => {
    const tecla = evento.target.closest('.tecla');
    if (!tecla) return;
    const indice = ordenTeclas.indexOf(tecla.dataset.nota);
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      tocar(tecla.dataset.nota);
      return;
    }
    const movimiento = { ArrowRight: 1, ArrowLeft: -1, Home: -indice, End: ordenTeclas.length - 1 - indice }[evento.key];
    if (movimiento === undefined) return;
    evento.preventDefault();
    const destino = elementosTecla.get(ordenTeclas[limitar(indice + movimiento, 0, ordenTeclas.length - 1)]);
    elementosTecla.forEach(el => el.setAttribute('tabindex', '-1'));
    destino.setAttribute('tabindex', '0');
    destino.focus();
  });

  const visible = elemento => {
    const r = elemento.getBoundingClientRect();
    const alto = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom > 80 && r.top < alto;
  };

  document.addEventListener('keydown', evento => {
    if (evento.repeat || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    const destino = evento.target;
    if (destino.closest && destino.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (destino.closest && destino.closest('.tecla, button, a') && (evento.key === 'Enter' || evento.key === ' ')) return;
    let nota = ATAJOS[evento.key.toLowerCase()];
    if (!nota) return;
    if (evento.shiftKey) nota = subirOctava(nota);
    if (visible($('#prueba')) && elementosTecla.has(nota)) {
      evento.preventDefault();
      tocar(nota);
    } else if (visible($('.escena__piano')) && teclasPortada.has(nota)) {
      evento.preventDefault();
      tocarPortada(nota);
    }
  });

  $$('#melodias button').forEach(boton => {
    boton.addEventListener('click', () => {
      $$('#melodias button').forEach(b => b.setAttribute('aria-checked', String(b === boton)));
      leccion.clave = boton.dataset.melodia;
      $('#escuchar').hidden = leccion.clave === 'libre';
      reiniciarLeccion();
    });
  });

  $('#melodias').addEventListener('keydown', evento => {
    const botones = $$('#melodias button');
    const actual = botones.indexOf(document.activeElement);
    const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[evento.key];
    if (actual < 0 || !paso) return;
    evento.preventDefault();
    const siguiente = botones[(actual + paso + botones.length) % botones.length];
    siguiente.focus();
    siguiente.click();
  });

  $('#verNombres').addEventListener('change', evento => panel.classList.toggle('sin-nombres', !evento.target.checked));
  $('#reiniciar').addEventListener('click', reiniciarLeccion);
  $('#escuchar').addEventListener('click', reproducirMelodia);

  reiniciarLeccion();

  const SEMANAS = [
    { titulo: 'Postura y tus primeras cinco notas', texto: 'Cómo sentarte, dónde poner las manos y cómo encontrar el Do central sin buscarlo.', pieza: ['Al terminar tocas: ', 'Oda a la alegría', ' con la mano derecha.'], figuras: [{ p: 2, d: 'redonda' }] },
    { titulo: 'Ritmo: negras, blancas y silencios', texto: 'Contar en voz alta, usar el metrónomo a 60 y tocar sin detenerte aunque te equivoques.', pieza: ['Al terminar tocas: ', 'Estrellita', ' completa.'], figuras: [{ p: 0, d: 'blanca' }, { p: 4, d: 'blanca' }] },
    { titulo: 'La mano izquierda entra al juego', texto: 'Notas largas en el bajo mientras la derecha lleva la melodía.', pieza: ['Al terminar tocas: ', 'Oda a la alegría', ' a dos manos.'], figuras: [{ p: 2, d: 'negra' }, { p: 3, d: 'negra' }, { p: 4, d: 'negra' }, { p: 2, d: 'negra' }] },
    { titulo: 'Acordes de Do, Fa y Sol', texto: 'Los tres acordes que sostienen cientos de canciones populares.', pieza: ['Al terminar tocas: ', 'Las mañanitas', ' con acompañamiento.'], figuras: [{ p: [-2, 0, 2], d: 'blanca' }, { p: [1, 3, 5], d: 'blanca' }] },
    { titulo: 'Leer partitura sin nombres de notas', texto: 'Clave de sol y clave de fa con trucos visuales; dejas de escribir los nombres encima.', pieza: ['Al terminar tocas: ', 'Minueto en Sol', ', versión sencilla.'], figuras: [{ p: 5, d: 'negra' }, { p: 3, d: 'negra' }, { p: 4, d: 'negra' }, { p: 6, d: 'negra' }] },
    { titulo: 'Pedal y dinámica', texto: 'Tocar suave y fuerte a propósito, y usar el pedal para que el sonido se una.', pieza: ['Al terminar tocas: ', 'Canon en Re', ', arreglo para principiantes.'], figuras: [{ p: 1, d: 'negra' }, { p: 2, d: 'negra' }, { p: 4, d: 'negra' }, { p: 6, d: 'negra' }], dinamica: true },
    { titulo: 'Tu pieza para el recital', texto: 'Eliges entre cinco arreglos y ensayas por secciones con la maestra.', pieza: ['Al terminar tocas: ', 'tu pieza completa', ', sin partitura en la parte difícil.'], figuras: [0, 2, 4, 5, 4, 2, 1, 2].map(p => ({ p, d: 'corchea' })) },
    { titulo: 'Recital', texto: 'Ensayo general, recital con público y video de tu presentación para que lo guardes.', pieza: ['Te llevas: ', 'constancia y video', ' de tu presentación.'], figuras: [4, 5, 6, 7, 6, 4].map(p => ({ p, d: 'corchea' })).concat([{ p: [0, 2, 4], d: 'blanca' }]) }
  ];

  const compases = $$('.compas');
  const contenedorCompases = $('#compases');
  const cabezal = $('#cabezal');
  const LINEAS_Y = [55, 70, 85, 100, 115];
  const yDePaso = p => 115 - p * 7.5;

  function dibujarFigura(svg, x, figura, direccion) {
    const pasos = Array.isArray(figura.p) ? figura.p : [figura.p];
    const g = svgEl('g', { class: 'figura' });
    const hueca = figura.d === 'redonda' || figura.d === 'blanca';
    pasos.forEach(p => {
      const y = yDePaso(p);
      if (p <= -2) g.append(svgEl('line', { x1: x - 13, x2: x + 13, y1: 130, y2: 130, 'stroke-width': 1.6 }));
      if (p >= 10) g.append(svgEl('line', { x1: x - 13, x2: x + 13, y1: 40, y2: 40, 'stroke-width': 1.6 }));
      const atributos = { cx: x, cy: y, rx: figura.d === 'redonda' ? 9.5 : 8, ry: 5.8, transform: `rotate(-20 ${x} ${y})`, 'stroke-width': hueca ? 2.4 : 0 };
      if (hueca) atributos.fill = 'none';
      g.append(svgEl('ellipse', atributos));
    });
    if (figura.d !== 'redonda') {
      const minimo = Math.min(...pasos);
      const maximo = Math.max(...pasos);
      const arriba = direccion !== undefined ? direccion : (minimo + maximo) / 2 < 4;
      const xp = arriba ? x + 7 : x - 7;
      const y1 = arriba ? yDePaso(minimo) : yDePaso(maximo);
      const y2 = arriba ? yDePaso(maximo) - 34 : yDePaso(minimo) + 34;
      g.append(svgEl('line', { class: 'plica', x1: xp, x2: xp, y1, y2, 'stroke-width': 2 }));
      g.dataset.plicaX = xp;
      g.dataset.plicaY = y2;
      g.dataset.arriba = arriba ? '1' : '0';
    }
    svg.append(g);
    return g;
  }

  function dibujarCompases() {
    let clave = $('.partitura__clave', contenedorCompases);
    if (!clave) {
      clave = svgEl('svg', { class: 'partitura__clave', viewBox: '0 0 70 170', 'aria-hidden': 'true' });
      contenedorCompases.prepend(clave);
    }
    clave.replaceChildren();
    LINEAS_Y.forEach(y => clave.append(svgEl('line', { x1: 0, x2: 70, y1: y, y2: y })));
    clave.append(svgEl('path', { d: CLAVE_SOL, transform: 'translate(10 10)' }));

    compases.forEach((compas, i) => {
      const svg = $('.compas__notas', compas);
      const ancho = Math.max(80, Math.round(svg.getBoundingClientRect().width) || 110);
      svg.setAttribute('viewBox', `0 0 ${ancho} 170`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.replaceChildren();
      LINEAS_Y.forEach(y => svg.append(svgEl('line', { class: 'pauta', x1: 0, x2: ancho, y1: y, y2: y })));
      const semana = SEMANAS[i];
      const n = semana.figuras.length;
      const indicesCorchea = semana.figuras.map((f, k) => (f.d === 'corchea' ? k : -1)).filter(k => k >= 0);
      const bloques = [];
      for (let k = 0; k < indicesCorchea.length; k += 4) bloques.push(indicesCorchea.slice(k, k + 4));
      const direcciones = {};
      bloques.forEach(bloque => {
        const promedio = bloque.reduce((suma, k) => suma + semana.figuras[k].p, 0) / bloque.length;
        bloque.forEach(k => { direcciones[k] = promedio < 4; });
      });
      const figuras = semana.figuras.map((figura, k) => {
        const x = 16 + (k + 0.5) * ((ancho - 28) / n);
        return dibujarFigura(svg, x, figura, direcciones[k]);
      });
      bloques.filter(b => b.length > 1).forEach(bloque => {
        const grupo = bloque.map(k => figuras[k]);
        const arriba = grupo[0].dataset.arriba === '1';
        const extremos = grupo.map(g => Number(g.dataset.plicaY));
        const y = arriba ? Math.min(...extremos) : Math.max(...extremos);
        grupo.forEach(g => $('.plica', g).setAttribute('y2', y));
        const viga = svgEl('g', { class: 'figura' });
        viga.append(svgEl('line', { x1: grupo[0].dataset.plicaX, x2: grupo[grupo.length - 1].dataset.plicaX, y1: y, y2: y, 'stroke-width': 5 }));
        svg.append(viga);
      });
      if (semana.dinamica) {
        const p = svgEl('text', { class: 'dinamica', x: 12, y: 150 });
        p.textContent = 'p';
        const f = svgEl('text', { class: 'dinamica', x: ancho - 22, y: 150 });
        f.textContent = 'f';
        const hor = svgEl('path', { d: `M24 146 L${ancho - 30} 140 M24 146 L${ancho - 30} 152`, fill: 'none', stroke: 'rgba(238,242,236,0.7)', 'stroke-width': 1.5 });
        svg.append(p, hor, f);
      }
    });
  }

  const panelSemana = $('#semanaPanel');
  function elegirSemana(i, enfocar = false) {
    compases.forEach((c, k) => {
      c.setAttribute('aria-selected', String(k === i));
      c.tabIndex = k === i ? 0 : -1;
    });
    const s = SEMANAS[i];
    $('#semanaNum').textContent = `Semana ${i + 1}`;
    $('#semanaTitulo').textContent = s.titulo;
    $('#semanaTexto').textContent = s.texto;
    const pieza = $('#semanaPieza');
    const fuerte = document.createElement('strong');
    fuerte.textContent = s.pieza[1];
    pieza.replaceChildren(document.createTextNode(s.pieza[0]), fuerte, document.createTextNode(s.pieza[2]));
    panelSemana.setAttribute('aria-labelledby', compases[i].id);
    panelSemana.classList.remove('cambiando');
    void panelSemana.offsetWidth;
    panelSemana.classList.add('cambiando');
    if (enfocar) compases[i].focus();
  }

  compases.forEach((compas, i) => compas.addEventListener('click', () => elegirSemana(i)));
  contenedorCompases.addEventListener('keydown', evento => {
    const actual = compases.indexOf(document.activeElement);
    if (actual < 0) return;
    const destino = { ArrowRight: actual + 1, ArrowLeft: actual - 1, Home: 0, End: compases.length - 1 }[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    elegirSemana((destino + compases.length) % compases.length, true);
  });

  function posicionCabezal(indice, fraccion = 0) {
    const compas = compases[Math.min(indice, compases.length - 1)];
    const base = compases[0].offsetLeft;
    const x = indice >= compases.length ? compases[compases.length - 1].offsetLeft + compases[compases.length - 1].offsetWidth - base : compas.offsetLeft - base + compas.offsetWidth * fraccion;
    cabezal.style.setProperty('--cabezal', `${x}px`);
  }

  const reproduccion = { activa: false, temporizadores: [], animacion: null };

  function recorrerPartitura(conSonido) {
    detenerPartitura();
    reproduccion.activa = true;
    const duracion = 1.5;
    const total = duracion * compases.length;
    cabezal.classList.add('activo');
    const base = compases[0].offsetLeft;
    const inicioX = 0;
    const finX = compases[compases.length - 1].offsetLeft + compases[compases.length - 1].offsetWidth - base;
    if (cabezal.animate && !movimientoReducido.matches) {
      reproduccion.animacion = cabezal.animate([
        { transform: `translateX(${inicioX}px)` },
        { transform: `translateX(${finX}px)` }
      ], { duration: total * 1000, easing: 'linear', fill: 'forwards' });
    }
    const ac = conSonido ? contextoAudio() : null;
    const t0 = ac ? ac.currentTime + 0.08 : 0;
    compases.forEach((compas, i) => {
      reproduccion.temporizadores.push(setTimeout(() => {
        compases.forEach(c => c.classList.toggle('sonando', c === compas));
        if (conSonido) elegirSemana(i);
        avisarLogo('pulso', 0.7);
        if (!reproduccion.animacion) posicionCabezal(i);
      }, i * duracion * 1000));
      if (ac) {
        const figuras = SEMANAS[i].figuras;
        figuras.forEach((figura, k) => {
          const pasos = Array.isArray(figura.p) ? figura.p : [figura.p];
          pasos.forEach(p => sonarNota(midiDesdePaso(p), t0 + i * duracion + (k * duracion) / figuras.length, true));
        });
      }
    });
    reproduccion.temporizadores.push(setTimeout(detenerPartitura, total * 1000 + 250));
  }

  function detenerPartitura() {
    reproduccion.temporizadores.forEach(clearTimeout);
    reproduccion.temporizadores = [];
    if (reproduccion.animacion) reproduccion.animacion.cancel();
    reproduccion.animacion = null;
    reproduccion.activa = false;
    compases.forEach(c => c.classList.remove('sonando'));
    cabezal.classList.remove('activo');
    const boton = $('#tocarPartitura');
    boton.textContent = 'Escuchar las ocho semanas';
    boton.setAttribute('aria-pressed', 'false');
  }

  $('#tocarPartitura').addEventListener('click', evento => {
    if (reproduccion.activa) {
      detenerPartitura();
      return;
    }
    recorrerPartitura(true);
    evento.currentTarget.textContent = 'Detener';
    evento.currentTarget.setAttribute('aria-pressed', 'true');
  });

  const observadorPartitura = new IntersectionObserver(entradas => {
    if (!entradas.some(e => e.isIntersecting)) return;
    observadorPartitura.disconnect();
    if (!movimientoReducido.matches && !reproduccion.activa) recorrerPartitura(false);
  }, { threshold: 0.6 });

  dibujarCompases();
  observadorPartitura.observe($('#partitura'));

  const pendulo = $('#pendulo');
  const bpmRango = $('#bpm');
  const bpmValor = $('#bpmValor');
  const botonMetro = $('#metroIniciar');
  const pulsos = $$('#pulsos span');
  const metro = { activo: false, siguiente: 0, compas: 0, inicio: 0, reloj: 0, cuadro: 0, golpes: [] };

  function nombreTempo(bpm) {
    if (bpm < 60) return 'Largo';
    if (bpm < 76) return 'Adagio';
    if (bpm < 108) return 'Andante';
    if (bpm < 120) return 'Moderato';
    if (bpm < 156) return 'Allegro';
    if (bpm < 176) return 'Vivace';
    return 'Presto';
  }

  function actualizarBpm() {
    const bpm = Number(bpmRango.value);
    bpmValor.textContent = bpm;
    $('#bpmNombre').textContent = nombreTempo(bpm);
    bpmRango.setAttribute('aria-valuetext', `${bpm} pulsos por minuto, ${nombreTempo(bpm)}`);
  }

  function clic(tiempo, acento) {
    const ac = contextoAudio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(acento ? 1760 : 1175, tiempo);
    g.gain.setValueAtTime(0.0001, tiempo);
    g.gain.exponentialRampToValueAtTime(acento ? 0.28 : 0.18, tiempo + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, tiempo + 0.05);
    osc.connect(g).connect(ac.destination);
    osc.start(tiempo);
    osc.stop(tiempo + 0.06);
  }

  function programarClics() {
    const duracion = 60 / Number(bpmRango.value);
    while (metro.siguiente < audio.currentTime + 0.12) {
      const numero = metro.compas;
      clic(metro.siguiente, numero === 0);
      const retraso = Math.max(0, (metro.siguiente - audio.currentTime) * 1000);
      setTimeout(() => {
        pulsos.forEach((p, i) => p.classList.toggle('encendido', i === numero));
        avisarLogo('pulso', numero === 0 ? 1 : 0.6);
      }, retraso);
      metro.siguiente += duracion;
      metro.compas = (metro.compas + 1) % 4;
    }
  }

  function moverPendulo() {
    if (!metro.activo) return;
    const duracion = 60 / Number(bpmRango.value);
    const t = audio.currentTime - metro.inicio;
    const amplitud = movimientoReducido.matches ? 10 : 26;
    pendulo.setAttribute('transform', `rotate(${(amplitud * Math.cos(Math.PI * t / duracion)).toFixed(2)} 100 200)`);
    metro.cuadro = requestAnimationFrame(moverPendulo);
  }

  function iniciarMetronomo() {
    const ac = contextoAudio();
    if (!ac) {
      $('#bpmNombre').textContent = 'Tu navegador no permite reproducir sonido';
      return;
    }
    metro.activo = true;
    metro.compas = 0;
    metro.siguiente = ac.currentTime + 0.08;
    metro.inicio = metro.siguiente;
    programarClics();
    metro.reloj = setInterval(programarClics, 25);
    metro.cuadro = requestAnimationFrame(moverPendulo);
    botonMetro.textContent = 'Detener';
    botonMetro.setAttribute('aria-pressed', 'true');
  }

  function detenerMetronomo() {
    metro.activo = false;
    clearInterval(metro.reloj);
    cancelAnimationFrame(metro.cuadro);
    pendulo.setAttribute('transform', 'rotate(0 100 200)');
    pulsos.forEach(p => p.classList.remove('encendido'));
    botonMetro.textContent = 'Iniciar';
    botonMetro.setAttribute('aria-pressed', 'false');
  }

  botonMetro.addEventListener('click', () => (metro.activo ? detenerMetronomo() : iniciarMetronomo()));

  bpmRango.addEventListener('input', () => {
    actualizarBpm();
    if (metro.activo && audio) {
      metro.siguiente = audio.currentTime + 0.05;
      metro.inicio = metro.siguiente;
      metro.compas = 0;
    }
  });

  $('#metroGolpe').addEventListener('click', () => {
    const ahora = performance.now();
    metro.golpes = metro.golpes.filter(t => ahora - t < 2500);
    metro.golpes.push(ahora);
    const ac = contextoAudio();
    if (ac) clic(ac.currentTime, false);
    avisarLogo('pulso', 0.8);
    if (metro.golpes.length >= 2) {
      const intervalos = metro.golpes.slice(1).map((t, i) => t - metro.golpes[i]);
      const promedio = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
      bpmRango.value = limitar(Math.round(60000 / promedio), 40, 200);
      bpmRango.dispatchEvent(new Event('input'));
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && metro.activo) detenerMetronomo();
  });

  actualizarBpm();

  const hoy = inicioDia(new Date());
  const lunesInicio = new Date(hoy);
  lunesInicio.setDate(hoy.getDate() + ((8 - hoy.getDay()) % 7 || 7));
  if ((lunesInicio - hoy) / 86400000 < 5) lunesInicio.setDate(lunesInicio.getDate() + 7);
  const desplazar = dias => {
    const d = new Date(lunesInicio);
    d.setDate(d.getDate() + dias);
    return d;
  };

  const GRUPOS = {
    tarde: { nombre: 'Entre semana', horario: 'Martes y jueves, 19:00 a 20:30', inicio: desplazar(1), hora: [19, 0], duracion: 90, ocupados: 4 },
    sabado: { nombre: 'Sábado intensivo', horario: 'Sábados, 10:00 a 13:00', inicio: desplazar(5), hora: [10, 0], duracion: 180, ocupados: 5 },
    linea: { nombre: 'En línea', horario: 'Miércoles, 20:00 a 21:30', inicio: desplazar(2), hora: [20, 0], duracion: 90, ocupados: 2 }
  };
  const TOTAL_LUGARES = 6;
  const CLAVE_LOCAL = 'ochocompases-inscripciones';

  function leerInscripciones() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_LOCAL)) || {};
    } catch {
      return {};
    }
  }

  function guardarInscripcion(grupo) {
    try {
      const datos = leerInscripciones();
      datos[grupo] = (datos[grupo] || 0) + 1;
      localStorage.setItem(CLAVE_LOCAL, JSON.stringify(datos));
    } catch {
    }
  }

  const ocupados = clave => Math.min(TOTAL_LUGARES, GRUPOS[clave].ocupados + (leerInscripciones()[clave] || 0));

  function pintarGrupos(nuevo) {
    Object.entries(GRUPOS).forEach(([clave, grupo]) => {
      const boleto = $(`[data-grupo="${clave}"]`);
      const n = ocupados(clave);
      const lleno = n >= TOTAL_LUGARES;
      const libres = TOTAL_LUGARES - n;
      $(`[data-inicio="${clave}"]`, boleto).textContent = fechaLarga(grupo.inicio);
      const lugares = $('.lugares', boleto);
      lugares.classList.toggle('lugares--pocos', libres <= 2);
      $$('.butacas span', lugares).forEach((butaca, i) => {
        butaca.classList.toggle('ocupada', i < n);
        if (nuevo === clave && i === n - 1) {
          butaca.classList.remove('nueva');
          void butaca.offsetWidth;
          butaca.classList.add('nueva');
        }
      });
      $('.lugares__texto', lugares).textContent = lleno ? 'Función llena. Te avisamos cuando abra la siguiente.' : libres === 1 ? 'Queda 1 de 6 butacas' : `Quedan ${libres} de 6 butacas`;
      const boton = $('[data-elegir]', boleto);
      boton.disabled = lleno;
      boton.textContent = lleno ? 'Llena' : boleto.classList.contains('elegido') ? 'Elegido' : 'Elegir';
      const opcion = $(`#insGrupo option[value="${clave}"]`);
      opcion.disabled = lleno;
      opcion.textContent = `${grupo.nombre}: ${grupo.horario.toLowerCase()}${lleno ? ' (lleno)' : ''}`;
    });

    const dias = Math.round((lunesInicio - hoy) / 86400000);
    $('#cohorteFecha').textContent = `semana del lunes ${lunesInicio.getDate()} de ${MESES[lunesInicio.getMonth()]}, en ${dias} días`;
    const masPedido = ocupados('sabado');
    $$('#cohorteBarra span').forEach((s, i) => s.classList.toggle('ocupado', i < masPedido));
    $('#cohorteBarra').setAttribute('aria-label', `Sábado intensivo: ${masPedido} de 6 lugares ocupados`);
    const texto = clave => {
      const libres = TOTAL_LUGARES - ocupados(clave);
      return libres === 0 ? 'lleno' : libres === 1 ? 'queda 1 lugar' : `quedan ${libres}`;
    };
    $('#cohorteNota').textContent = `Sábado intensivo: ${texto('sabado')}. Entre semana: ${texto('tarde')}. En línea: ${texto('linea')}.`;
  }

  const formIns = $('#formInscripcion');
  const selectGrupo = $('#insGrupo');

  function marcarGrupo(clave) {
    $$('.boleto').forEach(b => {
      const elegido = b.dataset.grupo === clave;
      b.classList.toggle('elegido', elegido);
      const boton = $('[data-elegir]', b);
      if (!boton.disabled) boton.textContent = elegido ? 'Elegido' : 'Elegir';
    });
  }

  pintarGrupos();

  $$('[data-elegir]').forEach(boton => {
    boton.addEventListener('click', () => {
      selectGrupo.value = boton.dataset.elegir;
      marcarGrupo(boton.dataset.elegir);
      limpiarError('errorInsGrupo', selectGrupo);
      actualizarResumen();
      $('#inscripcion').scrollIntoView({ behavior: movimientoReducido.matches ? 'auto' : 'smooth' });
      setTimeout(() => $('#insNombre').focus({ preventScroll: true }), 700);
    });
  });

  $$('.boleto').forEach(boleto => {
    boleto.addEventListener('pointermove', evento => {
      if (evento.pointerType !== 'mouse' || !punteroFino.matches || movimientoReducido.matches) return;
      const r = boleto.getBoundingClientRect();
      const x = (evento.clientX - r.left) / r.width - 0.5;
      const y = (evento.clientY - r.top) / r.height - 0.5;
      boleto.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      boleto.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    });
    boleto.addEventListener('pointerleave', () => {
      boleto.style.setProperty('--ry', '0deg');
      boleto.style.setProperty('--rx', '0deg');
    });
  });

  function actualizarResumen() {
    const grupo = GRUPOS[selectGrupo.value];
    const practica = formIns.elements.practica.value;
    const pago = formIns.elements.pago.value;
    marcarGrupo(selectGrupo.value);
    const filas = [
      ['Grupo', grupo ? grupo.nombre : 'Sin elegir'],
      ['Horario', grupo ? grupo.horario : '—'],
      ['Primera clase', grupo ? mayuscula(fechaLarga(grupo.inicio)) : '—'],
      ['Práctica', { propio: 'En tu piano o teclado', renta: 'Teclado rentado', salon: 'En el salón' }[practica]],
      ['Pago', pago === 'unico' ? 'Un pago' : 'Dos pagos']
    ];
    const dl = $('#insResumen');
    dl.replaceChildren();
    filas.forEach(([c, v]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = c;
      dd.textContent = v;
      dl.append(dt, dd);
    });
    const hoyPaga = (pago === 'unico' ? PRECIO.curso : PRECIO.pago) + (practica === 'renta' ? PRECIO.renta : 0);
    $('#insHoy').textContent = dinero.format(hoyPaga);
    let nota = pago === 'dos' ? `El segundo pago de ${dinero.format(PRECIO.pago)} se hace en la cuarta semana.` : `Pagas el curso completo y te ahorras ${dinero.format(PRECIO.pago * 2 - PRECIO.curso)}.`;
    if (practica === 'renta') nota += ' Incluye el primer mes de renta del teclado.';
    $('#insNota').textContent = nota;
    return { grupo, practica, pago, hoyPaga };
  }

  formIns.addEventListener('change', actualizarResumen);
  actualizarResumen();

  const validaciones = [
    { input: $('#insNombre'), error: 'errorInsNombre', validar: v => v.trim().length >= 3 ? '' : 'Escribe tu nombre completo.' },
    { input: $('#insCorreo'), error: 'errorInsCorreo', validar: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Revisa el correo: debe verse como nombre@correo.com.' },
    { input: $('#insTelefono'), error: 'errorInsTelefono', validar: v => v.replace(/\D/g, '').length >= 10 ? '' : 'El WhatsApp debe tener 10 dígitos.' },
    { input: selectGrupo, error: 'errorInsGrupo', validar: v => v ? '' : 'Elige el horario que te queda mejor.' }
  ];

  function mostrarError(id, mensaje, input) {
    const p = document.getElementById(id);
    p.textContent = mensaje;
    p.closest('.campo').classList.toggle('campo--error', Boolean(mensaje));
    input.setAttribute('aria-invalid', String(Boolean(mensaje)));
    if (mensaje) input.setAttribute('aria-describedby', id);
    else input.removeAttribute('aria-describedby');
  }

  const limpiarError = (id, input) => mostrarError(id, '', input);

  validaciones.forEach(v => {
    v.input.addEventListener('blur', () => {
      if (v.input.value) mostrarError(v.error, v.validar(v.input.value), v.input);
    });
    v.input.addEventListener('input', () => {
      if (v.input.getAttribute('aria-invalid') === 'true') mostrarError(v.error, v.validar(v.input.value), v.input);
    });
  });

  let ultimaInscripcion = null;

  formIns.addEventListener('submit', evento => {
    evento.preventDefault();
    let primero = null;
    validaciones.forEach(v => {
      const mensaje = v.validar(v.input.value);
      mostrarError(v.error, mensaje, v.input);
      if (mensaje && !primero) primero = v.input;
    });
    if (primero) {
      primero.focus();
      return;
    }
    if (formIns.elements.sitio.value) return;
    const resumen = actualizarResumen();
    const clave = selectGrupo.value;
    ultimaInscripcion = {
      clave,
      grupo: resumen.grupo,
      nombre: $('#insNombre').value.trim(),
      correo: $('#insCorreo').value.trim(),
      telefono: $('#insTelefono').value.trim(),
      hoyPaga: resumen.hoyPaga
    };
    guardarInscripcion(clave);
    pintarGrupos(clave);

    const d = ultimaInscripcion;
    $('#confirmacionTexto').textContent = `${d.nombre.split(' ')[0]}, te esperamos el ${fechaLarga(d.grupo.inicio)}. Envía la solicitud y te mandamos por WhatsApp los datos para el primer pago de ${dinero.format(d.hoyPaga)}.`;
    const filas = [
      ['Grupo', d.grupo.nombre],
      ['Horario', d.grupo.horario],
      ['Primera clase', mayuscula(fechaLarga(d.grupo.inicio))],
      ['Nombre', d.nombre],
      ['Correo', d.correo],
      ['WhatsApp', d.telefono],
      ['Primer pago', dinero.format(d.hoyPaga)]
    ];
    const dl = $('#confirmacionDatos');
    dl.replaceChildren();
    filas.forEach(([c, v]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = c;
      dd.textContent = v;
      dl.append(dt, dd);
    });
    const cuerpo = filas.map(([c, v]) => `${c}: ${v}`).join('\n');
    $('#confirmacionCorreo').href = `mailto:hola@ochocompases.mx?subject=${encodeURIComponent(`Inscripción: ${d.grupo.nombre}`)}&body=${encodeURIComponent(`Hola, quiero apartar mi lugar:\n\n${cuerpo}`)}`;
    $('.inscripcion').hidden = true;
    const confirmacion = $('#confirmacion');
    confirmacion.hidden = false;
    confirmacion.focus();
  });

  $('#confirmacionIcs').addEventListener('click', () => {
    if (!ultimaInscripcion) return;
    const g = ultimaInscripcion.grupo;
    const inicio = new Date(g.inicio);
    inicio.setHours(g.hora[0], g.hora[1], 0, 0);
    const fin = new Date(inicio);
    fin.setMinutes(fin.getMinutes() + g.duracion);
    const f = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ocho Compases//Inscripciones//ES',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@ochocompases.mx`,
      `DTSTAMP:${f(new Date())}`,
      `DTSTART:${f(inicio)}`,
      `DTEND:${f(fin)}`,
      'SUMMARY:Primera clase de piano en Ocho Compases',
      ultimaInscripcion.clave === 'linea' ? 'LOCATION:Videollamada' : 'LOCATION:Calle Pino 214\\, Col. Ciudad Granja\\, Zapopan\\, Jal.',
      'DESCRIPTION:Lleva tu cuaderno y llega diez minutos antes.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    enlace.download = 'ocho-compases-primera-clase.ics';
    document.body.append(enlace);
    enlace.click();
    setTimeout(() => {
      URL.revokeObjectURL(enlace.href);
      enlace.remove();
    }, 500);
  });

  $('#confirmacionOtra').addEventListener('click', () => {
    formIns.reset();
    validaciones.forEach(v => limpiarError(v.error, v.input));
    $('#confirmacion').hidden = true;
    $('.inscripcion').hidden = false;
    actualizarResumen();
    $('#insNombre').focus();
  });

  const escenario = $('#escenario');
  const foco = { x: 50, y: 42, ox: 50, oy: 42, cuadro: 0 };
  function moverFoco() {
    foco.x += (foco.ox - foco.x) * 0.14;
    foco.y += (foco.oy - foco.y) * 0.14;
    escenario.style.setProperty('--mx', `${foco.x.toFixed(2)}%`);
    escenario.style.setProperty('--my', `${foco.y.toFixed(2)}%`);
    if (Math.abs(foco.ox - foco.x) > 0.05 || Math.abs(foco.oy - foco.y) > 0.05) foco.cuadro = requestAnimationFrame(moverFoco);
    else foco.cuadro = 0;
  }
  escenario.addEventListener('pointermove', evento => {
    const r = escenario.getBoundingClientRect();
    foco.ox = ((evento.clientX - r.left) / r.width) * 100;
    foco.oy = ((evento.clientY - r.top) / r.height) * 100;
    if (movimientoReducido.matches) {
      foco.x = foco.ox;
      foco.y = foco.oy;
      escenario.style.setProperty('--mx', `${foco.x}%`);
      escenario.style.setProperty('--my', `${foco.y}%`);
      return;
    }
    if (!foco.cuadro) foco.cuadro = requestAnimationFrame(moverFoco);
  });
  escenario.addEventListener('pointerleave', () => {
    foco.ox = 50;
    foco.oy = 42;
    if (!foco.cuadro && !movimientoReducido.matches) foco.cuadro = requestAnimationFrame(moverFoco);
  });

  function estadoEscuela() {
    const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const dato = tipo => partes.find(p => p.type === tipo).value;
    const semana = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dato('weekday'));
    const minutos = (Number(dato('hour')) % 24) * 60 + Number(dato('minute'));
    const abierto = (semana >= 1 && semana <= 5 && minutos >= 960 && minutos < 1260) || (semana === 6 && minutos >= 540 && minutos < 840);
    const pie = $('#pieEstado');
    pie.classList.toggle('abierto', abierto);
    if (abierto) {
      pie.textContent = 'Abierto ahora';
      return;
    }
    let cuando;
    if (semana >= 1 && semana <= 5 && minutos < 960) cuando = 'hoy a las 16:00';
    else if (semana >= 1 && semana <= 4) cuando = 'mañana a las 16:00';
    else if (semana === 5) cuando = 'el sábado a las 9:00';
    else if (semana === 6 && minutos < 540) cuando = 'hoy a las 9:00';
    else cuando = 'el lunes a las 16:00';
    pie.textContent = `Cerrado ahora, abrimos ${cuando}`;
  }

  estadoEscuela();
  setInterval(estadoEscuela, 60000);

  let esperaRedimension = 0;
  window.addEventListener('resize', () => {
    dibujarLogo();
    clearTimeout(esperaRedimension);
    esperaRedimension = setTimeout(() => {
      dibujarPentagrama();
      dibujarCompases();
      alHacerScroll();
    }, 150);
  });
})();
