const FPS = 30
const FRICTION = 0.7
const LASER_DIST = 0.6
const LASER_EXPLODE_DUR = 0.1
const LASER_MAX = 10
const LASER_SPD = 500
const ASTEROIDS_JAG = 0.5
const ROID_PTS_LGE = 20
const ROID_PTS_MED = 30
const ROID_PTS_SML = 50
const Num_ASTEROIDS = 2
const ASTEROIDS_SPD = 50
const ASTEROIDS_VERT = 10
const ASTEROIDS_SIZE = 100
const SHIP_SIZE = 30
const SHIP_BLINK_DUR = 0.1
const SHIP_EXPLODE_DUR = 0.3
const SHIP_INV_DUR = 1.5
const SHIP_THRUST = 5
const TURN_SPEED = 360
const TEXT_FADE_TIME = 2
const TEXT_SIZE = 40
const SAVE_KEY_SCORE = 'asteroidsRecord'
const SHOW_BOUNDING = false

var level, asteroids, ship, score, text, textAlfa
var lives = 3
var gameRunning = false

function newGame() {
  level = 0
  score = 0
  lives = 3
  ship = newShip()
  if (localStorage.getItem(SAVE_KEY_SCORE) === null) {
    localStorage.setItem(SAVE_KEY_SCORE, 0)
  }
  newLevel()
}

function newLevel() {
  text = 'Nivel ' + (level + 1)
  textAlfa = 1.0
  createAsteroidBelt()
}

function newShip() {
  return {
    x: canv.width / 2,
    y: canv.height / 2,
    r: SHIP_SIZE / 2,
    canShoot: true,
    lasers: [],
    a: (90 / 180) * Math.PI,
    blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
    blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
    explodeTime: 0,
    rot: 0,
    thrusting: false,
    thrustingBack: false,
    thrust: { x: 0, y: 0 }
  }
}

function createAsteroidBelt() {
  asteroids = []
  for (var i = 0; i < Num_ASTEROIDS + level; i++) {
    var x, y
    do {
      x = Math.floor(Math.random() * canv.width)
      y = Math.floor(Math.random() * canv.height)
    } while (distanceBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r)
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 2)))
  }
}

function newAsteroid(x, y, r) {
  var lvlMult = 1 + 0.1 * level
  var a = Math.random() * Math.PI * 2
  var asteroid = {
    x: x,
    y: y,
    r: r,
    a: a,
    vert: Math.floor(Math.random() * (ASTEROIDS_VERT + 1) + ASTEROIDS_VERT / 2),
    rot: (Math.random() - 0.5) * 0.02,
    offs: [],
    velX: ASTEROIDS_SPD * lvlMult * Math.cos(a),
    velY: ASTEROIDS_SPD * lvlMult * Math.sin(a)
  }
  for (var i = 0; i < asteroid.vert; i++) {
    asteroid.offs.push(Math.random() * ASTEROIDS_JAG * 2 + 1 - ASTEROIDS_JAG)
  }
  return asteroid
}

function destroyAsteroid(index) {
  var x = asteroids[index].x
  var y = asteroids[index].y
  var r = asteroids[index].r

  if (r == Math.ceil(ASTEROIDS_SIZE / 2)) {
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)))
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)))
    score += ROID_PTS_LGE
  } else if (r == Math.ceil(ASTEROIDS_SIZE / 4)) {
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)))
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)))
    score += ROID_PTS_MED
  } else {
    score += ROID_PTS_SML
  }

  asteroids.splice(index, 1)

  document.getElementById('score').textContent = 'PUNTOS: ' + score

  if (asteroids.length == 0) {
    level++
    newLevel()
  }
}

function explodeShip() {
  lives--
  document.getElementById('lives').textContent = 'VIDAS: ' + lives
  ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS)
  ship.thrust.x = 0
  ship.thrust.y = 0
}

function shootLaser() {
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    ship.lasers.push({
      x: ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
      y: ship.y - (4 / 3) * ship.r * Math.sin(ship.a),
      xv: (LASER_SPD * Math.cos(ship.a)) / FPS,
      yv: (-LASER_SPD * Math.sin(ship.a)) / FPS,
      dist: 0,
      explodeTime: 0
    })
  }
  ship.canShoot = false
}

function distanceBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}
