class Controls {
    constructor(type, car) {
        this.forward = 0;
        this.reverse = 0; 
        this.left = 0; 
        this.right = 0; 
        this.car = car;

        switch (type) {
            case 'KEYS':
                this.#addKeyboardListeners();
                break;
            case 'DUMMY':
                this.forward = 1;
                break;
        }
    }

    #addKeyboardListeners() {
        document.onkeydown = (e) => {
            let addTrainData = false;
            switch (e.key) {
                case 'ArrowLeft':
                    addTrainData = true;
                    this.left = 1;
                    break;
                case 'ArrowRight':
                    addTrainData = true;
                    this.right = 1;
                    break;
                case 'ArrowUp':
                    addTrainData = true;
                    this.forward = 1;
                    // this.reverse = 0;
                    break;
                case 'ArrowDown':
                    addTrainData = true;
                    this.reverse = 1;
                    // this.forward = 0;
                    break;
            }
            if (addTrainData) {
                addTrainingData(this.car);
            }
        };
        document.onkeyup = (e) => {
            let addTrainData = false;
            switch (e.key) {
                case 'ArrowLeft':
                    addTrainData = true;
                    this.left = 0;
                    break;
                case 'ArrowRight':
                    addTrainData = true;
                    this.right = 0;
                    break;
                case 'ArrowUp':
                    addTrainData = true;
                    this.forward = 0;
                    break;
                case 'ArrowDown':
                    addTrainData = true;
                    this.reverse = 0;
                    break;
            }
            if (addTrainData) {
                addTrainingData(this.car);
            }
        }
    }

}