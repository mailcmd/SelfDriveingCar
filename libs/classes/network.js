class NeuralNetwork {
   constructor(neuronCounts) {
      this.levels = [];
      this.neuronCounts = neuronCounts;
      for (let i = 0; i < neuronCounts.length - 1; i++) {
         this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
      }
   }

   load(model) {
      for (let i = 0; i < this.levels.length; i++) {
         this.levels[i].biases = JSON.parse(JSON.stringify(model[i].biases));
         this.levels[i].weights = JSON.parse(JSON.stringify(model[i].weights));
      }
   }

   getModel() {
      const levels = [];
      for (let i = 0; i < this.neuronCounts.length - 1; i++) {
         levels.push(this.levels[i].clone(this.neuronCounts[i], this.neuronCounts[i + 1]));
      }
      return levels;
   }

   feedForward(givenInputs, binarize = true) {
      let outputs = this.levels[0].feedForward(
         givenInputs,
         binarize
      );
      for (let i = 1; i < this.levels.length; i++) {
         outputs = this.levels[i].feedForward(
            outputs,
            this.levels[i],
            binarize
         );
      }
      return outputs;
   }

   mutate(amount = 1, biasSubset = [], weightSubset = []) {
      for (let li = 0; li < this.levels.length; li++) {
         const level = this.levels[li];
         for (let i = 0; i < level.biases.length; i++) {
            // if (
            //    biasSubset.find((p) => p.levelIndex == li && p.index == i)
            // ) {
               level.biases[i] = lerp(
                  level.biases[i],
                  100*(Math.random() * 2 - 1)/100,
                  amount
               );
            // }
         }
         for (let i = 0; i < level.weights.length; i++) {
            for (let j = 0; j < level.weights[i].length; j++) {
               // if (
               //    weightSubset.find(
               //       (s) =>
               //          s.levelIndex == li &&
               //          s.indices[0] == i &&
               //          s.indices[1] == j
               //    )
               // ) {
                  level.weights[i][j] = lerp(
                     level.weights[i][j],
                     Math.floor(100*(Math.random() * 2 - 1))/100,
                     amount
                  );
               // }
            }
         }
      }
   }

  mutateWeights(amount = 1) {
      this.levels.forEach((level) => {
         for (let i = 0; i < level.weights.length; i++) {
            for (let j = 0; j < level.weights[i].length; j++) {
               level.weights[i][j] = lerp(
                  level.weights[i][j],
                  Math.random() * 2 - 1,
                  amount
               );
            }
         }
      });
   }

   static crossNetworks(network1, network2) {
      const newNetwork1 = new NeuralNetwork( network1.neuronCounts );
      const newNetwork2 = new NeuralNetwork( network1.neuronCounts );

      newNetwork1.levels.forEach( (level, l) => {
          for (let i = 0; i < level.biases.length; i++) {
              level.biases[i] = i % 2 == 0
                  ? network1.levels[l].biases[i]
                  : network2.levels[l].biases[i]; 
          }
          for (let i = 0; i < level.weights.length; i++) {
              for (let j = 0; j < level.weights[i].length; j++) {
                  level.weights[i][j] = i % 2 == 0
                      ? network1.levels[l].weights[i][j]
                      : network2.levels[l].weights[i][j];
              }
          }
      });
      newNetwork2.levels.forEach( (level, l) => {
          for (let i = 0; i < level.biases.length; i++) {
              level.biases[i] = i % 2 != 0
                  ? network1.levels[l].biases[i]
                  : network2.levels[l].biases[i]; 
          }
          for (let i = 0; i < level.weights.length; i++) {
              for (let j = 0; j < level.weights[i]; j++) {
                  level.weights[i][j] = i % 2 != 0
                      ? network1.levels[l].weights[i][j]
                      : network2.levels[l].weights[i][j];
              }
          }
      });

      return [ newNetwork1, newNetwork2 ];
   }
 
   static giveWeightsAndBiases(network, wab){
      for(let i=0;i<network.levels.length;i++){
         const level=network.levels[i];
         for(let j=0;j<level.biases.length;j++){
             if(wab.levels[i] && wab.levels[i].biases[j]){
                 level.biases[j]=wab.levels[i].biases[j]
             }
         }
         for(let j=0;j<level.weights.length;j++){
         for(let k=0;k<level.weights[j].length;k++){
             if(wab.levels[i] && wab.levels[i].weights[j] &&wab.levels[i].weights[j][k]){
                 level.weights[j][k]=wab.levels[i].weights[j][k]
             }
         }
         }
     }
   }

   static makeZeros(network) {
      network.levels.forEach((level) => {
         for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = 0;
         }
         for (let i = 0; i < level.weights.length; i++) {
            for (let j = 0; j < level.weights[i].length; j++) {
               level.weights[i][j] = 0;
            }
         }
      });
   }

}

class Level {
   constructor(inputCount, outputCount) {
      this.inputs = new Array(inputCount);
      this.outputs = new Array(outputCount);
      this.biases = new Array(outputCount);

      this.weights = [];
      for (let i = 0; i < inputCount; i++) {
         this.weights[i] = new Array(outputCount);
      }

      this.#randomize(this);
   }

   load(layers) {
      this.inputs = layers.inputs;
      this.outputs = layers.outputs;
   }

   feedForward(givenInputs, binarize) {
      for (let i = 0; i < this.inputs.length; i++) {
         this.inputs[i] = givenInputs[i];
      }

      for (let i = 0; i < this.outputs.length; i++) {
         let sum = 0;
         for (let j = 0; j < this.inputs.length; j++) {
            sum += this.inputs[j] * this.weights[j][i];
         }
         
         if (binarize) {
            if (sum - this.biases[i] > 0) {
               this.outputs[i] = 1;
            } else {
               this.outputs[i] = 0;
            }
         } else {
            this.outputs[i] = sum - this.biases[i];
         }
      }

      return this.outputs;
   }

   clone(inputs, outputs) {
      const level = new Level(inputs, outputs);
      level.weights = JSON.parse(JSON.stringify(this.weights));
      level.biases = JSON.parse(JSON.stringify(this.biases));
      return level;
   }

   #randomize(level) {
      for (let i = 0; i < level.inputs.length; i++) {
         for (let j = 0; j < level.outputs.length; j++) {
            level.weights[i][j] = Math.random() * 2 - 1;
         }
      }

      for (let i = 0; i < level.biases.length; i++) {
         level.biases[i] = Math.random() * 2 - 1;
      }
   }
}
