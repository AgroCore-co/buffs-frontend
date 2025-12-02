/**
 * Configuração do commitlint para validar padrão: <tipo>: <descrição>
 * Tipos permitidos: feat, fix, refactor, docs, style, test, perf, chore
 * Exemplo válido: feat: adicionar login
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
  rules: {
    // Validação customizada do padrão <tipo>: <descrição>
    'custom-commit-pattern': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'custom-commit-pattern': ({ raw }) => {
          // Padrão: <tipo>: <descrição>
          // Remove quebras de linha para validação
          const message = raw.trim();
          const pattern = /^(feat|fix|refactor|docs|style|test|perf|chore):\s.+/;
          
          const isValid = pattern.test(message);
          
          return [
            isValid,
            isValid
              ? ''
              : `Mensagem de commit deve seguir o padrão: <tipo>: <descrição>
              
Tipos permitidos: feat, fix, refactor, docs, style, test, perf, chore

Exemplos válidos:
  ✓ feat: adicionar login
  ✓ fix: corrigir bug no header
  ✓ refactor: melhorar performance
  
Mensagem recebida: "${raw}"

Regras:
  • Use dois-pontos (:) seguido de espaço
  • Descrição deve ter pelo menos 1 caractere
  • Tipos devem ser em minúsculas`
          ];
        },
      },
    },
  ],
};
