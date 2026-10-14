/* ===== A. MURCIÉLAGOS VOLANDO sobre un canvas ===== */
const lienzo = document.getElementById('cielo');
const ctx = lienzo.getContext('2d');
function ajustar(){ lienzo.width = innerWidth; lienzo.height = innerHeight; }
addEventListener('resize', ajustar); ajustar();

// Cada murciélago es un objeto con posición, velocidad y tamaño
const murcielagos = Array.from({length: innerWidth < 600 ? 4 : 9}, () => ({
  x: Math.random()*innerWidth, y: Math.random()*innerHeight*.6,
  vx: 0.6 + Math.random()*1.4, t: Math.random()*6, tam: 14 + Math.random()*16
}));
function dibujarMurcielago(m){
  const ala = Math.sin(m.t*8)*m.tam*.6;   // el aleteo cambia con el tiempo
  ctx.fillStyle = '#050208';
  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.quadraticCurveTo(m.x - m.tam, m.y - ala, m.x - m.tam*1.8, m.y + 4);
  ctx.quadraticCurveTo(m.x - m.tam*.8, m.y + 3, m.x, m.y + 8);
  ctx.quadraticCurveTo(m.x + m.tam*.8, m.y + 3, m.x + m.tam*1.8, m.y + 4);
  ctx.quadraticCurveTo(m.x + m.tam, m.y - ala, m.x, m.y);
  ctx.fill();
}
function animar(){
  ctx.clearRect(0,0,lienzo.width,lienzo.height);
  for(const m of murcielagos){
    m.x += m.vx; m.t += 0.016; m.y += Math.sin(m.t*2)*0.6;
    if(m.x > lienzo.width + 60){ m.x = -60; m.y = Math.random()*lienzo.height*.6; }
    dibujarMurcielago(m);
  }
  requestAnimationFrame(animar);
}
animar();

/* ===== B. LUZ MALA que sigue al cursor ===== */
const fantasma = document.getElementById('fantasma');
// En celulares y tablets no hay "mouse": eliminamos la luz para que no quede trabada en una esquina
const esTactil = window.matchMedia('(hover: none), (pointer: coarse)').matches;
if(esTactil){
  fantasma.remove();
}else{
  addEventListener('mousemove', e => {
    fantasma.style.left = (e.clientX + 18) + 'px';
    fantasma.style.top  = (e.clientY + 18) + 'px';
  });
}

/* ===== C. SONIDOS con la Web Audio API (sin archivos externos) ===== */
let audio = null, sonidoOn = false;
function tono(frec, dur, tipo='sawtooth', vol=0.08){
  if(!sonidoOn) return;
  audio = audio || new (window.AudioContext||window.webkitAudioContext)();
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = tipo; o.frequency.value = frec;
  g.gain.setValueAtTime(vol, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
  o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
}
document.getElementById('btn-sonido').addEventListener('click', e => {
  e.preventDefault(); sonidoOn = !sonidoOn;
  e.target.textContent = sonidoOn ? '🔊 Sonido' : '🔇 Sonido';
  tono(110, .6);
});
// Un sonido grave al abrir cada historia
document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => tono(90, .5)));

/* ===== D. RELÁMPAGO aleatorio ===== */
const rayo = document.getElementById('rayo');
function relampago(){
  rayo.classList.remove('on'); void rayo.offsetWidth; rayo.classList.add('on');
  tono(55, 1.2, 'square', .1);
  setTimeout(relampago, 12000 + Math.random()*15000);
}
setTimeout(relampago, 8000);

/* ===== E. CURIOSIDADES ===== */
const datos = [
  'Desde 1907, en Argentina existe el padrinazgo presidencial para el séptimo hijo varón, una medida pensada para frenar el abandono por la creencia en el lobizón.',
  'Al Pombero se le dejan ofrendas de tabaco, caña y miel para ganarse su favor. Y nunca se lo nombra de noche.',
  'La Luz Mala se ve en el campo, sobre todo en el norte y el litoral. Hay quienes la explican con gases que se desprenden de huesos y materia en descomposición.',
  'Cada 1 de agosto, en el noroeste, se le hace una ofrenda a la Pachamama para agradecerle y pedirle protección.',
  'Muchas leyendas mezclan creencias guaraníes, indígenas y españolas. La Llorona, por ejemplo, llegó con la colonia y echó raíces en cada región.',
  'Se cuenta que El Familiar, el perro negro del ingenio azucarero, reclamaba un peón por año al patrón que hizo el pacto.'
];
let ultimo = -1;
document.getElementById('btn-dato').addEventListener('click', () => {
  let i; do { i = Math.floor(Math.random()*datos.length); } while(i === ultimo);
  ultimo = i;
  document.getElementById('caja-dato').textContent = datos[i];
  tono(220, .3, 'triangle');
});

/* ===== F. JUEGO: juntá las 4 ofrendas de miel ===== */
const tablero = document.getElementById('tablero');
let ocultas, aciertos, intentos;
function iniciarJuego(){
  tablero.innerHTML = ''; aciertos = 0; intentos = 0;
  const contenido = Array(16).fill('🔥').map((x,i) => i < 4 ? '🍯' : (i < 8 ? '🐺' : x));
  contenido.sort(() => Math.random() - .5);   // mezclar
  contenido.forEach(c => {
    const b = document.createElement('button');
    b.className = 'casilla'; b.textContent = '❓'; b.setAttribute('aria-label','Casilla oculta');
    b.addEventListener('click', () => {
      b.textContent = c; b.disabled = true; intentos++;
      if(c === '🍯'){ aciertos++; tono(520, .2, 'triangle'); } else tono(80, .4);
      document.getElementById('puntos').textContent = aciertos;
      document.getElementById('intentos').textContent = intentos;
      if(aciertos === 4) setTimeout(() => alert('¡Juntaste todas las ofrendas en ' + intentos + ' intentos!'), 150);
    });
    tablero.appendChild(b);
  });
  document.getElementById('puntos').textContent = 0;
  document.getElementById('intentos').textContent = 0;
}
document.getElementById('btn-reiniciar').addEventListener('click', iniciarJuego);
iniciarJuego();

/* ===== G. FORMULARIO (solo muestra una respuesta, no envía datos) ===== */
document.getElementById('formulario').addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  document.getElementById('respuesta').textContent = '🌙 Gracias, ' + nombre + '. Tu mensaje viaja con el viento del monte...';
  e.target.reset(); tono(150, .8);
});
