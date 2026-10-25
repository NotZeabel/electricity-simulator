let gui;
let bgColor;

let circuit
let selected
let mode

async function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    gui = createGUI("main-gui", canvas);

    bgColor = color(0, 0, 0);

    circuit = new Circuit()
    selected = null
    mode = "draw"

    // populateGUI(gui);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function populateGUI(gui) {
    gui
        .button("btn0", 90, 50, 300, 60)
        .text("Random BG color")
        .textSize(20)
        .corners(10)
        .setAction(() => {
            bgColor = color(random(255), random(255), random(255));
        });
}

function draw() {
    background(bgColor);

    circuit.display(selected, mode === "draw", mouseX, mouseY)

    noStroke()
    textAlign(LEFT, TOP)
    textSize(13)
    text("Mode: " + mode + "\n" + "D draw\tS select\tU undo\tC clear", 16, 16)
}

function mousePressed() {
    if (mode === "draw") {
        circuit.addPoint(mouseX, mouseY)
    } else {
        selected = circuit.selectAt(mouseX, mouseY)
    }
}

function keyPressed() {
    if (key.toLowerCase() === "d") {
        mode = "draw"
        selected = null
    } else if (key.toLowerCase() === "s") {
        mode = "select"
    } else if (key.toLowerCase() === "c") {
        circuit.clear()
        selected = null
    } else if (key.toLowerCase() === "u") {
        circuit.removeLastPoint()
        if (selected && !circuit.segments.includes(selected)) {
            selected == null
        }
        return false
    }
}
