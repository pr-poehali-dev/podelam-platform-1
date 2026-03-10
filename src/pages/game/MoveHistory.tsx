import { useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface MoveHistoryProps {
  moveHistory: string[];
  currentMoveIndex: number;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUpOrLeave: () => void;
  onPreviousMove: () => void;
  onNextMove: () => void;
  historyRef: React.RefObject<HTMLDivElement>;
  theme?: 'light' | 'dark';
}

export const MoveHistory = ({
  moveHistory,
  currentMoveIndex,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUpOrLeave,
  onPreviousMove,
  onNextMove,
  historyRef,
  theme = 'dark'
}: MoveHistoryProps) => {
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollLeft = historyRef.current.scrollWidth;
    }
  }, [moveHistory.length, historyRef]);
  return (
    <div className="w-full flex items-center gap-1 sm:gap-2">
      <button
        onClick={onPreviousMove}
        disabled={currentMoveIndex === 0}
        className={`p-1 sm:p-2 disabled:opacity-30 disabled:cursor-not-allowed border rounded-md sm:rounded-lg transition-colors flex-shrink-0 ${
          theme === 'light'
            ? 'bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
            : 'bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100'
        }`}
        title="Предыдущий ход"
      >
        <Icon name="ChevronLeft" size={14} />
      </button>
      
      <div className="relative flex-1 min-w-0 max-w-full overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r z-10 pointer-events-none ${
          theme === 'light' ? 'from-slate-200 to-transparent' : 'from-stone-900 to-transparent'
        }`}></div>
        <div 
          ref={historyRef} 
          className={`overflow-x-auto hide-scrollbar backdrop-blur-sm rounded-md sm:rounded-lg border p-0.5 sm:p-1.5 ${
            theme === 'light' 
              ? 'bg-white/80 border-slate-300' 
              : 'bg-stone-800/50 border-stone-700/30'
          }`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUpOrLeave}
          onMouseLeave={onMouseUpOrLeave}
        >
          <div className={`flex gap-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} min-h-[16px] sm:min-h-[20px] justify-end`}>
            {moveHistory.map((move, index) => (
              <div 
                key={index} 
                className={`whitespace-nowrap flex-shrink-0 transition-all ${
                  index === currentMoveIndex - 1
                    ? (theme === 'light' ? 'text-slate-900 font-semibold text-xs' : 'text-white font-semibold text-xs')
                    : (theme === 'light' ? 'text-slate-600 text-[10px]' : 'text-stone-300 text-[10px]')
                }`}
              >
                <span className={theme === 'light' ? 'text-slate-400 mr-0.5' : 'text-stone-500 mr-0.5'}>{Math.floor(index / 2) + 1}.</span>
                {move}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNextMove}
        disabled={currentMoveIndex >= moveHistory.length}
        className={`p-1 sm:p-2 disabled:opacity-30 disabled:cursor-not-allowed border rounded-md sm:rounded-lg transition-colors flex-shrink-0 ${
          theme === 'light'
            ? 'bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
            : 'bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100'
        }`}
        title="Следующий ход"
      >
        <Icon name="ChevronRight" size={14} />
      </button>
    </div>
  );
};