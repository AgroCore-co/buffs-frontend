# Buffs Frontend

Sistema de gerenciamento para propriedades rurais e rebanhos bubalinos. Plataforma web desenvolvida com Next.js, React e TailwindCSS.

## Índice

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Build e Deploy](#build-e-deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Componentes](#componentes)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Padrão de Commits](#padrão-de-commits)
- [Testes e Validações](#testes-e-validações)
- [Documentação Adicional](#documentação-adicional)

## Tecnologias

- **Next.js 16** - Framework React com SSR
- **React 19** - Biblioteca UI
- **TailwindCSS 4** - Framework CSS utility-first
- **Axios** - Cliente HTTP
- **Leaflet** - Mapas interativos
- **Recharts** - Gráficos e visualizações
- **Storybook** - Documentação de componentes
- **Jest + Testing Library** - Testes
- **Husky + Commitlint** - Git hooks e validações

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Git

## Instalação

```bash
# Clone o repositório
git clone https://github.com/AgroCore-co/buffs-frontend.git

# Entre no diretório
cd buffs-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Desenvolvimento

```bash
# Servidor de desenvolvimento
npm run dev

# Acessar em http://localhost:3000
```

### Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Servidor de produção
npm run lint             # Verifica erros de ESLint
npm run lint:fix         # Corrige erros de ESLint
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação
npm test                 # Valida lint + formatação
npm run storybook        # Inicia Storybook (porta 6006)
```

## Build e Deploy

```bash
# Criar build de produção
npm run build

# Iniciar servidor de produção
npm run start
```

## Estrutura do Projeto

```
buffs-frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── layout/          # Header, Sidebar
│   │   ├── ui/              # Button, Badge, Table, etc.
│   │   ├── proprietario/    # Componentes de proprietário
│   │   ├── loading/         # Loading indicators
│   │   └── table/           # Tabelas customizadas
│   ├── pages/               # Rotas Next.js
│   │   ├── admin/           # Dashboard admin
│   │   ├── auth/            # Login, acesso negado
│   │   ├── funcionario/     # Dashboard funcionário
│   │   └── proprietario/    # Dashboard proprietário
│   ├── contexts/            # React Context (Auth)
│   ├── hooks/               # Custom hooks
│   ├── services/            # Serviços API
│   ├── lib/                 # Configurações (axios)
│   ├── logger/              # Sistema de logging
│   ├── middleware/          # Next.js middleware
│   ├── constants/           # Constantes e rotas
│   ├── styles/              # Estilos globais
│   ├── stories/             # Storybook stories
│   └── docs/                # Documentação
├── public/                  # Assets estáticos
├── .husky/                  # Git hooks
└── .storybook/              # Config Storybook
```

## Componentes

### UI Components (`src/components/ui`)

#### Button

Botão reutilizável com múltiplas variantes:

```jsx
<Button variant="primary" size="medium">
  Clique aqui
</Button>
```

Variantes: `primary`, `secondary`, `outline`, `success`, `danger`, `info`, `report`

#### Badge

Etiqueta para indicar status:

```jsx
<Badge type="active">Ativo</Badge>
```

Tipos: `active`, `inactive`, `info`

#### Table

Tabela responsiva com colunas customizáveis:

```jsx
<Table columns={columns} data={data} onRowClick={handleClick} />
```

#### Pagination

Componente de paginação:

```jsx
<Pagination currentPage={1} totalPages={10} onPageChange={setPage} />
```

#### MetricCard

Card para exibir métricas:

```jsx
<MetricCard title="Total" value="150" subtitle="Propriedades" icon={<Icon />} />
```

### Layout Components

- **Header** - Cabeçalho com navegação e perfil
- **Sidebar** - Menu lateral com rotas
- **Layout** - Wrapper principal com Header + Sidebar

### Documentação Completa

Veja todos os componentes documentados no Storybook:

```bash
npm run storybook
```

## Sistema de Autenticação

### AuthContext

Gerencia estado de autenticação global:

```jsx
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { user, login, logout } = useAuth();
  // ...
}
```

### Proteção de Rotas

Hook para proteger rotas:

```jsx
import useProtectedRoute from '@/hooks/useProtectedRoute';

function ProtectedPage() {
  useProtectedRoute(['ADMIN', 'PROPRIETARIO']);
  // ...
}
```

### API Client

Cliente HTTP configurado com interceptors:

```javascript
import api from '@/lib/api';

// Requisições autenticadas
const response = await api.get('/propriedades');
```

Funcionalidades:

- Refresh token automático
- Retry em caso de falha
- Tratamento de erros centralizado
- Logout automático em 401

## Padrão de Commits

Este projeto usa **Conventional Commits** com validação automática.

### Formato

```
<tipo>: <descrição>
```

### Tipos Permitidos

- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `refactor` - Refatoração de código
- `docs` - Documentação
- `style` - Formatação
- `test` - Testes
- `perf` - Performance
- `chore` - Manutenção

### Exemplos

```bash
git commit -m "feat: adicionar dashboard de métricas"
git commit -m "fix: corrigir validação do formulário"
git commit -m "docs: atualizar README"
```

### Git Hooks

**Pre-commit**

- Formata código com Prettier
- Verifica erros com ESLint

**Commit-msg**

- Valida padrão de mensagem
- Bloqueia commits fora do padrão

**Pre-push**

- Executa ESLint em todo o projeto
- Verifica formatação com Prettier

Veja mais em: [Guia de Commits](src/docs/COMMIT-PATTERN.md)

## Testes e Validações

### Lint e Formatação

```bash
# Verificar erros
npm run lint

# Corrigir erros automaticamente
npm run lint:fix

# Formatar código
npm run format

# Verificar formatação
npm run format:check
```

### Testes Unitários

```bash
# Rodar testes
npm test
```

Configuração Jest para Next.js com suporte a:

- React Testing Library
- Mocks para leaflet/react-leaflet
- Alias `@/` para imports

## Sistema de Logging

Sistema centralizado para debug e monitoramento:

```javascript
import { logger } from '@/logger';

logger.info('Mensagem', { context: 'data' });
logger.warn('Aviso');
logger.error('Erro', error);
```

Funcionalidades:

- Níveis: DEBUG, INFO, WARN, ERROR
- Performance monitoring
- Error tracking
- Contexto adicional

Veja mais em: [Documentação Logger](src/docs/LOGGER.md)

## Documentação Adicional

- [Padrão de Commits](src/docs/COMMIT-PATTERN.md)
- [Sistema de Logging](src/docs/LOGGER.md)
- [Storybook](src/docs/STORYBOOK.md)

## Ambientes

### Desenvolvimento

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Produção (AWS)

```env
NEXT_PUBLIC_API_URL=http://34.203.109.247:3001
```

## Troubleshooting

### Erro de Line Endings

Se encontrar warnings de LF/CRLF:

- O projeto está configurado com `.gitattributes`
- Prettier usa `endOfLine: auto`
- Git normaliza automaticamente

### Erro de Dependências do Storybook

Storybook pode apresentar conflito com Next.js 16. Instale com:

```bash
npm install --legacy-peer-deps
```

### Erro de Build

Se o build falhar, limpe o cache:

```bash
rm -rf .next
npm run build
```

## Contribuindo

1. Clone o projeto
2. Crie uma branch: `git checkout -b feat/nova-feature`
3. Faça suas alterações
4. Commit seguindo o padrão: `git commit -m "feat: descrição"`
5. Push: `git push origin feat/nova-feature`
6. Abra um Pull Request

## Licença

Projeto privado - AgroCore

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
