class Receptor {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.size = 15;
        this.maxGlow = 255;
        this.glowIntensity = 0;
        this.glowDecay = 2;
    }
    display(voltage) { // This looks pretty cursed, not gonna lie
        noStroke();
        imageMode(CENTER);
        image(imgReceptor, this.pos.x, this.pos.y, this.size*10, this.size*17);
        if (this.glowIntensity > 0) {
            fill(247, 232, 64, this.glowIntensity * 0.6);
            ellipse(this.pos.x, this.pos.y - 50, this.size * (voltage * 0.2));
        }   
        this.glowIntensity = max(0, this.glowIntensity - this.glowDecay);
    }

    touch(e) {
        let dif = p5.Vector.sub(this.pos, e.pos);
        return dif.mag() < this.size + e.radius;
    }

    glow() {
        this.glowIntensity = this.maxGlow;
    }
}