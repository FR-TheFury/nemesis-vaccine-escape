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
 * Génère un code de porte aléatoire à 4 chiffres
 */
export const generateDoorCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Génère tous les codes de porte pour les 3 zones
 */
export const generateAllDoorCodes = () => {
  return {
    zone1: generateDoorCode(),
    zone2: generateDoorCode(),
    zone3: generateDoorCode()
  };
};
