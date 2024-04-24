function rectangularCollision({ rectangle1, rectangle2 }) {
  const rect1 = rectangle1.attack_box
  const rect2 = rectangle2

  const rect1Right = rect1.position.x + rect1.width
  const rect2Right = rect2.position.x + rect2.width
  const rect1Bottom = rect1.position.y + rect1.height
  const rect2Bottom = rect2.position.y + rect2.height

  const horizontalCollision =
    rect1.position.x <= rect2Right && rect1Right >= rect2.position.x
  const verticalCollision =
    rect1.position.y <= rect2Bottom && rect1Bottom >= rect2.position.y

  return horizontalCollision && verticalCollision
}

function determineWinner({ player, enemy, timer_id }) {
  clearTimeout(timer_id)

  const showGameText = (text) => {
    game_text.innerHTML = text
    game_text.style.display = 'flex'
  }

  if (player.health === enemy.health) {
    showGameText('Tie')
  } else if (player.health > enemy.health) {
    showGameText('Player 1 win')
  } else if (player.health < enemy.health) {
    showGameText('Player 2 win')
  }
}

function decreaseTimer() {
  if (timer > 0) {
    timer_id = setTimeout(decreaseTimer, 1000)
    timer--
    document.querySelector('#timer').textContent = timer
  }

  if (timer !== 0) return

  determineWinner({ player, enemy, timer_id })
}
