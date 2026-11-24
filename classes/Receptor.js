class Receptor {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.size = 15;
        this.glowSize;
        this.maxGlow = 255;
        this.glowIntensity = 0;
        this.glowDecay = 5;
    }
    display() {
        noStroke();
        imageMode(CENTER);
        image(imgReceptor, this.pos.x, this.pos.y, this.size*10, this.size*17);
        if (this.glowIntensity > 0) {
            fill(247, 232, 64, this.glowIntensity * 0.5);
            ellipse(this.pos.x, this.pos.y - 50, this.size * this.glowSize);
        }   
        this.glowIntensity = max(0, this.glowIntensity - this.glowDecay);
    }

    touch(e) {
        let dif = p5.Vector.sub(this.pos, e.pos);
        return dif.mag() < this.size + e.radius;
    }

    // Receives the electron's size so the receptor can glow
    // more according to it
    glow(electronSize) {
        this.glowIntensity = this.maxGlow;
        this.glowSize = electronSize * 6;
    }
}