const MATERIALS = {
    copper: { resistivity: 1.68e-8, color: [184, 115, 51] },
    zinc: { resistivity: 5.90e-8, color: [150, 195, 205] },
    iron: { resistivity: 9.70e-8, color: [125, 125, 130] },
    lead: { resistivity: 22.0e-8, color: [75, 80, 105] },
    titanium: { resistivity: 42.0e-8, color: [205, 195, 230] },
};
const DEFAULT_CABLE_COLOR = [96, 120, 156];

class PathSegment {
    constructor(start, end, resistivity = 1.68e-8, diameter = 5) {
        this.start = start;
        this.end = end;

        this.length = p5.Vector.dist(this.start, this.end);

        this.resistivity = resistivity;
        this.diameter = diameter;

        this.resistance = 0;
        this.ownResistance = 0; // Se usa en las bifurcacioes y tal
        this.conductivity = 0;
    }

    get width() {
        return map(this.diameter, 3.5, 25, 20, 50);
    }

    get color() {
        for (const name in MATERIALS) {
            const m = MATERIALS[name];
            if (abs(this.resistivity - m.resistivity) <= m.resistivity * 0.01) {
                return m.color;
            }
        }
        return DEFAULT_CABLE_COLOR;
    }

    touches(node) {
        return this.start === node || this.end === node;
    }

    updateMaterial(circuitLength) {
        const material = new Material(
            circuitLength,
            this.diameter,
            this.resistivity,
        );

        this.resistance = material.calculateResistance();
        this.conductivity = material.calculateConductivity();

        this.ownResistance = new Material(
            this.length,
            this.diameter,
            this.resistivity,
        ).calculateResistance();
    }

    projectT(x, y) {
        const sx = this.end.x - this.start.x;
        const sy = this.end.y - this.start.y;
        const len2 = sx * sx + sy * sy;
        if (len2 === 0) return 0;
        return constrain(
            ((x - this.start.x) * sx + (y - this.start.y) * sy) / len2,
            0,
            1,
        );
    }

    distanceTo(x, y) {
        const t = this.projectT(x, y);
        return dist(
            x,
            y,
            this.start.x + (this.end.x - this.start.x) * t,
            this.start.y + (this.end.y - this.start.y) * t,
        );
    }

    display(selected) {
        strokeCap(ROUND);
        if (selected) {
            stroke(255);
            strokeWeight(this.width + 6);
            line(this.start.x, this.start.y, this.end.x, this.end.y);
        }
        stroke(...this.color);
        strokeWeight(this.width);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
}
