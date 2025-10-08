import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { InventoryItem } from '@/lib/gameLogic';

interface PuzzleBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onSolve: () => void;
  addItem: (item: InventoryItem) => void;
}

type Board = (number | null)[];

const WINNING_CONFIG: Board = [1, 2, 3, 4, 5, 6, 7, 8, null];

// Fonction pour mélanger le puzzle de manière soluble
const shuffleBoard = (): Board => {
  const board: Board = [...WINNING_CONFIG];
  const moves = 100;
  
  for (let i = 0; i < moves; i++) {
    const emptyIndex = board.indexOf(null);
    const possibleMoves = [];
    
    // Haut
    if (emptyIndex >= 3) possibleMoves.push(emptyIndex - 3);
    // Bas
    if (emptyIndex < 6) possibleMoves.push(emptyIndex + 3);
    // Gauche
    if (emptyIndex % 3 !== 0) possibleMoves.push(emptyIndex - 1);
    // Droite
    if (emptyIndex % 3 !== 2) possibleMoves.push(emptyIndex + 1);
    
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    [board[emptyIndex], board[randomMove]] = [board[randomMove], board[emptyIndex]];
  }
  
  return board;
};

const isSolved = (board: Board): boolean => {
  return board.every((val, idx) => val === WINNING_CONFIG[idx]);
};

export const PuzzleBoard = ({ isOpen, onClose, onSolve, addItem }: PuzzleBoardProps) => {
  const [board, setBoard] = useState<Board>(() => shuffleBoard());
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (isOpen && !solved) {
      setBoard(shuffleBoard());
    }
  }, [isOpen, solved]);

  useEffect(() => {
    if (isSolved(board) && !solved) {
      setSolved(true);
      toast.success('Puzzle résolu ! Informations récupérées.');
      addItem({
        id: 'virus_info',
        name: 'Informations sur le virus VX-9',
        description: 'Données techniques sur le virus VX-9'
      });
      onSolve();
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [board, solved, addItem, onSolve, onClose]);

  const handleTileClick = (index: number) => {
    if (solved) return;
    
    const emptyIndex = board.indexOf(null);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;
    
    // Vérifier si la case est adjacente à la case vide
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    
    if (isAdjacent) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span>🧩</span>
            Panneau de contrôle
          </DialogTitle>
          <DialogDescription>
            Réorganisez les pièces du puzzle en cliquant sur les cases adjacentes à l'espace vide.
            Reconstituez l'image pour révéler les informations sur le virus.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            {board.map((tile, index) => (
              <Button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={tile === null || solved}
                className={`h-24 text-3xl font-bold transition-all ${
                  tile === null
                    ? 'bg-slate-900 cursor-default'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                }`}
                variant="default"
              >
                {tile !== null ? tile : ''}
              </Button>
            ))}
          </div>

          {solved && (
            <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg">
              <p className="text-center text-green-400 font-semibold mb-2">
                ✓ Puzzle résolu !
              </p>
              <p className="text-sm text-center text-slate-300">
                Le virus VX-9 est un agent pathogène synthétique de classe 4.
                Hautement contagieux. Vaccin requis immédiatement.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};