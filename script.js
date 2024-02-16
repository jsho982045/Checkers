document.addEventListener('DOMContentLoaded', initializeBoard);

let isPlayerTurn = true; 

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

    const isKing = fromSquare.querySelector('.piece').classList.contains('king');
    const rowChange = toRow - fromRow;
    const validKingMove = isKing && Math.abs(rowChange) === 1 && Math.abs(fromCol - toCol) === 1;

    const isSimpleMove = (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1 && (toRow - fromRow) === direction);
    const isCaptureMove = (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2 && isCapture(fromId, toId, color));

    return isSimpleMove || isCaptureMove || validKingMove;
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

    kingPiece(toId, piece);

    if (Math.abs(parseInt(fromId[1]) - parseInt(toId[1])) === 2) {
        removeCapturedPiece(fromId, toId);
    }

    isPlayerTurn = !isPlayerTurn; 

    checkGameOver();
}


function kingPiece(squareId, piece) {
    const row = parseInt(squareId[1]);
    if ((piece.classList.contains('black-piece') && row === 8) || 
        (piece.classList.contains('white-piece') && row === 1)) {
        piece.classList.add('king');
        piece.innerHTML = 'K';
        piece.style.fontSize = '20px';
        piece.style.color = 'gold';


    }
}


function checkGameOver() {
    const blackPieces = document.querySelectorAll('.black-piece').length;
    const whitePieces = document.querySelectorAll('.white-piece').length;

    if (blackPieces === 0 || !hasValidMoves('black-piece')) {
        announceWinner('White');
    } else if (whitePieces === 0 || !hasValidMoves('white-piece')) {
        announceWinner('Black');
    }
}

function shouldKing(squareId, isBlackPiece) {
    const row = parseInt(squareId.substring(1, 2));
    return (isBlackPiece && row === 1) || (!isBlackPiece && row === 8);
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

function hasValidMoves(color) {
    let valid = false;
    document.querySelectorAll(`.${color}`).forEach(piece => {
        const squareId = piece.parentElement.id;
        getPotentialMoves(squareId, color).forEach(move => {
            if (isValidMove(squareId, move, color)) {
                valid = true;
            }
        });
    });
    return valid;
}

function announceWinner(winnerColor) {
    const gameArea = document.getElementById('gameArea');
    const announcement = document.createElement('div');
    announcement.innerHTML = `<h2>${winnerColor} Wins!</h2>`;
    announcement.style.color = winnerColor.toLowerCase() === 'black' ? 'black' : 'white';
    announcement.style.fontSize = '24px';
    announcement.style.fontWeight = 'bold';
    gameArea.appendChild(announcement);
    // Disable further moves
    document.removeEventListener('dragstart', dragStartHandler);
    document.querySelectorAll('.square').forEach(square => {
        square.removeEventListener('dragover', handleDragOver);
        square.removeEventListener('drop', handleDrop);
    });
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
                if (movedPiece && shouldKing(bestMove.toId, movedPiece.classList.contains('black-piece'))) {
                    movedPiece.classList.add('king');
                    movedPiece.innerHtml = 'K';
                    movedPiece.style.fontSize = '20px';
                    movedPiece.style.color = 'gold';
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

    if (shouldKing(toId, piece.classList.contains('black-piece'))) {
        piece.classList.add('king');
        piece.innerHTML = 'K';
        piece.style.fontSize = '20px';
        piece.style.color = 'gold';
    }
}

function getPotentialMoves(squareId, color) {
    let moves = [];
    const [row, col] = squareId.substring(1).split('c').map(Number);
    let directions = [];

    const piece = document.getElementById(squareId).querySelector('.piece');
    const isKing = piece.classList.contains('king');

    if (isKing) {
        // Kings can move both forwards and backwards
        directions = [1, -1];
    } else {
        // Regular pieces move in one direction
        const direction = color === 'white-piece' ? -1 : 1;
        directions = [direction];
    }

    directions.forEach(direction => {
        let potentialPositions = [
            { row: row + direction, col: col - 1 },
            { row: row + direction, col: col + 1 },
            { row: row + 2 * direction, col: col - 2 },
            { row: row + 2 * direction, col: col + 2 }
        ];

        if (isKing) {
            // Add backward diagonal moves for kings
            potentialPositions.push(
                { row: row - direction, col: col - 1 },
                { row: row - direction, col: col + 1 },
                { row: row - 2 * direction, col: col - 2 },
                { row: row - 2 * direction, col: col + 2 }
            );
        }

        moves = moves.concat(potentialPositions.filter(pos =>
            pos.row >= 1 && pos.row <= 8 && pos.col >= 1 && pos.col <= 8
        ).map(pos => `r${pos.row}c${pos.col}`));
    });

    return moves;
}
