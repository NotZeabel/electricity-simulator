class Receptor {
    constructor(x, y) {
        this.pos = createVector(x, y);
    }
    display() {
        noStroke();
        fill(255, 0, 0);
        ellipse(this.pos.x, this.pos.y, 5 * 2);
    }
    // Glows depending on the received voltage
    glow(voltage) {

    }
}