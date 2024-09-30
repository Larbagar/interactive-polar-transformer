import {draw} from "./draw.mjs"
import {setupCameraListeners} from "./camera.mjs"
import {setupListeners} from "./inputHandler.mjs"


addEventListener("resize", e => {
    draw()
})
draw()

addEventListener("contextmenu", e => e.preventDefault())

setupCameraListeners()
setupListeners()