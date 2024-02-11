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
    if (!isPlayerTurn) return;

    const fromId = e.dataTransfer.getData('text/plain');
    const toId = e.target.id || e.target.parentElement.id;

    if (isValidMove(fromId, toId, 'black-piece')) {
        movePiece(fromId, toId);
        setTimeout(computerMove, 500);
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

    if (shouldKing(toId, piece.classList.contains('black-piece'))) {
        piece.classList.add('king');
        // Optionally, update the piece's appearance to indicate it's a king
    }

    if (Math.abs(parseInt(fromId[1]) - parseInt(toId[1])) === 2) {
        removeCapturedPiece(fromId, toId);
    }

    isPlayerTurn = !isPlayerTurn; // Toggle turn
}

function shouldKing(squareId, isBlackPiece) {
    const row = parseInt(squareId.substring(1, 2));
    return (isBlackPiece && row === 8) || (!isBlackPiece && row === 1);
}

function removeCapturedPiece(fromId, toId) {
    const [fromRow, fromCol] = fromId.substring(1).split('c').map(Number);
    const [toRow, toCol] = toId.substring(1).split('c').map(Number);
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;
    const midSquareId = `r${midRow}c${midCol}`;
    const midSquare = document.getElementById(midSquareId);
    const capturedPiece = midSquare.removeChild(midSquare.firstChild);

    const captureAreaId = capturedPiece.classList.contains('black-piece') ? 'cpuCaptures' : 'playerCaptures';
    document.getElementById(captureAreaId).appendChild(capturedPiece);
}



function computerMove() {
    if (!isPlayerTurn) {
        const possibleMoves = generatePossibleMoves('white-piece');
        if (possibleMoves.length > 0) {
            const bestMove = selectBestMove(possibleMoves);
            if (bestMove) {
                executeMove(bestMove.fromId, bestMove.toId);
                // Handle capture if there's a jump
                if (Math.abs(parseInt(bestMove.fromId[1]) - parseInt(bestMove.toId[1])) === 2) {
                    removeCapturedPiece(bestMove.fromId, bestMove.toId);
                }
                // After moving, check for kinging
                const movedPiece = document.getElementById(bestMove.toId).querySelector('.piece');
                if (shouldKing(bestMove.toId, movedPiece.classList.contains('white-piece'))) {
                    movedPiece.classList.add('king');
                    // Optionally, update the piece's appearance to indicate it's a king
                }
                isPlayerTurn = true; // Toggle turn back to the player
            }
        }
    }
}

function generatePossibleMoves(color) {
    let moves = [];
    document.querySelectorAll(`.${color}`).forEach(piece => {
        const squareId = piece.parentElement.id;
        // Generate all valid moves for this piece, including potential captures
        getPotentialMoves(squareId, color).forEach(move => {
            if (isValidMove(squareId, move, color)) {
                moves.push({fromId: squareId, toId: move});
            }
        });
    });
    return moves;
}

function selectBestMove(moves) {
    // Prioritize captures if available
    const captures = moves.filter(move => Math.abs(parseInt(move.fromId[1]) - parseInt(move.toId[1])) === 2);
    if (captures.length > 0) {
        return captures[Math.floor(Math.random() * captures.length)];
    }
    // Fallback to random move if no captures are available
    return moves[Math.floor(Math.random() * moves.length)];
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