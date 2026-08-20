export const SERIES_SYSTEM = {
  'relational faith': { order: 1, color: '#1D3FBF' },
  'on bliss': { order: 2, color: '#E0A21A' },
  'the procession': { order: 3, color: '#8C2F1E' },
  'no parade': { order: 4, color: '#38434D' },
  'the song of circumstance': { order: 5, color: '#0E6B5A' },
  // Legacy alias retained for older records/routes.
  'song of circumstance': { order: 5, color: '#0E6B5A' },
  'sunrise protocol': { order: 6, color: '#E23A17' },
  'human weather': { order: 7, color: '#0A0A0A' },
};

export const EDITORIAL_COLORS = {
  paper: '#FCFCFA',
  ink: '#0A0A0A',
  rule: '#D8D8D2',
  muted: '#6E6E68',
};

export function getSeriesMeta(seriesName = 'Human Weather') {
  return SERIES_SYSTEM[String(seriesName).trim().toLowerCase()] || {
    order: null,
    color: EDITORIAL_COLORS.ink,
  };
}

export function formatRegisterCoordinate(value, digits = 2) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? String(number).padStart(digits, '0') : null;
}

export function publicationYear(value) {
  const year = String(value || '').match(/\b(19|20)\d{2}\b/)?.[0];
  return year || String(new Date().getFullYear());
}
