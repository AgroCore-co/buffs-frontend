// Máscara dinâmica para CEP
export function maskCEP(valor) {
  const v = valor.replace(/\D/g, '');
  if (!v) return '';
  if (v.length <= 5) return v;
  return v.replace(/(\d{5})(\d{0,3})/, '$1-$2');
}

// Máscara dinâmica para telefone (celular e fixo)
export function maskTelefone(valor) {
  const v = valor.replace(/\D/g, '');
  if (!v) return '';
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 6) return v.replace(/(\d{2})(\d+)/, '($1) $2');
  if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Máscara dinâmica para CPF
export function maskCPF(valor) {
  const v = valor.replace(/\D/g, '');
  if (!v) return '';
  if (v.length <= 3) return v;
  if (v.length <= 6) return v.replace(/(\d{3})(\d+)/, '$1.$2');
  if (v.length <= 9) return v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
}
// Função para formatar CNPJ
// Máscara dinâmica para CNPJ
export function maskCNPJ(valor) {
  const v = valor.replace(/\D/g, '');
  if (!v) return '';
  if (v.length <= 2) return v;
  if (v.length <= 5) return v.replace(/(\d{2})(\d+)/, '$1.$2');
  if (v.length <= 8) return v.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (v.length <= 12)
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
}

// Formata CNPJ apenas se completo
export function formatarCNPJ(valor) {
  const apenasNumeros = valor.replace(/\D/g, '');
  if (apenasNumeros.length !== 14) return valor;
  return apenasNumeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}
