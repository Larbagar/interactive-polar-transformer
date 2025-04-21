import {canvas, ctx} from "./canvas.mjs"
import {toWorld, transX, transY, zoom} from "./camera.mjs"
import {strokes} from "./drawing.mjs"
import {toolbar} from "./toolbar.mjs"


const piLen = 500
const stepLen = 250

let animationTime = 0
function setAnimationTime(t){
    animationTime = t
    window.animationTime = t
}
window.setAnimationTime = x => {
    animationTime = x
    draw()
}
const spin = (x, y) => {
    if(x / piLen < animationTime){
        const angle = (x / piLen - animationTime) * 2 * Math.PI
        return {x: -y*Math.sin(angle), y: y*Math.cos(angle)}
    }else{
        return {x: x - animationTime * piLen, y: y}
    }
}
const lerp = (x, y) => {
    const angle = (x / piLen - animationTime) * 2 * Math.PI
    return {x: x * (1 - animationTime) + -y * Math.cos(x / piLen * 2 * Math.PI) * animationTime, y: y * (1 - animationTime) + y * Math.sin(x / piLen * 2 * Math.PI) * animationTime}
}
let transformationFunction = lerp



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

    ctx.lineWidth = 1
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    for(let i = Math.ceil(left / stepLen) * stepLen; i <= Math.floor(right / stepLen) * stepLen; i += stepLen){
        ctx.moveTo(i, top)
        ctx.lineTo(i, bottom)
    }
    for(let i = Math.ceil(top / stepLen) * stepLen; i <= Math.floor(bottom / stepLen) * stepLen; i += stepLen){
        ctx.moveTo(left, i)
        ctx.lineTo(right, i)
    }
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.lineWidth = 5
    for(const stroke of strokes){
        ctx.strokeStyle = stroke.color
        ctx.beginPath()
        const start = transformationFunction(stroke.path[0], stroke.path[1])
        ctx.moveTo(start.x, start.y)
        if(window.pathRaw){
            for(let i = 2; i < stroke.pathRaw.length; i += 2){
                const vertex = transformationFunction(stroke.pathRaw[i], stroke.pathRaw[i + 1])
                ctx.lineTo(vertex.x, vertex.y)
            }
        }else {
            for (let i = 2; i < stroke.path.length; i += 2) {
                const vertex = transformationFunction(stroke.path[i], stroke.path[i + 1])
                ctx.lineTo(vertex.x, vertex.y)
            }
        }
        ctx.stroke()

        ctx.strokeStyle = "magenta"
        ctx.beginPath()
        ctx.moveTo(stroke.path[stroke.path.length - 4], stroke.path[stroke.path.length - 3])
        ctx.lineTo(stroke.path[stroke.path.length - 2], stroke.path[stroke.path.length - 1])
        ctx.stroke()
    }

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
window.draw = draw

export {draw, setAnimationTime}