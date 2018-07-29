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
    nextBlock?: GameObject
  }
}

const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")!

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
      y: -4,
      w: .2,
      h: 2
    },
    crane: {
      ltr: true,
      position: 0
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
      blockGO.transform.x -= .01
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
    if (!craneGO.crane.nextBlock) {
      const block: GameObject = {
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
      craneGO.transform.children.push(block)
      craneGO.crane.nextBlock = block
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

  const heightInBlocks = 10
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
