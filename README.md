# Buffs Frontend

Frontend web do Buffs, construído com Next.js (App Router) e TypeScript, com autenticação, i18n e módulos por perfil (proprietário, gerente, funcionário e veterinário).

## Visão geral do projeto

O Buffs Frontend é uma aplicação web modular que consome APIs internas para gerenciar propriedades, rebanho, grupos, equipe e ingestão de dados. O sistema separa as telas por perfil e protege as rotas com base na sessão do usuário.

## Principais tecnologias

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- React Query para cache e sincronização de dados
- Zustand para estado global (auth e contexto de propriedade)
- Axios com interceptors e refresh token
- next-intl para i18n
- React Hook Form + Zod para formulários
- Recharts para gráficos
- Leaflet/React-Leaflet para mapas

## Como rodar localmente

### Pré-requisitos

- Node.js 18+ (recomendado)
- NPM

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Configure o endpoint da API em [.env](.env):

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Execução

```bash
npm run dev
```

Aplicação disponível em http://localhost:3000.

### Build e produção

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Arquitetura e organização de pastas

### App Router e rotas

As rotas vivem em [src/app](src/app). O projeto é multi-idioma e as páginas ficam dentro de [src/app/[locale]](src/app/%5Blocale%5D), com subrotas organizadas por perfil:

- [src/app/[locale]/(buffs)/proprietario](src/app/%5Blocale%5D/(buffs)/proprietario)
- [src/app/[locale]/(buffs)/gerente](src/app/%5Blocale%5D/(buffs)/gerente)
- [src/app/[locale]/(buffs)/funcionario](src/app/%5Blocale%5D/(buffs)/funcionario)
- [src/app/[locale]/(buffs)/veterinario](src/app/%5Blocale%5D/(buffs)/veterinario)

Rotas públicas/estado:

- [src/app/[locale]/auth/login](src/app/%5Blocale%5D/auth/login)
- [src/app/not-authenticated.tsx](src/app/not-authenticated.tsx)
- [src/app/not-authorized.tsx](src/app/not-authorized.tsx)
- [src/app/not-found.tsx](src/app/not-found.tsx)

### Middleware e i18n

- O middleware de idioma está em [src/proxy.ts](src/proxy.ts).
- Configuração de rotas i18n em [src/i18n/routing.ts](src/i18n/routing.ts).
- Carregamento de mensagens em [src/i18n/request.ts](src/i18n/request.ts).
- Mensagens em [src/messages/pt.json](src/messages/pt.json) e [src/messages/en.json](src/messages/en.json).

### Camada de API

- Instância Axios em [src/lib/apiClient.ts](src/lib/apiClient.ts) com:
	- Injeção automática do token Bearer.
	- Refresh token automático em caso de 401.
- Serviços por domínio em [src/services](src/services) (ex.: propriedades, lotes, usuários, dashboard).

### Hooks

Hooks encapsulam o consumo de serviços e o cache do React Query:

- [src/hooks](src/hooks)
- Padrão: `useX` chama `x.service.ts` e expõe `data`, `isLoading`, `mutate`.

### Estado global (Zustand)

- Autenticação em [src/stores/auth.store.ts](src/stores/auth.store.ts)
- Contexto de propriedade em [src/stores/propriedade.store.ts](src/stores/propriedade.store.ts)

### Providers

- [src/providers/AuthProvider.tsx](src/providers/AuthProvider.tsx)
	- Protege rotas por cargo
	- Hidrata o perfil no refresh da página
	- Controla telas de não autenticado e não autorizado
- [src/providers/QueryProvider.tsx](src/providers/QueryProvider.tsx)
	- Configura o QueryClient e cache

### Componentes

- Layout geral em [src/components/layout](src/components/layout)
- Componentes de UI reutilizáveis em [src/components/ui](src/components/ui)
- Módulos específicos do proprietário em [src/components/proprietario](src/components/proprietario)

### Assets e documentação

- Imagens em [public/images](public/images)
- Documentos de apoio em [docs](docs)

## Como o projeto funciona (fluxo de dados)

1. As páginas do App Router chamam hooks em [src/hooks](src/hooks).
2. Os hooks usam serviços em [src/services](src/services).
3. Os serviços consomem a API via [src/lib/apiClient.ts](src/lib/apiClient.ts).
4. O AuthProvider valida sessão e restringe acesso por cargo.
5. O React Query mantém cache e sincronização dos dados.

## Autenticação e sessão

- A sessão é salva em `localStorage` com a chave `@Buffs:session`.
- O token é injetado no header Authorization por [src/lib/apiClient.ts](src/lib/apiClient.ts).
- Em caso de 401, o refresh token é usado para renovar a sessão.
- O AuthProvider redireciona conforme o cargo do usuário.

## Internacionalização

- Prefixo de idioma obrigatório nas rotas: `/pt` e `/en`.
- `next-intl` é responsável por navegar e carregar mensagens.

## Padrões do código

- Componentes com `use client` quando necessário.
- Hooks isolam efeitos e chamadas HTTP.
- Serviços por domínio, facilitando manutenção e testes.
- UI com Tailwind e componentes reutilizáveis.

## Suporte

Para dúvidas ou ajustes, consulte os arquivos de referência em [docs](docs) e os serviços em [src/services](src/services).
