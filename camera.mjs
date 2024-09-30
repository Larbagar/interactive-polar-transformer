import {draw} from "./draw.mjs"

let transX = - innerWidth / 4
let transY = innerHeight / 4
let zoom = 1

function toWorld(x, y){
    return {x: (x - innerWidth / 2) / zoom - transX, y: (y - innerHeight / 2) / zoom - transY}
}

function setupCameraListeners(){
    addEventListener("wheel", e => {
        e.preventDefault()
        if(e.ctrlKey){
            const world = toWorld(e.clientX, e.clientY)
            const factor = 2**(-e.deltaY/100)
            transX = (world.x + transX) / factor - world.x
            transY = (world.y + transY) / factor - world.y
            zoom *= factor
        }else{
            transX -= e.deltaX / zoom
            transY -= e.deltaY / zoom
        }
        draw()
    }, {passive: false})
}

export {transX, transY, zoom, toWorld, setupCameraListeners}