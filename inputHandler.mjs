import {toolbar} from "./toolbar.mjs"
import {DrawHandler, EraseHandler} from "./drawing.mjs"

const handlerMap = new Map()

const cursorHandlerMap = new Map()
cursorHandlerMap.set(0, DrawHandler)
cursorHandlerMap.set(2, EraseHandler)

const pointerHandlerMap = new Map()
pointerHandlerMap.set("pen", DrawHandler)
pointerHandlerMap.set("touch", DrawHandler)

const cursorHandlers = new Map()
const pointerHandlers = new Map()

const activeHandlers = new Map()

class InputType {
    MOUSE = "mouse"
    POINTER = "pointer"
    /** @type {InputType.MOUSE | InputType.POINTER} */
    type
    /** @type {number} */
    id
    constructor(type, id) {
        this.type = type
        this.id = id
    }
}

function setupListeners(){
    addEventListener("pointerdown", e => {
        if(e.pointerType === "mouse"){
            return
        }
        let handler
        if(toolbar.contains(e.clientX, e.clientY)){
            handler = toolbar.pointerDown(e.clientX, e.clientY, new InputType())
        }else{
            const handlerClass = pointerHandlerMap.get(e.pointerType)
            if(handlerClass){
                handler = new handlerClass(e.clientX, e.clientY)
            }
        }
        if(handler) {
            pointerHandlers.set(e.pointerId, handler)
        }
    })
    addEventListener("pointermove", e => {
        if(e.pointerType === "mouse"){
            return
        }
        const handler = pointerHandlers.get(e.pointerId)
        if(handler) {
            handler.move(e.clientX, e.clientY)
        }
    })
    addEventListener("pointerup", e => {
        if(e.pointerType === "mouse"){
            return
        }
        const handler = pointerHandlers.get(e.pointerId)
        if(handler) {
            handler.end(e.clientX, e.clientY)
            pointerHandlers.delete(e.pointerId)
        }
    })
    addEventListener("mousedown", e => {
        if(toolbar.contains(e.clientX, e.clientY)){
            console.log("send to toolbar")
            return
        }
        const handler = new (cursorHandlerMap.get(e.button))(e.clientX, e.clientY)
        cursorHandlers.set(e.button, handler)
    })
    addEventListener("mousemove", e => {
        for(const [button, handler] of cursorHandlers){
            handler.move(e.clientX, e.clientY)
        }
    })
    addEventListener("mouseup", e => {
        const handler = cursorHandlers.get(e.button)
        if(handler) {
            handler.end(e.clientX, e.clientY)
            cursorHandlers.delete(e.button)
        }
    })
}

export {setupListeners}