let topCanvas = document.getElementById("top")
topCanvas.width = window.innerWidth

let sideLength = topCanvas.width / 16

topCanvas.height = sideLength * 1.5
let topCtx = topCanvas.getContext("2d")
topCtx.fillStyle = "#000000"

let bottomCanvas = document.getElementById("bottom")
bottomCanvas.width = window.innerWidth
bottomCanvas.height = sideLength * 1.25
let bottomCtx = bottomCanvas.getContext("2d")
bottomCtx.fillStyle = "#000000"

let xCells = Math.floor(topCanvas.width / sideLength)
let updateCount = 0

let chordNotes = []
let chordBeats = []
let beatLength = .25
let attackLength = .05
let decayLength = .05
let beatLengthSelect = document.getElementById("beatLengthSelect")

let cell = {
    x: 0,
    alive: false,
    nextState: "undefined"
}

let cells = []
let cells2 = []

let selectedCell = 0

let tune
let tuna
let convolver
let audioCtx
let scale = "chin_lusheng"
let scaleSelect = document.getElementById("scaleSelect")
let baseNote = 110
let frequencySelect = document.getElementById("frequencySelect")

let init = () => {
    for(let i = 0; i < xCells; i++){
        let c = Object.create(cell)
        let c2 = Object.create(cell)
        c.x = i
        c2.x = i
        
        if(Math.random() > .5){
            c.alive = true
        }
        
        if(Math.random() > .5){
            c2.alive = true
        }
        
        cells[i] = c
        cells2[i] = c2
        
        if(i == 0){
            if(c2.alive){
                chordBeats.push(i)
            }
        }
        else{
            if(c2.alive && !cells2[i - 1].alive){
                chordBeats.push(i)
            }
        }
    }
    
    initTune()
}

let initTune = () => {
    tune = new Tune()
    tune.loadScale(scale)
    tune.tonicize(baseNote)
    
    audioCtx = new AudioContext()
    
    tuna = new Tuna(audioCtx)
    convolver = new tuna.Convolver({
        highCut: 22050,
        lowCut: 20,
        dryLevel: 1,
        wetLevel: 1.5,
        level: 1,
        impulse: "tuna/impulses/impulse_rev.wav",
        bypass: 0
    })
}

let update = chordLength => {
    chordNotes = []
    for(let i = 0; i < xCells; i++){
        if(i == 0){
            if(cells[xCells - 1].alive != (cells[i].alive || cells[i + 1].alive)){
                cells[i].nextState = "living"
            }
            else{
                cells[i].nextState = "dead"
            }
        }
        else if(i == xCells - 1){
            if((cells[i - 1].alive != (cells[i].alive || cells[0].alive))){
                cells[i].nextState = "living"
            }
            else{
                cells[i].nextState = "dead"
            }
        }
        else{
            if(cells[i - 1].alive != (cells[i].alive || cells[i + 1].alive)){
                cells[i].nextState = "living"
            }
            else{
                cells[i].nextState = "dead"
            }
        }
    }
    
    for(let i = 0; i < xCells; i++){
        if(cells[i].nextState == "living"){
            cells[i].alive = true
            chordNotes.push(i)
        }
        else{
            cells[i].alive = false
        }
        
        cells[i].nextState = "undefined"
    }
    
    for(let i = 0; i < chordNotes.length; i++){
        playNote(chordNotes[i], chordLength * beatLength, .05, attackLength, decayLength, 0)
    }
    
    draw()
}

