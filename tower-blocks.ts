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
  camera?: {},
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

const cameraGO: GameObject = {
  transform: {
    children: [],
    x: 0,
    y: 0,
    w: 0,
    h: 0
  },
  camera: {}
}

const rootGO: GameObject = {
  transform: {
    children: [
      cameraGO
    ],
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }
}

setTimeout(function setup() {
  const craneGO: GameObject = {
    transform: {
      children: [],
      x: 0,
      y: -5,
      w: .2,
      h: 10
    },
    crane: {
      ltr: true,
      position: 0,
      cooldown: Date.now()
    }
  }
  rootGO.transform.children.push(craneGO)

  const baseBlockGO: GameObject = {
    transform: {
      children: [],
      x: 0,
      y:  0,
      w: 10,
      h: 1
    },
    block: {
      falling: false
    }
  }
  rootGO.transform.children.push(baseBlockGO)
})

function update() {
  updateGO(rootGO)
}

function updateGO(go: GameObject) {
  updateBlock(go)
  updateCamera(go)
  updateCrane(go)

  for (const childGO of go.transform.children)
    updateGO(childGO)
}

function updateBlock(blockGO: GameObject) {
  if (blockGO.block) {
    // apply gravity
    if (blockGO.block.falling) {
      const speed = .1
      blockGO.transform.y += speed

      // stop falling when touching previous block
      const snappingDistance = .1
      const topBlockGO = findTopBlock()
      const dx = Math.abs(topBlockGO.transform.x - blockGO.transform.x)
      const dy = Math.abs(topBlockGO.transform.y - blockGO.transform.y)
      const minx = (topBlockGO.transform.w + blockGO.transform.w) / 2
      const miny = (topBlockGO.transform.h + blockGO.transform.h) / 2
      if (dx <= minx && dy < miny + snappingDistance) {
        blockGO.block.falling = false
        blockGO.transform.y = topBlockGO.transform.y - miny
      }
    }
  }
}

function updateCamera(cameraGO: GameObject) {
  if (cameraGO.camera) {
    const highestBlockY = findTopBlock().transform.y
    const targetY = highestBlockY - 3
    cameraGO.transform.y = cameraGO.transform.y * .9 + targetY * .1
  }
}

function updateCrane(craneGO: GameObject) {
  if (craneGO.crane) {
    // move horizontally
    const max = 100
    if (craneGO.crane.ltr)
      craneGO.crane.position++
    else
      craneGO.crane.position--
    if (craneGO.crane.position % max === 0)
      craneGO.crane.ltr = !craneGO.crane.ltr
    craneGO.transform.x = Math.sin((craneGO.crane.position - max / 2) * Math.PI / max) * 3

    // move vertically
    const highestBlockY = findTopBlock().transform.y
    const targetY = highestBlockY - 12
    craneGO.transform.y = craneGO.transform.y * .9 + targetY * .1

    // create a new block
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

    // drop a block
    if (drop && craneGO.crane.nextBlock) {
      const blockGO = craneGO.crane.nextBlock
      delete craneGO.crane.nextBlock
      craneGO.transform.children.pop()
      blockGO.transform.x += craneGO.transform.x
      blockGO.transform.y += craneGO.transform.y
      rootGO.transform.children.push(blockGO)
      blockGO.block!.falling = true
      craneGO.crane.cooldown = Date.now() + 1000
    }

    drop = false
  }
}

function findTopBlock() {
  return rootGO.transform.children
    .filter(go => go.block && !go.block.falling)
    .sort((a, b) => a.transform.y - b.transform.y)
    .shift()!
}

requestAnimationFrame(function render() {
  update()

  ctx.save()
  resizeCanvas()
  ctx.translate(-cameraGO.transform.x, -cameraGO.transform.y)
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
