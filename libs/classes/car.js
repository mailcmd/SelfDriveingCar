class Car {
    constructor({ 
            x, y, width, height, 
            controlType = 'AI', 
            maxSpeed = maxSpeedCars, 
            color = 'blue', 
            model,
            sensorsCount = 5
        }) {

        this.x = x;
        this.y = y;
        this.initialY = y;
        this.width = width;
        this.height = height;
        this.maxSpeed = maxSpeed;
        this.sensorsCount = sensorsCount;
        this.color = color;
        this.distance = 0;

        this.idiotCounter = 0;
        this.speed = 0;
        this.overpassedCars = 0;
        this.acceleration = 25;
        this.friction = 2;
        this.angle = 0;
        this.damaged = false;
        this.fitness = 0;
        this.score = 0;
        this.updateCounter = 0;

        this.useBrain = controlType == 'AI';

        if (controlType != 'DUMMY') {
            this.sensor = new Sensor(this, this.sensorsCount);

            const config = [
                this.sensorsCount + 1,
                60,
                4
            ];

            this.brain = new NeuralNetwork(config);
            if (model) {
                this.brain.load(model);
            }
        }
        this.controls = new Controls(controlType, this);

        this.img = new Image();
        this.mask = document.createElement('canvas');
        this.mask.width = this.width;
        this.mask.height = this.height;
        
        const maskCtx = this.mask.getContext('2d');

        this.img.onload = () => {
            maskCtx.fillStyle = this.color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();
            maskCtx.globalCompositeOperation = 'destination-atop';
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }

        this.img.src = 'images/car.png';
    }

    async update(roadBorders, traffic) {
        if (this.idiotCounter >= 60 * 3) {
            this.damaged = true;
        }
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();

            if (this.sensor) {
                this.damaged = this.#assessDamage(roadBorders, traffic);
                this.calculateScore(traffic);

                this.sensor.update(roadBorders, traffic);

                if (this.useBrain) {
                    const inputs = this.getInputs();
                    let outputs = [ 0,0,0,0 ];
                    outputs = this.brain.feedForward(inputs);
                    //log(outputs.toString())
                    this.controls.left = outputs[0];
                    this.controls.forward = outputs[1];
                    this.controls.right = outputs[2];
                    this.controls.reverse = outputs[3];
                }

            }
            this.updateCounter++;    
        }
        if (this.sensor) this.calculateScore(traffic);
    }

    calculateScore(traffic) {
        //if (!this.damaged) 
        this.score = -this.y;// * this.speed;
        //return this.score;
        let overpassedCars = 0;
        for (let i = 0; i < traffic.length; i++) {
            overpassedCars += this.y < traffic[i].y ? 1 : 0; 
        }
        // if (overpassedCars <= this.overpassedCars) {
        //     this.idiotCounter++;
        // }
        this.overpassedCars = Math.max(this.overpassedCars, overpassedCars);
        this.score = (this.overpassedCars + 1) * this.score;

        return this.score;
    }

    draw(drawSensors = false) {        
        if (drawSensors && this.sensor) {
            this.sensor.draw();
        }
        carCtx.save();
        carCtx.translate(this.x, this.y);
        carCtx.rotate(-this.angle);
        if (!this.damaged) {
            carCtx.drawImage(
                this.mask, 
                -this.width / 2, -this.height / 2,
                this.width, this.height
            );
            carCtx.globalCompositeOperation = 'multiply';
        }
        carCtx.drawImage(
            this.img, 
            -this.width / 2, -this.height / 2,
            this.width, this.height
        );

        carCtx.restore();
    }

    copy() {
        const newCarBrain = this.brain.copy();
        newCarBrain.mutate(mutateRatio);
		return new Car({
            x: road.getLaneCenter(1),
            y: 100,
            width: 30,
            height: 50,
            controlType: controlType,
            sensorsCount: 13,
            model: newCarBrain.model
        });
	}

    reset() {
        this.x = road.getLaneCenter(1);
        this.y = 100;
        this.overpassedCars = 0;
        this.distance = 0;
        this.fitness = 0;
        this.angle = 0;
        this.speed = 0;
        this.damaged = false;
        this.superiorRace = false;
        this.controls.forward = 0;
        this.controls.reverse = 0; 
        this.controls.left = 0; 
        this.controls.right = 0;
        this.idiotCounter = 0;
    }


    getInputs() {
        return [ ...this.sensor.readings.map( r => r==null ? 0 : 1-r.offset ), this.speed/this.maxSpeed ];
    }

    getProgress() {
        let overpassedCars = 0;
        for (let i = 0; i < traffic.length; i++) {
            overpassedCars += this.y < traffic[i].y ? 1 : 0; 
        }
        return overpassedCars / traffic.length;
    }

    #createPolygon() {
        const points = [];
        const rad = 0.9*Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
             x: this.x - Math.sin(this.angle - alpha) * rad,
             y: this.y - Math.cos(this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad,
       });
       points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
        });
        return points;
    }

    #assessDamage(roadBorders, traffic) {
        if (this.y > 400) true;
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }            
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }            
        }
        return false;
    }

    #move() {
        const previousPos = { x: this.x, y: this.y };
        const deltaCoef = deltaTime / 1000;

        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration * 0.2;
        }

        this.speed = this.speed > this.maxSpeed 
            ? this.maxSpeed 
            : (this.speed < -this.maxSpeed/2 
                ? -this.maxSpeed/2 
                : (Math.abs(this.speed) < this.friction ? 0 : this.speed)
            );
        this.speed -= Math.sign(this.speed) * this.friction;

        if (this.speed != 0) {
            const flip = Math.sign(this.speed);
            if (this.controls.left) {
                this.angle += 0.007*flip;
            }
            if (this.controls.right) {
                this.angle -= 0.007*flip;
            }
        }

        const mx = Math.sin(this.angle) * this.speed * deltaCoef;
        const my = Math.cos(this.angle) * this.speed * deltaCoef;
        this.x -= mx;
        this.y -= my;

        //this.distance += Math.hypot(mx, my);

        if (previousPos.x == this.x && previousPos.y <= this.y) {
            this.idiotCounter++;
        } else {
            this.distance += Math.hypot(mx, my);
        }
    }
}

