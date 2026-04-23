newGame()
ship.x = canv.width / 2
ship.y = canv.height / 2

document.getElementById('btn-start').addEventListener('click', function () {
  document.getElementById('screen-menu').classList.add('hidden')
  gameRunning = true
})

document.getElementById('btn-restart').addEventListener('click', function () {
  document.getElementById('lives').textContent = 'VIDAS: 3'
  document.getElementById('score').textContent = 'PUNTOS: 0'
  document.getElementById('screen-gameover').classList.add('hidden')
  newGame()
  ship.x = canv.width / 2
  ship.y = canv.height / 2
  gameRunning = true
})

document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)

function keyDown(ev) {
  switch (ev.keyCode) {
    case 32:
      shootLaser()
      break
    case 37:
    case 65:
      ship.rot = ((-TURN_SPEED / 180) * Math.PI) / FPS
      break
    case 38:
    case 87:
      ship.thrusting = true
      break
    case 39:
    case 68:
      ship.rot = ((+TURN_SPEED / 180) * Math.PI) / FPS
      break
    case 40:
    case 83:
      ship.thrustingBack = true
      break // abajo / S
  }
}

function keyUp(ev) {
  switch (ev.keyCode) {
    case 32:
      ship.canShoot = true
      break
    case 37:
    case 65:
      ship.rot = 0
      break
    case 38:
    case 87:
      ship.thrusting = false
      break
    case 39:
    case 68:
      ship.rot = 0
      break
    case 40:
    case 83:
      ship.thrustingBack = false
      break // abajo / S
  }
}

setInterval(update, 1000 / FPS)

