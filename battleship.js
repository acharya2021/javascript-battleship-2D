let view = {
    displayMessage: function (msg) {
        let messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg;
    },

    displayHit: function (location) {
        // get the particular td element that we want to modify
        // based on the string location
        let cell = document.getElementById(location);
        // set the class of that element to "hit"
        cell.setAttribute("class", "hit");
    },

    displayMiss: function (location) {
        let cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    }

};

let model = {
    boardSize: 7,
    numShips: 3,
    shipLength: 3,
    shipsSunk: 0,

    ships: [
        // initialize the ship locations to 0
        {locations: [0, 0, 0], hits: ["", "", ""]},
        {locations: [0, 0, 0], hits: ["", "", ""]},
        {locations: [0, 0, 0], hits: ["", "", ""]}
    ],

    fire: function (guess) {
        for (let i = 0; i < this.numShips; i++) {
            // select an individual ship
            let ship = this.ships[i];
            // let locations = ship.locations;
            let index = ship.locations.indexOf(guess);

            if (index >= 0) {
                // we have a hit
                ship.hits[index] = "hit";
                view.displayHit(guess);
                view.displayMessage("HIT!");

                if (this.isSunk(ship)) {
                    view.displayMessage("You sank my battleship!");
                    this.shipsSunk++;
                }
                // this is inside the for loop
                // as soon as a hit is detected, true is returned so that the displayMiss line below won't execute
                return true;
            }
        }
        // this is outside the for loop
        // these lines execute only when a guess does not make a hit
        view.displayMiss(guess);
        view.displayMessage("You missed.");
        return false;
    },

    isSunk: function (ship) {
        for (let i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== "hit") {
                return false;
            }
        }
        return true;
    },

    generateShipLocations: function () {
        let locations;
        for (let i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip();
                // keep generating new locations until there's no collision
            } while (this.collision(locations));
            // update each ship's location
            this.ships[i].locations = locations;
        }
    },

    generateShip: function () {
        let direction = Math.floor(Math.random() * 2);
        let row, col;

        if (direction === 1) {
            // generate a starting location for a horizontal ship
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
        } else {
            // generate a starting location for a vertical ship
            row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
            col = Math.floor(Math.random() * this.boardSize);

        }

        // start with an empty array for the new ship locations
        let newShipLocations = [];
        // loop for the number of locations in a ship (3 in default case)
        for (let i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                // add location to array for new horizontal ship
                // we’ll get something like “01”, “02”, “03” in the array
                newShipLocations.push(row + "" + (col + i));
            } else {
                // add location to array for new vertical ship
                // we’ll get something like “31”, “41”, “51” in the array
                newShipLocations.push((row + i) + "" + col);
            }
        }
        // once we've generated all the locations, return the array
        return newShipLocations;

    },

    // check to see if a NEW array of locations overlap with existing ships
    collision: function (locations) {
        // for each ship already on the board
        for (let i = 0; i < this.numShips; i++) {
            let ship = model.ships[i];
            // iterate over the locations in the new array
            for (let j = 0; j < locations.length; j++) {
                // use indexOf to check if the location already exists in a ship
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    // there was a collision
                    return true;
                }
            }

        }
        // we did not find a match for any location we were checking
        // so there was no collision
        return false;

    }


};

// get the player’s guess, make sure it’s valid, and then get
// it to the model object.
let controller = {
    guesses: 0,

    processGuess: function (guess) {
        let location = parseGuess(guess);
        // as long as we don't get null back
        // a valid location OBJECT
        if (location) {
            // the guesses property belongs to the controller object
            this.guesses++;
            // the fire method returns true if a ship is hit
            let hit = model.fire(location);
            if (hit && model.shipsSunk === model.numShips) {
                view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
            }
        }

    }

};

function parseGuess(guess) {

    let alphabet = ["A", "B", "C", "D", "E", "F", "G"];
    if (guess === null || guess.length !== 2) {
        alert("Oops, please enter a letter and a number on the board.");
    } else {
        //
        let firstChar = guess.charAt(0);
        let row = alphabet.indexOf(firstChar);
        let column = guess.charAt(1);

        if (isNaN(row) || isNaN(column)) {
            alert("Oops, that is not on the board.");
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
            alert("Oops, that's off the board.");
        } else {
            // concatenate row and column to make a string
            return row + column;
        }
    }
    // if we get here, there was a failed check along the way
    // so return null
    return null;

}

function handleFireButton() {
    let guessInput = document.getElementById("guessInput");
    // the guess is stored in the value property of the input element
    let guess = guessInput.value;
    // pass the player's guess to the controller
    controller.processGuess(guess);
    // reset the form input element to be the empty string
    guessInput.value = "";
}

// run init when the page is fully loaded
window.onload = init;

function init() {
    let fireButton = document.getElementById("fireButton");
    fireButton.onclick = handleFireButton;

    // add a reference to a key press handler
    let guessInput = document.getElementById("guessInput");
    guessInput.onkeypress = handleKeyPress;

    // add the call to generate the ship locations
    // this will fill in the empty arrays in the model
    // we place this function inside the init function because we want ships to be generated
    // as soon as we load the game, before we start playing
    model.generateShipLocations();
}

// a function to handle key press events from the HTML input field
function handleKeyPress(e) {
    let fireButton = document.getElementById("fireButton");

    // if the user presses the RETURN key, this event's keyCode property
    // will be set to 13
    if (e.keyCode === 13) {
        // cause the fire button to act like it was clicked
        fireButton.click();
        // return false so that the form does not submit itself
        return false;
    }
}
