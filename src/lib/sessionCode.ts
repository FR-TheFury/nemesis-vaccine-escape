/**
 * Génère un code de session aléatoire de 6 caractères
 * Format: XXXXXX (A-Z, 0-9)
 */
export const generateSessionCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

/**
 * Valide le format d'un code de session
 */
export const isValidSessionCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

/**
 * Codes de porte fixes basés sur des éléments du tableau périodique
 * Zone 1: 7926 (Au-Or: 79 + Fe-Fer: 26)
 * Zone 2: 1147 (Na-Sodium: 11 + Ag-Argent: 47)
 * Zone 3: 2982 (Cu-Cuivre: 29 + Pb-Plomb: 82)
 */
const FIXED_DOOR_CODES = {
  zone1: '7926',
  zone2: '1147',
  zone3: '2982'
};

/**
 * Retourne les codes de porte fixes pour les 3 zones
 */
export const getAllDoorCodes = () => {
  return { ...FIXED_DOOR_CODES };
};
