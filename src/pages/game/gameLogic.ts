import { Board, Piece, Position, CastlingRights } from './gameTypes';

export const isValidMove = (
  board: Board, 
  from: Position, 
  to: Position, 
  piece: Piece, 
  castlingRights?: CastlingRights, 
  enPassantTarget?: Position | null
): boolean => {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  const targetPiece = board[to.row][to.col];

  if (targetPiece && targetPiece.color === piece.color) return false;

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      if (dx === 0 && !targetPiece) {
        if (dy === direction) return true;
        if (from.row === startRow && dy === direction * 2 && !board[from.row + direction][from.col]) return true;
      }
      
      if (Math.abs(dx) === 1 && dy === direction) {
        if (targetPiece) return true;
        if (enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) return true;
      }
      return false;
    }
    case 'knight':
      return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
    case 'bishop':
      if (Math.abs(dx) !== Math.abs(dy)) return false;
      return !isPathBlocked(board, from, to);
    case 'rook':
      if (dx !== 0 && dy !== 0) return false;
      return !isPathBlocked(board, from, to);
    case 'queen':
      if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false;
      return !isPathBlocked(board, from, to);
    case 'king': {
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return true;
      
      if (castlingRights && dy === 0 && Math.abs(dx) === 2) {
        const isKingSide = dx > 0;
        const baseRow = piece.color === 'white' ? 7 : 0;
        
        if (from.row !== baseRow || from.col !== 4) return false;
        
        if (piece.color === 'white') {
          if (isKingSide && !castlingRights.whiteKingSide) return false;
          if (!isKingSide && !castlingRights.whiteQueenSide) return false;
        } else {
          if (isKingSide && !castlingRights.blackKingSide) return false;
          if (!isKingSide && !castlingRights.blackQueenSide) return false;
        }
        
        const rookCol = isKingSide ? 7 : 0;
        const direction = isKingSide ? 1 : -1;
        
        for (let col = from.col + direction; col !== rookCol; col += direction) {
          if (board[from.row][col]) return false;
        }
        
        return true;
      }
      return false;
    }
    default:
      return false;
  }
};

export const isPathBlocked = (board: Board, from: Position, to: Position): boolean => {
  const dx = Math.sign(to.col - from.col);
  const dy = Math.sign(to.row - from.row);
  let x = from.col + dx;
  let y = from.row + dy;

  while (x !== to.col || y !== to.row) {
    if (board[y][x]) return true;
    x += dx;
    y += dy;
  }
  return false;
};

export const findKing = (board: Board, color: 'white' | 'black'): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isSquareUnderAttack = (board: Board, pos: Position, byColor: 'white' | 'black'): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        if (isValidMove(board, { row, col }, pos, piece)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const isInCheck = (board: Board, color: 'white' | 'black'): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareUnderAttack(board, kingPos, opponentColor);
};

export const simulateMove = (board: Board, from: Position, to: Position): Board => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (!piece) return newBoard;
  
  // Рокировка
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const isKingSide = to.col > from.col;
    const rookFromCol = isKingSide ? 7 : 0;
    const rookToCol = isKingSide ? to.col - 1 : to.col + 1;
    
    newBoard[from.row][rookToCol] = newBoard[from.row][rookFromCol];
    newBoard[from.row][rookFromCol] = null;
  }
  
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  return newBoard;
};

export const isMoveLegal = (
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null
): boolean => {
  if (!isValidMove(board, from, to, piece, castlingRights, enPassantTarget)) {
    return false;
  }
  
  // Проверка рокировки через шах
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    
    // Король не может быть под шахом
    if (isSquareUnderAttack(board, from, opponentColor)) {
      return false;
    }
    
    // Король не может проходить через битое поле
    const direction = to.col > from.col ? 1 : -1;
    const intermediateCol = from.col + direction;
    if (isSquareUnderAttack(board, { row: from.row, col: intermediateCol }, opponentColor)) {
      return false;
    }
    
    // Король не может встать на битое поле
    if (isSquareUnderAttack(board, to, opponentColor)) {
      return false;
    }
  }
  
  // Симулируем ход и проверяем, остался ли король под шахом
  const simulatedBoard = simulateMove(board, from, to);
  
  // Взятие на проходе
  if (piece.type === 'pawn' && enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
    const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    simulatedBoard[capturedRow][to.col] = null;
  }
  
  return !isInCheck(simulatedBoard, piece.color);
};

export const getPossibleMoves = (
  board: Board, 
  pos: Position, 
  castlingRights?: CastlingRights, 
  enPassantTarget?: Position | null
): Position[] => {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const moves: Position[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isMoveLegal(board, pos, { row, col }, piece, castlingRights, enPassantTarget)) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
};

