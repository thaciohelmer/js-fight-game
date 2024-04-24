class Sprite {
  constructor({
    position,
    image_src,
    scale = 1,
    frames_max = 1,
    offset = { x: 0, y: 0 },
  }) {
    this.position = position
    this.height = 150
    this.width = 50
    this.image = new Image()
    this.image.src = image_src
    this.scale = scale
    this.frames_max = frames_max
    this.frames_current = 0
    this.frames_elapsed = 0
    this.frames_hold = 5
    this.offset = offset
  }

  draw() {
    c.drawImage(
      this.image,
      this.frames_current * (this.image.width / this.frames_max),
      0,
      this.image.width / this.frames_max,
      this.image.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      (this.image.width / this.frames_max) * this.scale,
      this.image.height * this.scale
    )
  }

  animateFrame() {
    this.frames_elapsed++

    if (this.frames_elapsed % this.frames_hold === 0) {
      if (this.frames_current < this.frames_max - 1) {
        this.frames_current++
      } else {
        this.frames_current = 0
      }
    }
  }

  update() {
    this.draw()
    this.animateFrame()
  }
}

class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = 'red',
    canvas,
    image_src,
    scale = 1,
    frames_max = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attack_box = { offset: {}, width: undefined, height: undefined },
  }) {
    super({
      position,
      image_src,
      scale,
      frames_max,
      offset,
    })

    this.velocity = velocity
    this.height = 150
    this.width = 50
    this.last_key = ''
    this.attack_box = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      ...attack_box,
    }
    this.color = color
    this.is_attacking = false
    this.health = 100
    this.canvas = canvas
    this.frames_current = 0
    this.frames_elapsed = 0
    this.frames_hold = 5
    this.sprites = sprites
    this.death = false

    for (const key in this.sprites) {
      const sprite = this.sprites[key]

      sprite.image = new Image()
      sprite.image.src = sprite.image_src
    }
  }

  update() {
    this.draw()

    if (!this.death) this.animateFrame()

    this.attack_box.position.x = this.position.x + this.attack_box.offset.x
    this.attack_box.position.y = this.position.y + this.attack_box.offset.y

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.y + this.height + this.velocity.y >= this.canvas.height) {
      this.velocity.y = 0
      this.position.y = 330
    } else {
      this.velocity.y += gravity
    }
  }

  switchSprite(sprite) {
    if (this.image === this.sprites.death.image) {
      if (this.frames_current === this.sprites.death.frames_max - 1) {
        this.death = true
      }

      return
    }

    if (
      !Object.keys(this.sprites).includes(sprite) ||
      this.image == this.sprites[sprite].image ||
      (this.image == this.sprites.attack_first.image &&
        this.frames_current < this.sprites.attack_first.frames_max - 1)
    ) {
      return
    }

    if (
      this.image === this.sprites.take_hit.image &&
      this.frames_current < this.sprites.take_hit.frames_max - 1
    ) {
      return
    }

    this.image = this.sprites[sprite].image
    this.frames_max = this.sprites[sprite].frames_max
    this.frames_current = 0
  }

  attack() {
    this.is_attacking = true
    this.switchSprite('attack_first')
  }

  takeHit() {
    this.health -= 20

    if (this.health <= 0) {
      this.switchSprite('death')

      return
    }

    this.switchSprite('take_hit')
  }
}
