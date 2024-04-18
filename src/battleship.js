class BattleshipGame {
    constructor() {
        this.players = ['player1', 'player2'];
        this.currentPlayerIndex = 0;
        this.placement = {};
        this.shipLengths = {
            'carrier': 5,
            'battleship': 4,
            'cruiser': 3
        };
        this.hits = { player1: 0, player2: 0 };  // Track hits for each player
        this.attacksMade = { player1: 0, player2: 0 };  // Track attacks made
        this.initializeGame();
        this.missiles = 3; // Each player gets three missiles
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    updateStatusBar() {
        if (this.allPlayersAttacked()) {
            const status = document.getElementById('status');
            status.textContent = "Game over. Check results!";
        } else {
            const status = document.getElementById('status');
            status.textContent = `${this.getCurrentPlayer()}'s turn to attack`;
        }
    }

    switchPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.initializeGameBoardHTML(); // Always clear the board when switching players
        this.displayBoard(this.placement[this.getCurrentPlayer() + '_matrix'], this.getCurrentPlayer());

        // Only check for all ships sunk if both players have attacked
        if (this.allPlayersAttacked()) {
            if (this.allShipsSunk()) {
                alert(`${this.getCurrentPlayer()} wins! All opponent's ships have been destroyed.`);
                return;
            }
            this.determineWinner(); // Call determineWinner if all players have attacked
        } else {
            if (this.allShipsPlaced()) {
                this.resetMissilesForPlacement(); // Prepare missiles if all ships are placed
            } else {
                this.resetShipsForPlacement(); // Otherwise, continue with ship placement
            }
        }

        this.updateStatusBar(); // Update the status bar each time players switch
    }


    allPlayersAttacked() {
        return Object.values(this.attacksMade).every(count => count >= this.missiles);
    }

    determineWinner() {
        const player1Hits = this.hits.player1;
        const player2Hits = this.hits.player2;
        if (player1Hits > player2Hits) {
            alert("Player 1 wins!");
        } else if (player2Hits > player1Hits) {
            alert("Player 2 wins!");
        } else {
            alert("It's a tie!");
        }
    }

    initializeGame() {
        this.players.forEach(player => {
            this.placement[player + '_matrix'] = this.createGameBoard();
        });
        this.initializeGameBoardHTML();
        this.displayBoard(this.placement[this.getCurrentPlayer() + '_matrix'], this.getCurrentPlayer());
        this.resetShipsForPlacement(); 
        this.updateStatusBar();
    }

    createGameBoard() {
        let board = [];
        for (let i = 0; i < 10; i++) {
            board[i] = new Array(10).fill('.');
        }
        return board;
    }
    areCoordsValid(coords, board) {
        return coords.every(([r, c]) => r >= 0 && r < 10 && c >= 0 && c < 10 && board[r][c] === '.');
    }
    displayBoard(board, player) {
        console.log(`${player}'s board:`);
        console.log('  ' + '0123456789'.split('').join(' '));
        board.forEach((row, index) => {
            console.log(String.fromCharCode(65 + index) + ' ' + row.join(' '));
        });
    }
    resetShipsForPlacement() {
        const shipContainer = document.getElementById('ships');
        shipContainer.innerHTML = `
            <div id="carrier" draggable="true" class="ship">Carrier (5)</div>
            <div id="battleship" draggable="true" class="ship">Battleship (4)</div>
            <div id="cruiser" draggable="true" class="ship">Cruiser (3)</div>
        `;

        const ships = document.querySelectorAll('.ship');
        ships.forEach(ship => {
            ship.addEventListener('dragstart', handleDragStart);
        });
    }

    resetMissilesForPlacement() {
        this.missiles = 3;  // Reset missile count
        const missileContainer = document.getElementById('missiles');
        missileContainer.innerHTML = '';
        for (let i = 0; i < this.missiles; i++) {
            const missile = document.createElement('div');
            missile.id = 'missile' + i;
            missile.draggable = true;
            missile.classList.add('missile');
            missile.textContent = 'Missile ' + (i + 1);
            missileContainer.appendChild(missile);
            missile.addEventListener('dragstart', handleDragStart);
        }
        this.initializeGameBoardHTML(); 
        this.displayBoard(this.placement[this.getCurrentPlayer() + '_matrix'], this.getCurrentPlayer());
    }

    placeShip(shipId, targetCell) {
        const shipLength = this.shipLengths[shipId];
        let [row, col] = [parseInt(targetCell.dataset.row), parseInt(targetCell.dataset.col)];
        const board = this.placement[this.getCurrentPlayer() + '_matrix'];

        let coords = [];
        for (let i = 0; i < shipLength; i++) {
            coords.push([row, col + i]);
        }

        if (this.areCoordsValid(coords, board)) {
            coords.forEach(([r, c]) => board[r][c] = 'S');
            this.displayBoard(board, this.getCurrentPlayer());
            return true;
        } else {
            console.error('Invalid ship placement for ' + shipId);
            return false;
        }
    }

    launchMissile(targetCell) {
        const [row, col] = [parseInt(targetCell.dataset.row), parseInt(targetCell.dataset.col)];
        const opponent = this.players[(this.currentPlayerIndex + 1) % 2];
        const opponentMatrix = this.placement[opponent + '_matrix'];
        if (opponentMatrix[row][col] === 'S') {
            console.log('Hit at ' + String.fromCharCode(65 + row) + (col + 1));
            opponentMatrix[row][col] = 'X'; // Mark hit
            targetCell.classList.add('hit');
            this.hits[this.getCurrentPlayer()] += 1; // Increment hit count
            return true;
        } else {
            console.log('Miss at ' + String.fromCharCode(65 + row) + (col + 1));
            opponentMatrix[row][col] = 'M'; // Mark miss
            targetCell.classList.add('miss');
            return false;
        }
    }

    allShipsSunk() {
        const opponentMatrix = this.placement[this.players[(this.currentPlayerIndex + 1) % 2] + '_matrix'];
        return !opponentMatrix.some(row => row.includes('S'));
    }


    allShipsPlaced() {
        return this.players.every(player => this.placement[player + '_shipsPlaced']);
    }

    initializeGameBoardHTML() {
        const gameBoard = document.getElementById('player1');
        gameBoard.innerHTML = '';
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const game = new BattleshipGame();

    const ships = document.querySelectorAll('.ship');
    ships.forEach(ship => {
        ship.addEventListener('dragstart', handleDragStart);
    });

    const gameBoard = document.getElementById('player1');
    gameBoard.addEventListener('dragover', handleDragOver);
    gameBoard.addEventListener('drop', event => handleDrop(event, game));
});

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
}