export const evaluatePosition = (testBoard: Board, color: 'white' | 'black'): number => {
  const pieceValues: Record<string, number> = {
    pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000
  };

  const pawnTable = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [80, 80, 80, 80, 80, 80, 80, 80],
    [20, 20, 30, 45, 45, 30, 20, 20],
    [ 5,  5, 15, 35, 35, 15,  5,  5],
    [ 0,  0, 10, 30, 30, 10,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-25,-25, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-30,  5, 20, 25, 25, 20,  5,-30],
    [-30,  5, 25, 30, 30, 25,  5,-30],
    [-30,  5, 25, 30, 30, 25,  5,-30],
    [-30,  5, 20, 25, 25, 20,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  const bishopTable = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-10, 10, 15, 15, 15, 15, 10,-10],
    [-10,  0, 15, 20, 20, 15,  0,-10],
    [-10,  5, 10, 20, 20, 10,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  const rookTable = [
    [ 0,  0,  0,  5,  5,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ];

  const queenTable = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];

  const kingMidTable = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-30,-30,-20,-20,-10],
    [ 20, 20,  0,-10,-10,  0, 20, 20],
    [ 20, 30, 10,-10,-10, 10, 30, 20]
  ];

  const kingEndTable = [
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-30,-20,-10,  0,  0,-10,-20,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-30,  0,  0,  0,  0,-30,-30],
    [-50,-30,-30,-30,-30,-30,-30,-50]
  ];

  let whiteMaterial = 0;
  let blackMaterial = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = testBoard[r][c];
      if (!p || p.type === 'king') continue;
      if (p.color === 'white') whiteMaterial += pieceValues[p.type];
      else blackMaterial += pieceValues[p.type];
    }
  }
  const totalMaterial = whiteMaterial + blackMaterial;
  const isEndgame = totalMaterial < 2800;

  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = testBoard[row][col];
      if (!piece) continue;

      const pieceScore = pieceValues[piece.type];
      let positionScore = 0;
      const adjustedRow = piece.color === 'white' ? 7 - row : row;

      switch (piece.type) {
        case 'pawn':   positionScore = pawnTable[adjustedRow][col]; break;
        case 'knight': positionScore = knightTable[adjustedRow][col]; break;
        case 'bishop': positionScore = bishopTable[adjustedRow][col]; break;
        case 'rook':   positionScore = rookTable[adjustedRow][col]; break;
        case 'queen':  positionScore = queenTable[adjustedRow][col]; break;
        case 'king':
          positionScore = isEndgame
            ? kingEndTable[adjustedRow][col]
            : kingMidTable[adjustedRow][col];
          break;
      }

      if (piece.color === color) {
        score += pieceScore + positionScore;
      } else {
        score -= pieceScore + positionScore;
      }
    }
  }

  const opponent = color === 'white' ? 'black' : 'white';

  // Мобильность: больше ходов = лучше
  const myMoves = getAllLegalMoves(testBoard, color);
  const oppMoves = getAllLegalMoves(testBoard, opponent);
  score += (myMoves.length - oppMoves.length) * 8;

  // Бонус за два слона
  const myBishops = [];
  const oppBishops = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = testBoard[r][c];
      if (!p || p.type !== 'bishop') continue;
      if (p.color === color) myBishops.push(p);
      else oppBishops.push(p);
    }
  }
  if (myBishops.length >= 2) score += 30;
  if (oppBishops.length >= 2) score -= 30;

  return score;
};

export const getAllPossibleMovesForBoard = (testBoard: Board, color: 'white' | 'black'): { from: Position; to: Position }[] => {
  const moves: { from: Position; to: Position }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = testBoard[row][col];
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMoveForBoard(testBoard, { row, col }, { row: toRow, col: toCol }, piece)) {
              moves.push({ from: { row, col }, to: { row: toRow, col: toCol } });
            }
          }
        }
      }
    }
  }
  return moves;
};

export const getAllLegalMoves = (
  board: Board, 
  color: 'white' | 'black',
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null
): { from: Position; to: Position }[] => {
  const moves: { from: Position; to: Position }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isMoveLegal(board, { row, col }, { row: toRow, col: toCol }, piece, castlingRights, enPassantTarget)) {
              moves.push({ from: { row, col }, to: { row: toRow, col: toCol } });
            }
          }
        }
      }
    }
  }
  return moves;
};

export const isCheckmate = (
  board: Board, 
  color: 'white' | 'black',
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null
): boolean => {
  if (!isInCheck(board, color)) return false;
  const legalMoves = getAllLegalMoves(board, color, castlingRights, enPassantTarget);
  return legalMoves.length === 0;
};

