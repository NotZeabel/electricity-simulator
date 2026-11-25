class Circuit {
    constructor(electrons) {
        this.length = 0;
        this.matWidth = 0;
        this.electrons = electrons;

        this.points = [];
        this.segments = [];
        this.active = null; // null = nuevo circuito miedo
    }

    updateLength() {
        let total = 0;
        for (const s of this.segments) total += s.length;
        this.length = total;
    }

    nodeAt(x, y, radius = 10) {
        let best = null;
        let bestDist = radius;
        for (const p of this.points) {
            const d = dist(x, y, p.x, p.y);
            if (d <= bestDist) {
                best = p;
                bestDist = d;
            }
        }
        return best;
    }

    segmentsAt(node) {
        return this.segments.filter((s) => s.touches(node));
    }

    hasSegmentBetween(a, b) {
        return this.segments.some(
            (s) => (s.start === a && s.end === b) || (s.start === b && s.end === a),
        );
    }

    nearestSegment(x, y) {
        let best = null;
        let bestDist = Infinity;
        for (const seg of this.segments) {
            const d = seg.distanceTo(x, y);
            if (d < bestDist) {
                best = seg;
                bestDist = d;
            }
        }
        return best;
    }

    selectAt(x, y) {
        let best = null;
        let bestDist = Infinity;

        for (const seg of this.segments) {
            const d = seg.distanceTo(x, y);
            if (d < max(seg.width / 2 + 4, 10) && d < bestDist) {
                best = seg;
                bestDist = d;
            }
        }

        return best;
    }

    newCircuit() {
        this.active = null;
    }

    splitSegment(seg, x, y) {
        const t = seg.projectT(x, y);
        const node = createVector(
            seg.start.x + (seg.end.x - seg.start.x) * t,
            seg.start.y + (seg.end.y - seg.start.y) * t,
        );

        const a = new PathSegment(seg.start, node, seg.resistivity, seg.diameter);
        const b = new PathSegment(node, seg.end, seg.resistivity, seg.diameter);

        const i = this.segments.indexOf(seg);
        this.segments.splice(i, 1, a, b);
        this.points.push(node);
        return node;
    }

    addPoint(x, y, resistivity, diameter) {
        let node = this.nodeAt(x, y);

        if (!node) {
            const seg = this.segments.find((s) => s.distanceTo(x, y) < s.width / 2);
            if (seg) node = this.splitSegment(seg, x, y);
        }

        if (!node) {
            node = createVector(x, y);
            this.points.push(node);
        }

        if (this.active && this.active !== node && !this.hasSegmentBetween(this.active, node)) {
            this.segments.push(new PathSegment(this.active, node, resistivity, diameter));
        }

        this.active = node;
    }

    removeLastSegment() {
        if (this.active && this.segmentsAt(this.active).length === 0) {
            this.points.splice(this.points.indexOf(this.active), 1);
            this.active = null;
            return;
        }

        const last = this.segments.pop();
        if (!last) return;

        if (this.segmentsAt(last.end).length === 0) {
            const i = this.points.indexOf(last.end);
            if (i >= 0) this.points.splice(i, 1);
        }
        this.active = this.points.includes(last.start) ? last.start : null;
    }

    clear() {
        this.points = [];
        this.segments = [];
        this.active = null;
        this.length = 0;
    }

    chooseNext(node, from) {
        const options = this.segments.filter((s) => s !== from && s.touches(node));
        if (options.length === 0) return null;
        if (options.length === 1) return options[0];

        const weights = options.map((s) => {
            const w = 1 / max(s.ownResistance, 1e-12);
            return isFinite(w) && w > 0 ? w : 1;
        });
        const total = weights.reduce((a, b) => a + b, 0);

        let r = random(total);
        for (let i = 0; i < options.length; i++) {
            r -= weights[i];
            if (r <= 0) return options[i];
        }
        return options[options.length - 1];
    }

    display(selected, drawing, mx, my) {
        for (const seg of this.segments) {
            seg.display(seg === selected);
        }

        noStroke();
        for (const point of this.points) {
            const links = this.segmentsAt(point).length;
            if (point === this.active) {
                fill(150, 240, 150);
                ellipse(point.x, point.y, 11);
            } else if (links >= 3) {
                fill(255, 190, 80); // junction
                ellipse(point.x, point.y, 11);
            } else {
                fill(230);
                ellipse(point.x, point.y, 7);
            }
        }

        if (drawing && this.active) {
            stroke(255, 120);
            strokeWeight(2);
            line(this.active.x, this.active.y, mx, my);
        }
    }

    // Applies a drag force to all electrons based on the resistance
    applyResistance(electrons) {
        for (let e of electrons) {
            const seg = e.seg;

            if (seg) {
                // Reduced to keep the electrons from bugging
                e.applyDrag(seg.resistance * 0.4);
            }
        }
    }
}
