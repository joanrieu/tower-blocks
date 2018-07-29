interface GameObject {
  transform: {
    children: GameObject[],
    x: number,
    y: number,
    w: number,
    h: number
  },
  block?: {
    falling: boolean
  },
  crane?: {
    ltr: boolean,
    position: number,
    nextBlock?: GameObject,
    cooldown: number
  }
}

const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")!

let drop = false
document.addEventListener("keydown", event => drop = event.keyCode === 32)

const rootGO: GameObject = {
  transform: {
    children: [],
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }
}

setTimeout(function setup() {
  const crane: GameObject = {
    transform: {
      children: [],
      x: 0,
      y: -7,
      w: .2,
      h: 2
    },
    crane: {
      ltr: true,
      position: 0,
      cooldown: Date.now()
    }
  }
  rootGO.transform.children.push(crane)
})

function update() {
  updateGO(rootGO)
}

function updateGO(go: GameObject) {
  updateBlock(go)
  updateCrane(go)

  for (const childGO of go.transform.children)
    updateGO(childGO)
}

function updateBlock(blockGO: GameObject) {
  if (blockGO.block) {
    if (blockGO.block.falling)
      blockGO.transform.y += .1
  }
}

function updateCrane(craneGO: GameObject) {
  if (craneGO.crane) {
    const max = 100
    if (craneGO.crane.ltr)
      craneGO.crane.position++
    else
      craneGO.crane.position--
    if (craneGO.crane.position % max === 0)
      craneGO.crane.ltr = !craneGO.crane.ltr
    craneGO.crane.position = craneGO.crane.position
    craneGO.transform.x = Math.sin((craneGO.crane.position - max / 2) * Math.PI / max) * 3

    if (!craneGO.crane.nextBlock && Date.now() > craneGO.crane.cooldown) {
      const blockGO: GameObject = {
        transform: {
          children: [],
          x: 0,
          y: craneGO.transform.h / 2,
          w: 1,
          h: 1
        },
        block: {
          falling: false
        }
      }
      craneGO.transform.children.push(blockGO)
      craneGO.crane.nextBlock = blockGO
    }

    if (drop && craneGO.crane.nextBlock) {
      drop = false
      const blockGO = craneGO.crane.nextBlock
      delete craneGO.crane.nextBlock
      craneGO.transform.children.pop()
      blockGO.transform.x += craneGO.transform.x
      blockGO.transform.y += craneGO.transform.y
      rootGO.transform.children.push(blockGO)
      blockGO.block!.falling = true
      craneGO.crane.cooldown = Date.now() + 1000
    }
  }
}

requestAnimationFrame(function render() {
  update()

  ctx.save()
  resizeCanvas()
  renderGO(rootGO)
  ctx.restore()

  requestAnimationFrame(render)
})

function resizeCanvas() {
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight
  ctx.translate(canvas.width / 2, canvas.height / 2)

  const heightInBlocks = 15
  const coef = canvas.height / heightInBlocks
  ctx.scale(coef, coef)
}

function renderGO(go: GameObject) {
  ctx.save()

  renderBlock(go)
  renderCrane(go)

  ctx.translate(go.transform.x, go.transform.y)

  for (const childGO of go.transform.children)
    renderGO(childGO)

  ctx.restore()
}

function renderBlock(go: GameObject) {
  if (go.block) {
    const { x, y, w, h } = go.transform
    ctx.fillStyle = "darkblue"
    ctx.fillRect(x - w / 2, y - h / 2, w, h)
  }
}

function renderCrane(go: GameObject) {
  if (go.crane) {
    const { x, y, w, h } = go.transform
    ctx.fillStyle = "yellow"
    ctx.fillRect(x - w / 2, y - h / 2, w, h)
  }
}
