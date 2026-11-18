class Emitter {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.voltage = 2;
        this.lastEmission = 0;
        this.emissionInterval = 1500;
        this.size = 12;
    }

    display() {
        imageMode(CENTER);
        image(imgEmitter, this.pos.x, this.pos.y, this.size*10, this.size*10);
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