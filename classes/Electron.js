class Electron {
    constructor(x, y, mass) {
        this.pos = createVector(x, y);
        this.speed = createVector(0, 0);
        this.accel = createVector(0, 0);
        this.mass = mass < 0? 0 : mass;
        this.radius = sqrt(this.mass / PI) * 5;
        this.c = color(245, 217, 78);
    }
    display() {
        stroke(this.c);
        strokeWeight(this.radius * 2);

        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.speed.heading());

        beginShape();
        vertex(-this.radius/3, -this.radius/2);
        vertex(-this.radius/3, this.radius/2);
        vertex(2 * this.radius/3, 0);
        endShape(CLOSE);
        pop();
    }
    update() {
        this.speed.add(this.accel);
        this.pos.add(this.speed);
        this.speed.mult(0);
    }
    // Keeps the electron inside the circuit
    borders() {

    }
    addForce(force) {
        let finalForce = p5.Vector.div(force, this.mass);
        this.accel.add(finalForce);
    }
    applyDrag(d) {
        let drag = this.speed.copy();
        drag.normalize();
        drag.mult(this.speed.mag()**2 * -d);
        this.addForce(drag);
    }
}