import enigmesData from '@/data/enigmes.json';

export type Zone = 1 | 2 | 3;

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

/**
 * Vérifie si toutes les énigmes d'une zone sont résolues
 */
export const isZoneComplete = (zone: Zone, solvedPuzzles: Record<string, boolean>): boolean => {
  const zoneKey = `zone${zone}`;
  const zoneData = enigmesData.zones[zoneKey as keyof typeof enigmesData.zones];
  
  if (!zoneData) return false;
  
  const puzzleIds = Object.values(zoneData.puzzles).map(p => p.id);
  return puzzleIds.every(id => solvedPuzzles[id] === true);
};

/**
 * Vérifie une solution d'énigme
 */
export const validatePuzzleSolution = (puzzleId: string, userAnswer: string): boolean => {
  // Parcourir toutes les zones pour trouver l'énigme
  for (const zone of Object.values(enigmesData.zones)) {
    for (const puzzle of Object.values(zone.puzzles)) {
      if (puzzle.id === puzzleId) {
        const normalizedAnswer = userAnswer.trim().toUpperCase();
        // Gérer les différents types de puzzles
        const solutionValue = 'solution' in puzzle ? puzzle.solution : 
                            'code' in puzzle ? puzzle.code : 
                            'keyword' in puzzle ? puzzle.keyword : null;
        if (!solutionValue) return false;
        const normalizedSolution = String(solutionValue).toUpperCase();
        return normalizedAnswer === normalizedSolution;
      }
    }
  }
  return false;
};

/**
 * Décode un texte avec le chiffrement de César
 */
export const caesarDecode = (text: string, shift: number): string => {
  return text
    .split('')
    .map(char => {
      if (char.match(/[A-Z]/)) {
        const code = char.charCodeAt(0);
        const shifted = ((code - 65 - shift + 26) % 26) + 65;
        return String.fromCharCode(shifted);
      }
      if (char.match(/[a-z]/)) {
        const code = char.charCodeAt(0);
        const shifted = ((code - 97 - shift + 26) % 26) + 97;
        return String.fromCharCode(shifted);
      }
      return char;
    })
    .join('');
};

/**
 * Récupère les indices pour une énigme
 */
export const getHints = (puzzleId: string): string[] => {
  for (const zone of Object.values(enigmesData.zones)) {
    for (const puzzle of Object.values(zone.puzzles)) {
      if (puzzle.id === puzzleId) {
        return puzzle.hints || [];
      }
    }
  }
  return [];
};

/**
 * Calcule le nombre d'énigmes résolues
 */
export const countSolvedPuzzles = (solvedPuzzles: Record<string, boolean>): number => {
  return Object.values(solvedPuzzles).filter(Boolean).length;
};

/**
 * Récupère le nom d'une zone
 */
export const getZoneName = (zone: Zone): string => {
  const zoneKey = `zone${zone}`;
  return enigmesData.zones[zoneKey as keyof typeof enigmesData.zones]?.name || '';
};