function update() {
  if (!gameRunning) return

  var blinkOn = ship.blinkNum == 0 || ship.blinkNum % 2 != 0
  var exploding = ship.explodeTime > 0

  // -- MODEL: física --
  if (ship.thrusting) {
    ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FPS
    ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FPS
  } else if (ship.thrustingBack) {
    ship.thrust.x -= (SHIP_THRUST * Math.cos(ship.a)) / FPS
    ship.thrust.y += (SHIP_THRUST * Math.sin(ship.a)) / FPS
  } else {
    ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS
    ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS
  }

  // -- VIEW: dibujar --
  drawBackground()
  drawShip(ship, blinkOn, exploding)
  drawLasers(ship)
  drawAsteroids(asteroids)
  drawEnemies(enemies)
  drawTexts(text, textAlfa)
  drawCenterDot(ship)

  // actualizar textAlfa
  if (textAlfa >= 0) textAlfa -= 1.0 / TEXT_FADE_TIME / FPS

  // -- MODEL: blink --
  if (!exploding && ship.blinkNum > 0) {
    ship.blinkTime--
    if (ship.blinkTime == 0) {
      ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS)
      ship.blinkNum--
    }
  }

  // -- MODEL: lasers --
  for (var i = 0; i < ship.lasers.length; i++) {
    var laserHit = false
    for (var j = 0; j < asteroids.length; j++) {
      if (
        ship.lasers[i].explodeTime == 0 &&
        distanceBetweenPoints(asteroids[j].x, asteroids[j].y, ship.lasers[i].x, ship.lasers[i].y) <
          asteroids[j].r
      ) {
        destroyAsteroid(j)
        ship.lasers[i].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS)
        i--
        laserHit = true
        break
      }
    }
    if (laserHit) continue

    if (ship.lasers[i].dist > LASER_DIST * canv.width) {
      ship.lasers.splice(i, 1)
      i--
      continue
    }

    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--
      if (ship.lasers[i].explodeTime == 0) {
        ship.lasers.splice(i, 1)
        i--
      }
    } else {
      ship.lasers[i].x += ship.lasers[i].xv
      ship.lasers[i].y += ship.lasers[i].yv
      ship.lasers[i].dist += Math.sqrt(
        Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2)
      )
      if (
        ship.lasers[i].x < 0 ||
        ship.lasers[i].x > canv.width ||
        ship.lasers[i].y < 0 ||
        ship.lasers[i].y > canv.height
      ) {
        ship.lasers.splice(i, 1)
        i--
      }
    }
  }

  // -- MODEL: mover asteroides --
  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].x += asteroids[i].velX / FPS
    asteroids[i].y += asteroids[i].velY / FPS
    if (asteroids[i].x < 0 - asteroids[i].r) asteroids[i].x = canv.width + asteroids[i].r
    else if (asteroids[i].x > canv.width + asteroids[i].r) asteroids[i].x = 0 - asteroids[i].r
    if (asteroids[i].y < 0 - asteroids[i].r) asteroids[i].y = canv.height + asteroids[i].r
    else if (asteroids[i].y > canv.height + asteroids[i].r) asteroids[i].y = 0 - asteroids[i].r
  }

  // -- MODEL: mover nave --
  ship.a += ship.rot
  ship.x += ship.thrust.x
  ship.y += ship.thrust.y
  if (ship.x < 0 - ship.r) ship.x = canv.width + ship.r
  else if (ship.x > canv.width + ship.r) ship.x = 0 - ship.r
  if (ship.y < 0 - ship.r) ship.y = canv.height + ship.r
  else if (ship.y > canv.height + ship.r) ship.y = 0 - ship.r

  // enemigos
  if (!exploding) {
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i]

      // apuntar hacia la nave
      e.a = Math.atan2(ship.y - e.y, ship.x - e.x)

      // mover hacia la nave
      e.x += (ENEMY_SPD * Math.cos(e.a)) / FPS
      e.y += (ENEMY_SPD * Math.sin(e.a)) / FPS

      // disparar al jugador
      e.fireTimer++
      if (e.fireTimer >= ENEMY_FIRE_RATE) {
        enemyShootAt(e)
        e.fireTimer = 0
      }

      for (var j = 0; j < e.lasers.length; j++) {
        e.lasers[j].x += e.lasers[j].xv
        e.lasers[j].y += e.lasers[j].yv

        if (
          ship.blinkNum == 0 &&
          distanceBetweenPoints(ship.x, ship.y, e.lasers[j].x, e.lasers[j].y) < ship.r
        ) {
          explodeShip()
          e.lasers.splice(j, 1)
          j--
          continue
        }

        if (
          e.lasers[j].x < 0 ||
          e.lasers[j].x > canv.width ||
          e.lasers[j].y < 0 ||
          e.lasers[j].y > canv.height
        ) {
          e.lasers.splice(j, 1)
          j--
        }
      }

      for (var k = 0; k < ship.lasers.length; k++) {
        if (
          ship.lasers[k].explodeTime == 0 &&
          distanceBetweenPoints(e.x, e.y, ship.lasers[k].x, ship.lasers[k].y) < e.r
        ) {
          enemies.splice(i, 1)
          ship.lasers.splice(k, 1)
          score += 150
          document.getElementById('score').textContent = 'PUNTOS: ' + score
          i--
          break
        }
      }

      if (distanceBetweenPoints(ship.x, ship.y, e.x, e.y) < ship.r + e.r) {
        explodeShip()
        enemies.splice(i, 1)
        i--
      }
    }
  }
  // -- MODEL: colisiones nave-asteroide --
  if (!exploding && ship.blinkNum == 0) {
    for (var i = 0; i < asteroids.length; i++) {
      if (
        distanceBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) <
        ship.r + asteroids[i].r
      ) {
        explodeShip()
        destroyAsteroid(i)
        break
      }
    }
  }

  // -- MODEL: countdown explosión --
  if (exploding) {
    ship.explodeTime--
    if (ship.explodeTime == 0) {
      ship = newShip()
      ship.x = canv.width / 2
      ship.y = canv.height / 2
      if (lives == 0) {
        if (score > parseInt(localStorage.getItem(SAVE_KEY_SCORE))) {
          localStorage.setItem(SAVE_KEY_SCORE, score)
        }
        gameRunning = false
        document.getElementById('final-score').textContent = 'Puntos: ' + score
        document.getElementById('screen-gameover').classList.remove('hidden')
      }
    }
  }
}