function handleDrop(e, game) {
    e.preventDefault();
    const itemID = e.dataTransfer.getData('text/plain');
    const targetCell = e.target.closest('div');

    if (itemID.startsWith('missile')) {
        if (targetCell) {
            const hit = game.launchMissile(targetCell);
            if (hit) {
                alert('Missile launched! It\'s a hit!');
            } else {
                alert('Missile launched! It\'s a miss!');
            }
            game.attacksMade[game.getCurrentPlayer()] += 1; // Increment attacks made
            if (game.attacksMade[game.getCurrentPlayer()] >= game.missiles) {
                game.switchPlayer(); // Switch to next player if all missiles are used
            }
        }
    } else if (targetCell && game.placeShip(itemID, targetCell)) {
        targetCell.appendChild(document.getElementById(itemID));
        document.getElementById(itemID).draggable = false;

        // Check if all ships of the current player are placed
        const ships = document.querySelectorAll('.ship');
        if (Array.from(ships).every(ship => !ship.draggable)) {
            game.placement[game.getCurrentPlayer() + '_shipsPlaced'] = true;
            if (game.allShipsPlaced()) {
                game.switchPlayer(); // Ensure correct player starts missile phase
            } else {
                game.switchPlayer(); // Switch to Player 2 for ship placement
            }
        }
    } else {
        alert('Invalid placement, try again.');
    }
}
