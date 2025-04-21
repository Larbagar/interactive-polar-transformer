import {ctx} from "./canvas.mjs"
import {draw, setAnimationTime} from "./draw.mjs"
import {cursorHandlerMap, InputType, pointerHandlerMap} from "./inputHandler.mjs"
import {createDrawHandler, EraseHandler} from "./drawing.mjs"

class IconHandler {
    toolbar
    icon
    handler
    constructor(toolbar, icon, handler) {
        this.toolbar = toolbar
        this.icon = icon
        this.handler = handler
    }
    move(x, y){
        const iconPos = toolbar.positionOf(this.icon)
        this.handler.move((x - iconPos.x)/toolbar.scale, (y - iconPos.y)/toolbar.scale)
    }
    end(x, y){
        const iconPos = toolbar.positionOf(this.icon)
        this.handler.end((x - iconPos.x)/toolbar.scale, (y - iconPos.y)/toolbar.scale)
    }
}

class Toolbar {
    /** @type {number} */
    x
    /** @type {number} */
    y
    /** @type {number} */
    scale
    icons = []
    constructor(x, y, scale = 50, icons = []) {
        this.x = x
        this.y = y
        this.scale = scale
        this.icons = icons
    }
    contains(x, y){
        return (
            this.x < x && x < this.x + this.scale*this.getWidth() &&
            this.y < y && y < this.y + this.scale
        )
    }
    positionOf(icon){
        let position = 0
        for(const currentIcon of this.icons){
            if(currentIcon === icon){
                return {
                    x: this.x + this.scale*position,
                    y: this.y,
                }
            }
            position += currentIcon.width
        }
    }
    pointerDown(x, y, inputType){
        let position = 0
        for(const icon of this.icons){
            const relX = x - this.x - position
            if(0 <= relX && relX < this.scale*icon.width){
                const handler = icon.pointerDown?.(
                    (x - this.x - position)/toolbar.scale,
                    (y - this.y)/toolbar.scale,
                    inputType
                )
                if(handler) {
                    return new IconHandler(this, icon, handler)
                }else{
                    return
                }
            }
            position += this.scale*icon.width
        }
    }
    getWidth(){
        let width = 0
        for(const icon of this.icons){
            width += icon.width
        }
        return width
    }
    draw(){
        ctx.save()
        let width = this.getWidth()

        ctx.translate(this.x, this.y)
        ctx.scale(this.scale, this.scale)

        ctx.beginPath()
        ctx.roundRect(0, 0, width, 1, 0.2)
        ctx.strokeStyle = "white"
        ctx.fillStyle = "black"
        ctx.fill()
        ctx.lineWidth = 2 / this.scale
        ctx.stroke()


        for(const icon of this.icons){
            // ctx.beginPath()
            // ctx.rect(0, 0, icon.width, 1)
            // ctx.stroke()
            icon.draw()
            ctx.translate(icon.width, 0)
        }

        ctx.restore()
    }
}

class Handle {
    width = 0.4
    draw(){
        ctx.beginPath()
        ctx.roundRect(0.1, 0.1, 0.2, 0.8, 0.1)
        ctx.stroke()
    }
}

class Color {
    width = 0.8
    color
    constructor(color) {
        this.color = color
    }
    draw() {
        ctx.beginPath()
        ctx.roundRect(0.1, 0.2, 0.6, 0.6, 0.1)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.stroke()
    }
    pointerDown(x, y, type){
        if(type.type == InputType.POINTER){
            pointerHandlerMap.set(type.id, createDrawHandler(this.color))
        }
        if(type.type == InputType.MOUSE){
            cursorHandlerMap.set(type.id, createDrawHandler(this.color))
        }
    }
}

class Pen {
    width = 0.8
    draw(){
        ctx.save()
        ctx.translate(0.4, 0.5)
        ctx.rotate(-Math.PI/4)
        ctx.beginPath()
        // Have the range -0.4 to 0.4 to work with
        ctx.arc(-0.35, 0, 0.05, Math.PI/2, 3*Math.PI/2)
        ctx.lineTo(0.3, -0.05)
        ctx.lineTo(0.4, 0)
        ctx.lineTo(0.3, 0.05)
        ctx.closePath()
        // ctx.roundRect(-0.4, -0.05, 0.8, 0.1, 0.05)
        ctx.stroke()
        ctx.restore()
    }
}

class Eraser {
    width = 0.8
    draw() {
        ctx.save()
        ctx.translate(0.4, 0.5)
        ctx.rotate(-Math.PI/4)
        ctx.beginPath()
        ctx.roundRect(-0.35, -0.2, 0.7, 0.4, 0.1)
        ctx.moveTo(0, -0.2)
        ctx.stroke()
        ctx.restore()
    }
    pointerDown(x, y, type){
        if(type.type == InputType.POINTER){
            pointerHandlerMap.set(type.id, EraseHandler)
        }
        if(type.type == InputType.MOUSE){
            cursorHandlerMap.set(type.id, EraseHandler)
        }
    }
}

class Padding {
    width
    constructor(width = 0.3) {
        this.width = width - 0.1
    }
    draw(){}
}

class SliderHandler {
    constructor(x, y, slider) {
        this.slider = slider
        this.x = this.slider.position - x / 0.8 / this.slider.width
    }
    move(x, y) {
        this.slider.position = this.x + x / 0.8 / this.slider.width
        this.slider.position = Math.max(0, Math.min(1, this.slider.position))
        setAnimationTime(this.slider.position)

        draw()
    }
    end(x, y){

    }
}

class Slider {
    width
    position = 0
    constructor(width) {
        this.width = width
    }
    draw(){
        ctx.beginPath()
        ctx.moveTo(0.1, 0.5)
        ctx.lineTo(this.width - 0.1, 0.5)
        ctx.moveTo(0.1, 0.4)
        ctx.lineTo(0.1, 0.6)
        ctx.moveTo(this.width - 0.1, 0.4)
        ctx.lineTo(this.width - 0.1, 0.6)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0.1 + (this.width - 0.2)*this.position, 0.5, 0.08, 0, 2*Math.PI)
        ctx.fillStyle = "white"
        ctx.fill()
    }
    pointerDown(x, y){
        return new SliderHandler(x, y, this)
    }
}


const toolbar = new Toolbar(10, 10, 50)
toolbar.icons.push(
    new Handle(),
    // new Padding(),
    new Color("red"),
    new Color("green"),
    new Color("blue"),
    new Eraser(),
    new Padding(),
    new Slider(2),
    // new Padding(),
    new Handle(),
)

export {toolbar}