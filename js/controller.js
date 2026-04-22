newGame();
ship.x = canv.width / 2;
ship.y = canv.height / 2;

document.getElementById("btn-start").addEventListener("click", function () {
  document.getElementById("screen-menu").classList.add("hidden");
  gameRunning = true;
});

document.getElementById("btn-restart").addEventListener("click", function () {
  document.getElementById("lives").textContent = "VIDAS: 3";
  document.getElementById("score").textContent = "PUNTOS: 0";
  document.getElementById("screen-gameover").classList.add("hidden");
  newGame();
  ship.x = canv.width / 2;
  ship.y = canv.height / 2;
  gameRunning = true;
});

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(ev) {
  switch (ev.keyCode) {
    case 32: shootLaser(); break;
    case 37: ship.rot = -TURN_SPEED / 180 * Math.PI / FPS; break;
    case 38: ship.thrusting = true; break;
    case 39: ship.rot = +TURN_SPEED / 180 * Math.PI / FPS; break;
  }
}

function keyUp(ev) {
  switch (ev.keyCode) {
    case 32: ship.canShoot = true; break;
    case 37: ship.rot = 0; break;
    case 38: ship.thrusting = false; break;
    case 39: ship.rot = 0; break;
  }
}

setInterval(update, 1000 / FPS);

function update() {
  if (!gameRunning) return;

  var blinkOn = ship.blinkNum == 0 || ship.blinkNum % 2 != 0;
  var exploding = ship.explodeTime > 0;

  // -- MODEL: física --
  if (ship.thrusting) {
    ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
    ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
  } else {
    ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
    ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
  }

  // -- VIEW: dibujar --
  drawBackground();
  drawShip(ship, blinkOn, exploding);
  drawLasers(ship);
  drawAsteroids(asteroids);
  drawTexts(text, textAlfa);
  drawCenterDot(ship);

  // actualizar textAlfa
  if (textAlfa >= 0) textAlfa -= 1.0 / TEXT_FADE_TIME / FPS;

  // -- MODEL: blink --
  if (!exploding && ship.blinkNum > 0) {
    ship.blinkTime--;
    if (ship.blinkTime == 0) {
      ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
      ship.blinkNum--;
    }
  }

  // -- MODEL: lasers --
  for (var i = 0; i < ship.lasers.length; i++) {
    var laserHit = false;
    for (var j = 0; j < asteroids.length; j++) {
      if (ship.lasers[i].explodeTime == 0 &&
          distanceBetweenPoints(asteroids[j].x, asteroids[j].y, ship.lasers[i].x, ship.lasers[i].y) < asteroids[j].r) {
        destroyAsteroid(j);
        ship.lasers[i].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
        i--;
        laserHit = true;
        break;
      }
    }
    if (laserHit) continue;

    if (ship.lasers[i].dist > LASER_DIST * canv.width) {
      ship.lasers.splice(i, 1); i--; continue;
    }

    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--;
      if (ship.lasers[i].explodeTime == 0) {
        ship.lasers.splice(i, 1); i--;
      }
    } else {
      ship.lasers[i].x += ship.lasers[i].xv;
      ship.lasers[i].y += ship.lasers[i].yv;
      ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
      if (ship.lasers[i].x < 0 || ship.lasers[i].x > canv.width ||
          ship.lasers[i].y < 0 || ship.lasers[i].y > canv.height) {
        ship.lasers.splice(i, 1); i--;
      }
    }
  }

  // -- MODEL: mover asteroides --
  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].x += asteroids[i].velX / FPS;
    asteroids[i].y += asteroids[i].velY / FPS;
    if (asteroids[i].x < 0 - asteroids[i].r) asteroids[i].x = canv.width + asteroids[i].r;
    else if (asteroids[i].x > canv.width + asteroids[i].r) asteroids[i].x = 0 - asteroids[i].r;
    if (asteroids[i].y < 0 - asteroids[i].r) asteroids[i].y = canv.height + asteroids[i].r;
    else if (asteroids[i].y > canv.height + asteroids[i].r) asteroids[i].y = 0 - asteroids[i].r;
  }

  // -- MODEL: mover nave --
  ship.a += ship.rot;
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;
  if (ship.x < 0 - ship.r) ship.x = canv.width + ship.r;
  else if (ship.x > canv.width + ship.r) ship.x = 0 - ship.r;
  if (ship.y < 0 - ship.r) ship.y = canv.height + ship.r;
  else if (ship.y > canv.height + ship.r) ship.y = 0 - ship.r;

  // -- MODEL: colisiones nave-asteroide --
  if (!exploding && ship.blinkNum == 0) {
    for (var i = 0; i < asteroids.length; i++) {
      if (distanceBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
        explodeShip();
        destroyAsteroid(i);
        break;
      }
    }
  }

  // -- MODEL: countdown explosión --
  if (exploding) {
    ship.explodeTime--;
    if (ship.explodeTime == 0) {
      ship = newShip();
      ship.x = canv.width / 2;
      ship.y = canv.height / 2;
      if (lives == 0) {
        if (score > parseInt(localStorage.getItem(SAVE_KEY_SCORE))) {
          localStorage.setItem(SAVE_KEY_SCORE, score);
        }
        gameRunning = false;
        document.getElementById("final-score").textContent = "Puntos: " + score;
        document.getElementById("screen-gameover").classList.remove("hidden");
      }
    }
  }
}