let gui;
let bgColor;
let buttons;
let lastHasPath;
let panel;
let cnv;

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

async function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("sketch");
  gui = createGUI("main-gui", cnv);
  createSliders();

  bgColor = color(0, 0, 0);
  buttons = {};
  lastHasPath = null;
  panel = {
    x: 10,
    y: 10,
    w: 100,
    h: 36,
    gap: 8,
    count: 12,
  };

  agents = [];
  circuit = new Circuit(agents);
  selected = null;
  mode = "draw";

  populateGUI();
  updateButtonStates(true);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function hasPath() {
  return !!circuit && !!circuit.segments && circuit.segments.length > 0;
}

function addButton(name, index, label, action) {
  const x = panel.x + index * (panel.w + panel.gap);

  const button = gui
    .button(name, x, panel.y, panel.w, panel.h)
    .text(label)
    .textSize(16)
    .corners(8)
    .setAction(action);

  buttons[name] = button;
  return button;
}

function populateGUI() {
  addButton("buttonDraw", 0, "Draw", () => {
    mode = "draw";
    selected = null;
  });

  addButton("buttonSelect", 1, "Select", () => {
    mode = "select";
  });

  addButton("buttonUndo", 2, "Undo", () => {
    circuit.removeLastPoint();
    if (
      (selected && !circuit.segments.includes(selected)) ||
      circuit.segments.length <= 0
    ) {
      agents = [];
      emitter = null;
      receptor = null;
      selected = null;
    }
  });

  addButton("buttonClear", 3, "Clear", () => {
    circuit.clear();
    agents = [];
    emitter = null;
    receptor = null;
    selected = null;
  });

  addButton("buttonAgent", 4, "Agent", () => {
    if (hasPath()) mode = "agent";
  });

  addButton("buttonEmitter", 5, "Emitter", () => {
    if (hasPath()) mode = "emitter";
  });

  addButton("buttonReceptor", 6, "Receptor", () => {
    if (hasPath()) mode = "receptor";
  });

  // For testing. All these buttons should be moved elsewhere
  addButton("buttonSilver", 7, "Silver", () => {
    sliderResistivity.value(1.59e-8);
  });

  addButton("buttonCopper", 8, "Copper", () => {
    sliderResistivity.value(1.68e-8);
  });

  addButton("buttonGold", 9, "Gold", () => {
    sliderResistivity.value(2.44e-8);
  });

  addButton("buttonZinc", 10, "Zinc", () => {
    sliderResistivity.value(5.9e-8);
  });

  addButton("buttonIron", 11, "Iron", () => {
    sliderResistivity.value(9.7e-8);
  });
}

function updateButtonStates(force = false) {
  const ok = hasPath();

  if (!force && ok === lastHasPath) return;

  lastHasPath = ok;

  for (const name of ["buttonAgent", "buttonEmitter", "buttonReceptor"]) {
    const button = buttons[name];

    if (!button) continue;

    if (ok) button.enable();
    else button.disable();
  }

  if (!ok && ["agent", "emitter", "receptor"].includes(mode)) {
    mode = "draw";
  }
}

function overPanel(x, y) {
  const totalWidth = panel.count * panel.w + (panel.count - 1) * panel.gap;

  const pad = 6;

  return (
    x >= panel.x - pad &&
    x <= panel.x + totalWidth + pad &&
    y >= panel.y - pad &&
    y <= panel.y + panel.h + pad
  );
}

function draw() {
  background(bgColor);

  updateButtonStates();

  material = new Material(
    200,
    sliderDiameter.value(),
    sliderResistivity.value(),
    sliderVoltage.value(),
  );

  resistance = material.calculateResistance();
  circuit.applyResistance(resistance);
  conductivity = material.calculateConductivity();

  circuit.display(selected, mode === "draw", mouseX, mouseY);

  if (emitter) {
    emitter.display();
    if (emitter.emit()) {
      agents.push(
        new Electron(
          emitter.pos.x,
          emitter.pos.y,
          sliderVoltage.value() * 0.01,
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

  noStroke();
  textAlign(LEFT, TOP);
  textSize(15);
  text("Mode: " + mode, panel.x, panel.y + panel.h + 12);

  text(
    "Resistivity: " +
      sliderResistivity.value().toExponential(2) +
      " ohms/meter",
    270,
    102,
  );
  text("Diameter: " + sliderDiameter.value() + " milimeters", 270, 152);
  text("Voltage: " + sliderVoltage.value() + " volts", 270, 202);

  text("Resistance: " + resistance.toExponential(2) + " ohms", 75, 240);
  text(
    "Conductivity: " + conductivity.toExponential(2) + " siemens/meter",
    40,
    270,
  );

  gui.draw();
}

function mousePressed(event) {
  if (event && event.target !== cnv.elt) return;
  if (overPanel(mouseX, mouseY)) return;

  if (mode === "draw") {
    circuit.addPoint(mouseX, mouseY);
  } else if (mode === "select") {
    selected = circuit.selectAt(mouseX, mouseY);
  } else if (hasPath()) {
    if (mode === "agent") {
      agents.push(new Electron(mouseX, mouseY, sliderVoltage.value() * 0.01));
    } else if (mode === "emitter") {
      emitter = new Emitter(mouseX, mouseY);
    } else if (mode === "receptor") {
      receptor = new Receptor(mouseX, mouseY);
    }
  }
}

function createSliders() {
  sliderResistivity = createSlider(1.59e-8, 98.0e-8, 1.68e-8, 0.01e-8);
  sliderResistivity.position(10, 100);
  sliderResistivity.size(250);

  // Higher diameter equals less resistance
  sliderDiameter = createSlider(15, 200, 10, 1);
  sliderDiameter.position(10, 150);
  sliderDiameter.size(250);

  sliderVoltage = createSlider(50, 300, 100, 50);
  sliderVoltage.position(10, 200);
  sliderVoltage.size(250);
}
