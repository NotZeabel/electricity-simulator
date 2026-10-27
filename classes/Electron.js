class Electron {
    constructor(x, y, mass) {
        this.pos = createVector(x, y);
        this.vel = createVector(1, 1);
        this.accel = createVector(0, 0);
        this.mass = mass < 0 ? 0 : mass;
        this.radius = sqrt(this.mass / PI) * 5;
        this.c = color(245, 217, 78);

        this.followLookahead = 25
        this.maxSpeed = 5
        this.maxSteeringForce = 1
        this.segment = 0
    }
    display() {
        stroke(this.c);
        strokeWeight(this.radius * 2);

        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        beginShape();
        vertex(-this.radius / 3, -this.radius / 2);
        vertex(-this.radius / 3, this.radius / 2);
        vertex(2 * this.radius / 3, 0);
        endShape(CLOSE);
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
    // Keeps the electron inside the circuit
    borders() {

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
        let future = this.vel.copy()
        future.normalize()
        future.mult(this.followLookahead)
        let futurePos = p5.Vector.add(this.pos, future)

        // If we wanted them to loop we could remove the "- 1" at the end
        let numSegments = path.points.length - 1

        let target = null
        let highest = Infinity
        let bestOffset = 0

        for (let offset = 0; offset <= 1; offset++) {
            let i = (this.segment + offset) % numSegments

            let start = path.points[i]
            let end = path.points[(i + 1) % path.points.length]

            let normalPoint = this.getNormalPoints(futurePos, start, end)
            let dir = p5.Vector.sub(end, start)

            // If the normal points goes beyond the path segments
            // assumes that is at the end
            if (normalPoint.x < min(start.x, end.x) ||
                normalPoint.x > max(start.x, end.x) ||
                normalPoint.y < min(start.y, end.y) ||
                normalPoint.y > max(start.y, end.y)) {
                normalPoint = end.copy()
            }

            let dist = p5.Vector.dist(futurePos, normalPoint)

            if (dist < highest) {
                highest = dist
                bestOffset = offset

                dir.normalize()
                // 100% arbitrary
                dir.mult(25)

                target = normalPoint.copy()
                target.add(dir)
            }

        }

        this.segment = (this.segment + bestOffset) % numSegments

        if (target != null && highest > path.matWidth / 2) {
            this.seek(target)
        }
    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.pos)

        desired.normalize()
        desired.mult(this.maxSpeed)

        let steer = p5.Vector.sub(desired, this.vel)
        steer.limit(this.maxSteeringForce)

        this.addForce(steer)
    }
}
