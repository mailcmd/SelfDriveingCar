// main functions
function animate(time) {
    deltaTime = Math.min(time - frameTime, 300);
    frameTime = time;

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    
    carCanvas.height = window.innerHeight;

    const carMaxScore = Math.max(...cars.map( c => c.score ));
    bestCar = cars.find( car => car.score ==  carMaxScore) ?? bestCar;
    if (bestCar.overpassedCars >= traffic.length) {
        paused = true;
        saveModel();
    }
    panelAvgFitness.innerHTML = ~~(bestCar.score);
    if (resetTimeOut == -1 && bestCar.damaged ) {
        resetTimeOut = setTimeout(()=> {
            resetTimeOut = -1;    
            createNextGeneration();
        }, 3000)
    } else if (!bestCar.damaged) {
        clearTimeout(resetTimeOut);
        resetTimeOut = -1;
    }

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.5);

    if (refreshCanvas) road.draw();
    for (let i = 0; i < traffic.length; i++) {
        if (refreshCanvas) traffic[i].draw();
    }

    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        if (refreshCanvas) cars[i].draw();
    }
    carCtx.globalAlpha = 1;
    if (refreshCanvas) bestCar.draw(true);

    carCtx.restore();

    if (!paused) {
        requestAnimationFrame(animate);
    } 

    if (resetGameNow || cars.filter( c => !c.damaged ).length == 0) {
		createNextGeneration();
	}

}


function generateCars(N, model, controlType = 'AI') {
    const cars = [];    
    for (let i = 0; i < N; i++) {
        cars.push( 
            new Car({
                x: road.getLaneCenter(1),
                y: 100,
                width: 30,
                height: 50,
                controlType: controlType,
                sensorsCount: 18,
                model: model
            })
        );
        cars[cars.length-1].brain.mutate(mutateRatio); 
    }
    return cars;
}

function generateTraffic(N) {
    const traffic = [];
    for (let i = 0; i < N; i++) {
        traffic.push( 
            new Car({            
                x: road.getLaneCenter( parseInt(Math.random()*3) ), // + (Math.random()*40-20), 
                y: -parseInt(Math.random() * 2200),
                width: 30, 
                height: 50, 
                controlType: 'DUMMY',
                maxSpeed: maxSpeedCars * 0.6 + Math.random() * maxSpeedCars * 0.2, 
                color: getRandomColor()
            }) 
        );
    }
    return traffic;
}

function resetTraffic(traffic) {
    for (let i = 0; i < traffic.length; i++) {
        [ traffic[i].x, traffic[i].y, traffic[i].maxSpeed ] = 
            [ trafficOriginalCoords[i].x, trafficOriginalCoords[i].y, trafficOriginalCoords[i].maxSpeed ];
    }
    return traffic;
}

function addTrainingData(car) {
    const inputs = car.getInputs();
    trainData.push({
        input: inputs,
        output: [
            car.controls.left,
            car.controls.forward,
            car.controls.right,
            car.controls.reverse
        ]
    });
}

function saveTrainingDataBatch() {
    const currentTrainData = JSON.parse(localStorage.getItem('trainData') || '[]');
    const newTrainData = [ ...currentTrainData, ...trainData ];
    localStorage.setItem('trainData', JSON.stringify(newTrainData));
    trainData = [];
    console.log('Train data saved! Data count: ' + newTrainData.length);
}

function restoreTrainingData() {
    return JSON.parse(localStorage.getItem('trainData') || '[]');
}

function discardTrainingData() {
    localStorage.removeItem('trainData');
}

function discardLocalStorageModels() {
    Object.keys(localStorage).forEach( k => k.slice(0, ('tensorflowjs_models/'+tfModelName).length) == 'tensorflowjs_models/'+tfModelName && (localStorage.removeItem(k)));
}

function getTrainingData() {
    let data = restoreTrainingData(), inputs = data.map( d => d.input), outputs = data.map( d => d.output);
    return { inputs, outputs };
}

function train(opts = {}) {
    paused = true;
    bestCar.brain.train( { ...getTrainingData(), ...opts } );
}

function saveModel() {
    localStorage.setItem('model', JSON.stringify(bestCar.brain.getModel()));
}
function removeModel() {
    localStorage.removeItem('model');
}
function restoreModel() {
    return JSON.parse(localStorage.getItem('model'));
}

// wrappers
let log = console.log;

//////////////////////////////////////////////////////////////////////////////////////////////////