let update2 = () => {
    chordBeats = []
    
    for(let i = 0; i < xCells; i++){
        if(i == 0){
            if(cells2[xCells - 1].alive != (cells2[i].alive || cells2[i + 1].alive)){
                cells2[i].nextState = "living"
            }
            else{
                cells2[i].nextState = "dead"
            }
        }
        else if(i == xCells - 1){
            if((cells2[i - 1].alive != (cells2[i].alive || cells2[0].alive))){
                cells2[i].nextState = "living"
            }
            else{
                cells2[i].nextState = "dead"
            }
        }
        else{
            if(cells2[i - 1].alive != (cells2[i].alive || cells2[i + 1].alive)){
                cells2[i].nextState = "living"
            }
            else{
                cells2[i].nextState = "dead"
            }
        }
    }				
    for(let i = 0; i < xCells; i++){
        if(cells2[i].nextState == "living"){
            cells2[i].alive = true
        }
        else{
            cells2[i].alive = false
        }
        
        cells2[i].nextState = "undefined"
    }
    
    for(let i = 0; i < xCells; i++){
        if(i == 0){
            if(cells2[i].alive){
                chordBeats.push(i)
            }
        }
        else{
            if(cells2[i].alive && !cells2[i - 1].alive){
                chordBeats.push(i)
            }
        }
    }
}

let draw = () => {
    topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height)
    
    for(let i = 0; i < xCells; i++){
        if(cells[i].alive){
            topCtx.fillRect(i * sideLength, 0, sideLength, sideLength)
        }
    }
    
    updateCount++
    
    for(let i = 0; i < xCells; i++){
        topCtx.font = "18px Helvetica"
        topCtx.fillText(parseInt(tune.note(i)), i * sideLength + 10, sideLength + 20)
    }
}

let draw2 = () => {
    bottomCtx.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height)
    
    for(let i = 0; i < xCells; i++){
        if(cells2[i].alive){
            bottomCtx.fillRect(i * sideLength, bottomCanvas.height - sideLength - 2, sideLength, sideLength)
        }
    }
    
    //Do in two separate loops so the outline will draw on top
    for(let i = 0; i < xCells; i++){
        if(i == selectedCell){
            bottomCtx.lineWidth = 2
            bottomCtx.strokeStyle = "#ff0000"
            bottomCtx.strokeRect(i * sideLength, bottomCanvas.height - sideLength - 2, sideLength, sideLength)
        }
    }
    
    if(chordBeats.includes(selectedCell)){
        update(findChordLength(selectedCell))
    }
    
    selectedCell++
    if(selectedCell >= xCells){
        update2()
        selectedCell = 0
    }
}

let findChordLength = index => {
    let length = 1
    let finished = false
    
    while(!finished){
        if(index + length < cells2.length){
            if(cells2[index + length].alive){
                length++
            }
            else{
                finished = true
            }
        }
        else{
            finished = true
        }
    }
    
    return length
}

let playNote = (frequency, duration, amp, attack, decay, detune) => {
    let osc = audioCtx.createOscillator()
    osc.type = "triangle"
    osc.frequency.value = tune.note(frequency)
    
    if(attack + decay > duration){
        attack = (attack / decay) * (decay * (duration / 2))
        decay = duration - attack
    }
    
    //console.log(attack, decay)
    
    // create gain node to control amplitude
    let gainNode = audioCtx.createGain()
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    gainNode.gain.linearRampToValueAtTime(amp, audioCtx.currentTime + attack)
    gainNode.gain.linearRampToValueAtTime(amp, audioCtx.currentTime + duration - decay)
    gainNode.gain.linearRampToValueAtTime(0,   audioCtx.currentTime + duration)
    
    osc.connect(gainNode)
    
    gainNode.connect(convolver)
    convolver.connect(audioCtx.destination)
    
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
}

window.onload = init
let interval = setInterval(draw2, beatLength * 1000)

scaleSelect.onchange = () => {
    tune.loadScale(scaleSelect.value)
}

frequencySelect.onchange = () => {
    tune.tonicize(parseInt(frequencySelect.value))
}

beatLengthSelect.onchange = () => {
    beatLength = parseFloat(beatLengthSelect.value)
    clearInterval(interval)
    interval = setInterval(draw2, beatLength * 1000)
}

attackLengthSelect.onchange = () => {
    attackLength = parseFloat(attackLengthSelect.value)
}

decayLengthSelect.onchange = () => {
    decayLength = parseFloat(decayLengthSelect.value)
}