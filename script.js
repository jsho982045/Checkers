document.addEventListener('DOMContentLoaded', initializeBoard);

let isPlayerTurn = true; // Start with the player's turn

function initializeBoard() {
    const board = document.getElementById('checkersBoard');
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.id = `r${row}c${col}`;

            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
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

    document.addEventListener('dragstart', (e) => {
        if (e.target.className.includes('piece') && isPlayerTurn && e.target.className.includes('black-piece')) {
            e.dataTransfer.setData('text/plain', e.target.parentElement.id);
        }
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (!isPlayerTurn) return; // Ignore drops during the computer's turn

    const fromId = e.dataTransfer.getData('text/plain');
    const toId = e.target.id || e.target.parentElement.id; // Correctly identify the target square

    if (isValidMove(fromId, toId, 'black-piece')) {
        movePiece(fromId, toId);
        isPlayerTurn = false; // End player's turn
        setTimeout(computerMove, 500); // Delay computer's move for better UX
    }
}

function isValidMove(fromId, toId, color) {
    const fromSquare = document.getElementById(fromId);
    const toSquare = document.getElementById(toId);
    if (!fromSquare || !toSquare || fromSquare === toSquare || toSquare.hasChildNodes()) {
        return false;
    }

    const [fromRow, fromCol] = fromId.substring(1).split('c').map(Number);
    const [toRow, toCol] = toId.substring(1).split('c').map(Number);
    const direction = color === 'black-piece' ? 1 : -1;

    // Adjusted for correct diagonal move checking
    const isSimpleMove = (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1 && (toRow - fromRow) === direction);
    const isCaptureMove = (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2 && isCapture(fromId, toId, color));

    return isSimpleMove || isCaptureMove;
}

function isCapture(fromId, toId, color) {
    const [fromRow, fromCol] = fromId.substring(1).split('c').map(Number);
    const [toRow, toCol] = toId.substring(1).split('c').map(Number);
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    const midSquare = document.getElementById(`r${midRow}c${midCol}`);
    
    if (!midSquare || !midSquare.hasChildNodes()) return false;

    const opponentColor = color === 'black-piece' ? 'white-piece' : 'black-piece';
    return midSquare.firstChild.classList.contains(opponentColor);
}


function movePiece(fromId, toId) {
    const fromSquare = document.getElementById(fromId);
    const toSquare = document.getElementById(toId);
    const piece = fromSquare.removeChild(fromSquare.firstChild);
    toSquare.appendChild(piece);

    // Check if the move is a capture move
    if (Math.abs(parseInt(fromId[1]) - parseInt(toId[1])) === 2) {
        // Capture logic
        removeCapturedPiece(fromId, toId);
    }

    // Toggle turn after move
    isPlayerTurn = !isPlayerTurn;

    if (!isPlayerTurn) {
        setTimeout(computerMove, 500); // Computer takes a turn after a delay
    }
}

function removeCapturedPiece(fromId, toId) {
    const [fromRow, fromCol] = fromId.substring(1).split('c').map(Number);
    const [toRow, toCol] = toId.substring(1).split('c').map(Number);
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    const midSquareId = `r${midRow}c${midCol}`;
    const midSquare = document.getElementById(midSquareId);
    const capturedPiece = midSquare.removeChild(midSquare.firstChild);

    // Determine the capture area based on the piece color
    const captureAreaId = capturedPiece.classList.contains('black-piece') ? 'cpuCaptures' : 'playerCaptures';
    document.getElementById(captureAreaId).appendChild(capturedPiece);
}



function computerMove() {
    const possibleMoves = generatePossibleMoves('white-piece');
    if (possibleMoves.length > 0) {
        const bestMove = selectBestMove(possibleMoves);
        executeMove(bestMove.fromId, bestMove.toId);
        isPlayerTurn = true; // Give turn back to player
    }
}

function generatePossibleMoves(color) {
    const moves = [];
    const pieces = document.querySelectorAll(`.${color}`);
    pieces.forEach(piece => {
        const squareId = piece.parentElement.id;
        const potentialMoves = getPotentialMoves(squareId, color);
        potentialMoves.forEach(move => {
            if (isValidMove(squareId, move, color)) {
                moves.push({fromId: squareId, toId: move});
            }
        });
    });
    return moves;
}

function selectBestMove(moves) {
    // This function can be enhanced to evaluate and prioritize moves
    const index = Math.floor(Math.random() * moves.length);
    return moves[index];
}

function executeMove(fromId, toId) {
    const fromSquare = document.getElementById(fromId);
    const toSquare = document.getElementById(toId);
    const piece = fromSquare.removeChild(fromSquare.firstChild);
    toSquare.appendChild(piece);
}

function getPotentialMoves(squareId, color) {
    let moves = [];
    const [row, col] = squareId.substring(1).split('c').map(Number);
    const direction = color === 'white-piece' ? -1 : 1;

    let potentialPositions = [
        { row: row + direction, col: col - 1 },
        { row: row + direction, col: col + 1 }
    ];

    potentialPositions.push(
        { row: row + 2 * direction, col: col - 2 },
        { row: row + 2 * direction, col: col + 2 }
    );

    moves = potentialPositions.filter(pos =>
        pos.row >= 1 && pos.row <= 8 && pos.col >= 1 && pos.col <= 8
    ).map(pos => `r${pos.row}c${pos.col}`);

    return moves;
}
