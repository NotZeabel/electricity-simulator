class Emitter {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.voltage = 2;
        this.lastEmission = 0;
        this.emissionInterval = 200;
    }

    display() {
        noStroke();
        fill(255);
        ellipse(this.pos.x, this.pos.y, 5 * 2);
    }

    // Emits the voltage to the circuit
    emit() {
        if (this.voltage <= 0) {
            return false;
        }

        if (millis() - this.lastEmission >= this.emissionInterval) {
            this.lastEmission = millis();
            return true;
        }

    return false;
    }
}