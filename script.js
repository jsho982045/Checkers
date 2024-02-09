document.addEventListener('DOMContentLoaded', initializeBoard);

function initializeBoard() {
    const board = document.getElementById('checkersBoard');
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.id = `r${row}c${col}`;

            // Determine square color based on its position
            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
                // Add initial pieces to the appropriate squares
                if (row < 4) square.appendChild(createPiece('black-piece'));
                if (row > 5) square.appendChild(createPiece('white-piece'));
            }

            board.appendChild(square);
        }
    }

    setupEventListeners();
}

function createPiece(color) {
    const piece = document.createElement('div');
    piece.classList.add('piece', color);
    piece.draggable = true;
    return piece;
}

function setupEventListeners() {
    const squares = document.querySelectorAll('#checkersBoard .black');
    squares.forEach(square => {
        square.addEventListener('dragover', handleDragOver);
        square.addEventListener('drop', handleDrop);
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const fromId = e.dataTransfer.getData('text/plain');
    const toId = e.target.id || e.target.parentElement.id; // If dropping on a piece, get the parent square's id
    if (isValidMove(fromId, toId)) {
        movePiece(fromId, toId);
    } else {
        // Optionally handle invalid move feedback here
    }
}

function isValidMove(fromId, toId) {
    // Add your move validation logic here
    // For simplicity, this example allows moving pieces to any empty black square
    const fromSquare = document.getElementById(fromId);
    const toSquare = document.getElementById(toId);
    return fromSquare && toSquare && 
           fromSquare !== toSquare && 
           !toSquare.hasChildNodes();
}

function movePiece(fromId, toId) {
    const fromSquare = document.getElementById(fromId);
    const toSquare = document.getElementById(toId);
    const piece = fromSquare.firstChild;
    fromSquare.removeChild(piece);
    toSquare.appendChild(piece);
}

document.addEventListener('dragstart', (e) => {
    if (e.target.className.includes('piece')) {
        e.dataTransfer.setData('text/plain', e.target.parentElement.id);
    }
});
