class Electron {
    constructor(x, y, mass) {
        this.pos = createVector(x, y);
        this.vel = createVector(1, 1);
        this.accel = createVector(0, 0);
        this.mass = mass < 0 ? 0 : mass;
        this.radius = sqrt(this.mass / PI) * 6;
        this.c = color(245, 217, 78);

        this.followLookahead = 25
        this.maxSpeed = 5
        this.seg = null
        this.forward = true   // true: start -> end, false: end -> start
    }
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(imgElectron, 0, 0, this.radius * 10, this.radius * 10);
        pop();
    }
    update() {
        this.vel.add(this.accel);
        if (this.vel.mag() > this.maxSpeed) {
            this.vel.setMag(this.maxSpeed)
        }
        this.accel.mult(0);
        this.pos.add(this.vel);
    }
    addForce(force) {
        let finalForce = p5.Vector.div(force, this.mass);
        this.accel.add(finalForce);
    }
    applyDrag(d) {
        let drag = this.vel.copy();
        drag.normalize();
        drag.mult(this.vel.mag() ** 2 * -d);
        this.addForce(drag);
    }

    getNormalPoints(point, start, end) {
        let sToP = p5.Vector.sub(point, start)
        let sToE = p5.Vector.sub(end, start)
        let len = sToE.mag()

        sToE.normalize()
        let t = constrain(sToP.dot(sToE), 0, len)
        sToE.mult(t)

        let normalPoint = p5.Vector.add(start, sToE)

        return normalPoint
    }

    follow(path) {
        if (path.segments.length === 0) return

        if (!this.seg || !path.segments.includes(this.seg)) {
            this.seg = path.nearestSegment(this.pos.x, this.pos.y)
            this.forward = true
        }

        let seg = this.seg
        let a = this.forward ? seg.start : seg.end
        let b = this.forward ? seg.end : seg.start

        if (p5.Vector.dist(this.pos, b) < max(seg.width / 2, 12)) {
            const next = path.chooseNext(b, seg)
            if (next) {
                this.seg = next
                this.forward = next.start === b
                seg = next
                a = this.forward ? seg.start : seg.end
                b = this.forward ? seg.end : seg.start
            }
        }

        let future = this.vel.copy()
        future.normalize()
        future.mult(this.followLookahead)
        let futurePos = p5.Vector.add(this.pos, future)

        let normalPoint = this.getNormalPoints(futurePos, a, b)
        let dir = p5.Vector.sub(b, a)
        dir.normalize()

        let deadEnd = path.segmentsAt(b).length <= 1
        let ahead = deadEnd
            ? min(25, p5.Vector.dist(normalPoint, b))
            : 25

        let target = normalPoint.copy()
        target.add(p5.Vector.mult(dir, ahead))

        if (p5.Vector.dist(futurePos, normalPoint) > 0) {
            this.seek(target)
        }
    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.pos)

        desired.normalize()
        desired.mult(this.maxSpeed)

        let steer = p5.Vector.sub(desired, this.vel)

        this.addForce(steer)
    }
}
