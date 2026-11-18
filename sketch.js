let bgColor;
let buttons;
let panel;
let circuit;
let selected;
let mode;
let material;
let emitter;
let receptor;

let resistance;
let conductivity;
let agents;

let sliderResistivity;
let sliderDiameter;
let sliderVoltage;
let hint = "";
let hintTime = 0;

let layout = {};

async function setup() {
    createCanvas(windowWidth, windowHeight);

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

    agents = [];
    circuit = new Circuit(agents);
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
    buttonAgent: "agent",
    buttonEmitter: "emitter",
    buttonReceptor: "receptor",
};

function drawButtons() {
    const hovered = buttonAt(mouseX, mouseY);

    for (const name in buttons) {
        const b = buttons[name];
        const active = MODE_BY_BUTTON[name] === mode;

        // Color base: verde = modo activo, amarillo = Agent, azul = el resto
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
    if (["agent", "emitter", "receptor"].includes(newMode) && !hasPath()) {
        showHint("Primero dibujá el cable:\nmodo Draw + 2 clics en la zona negra");
        return;
    }

    mode = newMode;
    if (mode === "draw") setSelected(null);

    if (mode === "agent")
        showHint("Hacé clic sobre el cable,\ncerca del primer punto");
    if (mode === "emitter") showHint("Hacé clic al inicio del cable");
    if (mode === "receptor") showHint("Hacé clic al final del cable");
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

    addButton("buttonUndo", y, 0, "Undo", () => {
        circuit.removeLastPoint();
        if (
            (selected && !circuit.segments.includes(selected)) ||
            circuit.segments.length <= 0
        ) {
            agents = [];
            emitter = null;
            receptor = null;
            setSelected(null);
        }
        if (!hasPath() && ["agent", "emitter", "receptor"].includes(mode))
            setMode("draw");
    });
    addButton("buttonClear", y, 1, "Clear", () => {
        circuit.clear();
        agents = [];
        emitter = null;
        receptor = null;
        setSelected(null);
        setMode("draw");
    });
    y += rowH;

    // ----- Sección ELECTRONES -----
    layout.electronTitle = y + 4;
    y += panel.title + 4;

    addButton("buttonAgent", y, 0, "Agent", () => setMode("agent"), 2).bold =
        true;
    y += rowH;

    addButton("buttonEmitter", y, 0, "Emitter", () => setMode("emitter"));
    addButton("buttonReceptor", y, 1, "Receptor", () => setMode("receptor"));
    y += rowH;

    // ----- Sección MATERIAL -----
    layout.materialTitle = y + 4;
    y += panel.title + 4;

    addButton("buttonCopper", y, 0, "Copper", () => setResistivity(1.68e-8));
    addButton("buttonZinc", y, 1, "Zinc", () => setResistivity(5.90e-8));
    y += rowH;

    addButton("buttonIron", y, 0, "Iron", () => setResistivity(9.70e-8));
    addButton("buttonMercury", y, 1, "Lead", () => setResistivity(22.0e-8)); // Plomo
    y += rowH;

    addButton("buttonTitanium", y, 0, "Titanium", () => setResistivity(42.0e-8));
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
    text("CIRCUITO", panel.x, layout.circuitTitle + 6);
    text("ELECTRONES", panel.x, layout.electronTitle + 6);
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

    fill(200);
    text("Resistance: " + resistance.toExponential(2) + " Ω", panel.x, s + 140);
    text(
        "Conductivity: " + conductivity.toExponential(2) + " S/m",
        panel.x,
        s + 160,
    );
    text("Length: " + floor(material.scaledLength) + " cm", 
        panel.x, s + 180);
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

    material = new Material(
        circuit.length,
        sliderDiameter.value(),
        sliderResistivity.value(),
        sliderVoltage.value(),
    );

    resistance = material.calculateResistance();
    conductivity = material.calculateConductivity();

    for (const seg of circuit.segments) {
        seg.updateMaterial(circuit.length, sliderVoltage.value());
    }

    circuit.applyResistance(agents);

    circuit.display(selected, mode === "draw", mouseX, mouseY);

    if (emitter) {
        emitter.display();
        if (emitter.emit()) {
            agents.push(
                new Electron(
                    emitter.pos.x,
                    emitter.pos.y,
                    sliderVoltage.value() * 0.02,
                ),
            );
        }
    }

    if (receptor) {
        receptor.display();
    }

    for (let i = agents.length - 1; i >= 0; i--) {
        let a = agents[i];
        a.follow(circuit);
        a.update();
        a.display();

        if (receptor) {
            if (receptor.touch(a)) {
                receptor.glow();
                agents.splice(i, 1);
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
        if (mode === "agent") {
            agents.push(new Electron(mouseX, mouseY, sliderVoltage.value() * 0.02));
        } else if (mode === "emitter") {
            emitter = new Emitter(mouseX, mouseY);
        } else if (mode === "receptor") {
            receptor = new Receptor(mouseX, mouseY);
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
}

// Coloca los sliders debajo de los botones, en el panel lateral
function positionSliders() {
    const s = layout.slidersTop;
    sliderResistivity.position(panel.x, s + 18);
    sliderDiameter.position(panel.x, s + 64);
    sliderVoltage.position(panel.x, s + 110);
}
