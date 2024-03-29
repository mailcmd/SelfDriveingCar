class Road {
    constructor(x, width, laneCount = 3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width / 2;
        this.right = x + width / 2;

        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = +infinity;

        const topLeft = { x: this.left, y: this.top};
        const bottomLeft = { x: this.left, y: this.bottom};
        const topRight = { x: this.right, y: this.top};
        const bottomRight = { x: this.right, y: this.bottom};

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    getLaneCenter(laneIndex) {
        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount-1) * laneWidth;
    }

    draw() {
        carCtx.lineWidth = 5;
        carCtx.strokeStyle = "white";

        for (let i = 1; i <= this.laneCount-1; i++) {
            const x = lerp(this.left, this.right, i / this.laneCount);
            carCtx.setLineDash([20, 20]);                
            carCtx.beginPath();
            carCtx.moveTo(x, this.top);
            carCtx.lineTo(x, this.bottom);
            carCtx.stroke();
        }

        carCtx.setLineDash([]);
        this.borders.forEach( b => {
            carCtx.beginPath();
            carCtx.moveTo(b[0].x, b[0].y);
            carCtx.lineTo(b[1].x, b[1].y);
            carCtx.stroke();
        });
    }
}