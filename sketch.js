let bgColor;
let buttons;
let panel;
let circuit;
let selected;
let mode;
let material;
let emitters;
let receptors;

let resistance;
let conductivity;
let electrons;

let sliderResistivity;
let sliderDiameter;
let sliderVoltage;
let sliderInterval;
let hint = "";
let hintTime = 0;

let layout = {};
var imgElectron;
var imgEmitter;
var imgReceptor;

let memesEmitter;
let memesElectron;
let memesReceptor;
let currentMemeImg;

async function setup() {
    createCanvas(windowWidth, windowHeight);
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    loadDefaultImages();

    // Memes: the DNA of the soul
    memesEmitter = ["images/gi_ei.webp", 
        "images/Mr_Electric_render.webp", 
        "images/z_revali.png",
        "images/ls_caja.png",
        "images/pkmn_pikachu.png",
        "images/mtrd_samus.jpg",
        "images/tec_torres.png"];

    memesElectron = ["images/gi_electro.webp", 
        "images/Mr_Electric_render.webp", 
        "images/z_flecha.webp",
        "images/ls_dona.png",
        "images/pkmn_rayo.png",
        "images/mtrd_misil.png",
        "images/tec_c.png"];

    memesReceptor = ["images/gi_monumento.webp", 
        "images/Mr_Electric_render.webp", 
        "images/z_link.png",
        "images/ls_homero.png",
        "images/pkmn_goldeen.png",
        "images/ridley.png",
        "images/tec_tec.jpg"];

    bgColor = color(0, 0, 0);
    buttons = {};

    // ===== TAMAÑO Y POSICIÓN DE LOS BOTONES =====

    panel = {
        x: 12,
        y: 12,
        w: 125, // ancho de cada botón
        h: 44, // alto de cada botón
        gap: 8, // espacio entre botones
        textSize: 17, // tamaño del texto de los botones
        title: 26, // espacio para el título de cada sección
        width: 282, // ancho total del panel lateral (zona donde no se dibuja)
    };

    receptors = [];
    emitters = [];
    electrons = [];
    circuit = new Circuit(electrons);
    setSelected(null);
    mode = "draw";

    createSliders();
    populateGUI();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function hasPath() {
    return !!circuit && !!circuit.segments && circuit.segments.length > 0;
}

let savedSliders = null;

function setSelected(seg) {
    if (seg && !selected) {
        savedSliders = {
            resistivity: sliderResistivity.value(),
            diameter: sliderDiameter.value(),
        };
    }

    if (seg) {
        sliderResistivity.value(seg.resistivity);
        sliderDiameter.value(seg.diameter);
    } else if (selected && savedSliders) {
        sliderResistivity.value(savedSliders.resistivity);
        sliderDiameter.value(savedSliders.diameter);
        savedSliders = null;
    }

    selected = seg;
}

function showHint(message) {
    hint = message;
    hintTime = millis();
}

function addButton(name, row, col, label, action, span = 1) {
    const button = {
        name: name,
        label: label,
        action: action,
        x: panel.x + col * (panel.w + panel.gap),
        y: row,
        w: span * panel.w + (span - 1) * panel.gap,
        h: panel.h,
        bold: false,
    };

    buttons[name] = button;
    return button;
}

function isInside(button, px, py) {
    return (
        px >= button.x &&
        px <= button.x + button.w &&
        py >= button.y &&
        py <= button.y + button.h
    );
}

function buttonAt(px, py) {
    for (const name in buttons) {
        if (isInside(buttons[name], px, py)) return buttons[name];
    }
    return null;
}

const MODE_BY_BUTTON = {
    buttonDraw: "draw",
    buttonSelect: "select",
    buttonElectron: "electron",
    buttonEmitter: "emitter",
    buttonReceptor: "receptor",
};

function drawButtons() {
    const hovered = buttonAt(mouseX, mouseY);

    for (const name in buttons) {
        const b = buttons[name];
        const active = MODE_BY_BUTTON[name] === mode;

        // Color base: verde = modo activo, amarillo = Electron, azul = el resto
        let c;
        if (active) c = color(150, 240, 150);
        else c = color(160, 185, 255);
        if (b === hovered) {
            c = mouseIsPressed
                ? lerpColor(c, color(0), 0.15)
                : lerpColor(c, color(255), 0.3);
        }

        noStroke();
        fill(c);
        rect(b.x, b.y, b.w, b.h, 8);

        fill(active ? color(20, 90, 20) : color(30, 40, 110));
        textAlign(CENTER, CENTER);
        textSize(panel.textSize);
        textStyle(b.bold ? BOLD : NORMAL);
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }

    textStyle(NORMAL);

    cursor(hovered ? HAND : ARROW);
}

function setMode(newMode) {
    if (["electron", "emitter", "receptor"].includes(newMode) && !hasPath()) {
        showHint("First draw the cable:\nDraw mode + 2 clicks on the black zone");
        return;
    }

    mode = newMode;
    if (mode === "draw") {
        setSelected(null);
        showHint("Click to place points. Click a point or cable to branch.\nNew circuit (or N) starts a separate one");
    }

    if (mode === "electron")
        showHint("Click the screen");
    if (mode === "emitter") showHint("Click the start of the cable");
    if (mode === "receptor") showHint("Click the end of the cable");
}

function populateGUI() {
    const rowH = panel.h + panel.gap;
    let y = panel.y;

    // ----- Sección CIRCUITO -----
    layout.circuitTitle = y;
    y += panel.title;

    addButton("buttonDraw", y, 0, "Draw", () => setMode("draw"));
    addButton("buttonSelect", y, 1, "Select", () => setMode("select"));
    y += rowH;

    addButton("buttonNewCircuit", y, 0, "New circuit", () => startNewCircuit(), 2);
    y += rowH;

    addButton("buttonUndoSegment", y, 0, "Undo segment", () => {
        circuit.removeLastSegment();
        if (
            (selected && !circuit.segments.includes(selected)) ||
            circuit.segments.length <= 0
        ) {
            electrons = [];
            emitters = [];
            receptors = [];
            setSelected(null);
        }
        if (!hasPath() && ["electron", "emitter", "receptor"].includes(mode))
            setMode("draw");
    });
    addButton("buttonUndoReceptor", y, 1, "Undo receptor", () => {
        if (receptors.length) // Using != 0 is unnecessary, apparently
            receptors.pop();
    });
    y += rowH;
    addButton("buttonUndoEmitter", y, 0, "Undo emitter", () => {
        if (emitters.length) // != 0
            emitters.pop();
    });
    addButton("buttonClear", y, 1, "Clear", () => {
        circuit.clear();
        electrons = [];
        emitters = [];
        receptors = [];
        setSelected(null);
        setMode("draw");
    });
    y += rowH;

    // ----- Sección ELECTRONES -----
    layout.electronTitle = y + 4;
    y += panel.title + 4;

    addButton("buttonElectron", y, 0, "Electron", () => setMode("electron"), 2).bold =
        true;
    y += rowH;

    addButton("buttonEmitter", y, 0, "Emitter", () => setMode("emitter"));
    addButton("buttonReceptor", y, 1, "Receptor", () => setMode("receptor"));
    y += rowH;

    // ----- Sección MATERIAL -----
    layout.materialTitle = y + 4;
    y += panel.title + 4;

    addButton("buttonCopper", y, 0, "Copper", () => setResistivity(MATERIALS.copper.resistivity));
    addButton("buttonZinc", y, 1, "Zinc", () => setResistivity(MATERIALS.zinc.resistivity));
    y += rowH;

    addButton("buttonIron", y, 0, "Iron", () => setResistivity(MATERIALS.iron.resistivity));
    addButton("buttonMercury", y, 1, "Lead", () => setResistivity(MATERIALS.lead.resistivity)); // Plomo
    y += rowH;

    addButton("buttonTitanium", y, 0, "Titanium", () => setResistivity(MATERIALS.titanium.resistivity));
    y += rowH;

    // ----- Sliders debajo de los botones -----
    layout.slidersTop = y + 8;
    positionSliders();
}

function overPanel(x, y) {
    return x <= panel.width;
}

function drawPanel() {
    // Fondo del panel lateral
    noStroke();
    fill(25, 28, 36);
    rect(0, 0, panel.width, height);
    stroke(70, 80, 100);
    strokeWeight(1);
    line(panel.width, 0, panel.width, height);

    noStroke();
    fill(160, 175, 200);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(13);
    text("CIRCUIT", panel.x, layout.circuitTitle + 6);
    text("ELECTRONS", panel.x, layout.electronTitle + 6);
    text("MATERIAL", panel.x, layout.materialTitle + 6);
    textStyle(NORMAL);

    const s = layout.slidersTop;
    fill(255);
    textSize(15);
    text(
        "Resistivity: " + sliderResistivity.value().toExponential(2) + " Ω/m",
        panel.x,
        s,
    );
    text("Diameter: " + sliderDiameter.value() + " mm", panel.x, s + 46);
    text("Voltage: " + sliderVoltage.value() + " V (global)", panel.x, s + 92);
    text("Electron emission interval: " + sliderInterval.value() / 1000 + " s", panel.x, s + 138);

    fill(200);
    text("Resistance: " + resistance.toExponential(2) + " Ω", panel.x, s + 180);
    text(
        "Conductivity: " + conductivity.toExponential(2) + " S/m",
        panel.x,
        s + 200,
    );
    text("Length: " + floor(material.scaledLength) + " cm",
        panel.x, s + 220);
}

function drawStatus() {
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textSize(18);
    text("Mode: " + mode, panel.width + 16, 14);

    // Qué están editando los sliders de resistividad y diámetro
    const idx = circuit.segments.indexOf(selected);
    const editing = idx >= 0 ? "Segment " + (idx + 1) : "All segments";
    fill(160, 175, 200);
    textSize(15);
    text("Sliders edit: " + editing, panel.width + 160, 17);

    if (hint && millis() - hintTime < 4000) {
        fill(255, 220, 90);
        textSize(16);
        text(hint, panel.width + 16, 42);
    }
}

function draw() {
    background(bgColor);

    circuit.updateLength();
    if (selected && !circuit.segments.includes(selected)) setSelected(null);

    material = new Material(
        circuit.length,
        sliderDiameter.value(),
        sliderResistivity.value(),
    );

    resistance = material.calculateResistance();
    conductivity = material.calculateConductivity();

    for (const seg of circuit.segments) {
        seg.updateMaterial(circuit.length);
    }

    circuit.applyResistance(electrons);

    circuit.display(selected, mode === "draw", mouseX, mouseY);
    if (emitters.length) { // != 0
        for (let e of emitters) {
            e.update(sliderInterval.value(), sliderVoltage.value());
            e.display();
            if (e.emit()) {
                electrons.push(
                    new Electron(
                        e.pos.x,
                        e.pos.y,
                        e.voltage * 0.02,
                    ),
                );
            }
        }
    }

    if (receptors.length) { // != 0
        for (let r of receptors)
            r.display();
    }

    for (let i = electrons.length - 1; i >= 0; i--) {
        let a = electrons[i];
        a.follow(circuit);
        a.update();
        a.display();

        if (receptors.length) { // != 0
            for (let r of receptors) {
                if (r.touch(a)) {
                    r.glow(a.radius);
                    electrons.splice(i, 1);
                }
            }
        }
    }

    drawPanel();
    drawButtons();
    drawStatus();
}

function mousePressed() {
    const button = buttonAt(mouseX, mouseY);
    if (button) {
        button.action();
        return;
    }

    if (overPanel(mouseX, mouseY)) return;

    if (mouseButton === RIGHT) {
        startNewCircuit();
        return;
    }

    if (mode === "draw") {
        circuit.addPoint(
            mouseX,
            mouseY,
            sliderResistivity.value(),
            sliderDiameter.value(),
        );
    } else if (mode === "select") {
        setSelected(circuit.selectAt(mouseX, mouseY));
    } else if (hasPath()) {
        if (mode === "electron") {
            electrons.push(new Electron(mouseX, mouseY, sliderVoltage.value() * 0.02));
        } else if (mode === "emitter") {
            emitters.push(new Emitter(mouseX, mouseY, sliderVoltage.value(), sliderInterval.value()));
        } else if (mode === "receptor") {
            receptors.push(new Receptor(mouseX, mouseY));
        }
    }
}

function applySlidersToSegments() {
    const targets = selected ? [selected] : circuit.segments;

    for (const seg of targets) {
        seg.resistivity = sliderResistivity.value();
        seg.diameter = sliderDiameter.value();
    }
}

function setResistivity(value) {
    sliderResistivity.value(value);
    applySlidersToSegments();
}

function createSliders() {
    sliderResistivity = createSlider(1.68e-8, 42.0e-8, 1.68e-8, 0.01e-8);
    sliderResistivity.size(panel.width - 2 * panel.x);
    sliderResistivity.input(applySlidersToSegments);

    sliderDiameter = createSlider(3.5, 25, 5, 0.25);
    sliderDiameter.size(panel.width - 2 * panel.x);
    sliderDiameter.input(applySlidersToSegments);

    sliderVoltage = createSlider(100, 300, 100, 25);
    sliderVoltage.size(panel.width - 2 * panel.x);

    sliderInterval = createSlider(200, 1500, 500, 100);
    sliderInterval.size(panel.width - 2 * panel.x);
}

// Coloca los sliders debajo de los botones, en el panel lateral
function positionSliders() {
    const s = layout.slidersTop;
    sliderResistivity.position(panel.x, s + 18);
    sliderDiameter.position(panel.x, s + 64);
    sliderVoltage.position(panel.x, s + 110);
    sliderInterval.position(panel.x, s + 156);
}

function startNewCircuit() {
    if (!circuit) return;
    setMode("draw");
    circuit.newCircuit();
    showHint("New circuit: click anywhere to start it");
}

function keyPressed() {
    if (key === "n" || key === "N") startNewCircuit();

    if (key === " ") loadMemeImages();

    if (key === "r" || key === "R") loadDefaultImages();
}

async function loadDefaultImages() {
    imgElectron = await loadImage("images/electron.png");
    imgEmitter = await loadImage("images/emitter.png");
    imgReceptor = await loadImage("images/receptor.png");
}

async function loadMemeImages() {
    let i = floor(random(memesElectron.length));
    while (i == currentMemeImg)
        i = floor(random(memesElectron.length));

    imgElectron = await loadImage(memesElectron[i]);
    imgEmitter = await loadImage(memesEmitter[i]);
    imgReceptor = await loadImage(memesReceptor[i]);
    currentMemeImg = i;
}