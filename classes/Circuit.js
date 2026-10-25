class Circuit {
    constructor() {
        this.length = 0;
        this.matWidth = 0;
        this.conductivity = 0;
        this.electrons = [];

        this.points = []
        this.segments = []
    }

    addPoint(x, y) {
        const n = this.points.length

        if (n > 0) {
            const last = this.points[n - 1]

            // Esto está acá para ignorar doble clicks
            // 5head
            if (dist(x, y, last.x, last.y) < 6) return

            const point = createVector(x, y)

            this.segments.push(new PathSegment(last, point))
            this.points.push(point)
        } else {
            this.points.push(createVector(x, y))
        }
    }

    removeLastPoint() {
        if (this.points.length === 0) return

        this.points.pop()
        this.segments.pop()
    }

    clear() {
        this.points = []
        this.segments = []
    }

    selectAt(x, y) {
        let best = null
        let bestDist = Infinity

        for (const seg of this.segments) {
            const dist = seg.distanceTo(x, y)

            if (dist < max(seg.width / 2 + 4, 10) && dist < bestDist) {
                best = seg
                bestDist = dist
            }
        }

        return best
    }

    display(selected, drawing, mx, my) {
        for (const seg of this.segments) {
            seg.display(seg === selected)
        }

        noStroke()
        fill(230)

        for (const point of this.points) {
            ellipse(point.x, point.y, 7)
        }

        if (drawing && this.points.length > 0) {
            const last = this.points[this.points.length - 1]

            stroke(255, 120)
            strokeWeight(2)
            line(last.x, last.y, mx, my)
        }
    }

    // Applies a drag force to all electrons depending on the conductivity
    applyDrag() { }
}
