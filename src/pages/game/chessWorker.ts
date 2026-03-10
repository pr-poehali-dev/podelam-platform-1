import type { Board, Position, Piece, CastlingRights } from './gameTypes';

const isPathBlocked = (board: Board, from: Position, to: Position): boolean => {
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

const isValidMoveW = (board: Board, from: Position, to: Position, piece: Piece): boolean => {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  const target = board[to.row][to.col];
  if (target && target.color === piece.color) return false;
  switch (piece.type) {
    case 'pawn': {
      const dir = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      if (dx === 0 && !target) {
        if (dy === dir) return true;
        if (from.row === startRow && dy === dir * 2 && !board[from.row + dir][from.col]) return true;
      }
      if (Math.abs(dx) === 1 && dy === dir && target) return true;
      return false;
    }
    case 'knight': return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
    case 'bishop': return Math.abs(dx) === Math.abs(dy) && !isPathBlocked(board, from, to);
    case 'rook': return (dx === 0 || dy === 0) && !isPathBlocked(board, from, to);
    case 'queen': return (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && !isPathBlocked(board, from, to);
    case 'king': return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    default: return false;
  }
};

const simulateMoveW = (board: Board, from: Position, to: Position): Board => {
  const next = board.map(r => [...r]);
  const piece = next[from.row][from.col];
  if (!piece) return next;
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const ks = to.col > from.col;
    const rFrom = ks ? 7 : 0;
    const rTo = ks ? to.col - 1 : to.col + 1;
    next[from.row][rTo] = next[from.row][rFrom];
    next[from.row][rFrom] = null;
  }
  next[to.row][to.col] = piece;
  next[from.row][from.col] = null;
  return next;
};

const findKingW = (board: Board, color: 'white' | 'black'): Position | null => {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'king' && p.color === color) return { row: r, col: c };
    }
  return null;
};

const isUnderAttack = (board: Board, pos: Position, by: 'white' | 'black'): boolean => {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === by && isValidMoveW(board, { row: r, col: c }, pos, p)) return true;
    }
  return false;
};

const isInCheckW = (board: Board, color: 'white' | 'black'): boolean => {
  const kp = findKingW(board, color);
  if (!kp) return false;
  return isUnderAttack(board, kp, color === 'white' ? 'black' : 'white');
};

const isMoveLegalW = (board: Board, from: Position, to: Position, piece: Piece): boolean => {
  if (!isValidMoveW(board, from, to, piece)) return false;
  const next = simulateMoveW(board, from, to);
  return !isInCheckW(next, piece.color);
};

const getAllLegalW = (board: Board, color: 'white' | 'black'): { from: Position; to: Position }[] => {
  const moves: { from: Position; to: Position }[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color)
        for (let tr = 0; tr < 8; tr++)
          for (let tc = 0; tc < 8; tc++)
            if (isMoveLegalW(board, { row: r, col: c }, { row: tr, col: tc }, p))
              moves.push({ from: { row: r, col: c }, to: { row: tr, col: tc } });
    }
  return moves;
};

const VALS: Record<string, number> = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000 };

const pawnT = [[0,0,0,0,0,0,0,0],[80,80,80,80,80,80,80,80],[20,20,30,45,45,30,20,20],[5,5,15,35,35,15,5,5],[0,0,10,30,30,10,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-25,-25,10,10,5],[0,0,0,0,0,0,0,0]];
const knightT = [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,5,5,0,-20,-40],[-30,5,20,25,25,20,5,-30],[-30,5,25,30,30,25,5,-30],[-30,5,25,30,30,25,5,-30],[-30,5,20,25,25,20,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]];
const bishopT = [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,5,0,0,0,0,5,-10],[-10,10,15,15,15,15,10,-10],[-10,0,15,20,20,15,0,-10],[-10,5,10,20,20,10,5,-10],[-10,0,10,10,10,10,0,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]];
const rookT = [[0,0,0,5,5,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]];
const queenT = [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,5,0,0,0,0,-10],[-10,5,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[-5,0,5,5,5,5,0,-5],[-10,0,5,5,5,5,0,-10],[-10,0,0,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]];
const kingMidT = [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-30,-30,-20,-20,-10],[20,20,0,-10,-10,0,20,20],[20,30,10,-10,-10,10,30,20]];
const kingEndT = [[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]];

