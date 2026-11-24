class Emitter {
    constructor(x, y, voltage, emissionInterval) {
        this.pos = createVector(x, y);
        this.voltage = voltage;
        this.lastEmission = 0;
        this.emissionInterval = emissionInterval;
        this.size = 12;
    }
    update(emissionInterval, voltage) {
        this.emissionInterval = emissionInterval;
        this.voltage = voltage;
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