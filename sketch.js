let gui;
let bgColor;
let buttons
let lastHasPath
let panel

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
    buttons = {}
    lastHasPath = null
    panel = {
        x: 10,
        y: 10,
        w: 100,
        h: 36,
        gap: 8,
        count: 8
    }

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

    // console.log("Resistance   =", (resistance).toExponential(2));
    // console.log("Conductivity =", (conductivity).toExponential(2));

    populateGUI();
    updateButtonStates(true)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function hasPath() {
    return !!circuit && !!circuit.segments && circuit.segments.length > 0
}

function addButton(name, index, label, action) {
    const x = panel.x + index * (panel.w + panel.gap)

    const button = gui
        .button(name, x, panel.y, panel.w, panel.h)
        .text(label)
        .textSize(16)
        .corners(8)
        .setAction(action)

    buttons[name] = button
    return button
}

function populateGUI() {
    addButton("buttonDraw", 0, "Draw", () => {
        mode = "draw"
        selected = null
    })

    addButton("buttonSelect", 1, "Select", () => {
        mode = "select"
    })

    addButton("buttonUndo", 2, "Undo", () => {
        circuit.removeLastPoint()
        if (selected && !circuit.segments.includes(selected) ||
            circuit.segments.length <= 0) {
            agents = []
            emitter = null
            receptor = null
            selected = null
        }
    })

    addButton("buttonClear", 3, "Clear", () => {
        circuit.clear()
        agents = []
        emitter = null
        receptor = null
        selected = null
    })

    addButton("buttonAgent", 4, "Agent", () => {
        if (hasPath()) mode = "agent"
    })

    addButton("buttonEmitter", 5, "Emitter", () => {
        if (hasPath()) mode = "emitter"
    })

    addButton("buttonReceptor", 6, "Receptor", () => {
        if (hasPath()) mode = "receptor"
    })
}

function updateButtonStates(force = false) {
    const ok = hasPath()

    if (!force && ok === lastHasPath) return

    lastHasPath = ok

    for (const name of ["buttonAgent", "buttonEmitter", "buttonReceptor"]) {
        const button = buttons[name]

        if (!button) continue

        if (ok) button.enable()
        else button.disable()
    }

    if (!ok && ["agent", "emitter", "receptor"].includes(mode)) {
        mode = "draw"
    }
}

function overPanel(x, y) {
    const totalWidth = panel.count * panel.w + (panel.count - 1) * panel.gap

    const pad = 6

    return (
        x >= panel.x - pad &&
        x <= panel.x + totalWidth + pad &&
        y >= panel.y - pad &&
        y <= panel.y + panel.h + pad
    )
}

function draw() {
    background(bgColor);

    updateButtonStates()

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
    text("Mode: " + mode, panel.x, panel.y + panel.h + 12)

    gui.draw()
}

function mousePressed() {
    if (overPanel(mouseX, mouseY)) return

    if (mode === "draw") {
        circuit.addPoint(mouseX, mouseY)
    } else if (mode === "select") {
        selected = circuit.selectAt(mouseX, mouseY)
    } else if (hasPath()) {
        if (mode === "agent") {
            agents.push(new Electron(mouseX, mouseY, 1))
        } else if (mode === "emitter") {
            emitter = new Emitter(mouseX, mouseY)
        } else if (mode === "receptor") {
            receptor = new Receptor(mouseX, mouseY)
        }
    }
}
