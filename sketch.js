let gui;
let bgColor;

async function setup() {
  let canvas = createCanvas(800, 600);
  gui = createGUI("main-gui", canvas);

  bgColor = color(0, 0, 0);

  populateGUI(gui);
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

  gui.draw();
}
