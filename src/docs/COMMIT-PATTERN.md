# Padrão de Commits - Buffs Frontend

Guia rápido do padrão de commits usado no projeto.

## Índice

- [Formato](#formato)
- [Tipos de Commit](#tipos-de-commit)
- [Exemplos](#exemplos)
- [Hooks Automáticos](#hooks-automáticos)

---

## Formato

Todo commit deve seguir este padrão:

```
<tipo>: <descrição>
```

## Tipos de Commit

| Tipo       | Descrição                                          | Exemplo                                                |
| ---------- | -------------------------------------------------- | ------------------------------------------------------ |
| `feat`     | Nova funcionalidade                                | `feat: adicionar página de login`                      |
| `fix`      | Correção de bug                                    | `fix: corrigir validação do formulário`                |
| `refactor` | Refatoração de código (sem alterar funcionalidade) | `refactor: melhorar estrutura do componente Header`    |
| `docs`     | Alterações em documentação                         | `docs: atualizar README com instruções de deploy`      |
| `style`    | Formatação, ponto e vírgula, espaços, etc.         | `style: formatar código com Prettier`                  |
| `test`     | Adição ou correção de testes                       | `test: adicionar testes para AuthService`              |
| `perf`     | Melhorias de performance                           | `perf: otimizar renderização da lista de propriedades` |
| `chore`    | Tarefas de manutenção, configs, deps, etc.         | `chore: atualizar dependências do projeto`             |

---

## Exemplos

```bash
feat: adicionar dashboard de métricas
fix: corrigir erro ao carregar propriedades
refactor: simplificar lógica de autenticação
docs: documentar API de serviços
style: aplicar lint em todos os arquivos
test: criar testes unitários para utils
perf: implementar lazy loading nas rotas
chore: configurar husky e commitlint
```

### Dicas

- Use verbos no infinitivo: "adicionar", "corrigir", "refatorar"
- Seja claro e objetivo
- Commits pequenos e focados

---

## Hooks Automáticos

O projeto usa **Husky** para validar automaticamente:

### Pre-commit

- Formata código com Prettier
- Verifica erros com ESLint

### Commit-msg

- Valida se a mensagem segue o padrão
- **Bloqueia** commits fora do padrão

### Pre-push

- Executa ESLint em todo o projeto
- Verifica formatação com Prettier
- **Bloqueia** push se houver erros

### Problema?

Se o commit foi bloqueado, verifique:

```bash
# Formato correto?
git commit -m "feat: sua descrição"

# Tem erros de lint?
npm run lint:fix

# Formatação ok?
npm run format

# Validações passando?
npm test
```

---

## Comandos Úteis

### Validação e Formatação

```bash
npm run lint              # Verifica erros de ESLint
npm run lint:fix          # Corrige erros de ESLint automaticamente
npm run format            # Formata código com Prettier
npm run format:check      # Verifica formatação sem alterar
npm test                  # Valida lint + formatação (usado no pre-push)
```

### Desenvolvimento

```bash
npm run dev               # Inicia servidor de desenvolvimento
npm run build             # Cria build de produção
npm run start             # Inicia servidor de produção
npm run storybook         # Inicia Storybook
```

### Git Workflow

```bash
# 1. Adicionar arquivos
git add .

# 2. Fazer commit (hook pre-commit formata automaticamente)
git commit -m "feat: sua descrição"

# 3. Push (hook pre-push valida lint e formatação)
git push origin sua-branch
```
