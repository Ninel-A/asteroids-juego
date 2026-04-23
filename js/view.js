var canv = document.getElementById('gameCanvas')
var ctx = canv.getContext('2d')
canv.width = window.innerWidth
canv.height = window.innerHeight

function drawBackground() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canv.width, canv.height)
}

function drawShip(ship, blinkOn, exploding) {
  if (exploding) {
    ctx.fillStyle = 'darkred'
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.r * 1.5, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.fillStyle = 'orange'
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.r * 1.2, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.fillStyle = 'yellow'
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.r * 0.9, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.r * 0.6, 0, Math.PI * 2, false)
    ctx.fill()
    return
  }

  if (ship.thrusting && blinkOn) {
    ctx.fillStyle = 'yellow'
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = SHIP_SIZE / 10
    ctx.beginPath()
    ctx.moveTo(
      ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
      ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
    )
    ctx.lineTo(
      ship.x - ship.r * ((4 / 3) * Math.cos(ship.a)),
      ship.y + ship.r * ((4 / 3) * Math.sin(ship.a))
    )
    ctx.lineTo(
      ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
      ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
    )
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  ctx.strokeStyle = blinkOn ? 'white' : 'transparent'
  ctx.lineWidth = SHIP_SIZE / 20
  ctx.beginPath()
  ctx.moveTo(
    ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
    ship.y - (4 / 3) * ship.r * Math.sin(ship.a)
  )
  ctx.lineTo(
    ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + Math.sin(ship.a)),
    ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - Math.cos(ship.a))
  )
  ctx.lineTo(
    ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - Math.sin(ship.a)),
    ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + Math.cos(ship.a))
  )
  ctx.closePath()
  ctx.stroke()

  if (SHOW_BOUNDING) {
    ctx.strokeStyle = 'lime'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false)
    ctx.stroke()
  }
}

function drawLasers(ship) {
  for (var i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime == 0) {
      ctx.fillStyle = 'purple'
      ctx.beginPath()
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false)
      ctx.fill()
    } else {
      ctx.fillStyle = 'orange'
      ctx.beginPath()
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.fillStyle = 'purple'
      ctx.beginPath()
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false)
      ctx.fill()
      ctx.fillStyle = 'pink'
      ctx.beginPath()
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false)
      ctx.fill()
    }
  }
}

function drawAsteroids(asteroids) {
  for (var i = 0; i < asteroids.length; i++) {
    ctx.strokeStyle = 'slategrey'
    ctx.lineWidth = SHIP_SIZE / 20
    var x = asteroids[i].x,
      y = asteroids[i].y
    var r = asteroids[i].r,
      a = asteroids[i].a
    var vert = asteroids[i].vert,
      offs = asteroids[i].offs

    ctx.beginPath()
    ctx.moveTo(x + r * offs[0] * Math.cos(a), y + r * offs[0] * Math.sin(a))
    for (var j = 1; j < vert; j++) {
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + (j * Math.PI * 2) / vert),
        y + r * offs[j] * Math.sin(a + (j * Math.PI * 2) / vert)
      )
    }
    ctx.closePath()
    ctx.stroke()

    if (SHOW_BOUNDING) {
      ctx.strokeStyle = 'lime'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2, false)
      ctx.stroke()
    }
  }
}

function drawTexts(text, textAlfa) {
  if (textAlfa >= 0) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, ' + textAlfa + ')'
    ctx.font = 'small-caps ' + TEXT_SIZE + 'px dejavu sans mono'
    ctx.fillText(text, canv.width / 2, canv.height * 0.75)
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'white'
  ctx.font = TEXT_SIZE * 0.4 + 'px dejavu sans mono'
  ctx.fillText('Record: ' + (localStorage.getItem(SAVE_KEY_SCORE) || 0), canv.width / 2, 16)
}

function drawCenterDot(ship) {
  ctx.fillStyle = 'red'
  ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
}
function drawEnemies(enemies) {
  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i]

    // nave enemiga (triángulo invertido en color rojo)
    ctx.strokeStyle = 'red'
    ctx.lineWidth = SHIP_SIZE / 20
    ctx.beginPath()
    ctx.moveTo(e.x - e.r * Math.cos(e.a), e.y + e.r * Math.sin(e.a))
    ctx.lineTo(
      e.x + e.r * ((2 / 3) * Math.cos(e.a) + Math.sin(e.a)),
      e.y - e.r * ((2 / 3) * Math.sin(e.a) - Math.cos(e.a))
    )
    ctx.lineTo(
      e.x + e.r * ((2 / 3) * Math.cos(e.a) - Math.sin(e.a)),
      e.y - e.r * ((2 / 3) * Math.sin(e.a) + Math.cos(e.a))
    )
    ctx.closePath()
    ctx.stroke()

    // lasers enemigo
    ctx.fillStyle = 'red'
    for (var j = 0; j < e.lasers.length; j++) {
      ctx.beginPath()
      ctx.arc(e.lasers[j].x, e.lasers[j].y, SHIP_SIZE / 15, 0, Math.PI * 2, false)
      ctx.fill()
    }
  }
}
