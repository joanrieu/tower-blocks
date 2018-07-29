interface GameObject {
  transform: {
    children: GameObject[],
    x: number,
    y: number,
    w: number,
    h: number
  },
  block?: {
    color: string
  },
  crane?: {
    ltr: boolean,
    position: number
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

function updateBlock(go: GameObject) {
  if (go.block) {
    // todo
  }
}

function updateCrane(go: GameObject) {
  if (go.crane) {
    const max = 100
    let { position } = go.crane
    if (go.crane.ltr)
      position++
    else
      position--
    if (position % max === 0)
      go.crane.ltr = !go.crane.ltr
    go.crane.position = position
    go.transform.x = Math.sin((position - max / 2) * Math.PI / max) * 3
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
  const coef = canvas.height / 10
  ctx.translate(canvas.width / 2, canvas.height / 2)
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
    ctx.strokeStyle = "darkblue"
    ctx.strokeRect(x - w / 2, y - h / 2, w, h)
  }
}

function renderCrane(go: GameObject) {
  if (go.crane) {
    const { x, y, w, h } = go.transform
    ctx.fillStyle = "yellow"
    ctx.fillRect(x - w / 2, y - h / 2, w, h)
  }
}
