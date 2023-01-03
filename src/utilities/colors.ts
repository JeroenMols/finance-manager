export const stockColors = [
  '#C62828',
  '#AD1457',
  '#6A1B9A',
  '#283593',
  '#1565C0',
  '#00838F',
  '#2E7D32',
  '#9E9D24',
  '#F9A825',
  '#EF6C00',
  '#D84315',
  '#4E342E',
  '#37474F',
];

export function toColor(index: number) {
  return stockColors[index % stockColors.length];
}
