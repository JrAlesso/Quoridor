// ============================================================
// CORREÇÃO: ROTAÇÃO NO MODO ONLINE (PRIMEIRA PESSOA)
// ============================================================

// 1. Em aplicarEstadoSala, após definir G.p2Name, adicione:
if (G.online && currentUser === G.p2Name) {
  document.getElementById("game-screen").classList.add("p2-active");
  document.getElementById("hud-wrapper").classList.add("rotated");
}

// 2. Em nextTurn, substitua o bloco que alterna a rotação por:
if (!G.vsIA) {
  if (!G.online) {
    document.getElementById("game-screen").classList.toggle("p2-active", G.turn === 1);
    document.getElementById("hud-wrapper").classList.toggle("rotated", G.turn === 1);
  }
  // Se for online, NÃO altere a rotação (ela é fixa)
}

// 3. Em draw, logo após if (!BOARD || BOARD < 10) return; adicione:
var rotated = false;
if (G.online && currentUser === G.p2Name) {
  rotated = true;
  ctx.save();
  ctx.translate(BOARD, BOARD);
  ctx.rotate(Math.PI);
}
// E no final da função, antes do último }, adicione:
if (rotated) ctx.restore();

// 4. Substitua a função getEventXY inteira por:
function getEventXY(e) {
  var rect = canvas.getBoundingClientRect();
  var t = e.touches ? e.touches[0] : e;
  var x = (t.clientX - rect.left) * (BOARD / rect.width);
  var y = (t.clientY - rect.top) * (BOARD / rect.height);
  if (G.online && currentUser === G.p2Name) {
    x = BOARD - x;
    y = BOARD - y;
  }
  return [x, y];
}
