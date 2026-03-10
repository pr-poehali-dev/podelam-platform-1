export type Piece = {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
};

export type Board = (Piece | null)[][];
export type Position = { row: number; col: number };

export type CastlingRights = {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
};

export const initialBoard: Board = [
  [
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' }, { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' } as Piece)),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' } as Piece)),
  [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' }, { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
  ]
];

export const pieceSymbols: Record<string, Record<string, string>> = {
  white: {
    king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙'
  },
  black: {
    king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
  }
};

export const pieceImages: Record<string, Record<string, string>> = {
  white: {
    king: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    queen: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    rook: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    bishop: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    knight: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    pawn: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
  },
  black: {
    king: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    queen: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    rook: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    bishop: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    knight: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    pawn: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg'
  }
};

export type BoardTheme = 'classic' | 'flat' | 'wood';

export interface BoardThemeConfig {
  name: string;
  lightSquare: string;
  darkSquare: string;
  backgroundImage?: string;
  borderColor: string;
  borderOuterColor: string;
  labelLightColor: string;
  labelDarkColor: string;
}

export const boardThemes: Record<BoardTheme, BoardThemeConfig> = {
  classic: {
    name: 'Классика',
    lightSquare: 'rgba(255, 255, 255, 0.15)',
    darkSquare: 'rgba(0, 0, 0, 0.3)',
    backgroundImage: 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/79c4520d-63b3-4e07-8bba-0b7b41c53435.jpg',
    borderColor: '#3e2723',
    borderOuterColor: '#5d4037',
    labelLightColor: '#b58863',
    labelDarkColor: '#f0d9b5'
  },
  flat: {
    name: 'Плоская',
    lightSquare: '#b8976a',
    darkSquare: '#8b6b4a',
    borderColor: '#5d4037',
    borderOuterColor: '#3e2723',
    labelLightColor: '#8b6b4a',
    labelDarkColor: '#b8976a'
  },
  wood: {
    name: 'Дерево',
    lightSquare: '#c4a882',
    darkSquare: '#8b7355',
    borderColor: '#5a4a3a',
    borderOuterColor: '#3d3228',
    labelLightColor: '#7a6548',
    labelDarkColor: '#d4bc9a'
  }
};

export function parseTimeControl(control: string): { minutes: number; increment: number } {
  if (control.includes('+')) {
    const [mins, inc] = control.split('+').map(Number);
    return { minutes: mins || 10, increment: inc || 0 };
  }
  const mins = parseInt(control);
  if (!isNaN(mins)) return { minutes: mins, increment: 0 };
  switch (control) {
    case 'blitz': return { minutes: 3, increment: 2 };
    case 'rapid': return { minutes: 10, increment: 5 };
    case 'classic': return { minutes: 15, increment: 10 };
    default: return { minutes: 10, increment: 0 };
  }
}

export function getInitialTime(control: string): number {
  const { minutes } = parseTimeControl(control);
  return minutes * 60;
}

export function getIncrement(control: string): number {
  const { increment } = parseTimeControl(control);
  return increment;
}

export function formatTime(seconds: number): string {
  if (seconds <= 10) {
    return seconds.toFixed(1);
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getDifficultyLabel(diff: string): string {
  switch (diff) {
    case 'easy': return 'Легкий';
    case 'medium': return 'Средний';
    case 'hard': return 'Сложный';
    case 'master': return 'Мастер';
    default: return diff;
  }
}