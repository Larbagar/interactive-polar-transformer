import {draw} from "./draw.mjs"
import {toWorld} from "./camera.mjs"
import {did} from "./history.mjs"

class StrokeAction {
    stroke
    constructor(stroke) {
        this.stroke = stroke
    }
    do(){
        strokes.add(this.stroke)
        draw()
    }
    undo(){
        strokes.delete(this.stroke)
        draw()
    }
}

class EraseAction {
    stroke
    constructor(stroke) {
        this.stroke = stroke
    }
    do() {
        strokes.delete(this.stroke)
        draw()
    }
    undo() {
        strokes.add(this.stroke)
        draw()
    }
}

function follow(
    targetStart, targetVel,
    followerStart, restoringCoefficient,
    time,
){
    return (followerStart + targetVel / restoringCoefficient - targetStart)*Math.exp(-restoringCoefficient * time) + targetVel*time - targetVel / restoringCoefficient + targetStart
}

class Stroke {
    path = []
    /** @type {number} */
    lastX
    /** @type {number} */
    lastY
    /** @type {number} */
    drawX
    /** @type {number} */
    drawY
    /** @type {number} */
    smoothness
    /** @type {number} */
    resolution
    constructor(startX, startY, color = "red", smoothness = 0.02, resolution = 20) { // 0.02, 20
        this.drawX = startX
        this.drawY = startY
        this.lastX = startX
        this.lastY = startY
        this.smoothness = smoothness
        this.resolution = resolution
        this.color = color
        this.pathRaw = []
    }
    append(x, y){
        this.pathRaw.push(x, y)
        this.path.pop()
        this.path.pop()
        const dist = Math.hypot(x - this.drawX, y - this.drawY)
        const count = Math.ceil(dist / this.resolution)
        const stepLen = dist / count
        let currentX = this.drawX
        let currentY = this.drawY
        for(let t = stepLen; t <= dist; t += stepLen){
            currentX = follow(this.lastX, (x - this.lastX) / dist, this.drawX, this.smoothness, t)
            currentY = follow(this.lastY, (y - this.lastY) / dist, this.drawY, this.smoothness, t)
            this.path.push(currentX, currentY)
        }
        this.path.push(x, y)
        this.drawX = currentX
        this.drawY = currentY

        this.lastX = x
        this.lastY = y
    }
    end(x, y) {
        this.path.push(x, y)
        this.lastX = x
        this.lastY = y
        this.drawX = x
        this.drawY = y
    }
}

/** @type {Set<Stroke>} */
const strokes = new Set()

function rayIntersection(
    ax, ay, avx, avy,
    bx, by, bvx, bvy,
){
    const a = (bvx*(by - ay) - bvy*(bx - ax)) / (bvx*avy - bvy*avx)
    const b = (avx*(ay - by) - avy*(ax - bx)) / (avx*bvy - avy*bvx)
    return {a, b}
}

function createDrawHandler(col){
    const handler = function(x, y){
        const world = toWorld(x, y)
        this.stroke = new Stroke(world.x, world.y, col)
        this.action = new StrokeAction(this.stroke)
        this.action.do()
        did.push(this.action)
        this.move = function(x, y){
            const world = toWorld(x, y)
            this.stroke.append(world.x, world.y)
            draw()
        }
        this.end = function(x, y){
            const world = toWorld(x, y)
            this.stroke.end(world.x, world.y)
            draw()
        }
        handler.cancel = function(){}
    }
    return handler
}

class EraseHandler {
    constructor(x, y) {
        const world = toWorld(x, y)
        this.lastX = world.x
        this.lastY = world.y
    }
    move(x, y){
        const world = toWorld(x, y)
        let changed = false
        for (const stroke of strokes) {
            for (let i = 0; i < stroke.path.length - 2; i += 2) {
                const int = rayIntersection(
                    this.lastX, this.lastY,
                    world.x - this.lastX, world.y - this.lastY,
                    stroke.path[i], stroke.path[i + 1],
                    stroke.path[i + 2] - stroke.path[i], stroke.path[i + 3] - stroke.path[i + 1]
                )
                if (0 <= int.a && int.a <= 1 && 0 <= int.b && int.b <= 1) {
                    strokes.delete(stroke)
                    did.push(new EraseAction(stroke))
                    changed = true
                }
            }
        }
        if (changed) {
            draw()
        }
        this.lastX = world.x
        this.lastY = world.y
    }
    end(x, y){

    }
    cancel(x, y){

    }
}

export {createDrawHandler, EraseHandler, strokes}