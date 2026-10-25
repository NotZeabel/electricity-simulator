class PathSegment {
    constructor(start, end, width = 14) {
        this.start = start
        this.end = end
        this.width = width
    }

    distanceTo(x, y) {
        const startEndX = this.end.x - this.start.x
        const startEndY = this.end.y - this.start.y

        const len2 = startEndX * startEndX + startEndY * startEndY

        let t = 0

        if (len2 !== 0) {
            t = ((x - this.start.x) * startEndX + (y - this.start.y) * startEndY) / len2
        }

        t = constrain(t, 0, 1)

        return dist(x, y, this.start.x + startEndX * t, this.start.y + startEndY * t)
    }

    display(selected) {
        strokeCap(ROUND)
        if (selected) {
            stroke(255)
            strokeWeight(this.width + 6)
            line(this.start.x, this.start.y, this.end.x, this.end.y)
        }
        stroke(96, 120, 156)
        strokeWeight(this.width)
        line(this.start.x, this.start.y, this.end.x, this.end.y)
    }
}
