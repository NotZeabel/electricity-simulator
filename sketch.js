let gui;
let bgColor;

let circuit
let selected
let mode
let material;
let emitter;
let receptor;

let resistance;
let conductivity;
let agents

async function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    gui = createGUI("main-gui", canvas);

    bgColor = color(0, 0, 0);
    
    agents = []
    circuit = new Circuit(agents)
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
    resistance = material.calculateResistance();
    conductivity = material.calculateConductivity();

    console.log("Resistance   =", (resistance).toExponential(2));
    console.log("Conductivity =", (conductivity).toExponential(2));
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
    circuit.applyResistance(resistance);

    if (emitter) {
        emitter.display();
        if (emitter.emit()) {
            agents.push(new Electron(emitter.pos.x, emitter.pos.y, emitter.voltage))
        }
    }

    if (receptor) {
        receptor.display();
    }

    for (const a of agents) {
        a.follow(circuit)
        a.update()
        a.display()
    }

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
    } else if (key.toLowerCase() === "a") {
        agents.push(new Electron(mouseX, mouseY, 1))
    } else if (key.toLowerCase() === "e") {
        emitter = new Emitter(mouseX, mouseY)
    } else if (key.toLowerCase() === "r") {
        receptor = new Receptor(mouseX, mouseY)
    }

}
