let gui;
let bgColor;

let circuit
let selected
let mode
let material;

async function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    gui = createGUI("main-gui", canvas);

    bgColor = color(0, 0, 0);

    circuit = new Circuit()
    selected = null
    mode = "draw"

    /*
    EXAMPLE METAL RESISTIVITIES
    Silver: 1.59e-8
    Copper: 1.68e-8
    Gold: 2.44e-8
    Zinc: 5.90e-8
    Iron: 9.70e-8
    Steel: 69.0e-8
    Mercury 98.0e-8
    */ 
    material = new Material(200, 10, 1.68e-8, 0.01);
    material.calculateVariables();

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
