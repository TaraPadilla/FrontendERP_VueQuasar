export function formatearPesos(valor) {
  return Number(valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })
}
