// Meteorological seasons by hemisphere. Framework-free so the app and the
// planting calendar can reuse it. Months are 1–12.

export const MONTHS = Object.freeze([
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]);

const NORTH = Object.freeze({ primavera: [3, 4, 5], verano: [6, 7, 8], otono: [9, 10, 11], invierno: [12, 1, 2] });

function assertHemisphere(hemisphere) {
  if (hemisphere !== 'norte' && hemisphere !== 'sur') throw new RangeError(`Hemisferio desconocido: ${hemisphere}`);
}

const shift = (month) => ((month + 5) % 12) + 1;

export function seasonMonths(season, hemisphere) {
  assertHemisphere(hemisphere);
  const months = NORTH[season];
  if (!months) throw new RangeError(`Estación desconocida: ${season}`);
  return hemisphere === 'norte' ? [...months] : months.map(shift);
}

export function seasonOf(month, hemisphere) {
  assertHemisphere(hemisphere);
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError(`Mes inválido: ${month}`);
  const northMonth = hemisphere === 'norte' ? month : shift(month);
  return Object.keys(NORTH).find((season) => NORTH[season].includes(northMonth));
}

// "de marzo a agosto" for one or more consecutive seasons.
export function monthRange(seasons, hemisphere) {
  const months = seasons.flatMap((season) => seasonMonths(season, hemisphere));
  return `de ${MONTHS[months[0] - 1]} a ${MONTHS[months.at(-1) - 1]}`;
}

// Growing season (spring + summer) for both hemispheres, used on plant cards.
export function growingSeason() {
  return { norte: monthRange(['primavera', 'verano'], 'norte'), sur: monthRange(['primavera', 'verano'], 'sur') };
}
