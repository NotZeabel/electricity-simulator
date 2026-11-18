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
    calculateResistance() {
        this.area = PI * (this.scaledDiameter / 2) ** 2; // Cross-sectional area

        this.resistance = ((this.resistivity * this.scaledLength) / this.area);
        // Values greater than this bug the electrons
        if (this.resistance > 1.50e+0)
            this.resistance = 1.50e+0;
        return this.resistance;
    }
    calculateConductivity() {
        this.conductivity = 1 / this.resistivity;
        return this.conductivity;
    }
}
