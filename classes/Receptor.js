class Receptor {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.radius = 15;
        this.maxGlow = 255;
        this.glowIntensity = 0;
        this.glowDecay = 2;
    }
    display() {
        noStroke();
        if (this.glowIntensity > 0) {
            fill(255, 0, 0, this.glowIntensity * 0.25);
            ellipse(this.pos.x, this.pos.y, this.radius);

            fill(255, 0, 0, this.glowIntensity * 0.5);
            ellipse(this.pos.x, this.pos.y, this.radius * 3);
        }

        fill(255, 0, 0);
        ellipse(this.pos.x, this.pos.y, this.radius * 2);
        this.glowIntensity = max(0, this.glowIntensity - this.glowDecay);
    }

    touch(e) {
        let dif = p5.Vector.sub(this.pos, e.pos);
        return dif.mag() < this.radius + e.radius;
    }

    glow() {
        this.glowIntensity = this.maxGlow;
    }
}