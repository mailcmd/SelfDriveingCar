
function resetGame() {
    resetTraffic(traffic);
    trainData = [];
    resetGameNow = false;
}

function createNextGeneration() {
	const brainsCount = 20;
	generation++;
	panelGeneration.innerHTML = generation;        
	panelMaxFitness.innerHTML = Math.max(...cars.map( c => c.score));
	saveModel();
	resetGame();
	cars = cars.sort( (a,b) => b.score - a.score);
	let brains = cars.sort( (a,b) => b.score - a.score).map( c => c.brain ).slice(0, brainsCount);
	// let brains = [];
	// for (let i = 0; i < brainsCount; i+=2) {
	// 	brains = [...brains, ...NeuralNetwork.crossNetworks(cars[i].brain, cars[i+1].brain)];
	// }
	
	cars.forEach( (car, i) => {
		car.reset();
		car.brain = new NeuralNetwork(car.brain.neuronCounts);
		car.brain.load(brains[i % brainsCount].getModel());
		// if (Math.random() <= mutateRatio) 
		if (i > 0) 
			car.brain.mutate(mutateRatio); 
	});
}

