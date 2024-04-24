const canvas = document.querySelector('canvas')
const game_text = document.querySelector('#game__text')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const movement_speed = {
  x: 5,
  y: 20,
}

let timer = 60
let timer_id

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image_src: './imgs/background.png',
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 130,
  },
  image_src: './imgs/shop.png',
  scale: 2.75,
  frames_max: 6,
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  color: 'blue',
  canvas: {
    height: canvas.height - 96,
  },
  image_src: './imgs/samuraiMack/Idle.png',
  frames_max: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      image_src: './imgs/samuraiMack/Idle.png',
      frames_max: 8,
    },
    run: {
      image_src: './imgs/samuraiMack/Run.png',
      frames_max: 8,
    },
    jump: {
      image_src: './imgs/samuraiMack/Jump.png',
      frames_max: 2,
    },
    fall: {
      image_src: './imgs/samuraiMack/Fall.png',
      frames_max: 2,
    },
    attack_first: {
      image_src: './imgs/samuraiMack/Attack1.png',
      frames_max: 6,
    },
    take_hit: {
      image_src: './imgs/samuraiMack/Take hit.png',
      frames_max: 4,
    },
    death: {
      image_src: './imgs/samuraiMack/Death.png',
      frames_max: 6,
    },
  },
  attack_box: {
    offset: {
      x: 100,
      y: 50,
    },
    height: 50,
    width: 154,
  },
})

const enemy = new Fighter({
  position: {
    x: 480,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: 'purple',
  canvas: {
    height: canvas.height - 96,
  },
  image_src: './imgs/kenji/Idle.png',
  frames_max: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 169,
  },
  sprites: {
    idle: {
      image_src: './imgs/kenji/Idle.png',
      frames_max: 4,
    },
    run: {
      image_src: './imgs/kenji/Run.png',
      frames_max: 8,
    },
    jump: {
      image_src: './imgs/kenji/Jump.png',
      frames_max: 2,
    },
    fall: {
      image_src: './imgs/kenji/Fall.png',
      frames_max: 2,
    },
    attack_first: {
      image_src: './imgs/kenji/Attack1.png',
      frames_max: 4,
    },
    take_hit: {
      image_src: './imgs/kenji/Take hit.png',
      frames_max: 3,
    },
    death: {
      image_src: './imgs/kenji/Death.png',
      frames_max: 7,
    },
  },
  attack_box: {
    offset: {
      x: -165,
      y: 50,
    },
    height: 50,
    width: 150,
  },
})

const player_keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

const enemy_keys = {
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  if (player_keys.a.pressed && player.last_key === 'a') {
    player.velocity.x = -movement_speed.x
    player.switchSprite('run')
  } else if (player_keys.d.pressed && player.last_key === 'd') {
    player.velocity.x = movement_speed.x
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  if (enemy_keys.ArrowLeft.pressed && enemy.last_key === 'ArrowLeft') {
    enemy.velocity.x = -movement_speed.x
    enemy.switchSprite('run')
  } else if (enemy_keys.ArrowRight.pressed && enemy.last_key === 'ArrowRight') {
    enemy.velocity.x = movement_speed.x
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.is_attacking &&
    player.frames_current === 4
  ) {
    enemy.takeHit()
    player.is_attacking = false

    document.querySelector('#enemy-health').style.width = `${enemy.health}%`
  }

  if (player.is_attacking && player.frames_current === 4) {
    player.is_attacking = false
  }

  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.is_attacking &&
    enemy.frames_current === 2
  ) {
    player.takeHit()
    enemy.is_attacking = false

    document.querySelector('#player-health').style.width = `${player.health}%`
  }

  if (enemy.is_attacking && enemy.frames_current === 2) {
    enemy.is_attacking = false
  }

  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timer_id })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  const { key } = event

  event.preventDefault()

  if (!player.death) {
    if (Object.keys(player_keys).includes(key)) {
      player_keys[key].pressed = true
      player.last_key = key
    }

    if (key === 'w') {
      player.velocity.y = -movement_speed.y
    }

    if (key === ' ') {
      player.attack()
    }
  }

  if (!enemy.death) {
    if (Object.keys(enemy_keys).includes(key)) {
      enemy_keys[key].pressed = true
      enemy.last_key = key
    }

    if (key === 'ArrowUp') {
      enemy.velocity.y = -movement_speed.y
    }

    if (key === 'ArrowDown') {
      enemy.attack()
    }
  }
})

window.addEventListener('keyup', ({ key }) => {
  if (Object.keys(player_keys).includes(key)) {
    player_keys[key].pressed = false
    player.last_key = key
  }

  if (Object.keys(enemy_keys).includes(key)) {
    enemy_keys[key].pressed = false
    enemy.last_key = key
  }
})
