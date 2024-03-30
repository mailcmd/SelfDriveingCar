// GA
let generation = 1;

// config constants
const carsCount = 100; 
const trafficCount = 20;
const yLimit = -5000;
let mutateRatio = 0.1;
const roundLength = 1800;
const maxSpeedCars = 500;

// neural network data
let trainData = [];

// global variables
let bestCar = null;
let frameTime = 0;
let deltaTime = 0;
let resetTimeOut = -1;

// admin actions control
let paused = false, refreshCanvas = true, resetGameNow = false;

document.onkeypress = e => {
    console.log(e.keyCode)
    if (e.keyCode == 32) {
        (paused = !paused) || animate(frameTime) ;
        document.getElementById('paused').style.display = paused ? 'flex' : 'none';
    } else if (e.keyCode == 13) {
        refreshCanvas = !refreshCanvas;
    } else if (e.keyCode == 82 || e.keyCode == 114) {
        resetGameNow = true;
    } else if (e.keyCode == 83 || e.keyCode == 115) {
        saveModel();
    }
};

// main settings
carCanvas.width = 250;
const carCtx = carCanvas.getContext('2d');

// road declaration
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.95);

// traffic declaration
let traffic = generateTraffic(trafficCount);
//let trafficOriginalCoords = JSON.parse(localStorage.getItem('trafficOriginalCoords')); resetTraffic(traffic);
let trafficOriginalCoords = traffic.map( c => ({ x: c.x, y: c.y, maxSpeed: c.maxSpeed }));


// cars declaration and init
const controlType = 'AI';
let aliveCars = [];
let cars;
try {
    const model = restoreModel();
    cars = generateCars(carsCount, model,  controlType);
    for (let i = 0; i < carsCount; i++) {
        aliveCars[i] = cars[i];
    }
    animate(1);
} catch(e) {
    cars = generateCars(carsCount, null, controlType);
    for (let i = 0; i < carsCount; i++) {
        aliveCars[i] = cars[i];
    }
    animate(1);
};
