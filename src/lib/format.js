// Small display helpers shared by pages. Framework-free and tested.

const dateFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new RangeError(`Fecha inválida: ${iso}`);
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

export function petLabel(status) {
  if (status === 'toxica') return 'Tóxica';
  if (status === 'no-toxica') return 'No tóxica';
  throw new RangeError(`Estado desconocido: ${status}`);
}

// One-line verdict for cats and dogs together.
export function petVerdict({ cats, dogs }) {
  if (cats === 'no-toxica' && dogs === 'no-toxica') return { tone: 'ok', text: 'No tóxica para gatos ni perros' };
  if (cats === 'toxica' && dogs === 'toxica') return { tone: 'bad', text: 'Tóxica para gatos y perros' };
  return { tone: 'bad', text: cats === 'toxica' ? 'Tóxica para gatos' : 'Tóxica para perros' };
}

export function temperatureLine({ minC, idealMinC, idealMaxC, short }) {
  if (idealMinC === null || idealMaxC === null) return short ?? 'Ver detalles';
  const ideal = `${idealMinC}–${idealMaxC} °C`;
  return minC === null ? ideal : `${ideal} (mínimo ${minC} °C)`;
}
