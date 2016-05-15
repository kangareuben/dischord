let topCanvas = document.getElementById("top")
topCanvas.width = window.innerWidth

let sideLength = topCanvas.width / 16

topCanvas.height = sideLength * 1.5
let topCtx = topCanvas.getContext("2d")
topCtx.fillStyle = "#ffffff"
topCtx.globalAlpha = .35

let bottomCanvas = document.getElementById("bottom")
bottomCanvas.width = window.innerWidth
bottomCanvas.height = sideLength * 1.25
let bottomCtx = bottomCanvas.getContext("2d")
bottomCtx.fillStyle = "#ffffff"
bottomCtx.globalAlpha = .35

let backgroundCanvas = document.getElementById("background")
backgroundCanvas.width = window.innerWidth
backgroundCanvas.height = window.innerHeight
let backgroundCtx = backgroundCanvas.getContext("2d")
//let gl = backgroundCanvas.getContext("webgl")
backgroundCtx.fillStyle = "#ccccff"

let backgroundColors = [[176, 23, 31], [205, 16, 118], [148, 0, 211], [0, 0, 139], [0, 128, 128], [46, 139, 87], [0, 100, 0], [85, 107, 47], [238, 118, 0], [255, 69, 0]]
let bgcLength = backgroundColors.length
let foregroundColors = [[220, 20, 60], [255, 105, 180], [224, 102, 255], [67, 110, 238], [32, 178, 170], [78, 238, 148], [0, 205, 0], [107, 142, 35], [255, 165, 79], [255, 125, 64]]
let fgcLength = foregroundColors.length
let currentBackgroundColor = [255, 255, 255]
let currentForegroundColor = [255, 255, 255]
let nextBackgroundColor = [255, 255, 255]
let nextForegroundColor = [255, 255, 255]

let reachedNextColor = true

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

let fadeDiv = document.getElementById("fadeable")
let fadeOpacity = 1
let mouseLastMoved

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
    
    mouseLastMoved = Date.now()
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
        impulse: "tuna/impulses/impulse_pistol.wav",
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
            if(cells[i - 1]){
                if(Math.random() < .2){
                    chordNotes.push(i)
                }
                else if(!cells[i - 1].alive){
                    chordNotes.push(i)
                }
                else{
                    if(cells[i - 2]){
                        if(cells[i - 1].alive && cells[i - 2].alive && Math.random() < .3){
                            chordNotes.push(i)
                        }
                    }
                }
            }
            else{
                chordNotes.push(i)
            }
        }
        else{
            cells[i].alive = false
        }
        
        cells[i].nextState = "undefined"
    }
    
    for(let i = 0; i < chordNotes.length; i++){
        playNote(chordNotes[i], chordLength * beatLength, .025, attackLength, decayLength, 0)
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
        if(cells[i].alive && chordNotes.includes(i)){
            topCtx.fillRect(i * sideLength, 0, sideLength, sideLength)
        }
    }
    
    updateCount++
    
    for(let i = 0; i < xCells; i++){
        topCtx.font = "18px Helvetica"
        topCtx.globalAlpha = .4
        topCtx.fillText(parseInt(tune.note(i)), i * sideLength + 10, sideLength + 20)
        topCtx.globalAlpha = .35
    }
    
    shaders()
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