export const isStalemate = (
  board: Board, 
  color: 'white' | 'black',
  castlingRights?: CastlingRights,
  enPassantTarget?: Position | null
): boolean => {
  if (isInCheck(board, color)) return false;
  const legalMoves = getAllLegalMoves(board, color, castlingRights, enPassantTarget);
  return legalMoves.length === 0;
};

export const isValidMoveForBoard = (testBoard: Board, from: Position, to: Position, piece: Piece): boolean => {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  const targetPiece = testBoard[to.row][to.col];

  if (targetPiece && targetPiece.color === piece.color) return false;

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      if (dx === 0 && !targetPiece) {
        if (dy === direction) return true;
        if (from.row === startRow && dy === direction * 2) {
          const middleRow = from.row + direction;
          if (!testBoard[middleRow][from.col]) return true;
        }
      }
      
      if (Math.abs(dx) === 1 && dy === direction && targetPiece) return true;
      return false;
    }
    case 'knight':
      return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
    case 'bishop':
      if (Math.abs(dx) !== Math.abs(dy)) return false;
      return !isPathBlockedForBoard(testBoard, from, to);
    case 'rook':
      if (dx !== 0 && dy !== 0) return false;
      return !isPathBlockedForBoard(testBoard, from, to);
    case 'queen':
      if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false;
      return !isPathBlockedForBoard(testBoard, from, to);
    case 'king':
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    default:
      return false;
  }
};

export const isPathBlockedForBoard = (testBoard: Board, from: Position, to: Position): boolean => {
  const dx = Math.sign(to.col - from.col);
  const dy = Math.sign(to.row - from.row);
  let x = from.col + dx;
  let y = from.row + dy;

  while (x !== to.col || y !== to.row) {
    if (testBoard[y][x]) return true;
    x += dx;
    y += dy;
  }
  return false;
};

const PIECE_VALUES: Record<string, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000
};

const sortMoves = (
  board: Board,
  moves: { from: Position; to: Position }[]
): { from: Position; to: Position }[] => {
  return [...moves].sort((a, b) => {
    const captureA = board[a.to.row][a.to.col];
    const captureB = board[b.to.row][b.to.col];
    let scoreA = captureA ? PIECE_VALUES[captureA.type] : 0;
    let scoreB = captureB ? PIECE_VALUES[captureB.type] : 0;
    // Приоритет ходам дающим шах
    const pieceA = board[a.from.row][a.from.col];
    const pieceB = board[b.from.row][b.from.col];
    if (pieceA) {
      const nextA = simulateMove(board, a.from, a.to);
      const oppColor = pieceA.color === 'white' ? 'black' : 'white';
      if (isInCheck(nextA, oppColor)) scoreA += 500;
    }
    if (pieceB) {
      const nextB = simulateMove(board, b.from, b.to);
      const oppColor = pieceB.color === 'white' ? 'black' : 'white';
      if (isInCheck(nextB, oppColor)) scoreB += 500;
    }
    return scoreB - scoreA;
  });
};

const minimax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  botColor: 'white' | 'black'
): number => {
  const playerColor = botColor === 'black' ? 'white' : 'black';

  if (depth === 0) return evaluatePosition(board, botColor);

  const color = isMaximizing ? botColor : playerColor;
  const rawMoves = getAllLegalMoves(board, color);
  const moves = sortMoves(board, rawMoves);

  if (moves.length === 0) {
    if (isInCheck(board, color)) return isMaximizing ? (-900000 - depth * 1000) : (900000 + depth * 1000);
    return 0;
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const next = simulateMove(board, move.from, move.to);
      const score = minimax(next, depth - 1, alpha, beta, false, botColor);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const next = simulateMove(board, move.from, move.to);
      const score = minimax(next, depth - 1, alpha, beta, true, botColor);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
};

export const getBestMove = (
  board: Board,
  moves: { from: Position; to: Position }[],
  difficulty: 'medium' | 'hard' | 'master',
  botColor: 'white' | 'black' = 'black'
): { from: Position; to: Position } => {
  const depth = difficulty === 'master' ? 4 : difficulty === 'hard' ? 3 : 2;
  const noise = difficulty === 'master' ? 0 : difficulty === 'hard' ? 15 : 60;

  const sorted = sortMoves(board, moves);
  let bestMove = sorted[0];
  let bestScore = -Infinity;

  for (const move of sorted) {
    const testBoard = simulateMove(board, move.from, move.to);
    let score = minimax(testBoard, depth - 1, -Infinity, Infinity, false, botColor);
    score += Math.random() * noise;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};