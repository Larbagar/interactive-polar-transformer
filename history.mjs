const did = []
const undid = []

addEventListener("keydown", e => {
    if((e.code === "KeyZ" && !e.shiftKey || e.code === "KeyY" && e.shiftKey) && did.length){
        const event = did.pop()
        event.undo()
        undid.push(event)
    }else if((e.code === "KeyY" && !e.shiftKey || e.code === "KeyZ" && e.shiftKey) && undid.length){
        const event = undid.pop()
        event.do()
        did.push(event)
    }
})

export {did, undid}