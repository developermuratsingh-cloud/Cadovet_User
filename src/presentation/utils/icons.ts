// Emoji icons, like the website's service cards (which use emoji rather than an icon font).
export const serviceEmoji = (category: string, name = ''): string => {
  const k = `${category} ${name}`.toLowerCase();
  if (/vaccin/.test(k)) return '💉';
  if (/dental|teeth/.test(k)) return '🦷';
  if (/surg/.test(k)) return '🏥';
  if (/groom/.test(k)) return '✂️';
  if (/diagnos|lab|test/.test(k)) return '🧪';
  if (/consult|check/.test(k)) return '🩺';
  if (/preventive/.test(k)) return '💉';
  return '🐾';
};

export const petEmoji = (species: string): string => {
  const s = species.toLowerCase();
  if (s.includes('dog')) return '🐶';
  if (s.includes('cat')) return '🐱';
  if (s.includes('rabbit')) return '🐰';
  if (s.includes('bird')) return '🐦';
  return '🐾';
};
