const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function formatDate(value?: string | number | Date | null) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      const monthName = MONTHS[Number(month) - 1] ?? 'Mes';
      return `${day}-${monthName}-${year}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS[date.getMonth()] ?? 'Mes';
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatMoney(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }
  try {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }
  try {
    return new Intl.NumberFormat('es-EC').format(value);
  } catch {
    return String(value);
  }
}