let shaders = () => {
    if(reachedNextColor){
        let i = getRandomBackgroundColor()
        nextBackgroundColor = backgroundColors[i]
        nextForegroundColor = foregroundColors[i]
        reachedNextColor = false
    }
    
    currentBackgroundColor = lerpTowardColor(currentBackgroundColor, nextBackgroundColor)
    currentForegroundColor = lerpTowardColor(currentForegroundColor, nextForegroundColor)
    
    let foregroundColorR = currentForegroundColor[0] + (Math.floor(Math.random() * 17) - 16)
    let foregroundColorG = currentForegroundColor[1] + (Math.floor(Math.random() * 17) - 16)
    let foregroundColorB = currentForegroundColor[2] + (Math.floor(Math.random() * 17) - 16)
    let foregroundColor = [foregroundColorR, foregroundColorG, foregroundColorB]
    
    let backgroundColorR = currentBackgroundColor[0] + (Math.floor(Math.random() * 17) - 16)
    let backgroundColorG = currentBackgroundColor[1] + (Math.floor(Math.random() * 17) - 16)
    let backgroundColorB = currentBackgroundColor[2] + (Math.floor(Math.random() * 17) - 16)
    let backgroundColor = [backgroundColorR, backgroundColorG, backgroundColorB]
    
    for(let i = 0; i < window.innerWidth; i += 10){
        for(let j = 0; j < window.innerHeight; j += 10){
            //let color = (Math.floor(Math.random() * 16777215.))
            //backgroundCtx.fillStyle = "#" + color
            
            let column = Math.floor(i / (window.innerWidth / 16))
            if((cells[column].alive && chordNotes.includes(column))){
                backgroundCtx.fillStyle = rgbToHex(foregroundColor[0], foregroundColor[1], foregroundColor[2])
                backgroundCtx.fillRect(i, j, Math.random() * 20, Math.random() * 20)
            }
            else if(Math.random() < .4){
                backgroundCtx.fillStyle = rgbToHex(backgroundColor[0], backgroundColor[1], backgroundColor[2])
                backgroundCtx.fillRect(i, j, Math.random() * 20, Math.random() * 20)
            }
        }
    }
}

let componentToHex = c => {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

let getRandomBackgroundColor = () => {
    let i = Math.floor(Math.random() * bgcLength)
    return i
}

let lerpTowardColor = (currentColor, newColor) => {
    let returnColor = currentColor
    
    if(currentColor[0] == newColor[0] && currentColor[1] == newColor[1] && currentColor[2] == newColor[2]){
        reachedNextColor = true
        return returnColor
    }
    
    for(let i = 0; i < 3; i++){
        if(currentColor[i] < newColor[i]){
            returnColor[i]++
        }
        else if(currentColor[i] > newColor[i]){
            returnColor[i]--
        }
    }
    
    return returnColor
}

let rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let fadeCanvas = () => {
    /*var pixels = backgroundCtx.getImageData(0, 0, window.innerWidth, window.innerHeight);
    
    for(var d = 3; d < pixels.data.length; d += 4){
        pixels.data[d] = Math.floor(pixels.data[d] * .999)
        if(pixels.data[d] < 0){
            pixels.data[d] = 0
        }
    }
    
    backgroundCtx.putImageData(pixels, 0, 0)*/
}

let fadeText = () => {
    fadeDiv.style.opacity = fadeOpacity;
    fadeDiv.style.filter = 'alpha(opacity=' + fadeOpacity * 100 + ")";
        
    if(Date.now() - mouseLastMoved > 1000){
        fadeOpacity -= .025
    }
    
    if(fadeOpacity < 0){
        fadeOpacity = 0
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
let interval2 = setInterval(shaders, Math.random() * beatLength * 3000)
let interval3 = setInterval(fadeCanvas, (1000. / 180.) / (beatLength / 5.))
let interval4 = setInterval(fadeText, 100)

document.onmousemove = () => {
    fadeOpacity = 1
    mouseLastMoved = Date.now()
}

scaleSelect.onchange = () => {
    tune.loadScale(scaleSelect.value)
}

frequencySelect.onchange = () => {
    tune.tonicize(parseInt(frequencySelect.value))
}

beatLengthSelect.onchange = () => {
    beatLength = parseFloat(beatLengthSelect.value)
    clearInterval(interval)
    clearInterval(interval2)
    clearInterval(interval3)
    interval = setInterval(draw2, beatLength * 1000)
    interval2 = setInterval(shaders, Math.random() * beatLength * 1500)
    interval3 = setInterval(fadeCanvas, beatLength * (1000. / 180.))
}

attackLengthSelect.onchange = () => {
    attackLength = parseFloat(attackLengthSelect.value)
}

decayLengthSelect.onchange = () => {
    decayLength = parseFloat(decayLengthSelect.value)
}