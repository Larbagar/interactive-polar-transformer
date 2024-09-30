import {canvas, ctx} from "./canvas.mjs"
import {toWorld, transX, transY, zoom} from "./camera.mjs"
import {strokes} from "./drawing.mjs"
import {toolbar} from "./toolbar.mjs"

window.transFunc = ctx => {}

const stepLen = 500

let animationTime = 0
function setAnimationTime(t){
    animationTime = t
}
window.setAnimationTime = x => {
    animationTime = x
    draw()
}
const spin = (x, y) => {
    if(x < animationTime){
        const angle = (x - animationTime) * 2 * Math.PI / stepLen
        return {x: -y*Math.sin(angle), y: y*Math.cos(angle)}
    }else{
        return {x: x - animationTime * Math.sign(x), y: y}
    }
}
let transformationFunction = spin



function draw(){
    const
        {x: left, y: top} = toWorld(0, 0),
        {x: right, y: bottom} = toWorld(innerWidth, innerHeight)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(canvas.width/innerWidth, canvas.height/innerHeight)

    ctx.save()

    ctx.translate(innerWidth / 2, innerHeight / 2)
    ctx.scale(zoom, zoom)
    ctx.translate(transX, transY)

    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(left, 0)
    ctx.lineTo(right, 0)
    ctx.moveTo(0, top)
    ctx.lineTo(0, bottom)
    ctx.stroke()

    ctx.beginPath()
    for(let i = Math.ceil(left / stepLen) * stepLen; i <= Math.floor(right / stepLen) * stepLen; i += stepLen){
        ctx.moveTo(i, -10)
        ctx.lineTo(i, 10)
    }
    for(let i = Math.ceil(top / stepLen) * stepLen; i <= Math.floor(bottom / stepLen) * stepLen; i += stepLen){
        ctx.moveTo(-10, i)
        ctx.lineTo(10, i)
    }
    ctx.stroke()

    ctx.strokeStyle = "red"
    ctx.lineWidth = 5
    ctx.beginPath()
    for(const stroke of strokes){
        const start = transformationFunction(stroke.path[0], stroke.path[1])
        ctx.moveTo(start.x, start.y)
        for(let i = 2; i < stroke.path.length; i += 2){
            const vertex = transformationFunction(stroke.path[i], stroke.path[i + 1])
            ctx.lineTo(vertex.x, vertex.y)
        }
    }
    ctx.stroke()

    ctx.restore()

    toolbar.draw()
    // ctx.beginPath()
    // ctx.roundRect(5, 5, 10, 40, 5)
    // ctx.stroke()
    //
    // ctx.beginPath()
    // ctx.roundRect(25, 5, 40, 40, 5)
    // ctx.fillStyle = "red"
    // ctx.fill()
    // ctx.stroke()

    ctx.restore()
}

export {draw, setAnimationTime}