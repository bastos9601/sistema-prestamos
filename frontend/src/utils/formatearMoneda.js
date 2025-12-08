// Utilidad para formatear moneda en Soles Peruanos
export const formatearMoneda = (valor) => {
  return `S/ ${parseFloat(valor || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const MONEDA = 'Soles Peruanos';
export const SIMBOLO_MONEDA = 'S/';
