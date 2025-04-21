import {toolbar} from "./toolbar.mjs"
import {createDrawHandler, EraseHandler} from "./drawing.mjs"

const handlerMap = new Map()

const cursorHandlerMap = new Map()
cursorHandlerMap.set("0", createDrawHandler("blue"))
cursorHandlerMap.set("2", EraseHandler)

const pointerHandlerMap = new Map()
pointerHandlerMap.set("pen", createDrawHandler("green"))
pointerHandlerMap.set("touch", createDrawHandler("red"))

const cursorHandlers = new Map()
const pointerHandlers = new Map()

const activeHandlers = new Map()

class InputType {
    static MOUSE = "mouse"
    static POINTER = "pointer"
    /** @type {string} */
    type
    /** @type {string} */
    id

    /**
     * @param {string} type
     * @param {string} id
     */
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
            handler = toolbar.pointerDown(e.clientX, e.clientY, new InputType(InputType.POINTER, e.pointerType))
        }else{
            const handlerClass = pointerHandlerMap.get(e.pointerType)
            if(handlerClass){
                handler = new handlerClass(e.clientX, e.clientY)
            }
        }
        if(handler) {
            pointerHandlers.set(e.pointerId, handler)
        }
        e.preventDefault()
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
        let handler
        if(toolbar.contains(e.clientX, e.clientY)){
            handler = toolbar.pointerDown(e.clientX, e.clientY, new InputType(InputType.MOUSE, e.button.toString()))
        }else{
            handler = new (cursorHandlerMap.get(e.button.toString()))(e.clientX, e.clientY)
        }
        if(handler) {
            cursorHandlers.set(e.button.toString(), handler)
        }
    })
    addEventListener("mousemove", e => {
        for(const [button, handler] of cursorHandlers){
            handler.move(e.clientX, e.clientY)
        }
    })
    addEventListener("mouseup", e => {
        const handler = cursorHandlers.get(e.button.toString())
        if(handler) {
            handler.end(e.clientX, e.clientY)
            cursorHandlers.delete(e.button.toString())
        }
    })
}

export {setupListeners, cursorHandlerMap, pointerHandlerMap, InputType}