class Material {
    constructor(length, diameter, resistivity, voltage) {
        this.length = length; // Length in pixels
        this.diameter = diameter; // Diameter in pixels
        this.resistivity = resistivity;
        this.voltage = voltage;

        // Two scales because cables are very long and very thin
        this.xScale = 0.01; // Centimeters per pixel
        this.yScale = 0.001 // Milimeters per pixel

        this.scaledLength = this.length * this.xScale;
        this.scaledDiameter = this.diameter * this.yScale;
        this.area = 0;
        this.resistance = 0;
        this.conductivity = 0;
    }
    display() {

    }
    // Temporary. Should be separated into 3
    calculateVariables() {
        this.area = PI * (this.scaledDiameter / 2) ** 2; // Cross-sectional area

        this.resistance = (this.resistivity * this.scaledLength) / this.area;
        this.conductivity = 1 / this.resistivity;
        let current = this.voltage / this.resistance;

        // console.log("R =", (this.resistance).toExponential(2));
        // console.log("σ =", (this.conductivity).toExponential(2));
        // console.log("I =", current);
    }
}
