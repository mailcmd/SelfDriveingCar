class Sensor {
    constructor(car, rayCount = 5) {
        this.car = car;
        this.rayCount = rayCount;
        this.rayLength = 240;
        this.raySpread = Math.PI / 1.2 ;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push( 
                this.#getReadings(this.rays[i], roadBorders, traffic)
            );
        }
    }

    draw() {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            if (this.readings[i]) {
                end = this.readings[i]
            }
            carCtx.beginPath();
            carCtx.lineWidth = 2;
            carCtx.strokeStyle = 'yellow';
            carCtx.moveTo( this.rays[i][0].x, this.rays[i][0].y );
            carCtx.lineTo( end.x, end.y );
            carCtx.stroke();

            carCtx.beginPath();
            carCtx.lineWidth = 2;
            carCtx.strokeStyle = 'black';
            carCtx.moveTo( this.rays[i][1].x, this.rays[i][1].y );
            carCtx.lineTo( end.x, end.y );
            carCtx.stroke();
        }
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount-2; i++) {
            const rayAngle = lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount-3)
            ) + this.car.angle;
 
            const start = { x: this.car.x, y: this.car.y };
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            }
            this.rays.push( [start, end] );
        }
        let rayAngle = Math.PI - Math.PI / 16;
        let start = { x: this.car.x, y: this.car.y };
        let end = {
            x: this.car.x - Math.sin(rayAngle) * this.rayLength,
            y: this.car.y - Math.cos(rayAngle) * this.rayLength
        }
        this.rays.push( [start, end] );
        
        rayAngle = Math.PI + Math.PI / 16;
        start = { x: this.car.x, y: this.car.y };
        end = {
            x: this.car.x - Math.sin(rayAngle) * this.rayLength,
            y: this.car.y - Math.cos(rayAngle) * this.rayLength
        }
        this.rays.push( [start, end] );
    }

    #getReadings(ray, roadBorders, traffic) {
        let touches = [];
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0], ray[1],
                roadBorders[i][0], roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;
            for (let j = 0; j < poly.length; j++) {
                const value = getIntersection(
                    ray[0], ray[1],
                    poly[j], poly[(j+1) % poly.length]
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        if (touches.length > 0) {
            return touches.slice(1).reduce( (c, t) => t.offset < c.offset ? t : c , touches[0]);
            //const offsets = touches.map( t => t.offset );
            //const minOffset = Math.min(...offsets);
            //return touches.find( t => t.offset == minOffset );
        }
        return null;
    }
}