const evaluateW = (board: Board, color: 'white' | 'black'): number => {
  let wMat = 0, bMat = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.type === 'king') continue;
      if (p.color === 'white') wMat += VALS[p.type];
      else bMat += VALS[p.type];
    }
  const endgame = (wMat + bMat) < 2800;
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const ar = p.color === 'white' ? 7 - r : r;
      let pos = 0;
      switch (p.type) {
        case 'pawn': pos = pawnT[ar][c]; break;
        case 'knight': pos = knightT[ar][c]; break;
        case 'bishop': pos = bishopT[ar][c]; break;
        case 'rook': pos = rookT[ar][c]; break;
        case 'queen': pos = queenT[ar][c]; break;
        case 'king': pos = endgame ? kingEndT[ar][c] : kingMidT[ar][c]; break;
      }
      if (p.color === color) score += VALS[p.type] + pos;
      else score -= VALS[p.type] + pos;
    }
  const opp = color === 'white' ? 'black' : 'white';
  score += (getAllLegalW(board, color).length - getAllLegalW(board, opp).length) * 8;
  return score;
};

const sortMovesW = (board: Board, moves: { from: Position; to: Position }[]): { from: Position; to: Position }[] => {
  return [...moves].sort((a, b) => {
    const ca = board[a.to.row][a.to.col];
    const cb = board[b.to.row][b.to.col];
    let sa = ca ? VALS[ca.type] : 0;
    let sb = cb ? VALS[cb.type] : 0;
    const pa = board[a.from.row][a.from.col];
    const pb = board[b.from.row][b.from.col];
    if (pa) { const nx = simulateMoveW(board, a.from, a.to); if (isInCheckW(nx, pa.color === 'white' ? 'black' : 'white')) sa += 500; }
    if (pb) { const nx = simulateMoveW(board, b.from, b.to); if (isInCheckW(nx, pb.color === 'white' ? 'black' : 'white')) sb += 500; }
    return sb - sa;
  });
};

const minimaxW = (board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, botColor: 'white' | 'black'): number => {
  const oppColor = botColor === 'white' ? 'black' : 'white';
  if (depth === 0) return evaluateW(board, botColor);
  const color = maximizing ? botColor : oppColor;
  const moves = sortMovesW(board, getAllLegalW(board, color));
  if (moves.length === 0) {
    if (isInCheckW(board, color)) return maximizing ? (-900000 - depth * 1000) : (900000 + depth * 1000);
    return 0;
  }
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const score = minimaxW(simulateMoveW(board, m.from, m.to), depth - 1, alpha, beta, false, botColor);
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const score = minimaxW(simulateMoveW(board, m.from, m.to), depth - 1, alpha, beta, true, botColor);
      best = Math.min(best, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return best;
  }
};

self.onmessage = (e: MessageEvent) => {
  const { board, moves, difficulty, botColor } = e.data as {
    board: Board;
    moves: { from: Position; to: Position }[];
    difficulty: 'medium' | 'hard' | 'master';
    botColor: 'white' | 'black';
  };

  const depth = difficulty === 'master' ? 4 : difficulty === 'hard' ? 3 : 2;
  const noise = difficulty === 'master' ? 0 : difficulty === 'hard' ? 15 : 60;

  const sorted = sortMovesW(board, moves);
  let bestMove = sorted[0];
  let bestScore = -Infinity;

  for (const move of sorted) {
    const next = simulateMoveW(board, move.from, move.to);
    let score = minimaxW(next, depth - 1, -Infinity, Infinity, false, botColor);
    score += Math.random() * noise;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  self.postMessage(bestMove);
};