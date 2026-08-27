export const ARS = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
export const off = (p) => (p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : 0);
export const cuota = (p) => (p.installments > 1 ? ARS(Math.round(p.price / p.installments)) : null);
