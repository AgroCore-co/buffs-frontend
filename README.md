# BUFFS Frontend 

> **Sistema de Gestão de Bubalinocultura**
> Plataforma web para gerenciamento completo de propriedades de criação de búfalos — rebanho, reprodução, lactação, sanidade, alimentação, indústria e mais.

---

## Índice

- [1. Visão Geral](#1-visão-geral)
- [2. Stack Tecnológico](#2-stack-tecnológico)
- [3. Arquitetura do Projeto](#3-arquitetura-do-projeto)
- [4. Instalação e Execução](#4-instalação-e-execução)
- [5. Variáveis de Ambiente](#5-variáveis-de-ambiente)
- [6. Internacionalização (i18n)](#6-internacionalização-i18n)
- [7. Autenticação e Autorização](#7-autenticação-e-autorização)
- [8. Middleware / Proxy (CSP + Auth Gate)](#8-middleware--proxy-csp--auth-gate)
- [9. Gerenciamento de Estado](#9-gerenciamento-de-estado)
- [10. Mapa Completo de Rotas](#10-mapa-completo-de-rotas)
- [11. Serviços (API Layer)](#11-serviços-api-layer)
- [12. Hooks Customizados](#12-hooks-customizados)
- [13. Componentes](#13-componentes)
- [14. Schemas de Validação](#14-schemas-de-validação)
- [15. Utilitários (lib/)](#15-utilitários-lib)
- [16. Segurança](#16-segurança)
- [17. CI/CD e Deploy](#17-cicd-e-deploy)
- [18. Análise de Melhorias](#18-análise-de-melhorias)

---

## 1. Visão Geral

**BUFFS** é uma plataforma SaaS focada no manejo inteligente de bubalinos (búfalos). O frontend consome uma API REST e oferece funcionalidades completas de:

| Domínio | Funcionalidades |
|---|---|
| **Propriedades** | CRUD, mapa de piquetes (Leaflet), equipe, grupos de manejo, alimentação, data ingestion (ETL Excel) |
| **Rebanho** | Cadastro de búfalos, filtro avançado (raça/sexo/maturidade/status/brinco), inativação/reativação, processamento de categoria ABCB |
| **Reprodução** | Controle de coberturas (IA, IATF, TE, Monta Natural), simulação de acasalamento com análise de consanguinidade (IA), recomendações de fêmeas/machos |
| **Lactação** | Estatísticas de ciclos, fêmeas em lactação, ordenhas, gráficos de produção, predição de produção (IA) |
| **Sanidade** | Registros sanitários, vacinação, frequência de doenças, autocomplete de doenças, migração de dados |
| **Zootecnia** | Pesagem, escore corporal, cor de pelagem, formato de chifre, porte |
| **Medicamentos** | CRUD de medicações com classificação por tipo de tratamento |
| **Genealogia** | Árvore genealógica (até 5 gerações), análise de consanguinidade (IA), machos compatíveis |
| **Indústria** | Coletas de leite, laticínios parceiros |
| **Alertas** | Sistema inteligente com classificação de prioridade por IA (CLÍNICO, SANITÁRIO, REPRODUÇÃO, MANEJO, PRODUÇÃO) |
| **Data Ingestion** | Importação/exportação de planilhas Excel (leite, pesagem, reprodução) |

---

## 2. Stack Tecnológico

| Categoria | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js | 16.2.3 |
| **Runtime** | React | 19.2.4 |
| **Linguagem** | TypeScript | ^5 |
| **Estilização** | TailwindCSS | ^4 |
| **Estado Global** | Zustand | ^5.0.12 |
| **Cache/Server State** | TanStack React Query | ^5.99.0 |
| **HTTP Client** | Axios | ^1.15.0 |
| **Formulários** | React Hook Form + Zod | ^7.72.1 / ^4.3.6 |
| **Gráficos** | Recharts | ^3.8.1 |
| **Mapas** | Leaflet + React Leaflet | ^1.9.4 / ^5.0.0 |
| **Ícones** | Lucide React | ^1.8.0 |
| **Notificações** | Sonner | ^2.0.7 |
| **i18n** | next-intl | ^4.9.1 |
| **Acessibilidade** | focus-trap-react | ^12.0.2 |
| **Deploy** | PM2 + GitHub Actions | — |

---

## 3. Arquitetura do Projeto

```
src/
├── app/                    # Rotas (App Router do Next.js)
│   ├── [locale]/           # Segmento de idioma (pt/en)
│   │   ├── (buffs)/        # Grupo de layout autenticado
│   │   │   ├── proprietario/   # Área do proprietário
│   │   │   ├── gerente/        # Área do gerente
│   │   │   ├── funcionario/    # Área do funcionário
│   │   │   └── veterinario/    # Área do veterinário
│   │   └── auth/           # Área pública (login)
│   ├── not-authenticated.tsx
│   ├── not-authorized.tsx
│   └── not-found.tsx
├── components/             # Componentes React
│   ├── layout/             # Header, Sidebar, LanguageSwitcher
│   ├── proprietario/       # Componentes específicos do proprietário
│   └── ui/                 # Design System (Button, Modal, DataTable, etc.)
├── constants/              # Constantes globais (roles, navegação, storage keys)
├── hooks/                  # Custom hooks (data fetching, mutations)
├── i18n/                   # Configuração de internacionalização
├── lib/                    # Utilitários (API client, toCamelCase)
├── messages/               # Traduções (pt.json, en.json)
├── providers/              # Providers React (Auth, React Query)
├── schemas/                # Schemas de validação Zod
├── services/               # Camada de serviços (chamadas à API)
└── stores/                 # Stores Zustand (auth, propriedade ativa)
```

### Fluxo de Dados

```
Componente → Hook (useX) → Service (xService) → apiClient (Axios) → API REST
     ↑                                                      |
     └────── React Query (cache + refetch) ←────────────────┘
```

- **Componentes** nunca chamam a API diretamente
- **Hooks** encapsulam queries/mutations do React Query
- **Services** definem os DTOs e chamadas HTTP
- **apiClient** injeta o token JWT automaticamente e gerencia refresh token

---

## 4. Instalação e Execução

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd buffs-frontend

# Instalar dependências
npm install --legacy-peer-deps

# Criar arquivo .env
cp .env.example .env
# (preencher NEXT_PUBLIC_API_URL)

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build
npm start

# Verificar tipos
npm run typecheck

# Lint
npm run lint
```

---

## 5. Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API REST | `https://api.buffs.com.br` |

---

## 6. Internacionalização (i18n)

O sistema suporta **2 idiomas**:

| Locale | Idioma | Padrão |
|---|---|---|
| `pt` | Português | ✅ |
| `en` | Inglês | — |

### Configuração

- **Routing**: `src/i18n/routing.ts` — Define locales e locale padrão
- **Request**: `src/i18n/request.ts` — Carregamento de mensagens por request
- **Mensagens**: `src/messages/pt.json` e `src/messages/en.json`
- **Componente**: `src/components/layout/LanguageSwitcher.tsx` — Troca de idioma na UI

### Funcionamento

- Todas as URLs possuem prefixo de locale: `/{locale}/...` (ex: `/pt/proprietario`)
- O `next-intl` injeta automaticamente o locale via middleware
- Componentes usam `useTranslations('Namespace')` para acessar traduções
- Links usam `Link` de `@/i18n/routing` que injeta o locale automaticamente

---

## 7. Autenticação e Autorização

### 7.1 Fluxo de Autenticação

```
1. Usuário preenche email/senha na tela de login
2. useAuth().login() → authService.signin() → POST /auth/signin
3. API retorna: { access_token, refresh_token, expires_at, user }
4. Sessão salva em localStorage (@Buffs:session) + cookie (buffs_auth_token)
5. Zustand (auth.store) atualizado com sessão
6. AuthProvider detecta isAuthenticated=true, busca GET /usuarios/me
7. Perfil salvo no Zustand → redirecionamento para rota do cargo
```

### 7.2 Cargos (Roles)

| Cargo | Rota Base | Descrição |
|---|---|---|
| `PROPRIETARIO` | `/proprietario` | Acesso completo a todas as funcionalidades |
| `GERENTE` | `/gerente` | Gestão operacional (página placeholder) |
| `FUNCIONARIO` | `/funcionario` | Operações do dia-a-dia (página placeholder) |
| `VETERINARIO` | `/veterinario` | Saúde e sanidade animal (página placeholder) |

### 7.3 Proteção de Rotas

| Camada | Descrição |
|---|---|
| **Middleware (proxy.ts)** | Verifica cookie `buffs_auth_token`; se ausente, redireciona para `/auth/login` |
| **AuthProvider** | Valida token no client-side; busca perfil via `/usuarios/me` no F5; verifica se o path corresponde ao cargo do usuário |
| **Telas de Erro** | `not-authenticated.tsx` e `not-authorized.tsx` exibidas conforme o caso |

### 7.4 Refresh Token

O `apiClient` implementa um mecanismo de refresh token com **fila de requisições**:

1. Quando uma requisição retorna 401, o token é renovado via `POST /auth/refresh`
2. Requisições simultâneas ficam enfileiradas (`failedQueue`) e são re-executadas após a renovação
3. Se o refresh falhar, a sessão é limpa e o usuário é redirecionado para login

### 7.5 Fluxo de Logout

```
1. queryClient.cancelQueries() — cancela todas as queries em voo
2. authService.signout() — POST /auth/signout (invalida sessão no servidor)
3. Limpa localStorage e cookie
4. clearAuth() no Zustand
5. queryClient.clear() — limpa cache
6. router.replace('/auth/login')
```

---

## 8. Middleware / Proxy (CSP + Auth Gate)

**Arquivo**: `src/proxy.ts`

O middleware é a **fonte única de verdade** para o Content-Security-Policy:

| Funcionalidade | Descrição |
|---|---|
| **CSP com nonce** | Cada request gera um `crypto.randomUUID()` como nonce; scripts inline só executam com esse nonce |
| **Auth Gate** | Rotas privadas verificam o cookie `buffs_auth_token`; sem cookie → redirect para login com `callbackUrl` |
| **Intl Middleware** | `createMiddleware(routing)` do next-intl aplicado em todas as respostas |

### Rotas Públicas

```
/
/auth/login
/auth/register
/auth/forgot-password
```

### Headers de Segurança (next.config.ts)

| Header | Valor |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

---

## 9. Gerenciamento de Estado

### 9.1 auth.store.ts (Zustand)

| Estado | Tipo | Descrição |
|---|---|---|
| `session` | `AuthSessionResponse \| null` | Tokens JWT + dados do usuário |
| `profile` | `Usuario \| null` | Perfil completo (`/usuarios/me`) |
| `isAuthenticated` | `boolean` | Derivado de `!!session?.access_token` |

| Ação | Descrição |
|---|---|
| `setSession(session)` | Salva sessão após login |
| `setProfile(profile)` | Salva perfil após busca |
| `clearAuth()` | Limpa tudo (logout); também remove `ACTIVE_PROPRIEDADE` do localStorage |

### 9.2 propriedade.store.ts (Zustand)

| Estado | Tipo | Descrição |
|---|---|---|
| `activeId` | `string \| null` | UUID da propriedade ativa |
| `activePropriedade` | `Propriedade \| null` | Dados completos da propriedade ativa |

| Ação | Descrição |
|---|---|
| `setActivePropriedade(prop)` | Seleciona propriedade + persiste no localStorage |
| `clearActivePropriedade()` | Limpa seleção (logout) |

> **Persistência**: Ambos os stores sobrevivem a F5 via `localStorage` com chaves `@Buffs:session` e `@Buffs:activePropriedade`.

---

## 10. Mapa Completo de Rotas

### 10.1 Rotas Públicas

| Rota | Arquivo | Descrição |
|---|---|---|
| `/{locale}` | `src/app/[locale]/page.tsx` | Landing page / redirect |
| `/{locale}/auth/login` | `src/app/[locale]/auth/login/page.tsx` | Tela de login |

### 10.2 Rotas Autenticadas — Proprietário

Todas sob o layout `src/app/[locale]/(buffs)/layout.tsx` que inclui `Header` + `Sidebar`.

| Rota | Arquivo | Descrição |
|---|---|---|
| `/{locale}/proprietario` | `(buffs)/proprietario/page.tsx` | **Dashboard principal** — KPIs do rebanho, gráficos de produção de leite, top búfalas, resumo reprodutivo |
| `/{locale}/proprietario/propriedades` | `(buffs)/proprietario/propriedades/page.tsx` | **Listagem de propriedades** — Cards com dados de cada fazenda, criar/editar/excluir propriedades |
| `/{locale}/proprietario/propriedade/[id]` | `(buffs)/proprietario/propriedade/[id]/page.tsx` | **Detalhe da propriedade** — Abas: Visão Geral, Grupos, Alimentação, Equipe, Data Ingestion, Mapa de Piquetes |
| `/{locale}/proprietario/rebanho` | `(buffs)/proprietario/rebanho/page.tsx` | **Listagem do rebanho** — Tabela paginada de búfalos com filtros avançados (raça, sexo, maturidade, status, brinco), gráficos de distribuição |
| `/{locale}/proprietario/rebanho/[id]` | `(buffs)/proprietario/rebanho/[id]/page.tsx` | **Detalhe do búfalo** — Abas: Visão Geral, Desempenho, Produção, Reprodução, Sanitário, Vacinação, Zootécnico, Genealogia, Movimentações, Eventos |
| `/{locale}/proprietario/medicamentos` | `(buffs)/proprietario/medicamentos/page.tsx` | **Medicamentos** — CRUD de medicações, filtro por tipo de tratamento, soft delete/restore |
| `/{locale}/proprietario/lactacao` | `(buffs)/proprietario/lactacao/page.tsx` | **Lactação** — Estatísticas de ciclos, fêmeas em lactação, alertas de produção, gráficos mensais |
| `/{locale}/proprietario/controle-reproducao` | `(buffs)/proprietario/controle-reproducao/page.tsx` | **Controle de Reprodução** — Listagem de coberturas, registrar nova cobertura, detalhes, filtro por status |
| `/{locale}/proprietario/material-genetico` | `(buffs)/proprietario/material-genetico/page.tsx` | **Material Genético** — Sêmen, embriões, óvulos. CRUD com paginação, soft delete/restore |
| `/{locale}/proprietario/simulacao` | `(buffs)/proprietario/simulacao/page.tsx` | **Simulação de Acasalamento** — Recomendações de fêmeas/machos por score, simulação com análise de consanguinidade e predição de produção (IA) |
| `/{locale}/proprietario/coleta` | `(buffs)/proprietario/coleta/page.tsx` | **Coletas de Leite** — Registro de retiradas, vínculo com laticínio, resultado de testes |
| `/{locale}/proprietario/industria` | `(buffs)/proprietario/industria/page.tsx` | **Indústria** — CRUD de laticínios parceiros (nome, representante, contato, observação) |

### 10.3 Rotas Autenticadas — Outros Cargos

| Rota | Arquivo | Status |
|---|---|---|
| `/{locale}/gerente` | `(buffs)/gerente/page.tsx` | 🟡 Placeholder |
| `/{locale}/funcionario` | `(buffs)/funcionario/page.tsx` | 🟡 Placeholder |
| `/{locale}/veterinario` | `(buffs)/veterinario/page.tsx` | 🟡 Placeholder |

### 10.4 Rotas de Erro/Estado

| Arquivo | Descrição |
|---|---|
| `src/app/not-authenticated.tsx` | Exibido quando o usuário tenta acessar rota protegida sem estar autenticado |
| `src/app/not-authorized.tsx` | Exibido quando o cargo do usuário não tem permissão para acessar a rota |
| `src/app/not-found.tsx` | Página 404 global |
| `src/app/[locale]/(buffs)/error.tsx` | Error boundary do grupo (buffs) |
| `src/app/[locale]/(buffs)/loading.tsx` | Loading state do grupo (buffs) |

---

## 11. Serviços (API Layer)

Todos os serviços estão em `src/services/` e utilizam o `apiClient` (Axios) com injeção automática de token JWT.

### 11.1 auth.service.ts — Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| `signupProprietario(data)` | `POST /auth/signup-proprietario` | Cadastra proprietário + conta principal |
| `signupFuncionario(data)` | `POST /auth/signup-funcionario` | Cadastra funcionário (requer PROPRIETARIO/GERENTE) |
| `signin(data)` | `POST /auth/signin` | Login → retorna access_token + refresh_token |
| `refresh(token)` | `POST /auth/refresh` | Renova access_token |
| `signout()` | `POST /auth/signout` | Invalida sessão + limpa localStorage/cookie |
| `setSession(data)` | — (local) | Persiste sessão no localStorage + cookie |
| `getSession()` | — (local) | Recupera sessão do localStorage |

### 11.2 usuarios.service.ts — Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| `getMe()` | `GET /usuarios/me` | Perfil do usuário autenticado |
| `getAll()` | `GET /usuarios` | Lista todos os usuários |
| `getFuncionarios()` | `GET /usuarios/funcionarios` | Lista funcionários |
| `getFuncionariosByPropriedade(id)` | `GET /usuarios/funcionarios/propriedade/{id}` | Funcionários de uma propriedade |
| `getById(id)` | `GET /usuarios/{id}` | Busca usuário por ID |
| `update(id, data)` | `PATCH /usuarios/{id}` | Atualiza nome, telefone, endereço |
| `updateCargo(id, data)` | `PATCH /usuarios/{id}/cargo` | Altera cargo (exceto PROPRIETARIO) |
| `delete(id)` | `DELETE /usuarios/{id}` | Remove usuário |
| `desvincularFuncionarioPropriedade(idUsuario, idProp)` | `DELETE /usuarios/funcionarios/{id}/propriedade/{id}` | Desvincula funcionário da propriedade |

### 11.3 propriedades.service.ts — Propriedades

| Método | Endpoint | Descrição |
|---|---|---|
| `getAll()` | `GET /propriedades` | Lista propriedades do usuário |
| `getById(id)` | `GET /propriedades/{id}` | Busca propriedade por ID |
| `create(data)` | `POST /propriedades` | Cria propriedade (só PROPRIETARIO) |
| `update(id, data)` | `PATCH /propriedades/{id}` | Atualiza nome, p_abcb, tipoManejo |
| `delete(id)` | `DELETE /propriedades/{id}` | Soft delete da propriedade |

**Campos da Propriedade**: nome, cnpj, idEndereco, p_abcb (participante ABCB), tipoManejo (P=Pecuária, E=Extensivo, I=Intensivo)

### 11.4 bufalos.service.ts — Búfalos (Rebanho)

#### CRUD Básico

| Método | Endpoint | Descrição |
|---|---|---|
| `create(data)` | `POST /bufalos` | Cadastra búfalo |
| `getAll(page, limit)` | `GET /bufalos` | Lista paginada |
| `getById(id)` | `GET /bufalos/{id}` | Busca por ID |
| `update(id, data)` | `PATCH /bufalos/{id}` | Atualiza parcialmente |
| `delete(id)` | `DELETE /bufalos/{id}` | Soft delete |
| `restore(id)` | `POST /bufalos/{id}/restore` | Restaura |
| `getAllDeleted()` | `GET /bufalos/deleted/all` | Lista deletados |

#### Buscas Específicas

| Método | Endpoint |
|---|---|
| `getByMicrochip(chip)` | `GET /bufalos/microchip/{chip}` |
| `getByPropriedade(id, page, limit)` | `GET /bufalos/propriedade/{id}` |
| `getByGrupo(id, page, limit)` | `GET /bufalos/grupo/{id}` |
| `getByCategoria(cat)` | `GET /bufalos/categoria/{cat}` |

#### Filtros Avançados

| Método | Endpoint |
|---|---|
| `filterByRaca(raca, prop, page, limit)` | `GET /bufalos/filtro/raca/{raca}/propriedade/{prop}` |
| `filterByRacaEBrinco(...)` | `GET /bufalos/filtro/raca/{raca}/propriedade/{prop}/brinco/{brinco}` |
| `filterByRacaEStatus(...)` | `GET /bufalos/filtro/raca/{raca}/propriedade/{prop}/status/{status}` |
| `filterBySexo(sexo, prop, page, limit)` | `GET /bufalos/filtro/sexo/{sexo}/propriedade/{prop}` |
| `filterBySexoEBrinco(...)` | `GET /bufalos/filtro/sexo/{sexo}/propriedade/{prop}/brinco/{brinco}` |
| `filterBySexoEStatus(...)` | `GET /bufalos/filtro/sexo/{sexo}/propriedade/{prop}/status/{status}` |
| `filterByMaturidade(nivel, prop, page, limit)` | `GET /bufalos/filtro/maturidade/{nivel}/propriedade/{prop}` |
| `filterByMaturidadeEBrinco(...)` | `GET /bufalos/filtro/maturidade/{nivel}/propriedade/{prop}/brinco/{brinco}` |
| `filterByMaturidadeEStatus(...)` | `GET /bufalos/filtro/maturidade/{nivel}/propriedade/{prop}/status/{status}` |
| `filterByStatus(status, prop, page, limit)` | `GET /bufalos/filtro/status/{status}/propriedade/{prop}` |
| `filterByStatusEBrinco(...)` | `GET /bufalos/filtro/status/{status}/propriedade/{prop}/brinco/{brinco}` |
| `filterAvancado(prop, params)` | `GET /bufalos/filtro/propriedade/{prop}/avancado` |

#### Gestão de Grupo e Ciclo de Vida

| Método | Endpoint | Descrição |
|---|---|---|
| `moverGrupo(data)` | `PATCH /bufalos/grupo/mover` | Move búfalos entre grupos |
| `inativar(id, data)` | `POST /bufalos/{id}/inativar` | Inativa com data/motivo de baixa |
| `reativar(id)` | `POST /bufalos/{id}/reativar` | Reativa búfalo |
| `processarCategoria(id)` | `POST /bufalos/processar-categoria/{id}` | Calcula categoria ABCB individual |
| `processarCategoriaPropriedade(id)` | `POST /bufalos/processar-categoria/propriedade/{id}` | Calcula categoria ABCB de toda a propriedade |

**Categorias ABCB**: PO (Puro de Origem), PC (Puro por Cruza), PA (Puro por Avô), CCG (Controle de Cruzamento Genético), SRD (Sem Raça Definida)

**Níveis de Maturidade**: B (Bezerro), N (Novilha), V (Vaca), T (Touro)

### 11.5 grupos.service.ts — Grupos de Manejo

| Método | Endpoint | Descrição |
|---|---|---|
| `getAll()` | `GET /grupos` | Lista todos os grupos |
| `getByPropriedade(id, page, limit)` | `GET /grupos/propriedade/{id}` | Grupos da propriedade (paginado) |
| `getById(id)` | `GET /grupos/{id}` | Busca grupo |
| `create(data)` | `POST /grupos` | Cria grupo (nome, cor, propriedade) |
| `update(id, data)` | `PATCH /grupos/{id}` | Atualiza grupo |
| `delete(id)` | `DELETE /grupos/{id}` | Soft delete |
| `restore(id)` | `POST /grupos/{id}/restore` | Restaura |
| `getAllDeleted()` | `GET /grupos/deleted/all` | Lista deletados |

### 11.6 lotes.service.ts — Lotes / Piquetes

| Método | Endpoint | Descrição |
|---|---|---|
| `getByPropriedade(id)` | `GET /lotes/propriedade/{id}` | Lista lotes com geometria GeoJSON |
| `getById(id)` | `GET /lotes/{id}` | Busca lote |
| `create(data)` | `POST /lotes` | Cria lote (nome, tipo, capacidade, área, geoJSON) |
| `update(id, data)` | `PATCH /lotes/{id}` | Atualiza lote |
| `delete(id)` | `DELETE /lotes/{id}` | Remove lote |

### 11.7 mov-lote.service.ts — Movimentação de Lotes

| Método | Endpoint | Descrição |
|---|---|---|
| `create(data)` | `POST /mov-lote` | Registra movimentação (entrada/saída de lote) |
| `getAll(page, limit)` | `GET /mov-lote` | Lista todas as movimentações |
| `getByPropriedade(id, page, limit)` | `GET /mov-lote/propriedade/{id}` | Por propriedade (paginado) |
| `getById(id)` | `GET /mov-lote/{id}` | Busca movimentação |
| `update(id, data)` | `PATCH /mov-lote/{id}` | Atualiza movimentação |
| `delete(id)` | `DELETE /mov-lote/{id}` | Remove movimentação |
| `getHistoricoByGrupo(idGrupo)` | `GET /mov-lote/historico/grupo/{id}` | Histórico completo do grupo (dias de permanência) |
| `getStatusByGrupo(idGrupo)` | `GET /mov-lote/status/grupo/{id}` | Localização atual do grupo |

### 11.8 reproducao.service.ts — Reprodução (Coberturas)

| Método | Endpoint | Descrição |
|---|---|---|
| `getByPropriedade(id, params)` | `GET /cobertura/propriedade/{id}` | Lista coberturas (paginado) |
| `getById(id)` | `GET /cobertura/{id}` | Busca cobertura |
| `create(data)` | `POST /cobertura` | Registra cobertura (IA/IATF/TE/Monta Natural) |
| `update(id, data)` | `PATCH /cobertura/{id}` | Atualiza cobertura |
| `delete(id)` | `DELETE /cobertura/{id}` | Soft delete |
| `restore(id)` | `POST /cobertura/{id}/restore` | Restaura |
| `getResumoByBufalo(id, params)` | `GET /reproducao/bufalo/{id}/resumo` | Resumo reprodutivo (discriminado por sexo) |

**Tipos de Inseminação**: IA, IATF, TE, Monta Natural
**Status**: Em andamento, Confirmada, Falha, Concluída

### 11.9 cobertura.service.ts — Recomendações e Simulação (IA)

| Método | Endpoint | Descrição |
|---|---|---|
| `getRecomendacoesFemeas(id)` | `GET /cobertura/recomendacoes/femeas/{id}` | Fêmeas recomendadas com score |
| `getRecomendacoesMachos(id)` | `GET /cobertura/recomendacoes/machos/{id}` | Machos recomendados com score |
| `simularAcasalamento(idMacho, idFemea)` | `POST /reproducao/simulacao` | Simula acasalamento: consanguinidade, risco, predição de produção |

### 11.10 genealogia.service.ts — Genealogia (IA)

| Método | Endpoint | Descrição |
|---|---|---|
| `getArvore(id, geracoes)` | `GET /reproducao/genealogia/{id}` | Árvore genealógica (até 5 gerações) |
| `getAnalise(id)` | `GET /reproducao/genealogia/{id}/analise` | Análise de consanguinidade (IA): coeficiente, risco genético, ancestrais, descendentes |
| `getMachosCompativeis(femeaId, max)` | `GET /reproducao/genealogia/machos-compativeis/{id}` | Machos compatíveis com score e risco |

### 11.11 lactacao.service.ts — Lactação

| Método | Endpoint | Descrição |
|---|---|---|
| `getEstatisticas(id)` | `GET /lactacao/propriedade/{id}/estatisticas` | Estatísticas: total ciclos, ativos, secos, média dias, próximos secagem, atrasados |
| `getFemeasEmLactacao(id)` | `GET /ordenhas/femeas/em-lactacao/{id}` | Fêmeas com ciclo ativo (disponíveis para ordenha) |

### 11.12 ordenhas.service.ts — Ordenhas

| Método | Endpoint | Descrição |
|---|---|---|
| `create(data)` | `POST /ordenhas` | Registra ordenha individual |
| `getByBufala(id, params)` | `GET /ordenhas/bufala/{id}` | Ordenhas da búfala (paginado) |
| `getByCiclo(id, params)` | `GET /ordenhas/ciclo/{id}` | Ordenhas do ciclo de lactação |
| `getById(id)` | `GET /ordenhas/{id}` | Busca ordenha |
| `update(id, data)` | `PATCH /ordenhas/{id}` | Atualiza ordenha |
| `delete(id)` | `DELETE /ordenhas/{id}` | Soft delete |
| `restore(id)` | `POST /ordenhas/{id}/restore` | Restaura |
| `getResumoProducao(id)` | `GET /ordenhas/bufala/{id}/resumo-producao` | Resumo: ciclo atual, comparativo, gráfico 30 dias |

**Períodos**: M (Manhã), T (Tarde), N (Noite)

### 11.13 predicao-producao.service.ts — Predição de Produção (IA)

| Método | Endpoint | Descrição |
|---|---|---|
| `predizer(idFemea)` | `POST /producao/predicao` | Prediz produção de leite para próximo ciclo (features ML) |

**Classificações**: MUITO_BAIXA, BAIXA, MÉDIA, ALTA, MUITO_ALTA

### 11.14 coleta.service.ts — Coletas de Leite

| Método | Endpoint | Descrição |
|---|---|---|
| `getByPropriedade(id, page, limit)` | `GET /retiradas/propriedade/{id}` | Lista coletas (paginado) |
| `getById(id)` | `GET /retiradas/{id}` | Busca coleta |

### 11.15 coleta.service.ts (laticinioService) — Laticínios / Indústria

| Método | Endpoint | Descrição |
|---|---|---|
| `getByPropriedade(id)` | `GET /laticinios/propriedade/{id}` | Lista laticínios da propriedade |
| `getById(id)` | `GET /laticinios/{id}` | Busca laticínio |
| `create(data)` | `POST /laticinios` | Cria laticínio |
| `update(id, data)` | `PATCH /laticinios/{id}` | Atualiza laticínio |
| `delete(id)` | `DELETE /laticinios/{id}` | Remove laticínio |

### 11.16 medicamentos.service.ts — Medicamentos

| Método | Endpoint | Descrição |
|---|---|---|
| `getAll()` | `GET /medicamentos` | Lista todas as medicações |
| `getByPropriedade(id)` | `GET /medicamentos/propriedade/{id}` | Por propriedade |
| `getById(id)` | `GET /medicamentos/{id}` | Busca medicação |
| `create(data)` | `POST /medicamentos` | Cria medicação |
| `update(id, data)` | `PATCH /medicamentos/{id}` | Atualiza medicação |
| `delete(id)` | `DELETE /medicamentos/{id}` | Soft delete |
| `restore(id)` | `POST /medicamentos/{id}/restore` | Restaura |
| `getAllDeleted()` | `GET /medicamentos/deleted/all` | Lista deletados |

**Tipos de Tratamento**: VACINACAO, VERMIFUGACAO, ANTIBIOTICO, SUPLEMENTACAO, HORMONAL, OUTRO

### 11.17 dados-sanitarios.service.ts — Dados Sanitários

| Método | Endpoint | Descrição |
|---|---|---|
| `create(data)` | `POST /dados-sanitarios` | Cria registro sanitário (doença auto-normalizada) |
| `getAll(params)` | `GET /dados-sanitarios` | Lista geral (paginado) |
| `getSugestoesDoencas(termo, limit)` | `GET /dados-sanitarios/doencas/sugestoes` | Autocomplete de doenças |
| `getByBufalo(id, params)` | `GET /dados-sanitarios/bufalo/{id}` | Por búfalo (paginado) |
| `getByPropriedade(id, params)` | `GET /dados-sanitarios/propriedade/{id}` | Por propriedade (paginado) |
| `getFrequenciaDoencas(id, params)` | `GET /dados-sanitarios/propriedade/{id}/frequencia-doencas` | Frequência de doenças com agrupamento por similaridade |
| `getById(id)` | `GET /dados-sanitarios/{id}` | Busca registro |
| `update(id, data)` | `PATCH /dados-sanitarios/{id}` | Atualiza registro |
| `delete(id)` | `DELETE /dados-sanitarios/{id}` | Soft delete |
| `migrarDoencas()` | `POST /dados-sanitarios/migrar-doencas` | [ADMIN] Normaliza todas as doenças existentes |
| `restore(id)` | `POST /dados-sanitarios/{id}/restore` | Restaura registro |
| `getAllIncludingDeleted()` | `GET /dados-sanitarios/deleted/all` | Lista com deletados |

### 11.18 vacinacao.service.ts — Vacinação

| Método | Endpoint | Descrição |
|---|---|---|
| `create(idBufalo, data)` | `POST /vacinacao/bufalo/{id}` | Registra vacinação |
| `getByBufalo(id, params)` | `GET /vacinacao/bufalo/{id}` | Histórico do búfalo (paginado) |
| `getVacinasByBufalo(id, params)` | `GET /vacinacao/bufalo/{id}/vacinas` | Apenas vacinas (sem tratamentos) |
| `getById(id)` | `GET /vacinacao/{id}` | Busca registro |
| `update(id, data)` | `PATCH /vacinacao/{id}` | Atualiza vacinação |
| `delete(id)` | `DELETE /vacinacao/{id}` | Soft delete |
| `restore(id)` | `POST /vacinacao/{id}/restore` | Restaura |
| `getAllIncludingDeleted()` | `GET /vacinacao/deleted/all` | Lista com deletados |

### 11.19 dados-zootecnicos.service.ts — Dados Zootécnicos

| Método | Endpoint | Descrição |
|---|---|---|
| `create(idBufalo, data)` | `POST /dados-zootecnicos/bufalo/{id}` | Cria registro (peso, condição corporal, etc.) |
| `getByBufalo(id, params)` | `GET /dados-zootecnicos/bufalo/{id}` | Por búfalo (paginado) |
| `getByPropriedade(id, params)` | `GET /dados-zootecnicos/propriedade/{id}` | Por propriedade (paginado) |
| `getById(id)` | `GET /dados-zootecnicos/{id}` | Busca registro |
| `update(id, data)` | `PATCH /dados-zootecnicos/{id}` | Atualiza registro |
| `delete(id)` | `DELETE /dados-zootecnicos/{id}` | Soft delete |
| `restore(id)` | `POST /dados-zootecnicos/{id}/restore` | Restaura |
| `getAllIncludingDeleted()` | `GET /dados-zootecnicos/deleted/all` | Lista com deletados |

### 11.20 alimentacao.service.ts — Alimentação

#### Definições de Alimentação (Tipos de Alimento)

| Método | Endpoint | Descrição |
|---|---|---|
| `getByPropriedade(id, page, limit)` | `GET /alimentacoes-def/propriedade/{id}` | Lista definições (paginado) |
| `getById(id)` | `GET /alimentacoes-def/{id}` | Busca definição |
| `create(data)` | `POST /alimentacoes-def` | Cria tipo de alimentação |
| `update(id, data)` | `PATCH /alimentacoes-def/{id}` | Atualiza tipo |
| `delete(id)` | `DELETE /alimentacoes-def/{id}` | Remove tipo |

#### Registros de Alimentação (Operacional)

| Método | Endpoint | Descrição |
|---|---|---|
| `getByPropriedade(id, page, limit)` | `GET /alimentacao/registros/propriedade/{id}` | Lista registros (paginado) |
| `getById(id)` | `GET /alimentacao/registros/{id}` | Busca registro |
| `create(data)` | `POST /alimentacao/registros` | Cria registro (grupo, tipo alimento, quantidade, frequência) |
| `update(id, data)` | `PATCH /alimentacao/registros/{id}` | Atualiza registro |
| `delete(id)` | `DELETE /alimentacao/registros/{id}` | Remove registro |

### 11.21 alertas.service.ts — Alertas Inteligentes

| Método | Endpoint | Descrição |
|---|---|---|
| `create(data)` | `POST /alertas` | Cria alerta (prioridade pode ser classificada por IA) |
| `getAll(params)` | `GET /alertas` | Lista com filtros (tipo, prioridade, antecedência) |
| `getByPropriedade(id, params)` | `GET /alertas/propriedade/{id}` | Por propriedade com filtros |
| `getById(id)` | `GET /alertas/{id}` | Busca alerta |
| `delete(id)` | `DELETE /alertas/{id}` | Remove permanentemente |
| `marcarVisto(id, status)` | `PATCH /alertas/{id}/visto` | Marca como visto/não visto |
| `verificar(id, nichos?)` | `POST /alertas/verificar/{id}` | Verificação manual de alertas para propriedade |

**Nichos**: CLINICO, SANITARIO, REPRODUCAO, MANEJO, PRODUCAO
**Prioridades**: BAIXA, MEDIA, ALTA

### 11.22 dataIngestion.service.ts — Data Ingestion (ETL)

| Método | Endpoint | Descrição |
|---|---|---|
| `importLeite(propId, file)` | `POST /propriedades/{id}/data-ingestion/leite` | Importa planilha de leite (.xlsx) |
| `exportLeite(propId, filters?)` | `GET /propriedades/{id}/data-ingestion/leite/export` | Exporta planilha de leite |
| `importPesagem(propId, file)` | `POST /propriedades/{id}/data-ingestion/pesagem` | Importa planilha de pesagem |
| `exportPesagem(propId, filters?)` | `GET /propriedades/{id}/data-ingestion/pesagem/export` | Exporta planilha de pesagem |
| `importReproducao(propId, file)` | `POST /propriedades/{id}/data-ingestion/reproducao` | Importa planilha de reprodução |
| `exportReproducao(propId, filters?)` | `GET /propriedades/{id}/data-ingestion/reproducao/export` | Exporta planilha de reprodução |
| `getJobStatus(jobId)` | `GET /data-ingestion/jobs/{jobId}` | Status de processamento assíncrono |

### 11.23 enderecos.service.ts — Endereços

| Método | Endpoint | Descrição |
|---|---|---|
| `getAll()` | `GET /enderecos` | Lista todos |
| `getById(id)` | `GET /enderecos/{id}` | Busca endereço |
| `create(data)` | `POST /enderecos` | Cria endereço |
| `update(id, data)` | `PATCH /enderecos/{id}` | Atualiza endereço |
| `delete(id)` | `DELETE /enderecos/{id}` | Remove endereço |

### 11.24 dashboard.service.ts — Dashboards

| Método | Endpoint | Descrição |
|---|---|---|
| `getGeral(id)` | `GET /dashboard/{id}` | KPIs: machos/fêmeas ativos, maturidade, raças, lotes, usuários |
| `getLactacao(id, ano?)` | `GET /dashboard/lactacao/{id}` | Ciclos de lactação com classificação (Ótima/Boa/Mediana/Ruim) |
| `getProducaoMensal(id, ano?)` | `GET /dashboard/producao-mensal/{id}` | Produção mensal com série histórica e variação |
| `getReproducao(id)` | `GET /dashboard/reproducao/{id}` | Resumo: em andamento, confirmadas, falhas |

---

## 12. Hooks Customizados

Todos em `src/hooks/`. Encapsulam queries e mutations do React Query.

| Hook | Serviço | Funcionalidades |
|---|---|---|
| `useAuth` | auth.service | login, logout, signupProprietario, signupFuncionario, estados de loading |
| `useAlertas` | alertas.service | CRUD alertas, marcar visto, verificar, filtros por propriedade/nicho |
| `useAlimentacao` | alimentacao.service | CRUD definições + registros de alimentação |
| `useBufalos` | bufalos.service | CRUD, filtros avançados, mover grupo, inativar/reativar, processar categoria |
| `useCobertura` | cobertura.service | Recomendações fêmeas/machos, simulação de acasalamento |
| `useColeta` | coleta.service | Listagem de coletas por propriedade |
| `useDadosSanitarios` | dados-sanitarios.service | CRUD sanitário, frequência de doenças, sugestões de doenças |
| `useDadosZootecnicos` | dados-zootecnicos.service | CRUD dados zootécnicos (peso, condição corporal) |
| `useDashboard` | dashboard.service | Queries de dashboard (geral, lactação, produção, reprodução) |
| `useDataIngestion` | dataIngestion.service | Import/export planilhas, status de jobs |
| `useEnderecos` | enderecos.service | CRUD endereços |
| `useGenealogia` | genealogia.service | Árvore genealógica, análise de consanguinidade, machos compatíveis |
| `useGrupos` | grupos.service | CRUD grupos de manejo |
| `useLactacao` | lactacao.service | Estatísticas de lactação, fêmeas em lactação |
| `useLotes` | lotes.service | CRUD lotes/piquetes |
| `useMaterialGenetico` | material-genetico.service | CRUD material genético |
| `useMedicamentos` | medicamentos.service | CRUD medicamentos |
| `useMovLote` | mov-lote.service | CRUD movimentações, histórico e status de grupo |
| `useOrdenhas` | ordenhas.service | CRUD ordenhas, resumo de produção |
| `usePredicaoProducao` | predicao-producao.service | Predição de produção (IA) |
| `usePropriedades` | propriedades.service | CRUD propriedades |
| `useReproducao` | reproducao.service | CRUD coberturas, resumo reprodutivo por animal |
| `useUsuarios` | usuarios.service | CRUD usuários, funcionários |
| `useVacinacao` | vacinacao.service | CRUD vacinações |

---

## 13. Componentes

### 13.1 Design System (`components/ui/`)

| Componente | Descrição |
|---|---|
| `Badge` | Badge com variantes de cor |
| `Button` | Botão com variantes, loading state |
| `ChartSkeleton` | Skeleton para carregamento de gráficos |
| `Checkbox` | Checkbox estilizado |
| `Container` | Container responsivo com padding |
| `DataTable` | Tabela de dados genérica com ordenação |
| `FilterBar` | Barra de filtros reutilizável |
| `Input` | Input estilizado com label e erro |
| `Logo` | Logo da aplicação |
| `MetricCard` | Card de métrica (KPI) |
| `Modal` | Modal acessível com focus-trap |
| `Pagination` | Componente de paginação |
| `Select` | Select estilizado |
| `Stepper` | Stepper para fluxos multi-etapa |
| `TabNav` | Navegação por abas |

### 13.2 Layout (`components/layout/`)

| Componente | Descrição |
|---|---|
| `Header` | Header da aplicação com navegação e info do usuário |
| `Sidebar` | Sidebar com navegação baseada no cargo (proprietarioNavigation) |
| `LanguageSwitcher` | Troca de idioma (pt/en) |

### 13.3 Componentes do Proprietário (`components/proprietario/`)

#### Dashboard
| Componente | Descrição |
|---|---|
| `ProducaoLeiteChart` | Gráfico de produção de leite (Recharts) |
| `TopBufalasChart` | Gráfico das top búfalas produtoras |

#### Propriedades
| Componente | Descrição |
|---|---|
| `PropriedadeCard` | Card de propriedade com dados e ações |
| `CreatePropriedadeModal` | Modal de criação de propriedade |
| `EditPropriedadeModal` | Modal de edição de propriedade |
| `DeletePropriedadeModal` | Modal de confirmação de exclusão |
| `MapaPiquetes` | Mapa interativo de piquetes (Leaflet) |
| `DetalhesLoteModal` | Modal com detalhes do lote/piquete |

#### Tabs da Propriedade
| Componente | Descrição |
|---|---|
| `VIsaoGeralTab` | Aba de visão geral da propriedade |
| `GruposTab` | Aba de gerenciamento de grupos de manejo |
| `AlimentacaoTab` | Aba de alimentação (resumo, histórico, formulário) |
| `EquipeTab` | Aba de equipe (funcionários vinculados) |
| `DataIngestionTab` | Aba de importação/exportação de planilhas |

#### Sub-componentes de Alimentação
| Componente | Descrição |
|---|---|
| `AlimentacaoForm` | Formulário de registro de alimentação |
| `AlimentacaoHistorico` | Histórico de registros de alimentação |
| `AlimentacaoResumo` | Resumo de alimentação |

#### Sub-componentes de Grupos
| Componente | Descrição |
|---|---|
| `CreateEditGrupoModal` | Modal de criar/editar grupo |
| `DeleteGrupoModal` | Modal de confirmar exclusão de grupo |
| `DetailsGrupoModal` | Modal de detalhes do grupo (Header, Tabs, Footer) |
| `TransferirLoteModal` | Modal de transferência de lote |
| `DetailsGrupoHeader` | Header do detalhe do grupo |
| `DetailsGrupoTabs` | Tabs do detalhe do grupo |
| `DetailsGrupoFooter` | Footer do detalhe do grupo |

#### Rebanho (Detalhe do Búfalo)
| Componente | Descrição |
|---|---|
| `BufalosFilterBar` | Barra de filtros avançados para búfalos |
| `VisaoGeralTab` | Dados básicos e identificação do búfalo |
| `DesempenhoTab` + `DesempenhoCharts` | Gráficos de desempenho |
| `ProducaoTab` | Produção de leite com ciclos, gráfico e registro de ordenha |
| `ReproducaoTab` | Histórico reprodutivo |
| `SanitarioTab` | Registros sanitários (CRUD) |
| `VacinacaoTab` | Histórico de vacinação (CRUD) |
| `ZootecnicoTab` | Dados zootécnicos (CRUD) |
| `GenealogiaTab` | Árvore genealógica + análise de consanguinidade |
| `MovimentacoesTab` | Histórico de movimentações entre grupos |
| `EventosTab` | Timeline de eventos do animal |
| `RacaChart` | Gráfico de distribuição por raça |
| `SexoChart` | Gráfico de distribuição por sexo |
| `MaturidadeChart` | Gráfico de distribuição por maturidade |

#### Sub-componentes de Produção
| Componente | Descrição |
|---|---|
| `CiclosLactacao` | Lista de ciclos de lactação |
| `ProducaoChart` | Gráfico de produção diária |
| `PredicaoProducaoCard` | Card com predição de produção (IA) |
| `RegistrarOrdenhaModal` | Modal para registrar nova ordenha |

#### Sub-componentes de Sanitário/Vacinação/Zootécnico
| Componente | Descrição |
|---|---|
| `CreateDadoSanitarioModal` | Modal de criação de registro sanitário |
| `DadoSanitarioDetailsModal` | Modal de detalhes do registro |
| `DeletedRegistrosModal` (sanitário) | Modal de registros deletados (restore) |
| `CreateVacinacaoModal` | Modal de criação de vacinação |
| `VacinacaoDetailsModal` | Modal de detalhes da vacinação |
| `DeletedVacinacaoModal` | Modal de vacinações deletadas (restore) |
| `DadoZootecnicoDetailsModal` | Modal de detalhes zootécnicos |
| `DeletedRegistrosModal` (zootécnico) | Modal de registros deletados (restore) |
| `MoverGrupoModal` | Modal para mover búfalo entre grupos |

#### Lactação
| Componente | Descrição |
|---|---|
| `ProducaoMensalChart` | Gráfico de produção mensal |
| `ResumoProducaoChart` | Gráfico de resumo de produção |
| `ResumoProducaoModal` | Modal com detalhes de produção |
| `AlertasProducaoModal` | Modal de alertas de produção |

#### Reprodução
| Componente | Descrição |
|---|---|
| `CoberturaFormModal` | Modal de formulário de cobertura |
| `ReproducaoDetailModal` | Modal de detalhes da reprodução |

#### Material Genético
| Componente | Descrição |
|---|---|
| `MaterialGeneticoFormModal` | Modal de formulário de material genético |
| `MaterialGeneticoDetailModal` | Modal de detalhes |

#### Medicamentos
| Componente | Descrição |
|---|---|
| `MedicamentoFormModal` | Modal de formulário de medicamento |
| `DeletedMedicamentosModal` | Modal de medicamentos deletados (restore) |

#### Coleta
| Componente | Descrição |
|---|---|
| `ColetaModal` | Modal de detalhes da coleta |

#### Indústria
| Componente | Descrição |
|---|---|
| `IndustriaFormModal` | Modal de formulário de laticínio |
| `IndustriaDetalheModal` | Modal de detalhes do laticínio |

### 13.4 ErrorBoundary

`components/ErrorBoundary.tsx` — Captura erros de renderização React e exibe fallback.

---

## 14. Schemas de Validação

Schemas Zod com traduções injetadas via `useTranslations()`:

| Schema | Arquivo | Campos |
|---|---|---|
| **Cobertura** | `schemas/cobertura.schema.ts` | idBufala (req), tipoInseminacao (enum), idSemen (condicional: IA/IATF/TE), idBufalo (condicional: Monta Natural), dtEvento (req, ≤ hoje), status (enum) |
| **Indústria** | `schemas/industria.schema.ts` | nome (req), representante, contato, observacao |
| **Material Genético** | `schemas/material-genetico.schema.ts` | Validação de material genético |
| **Medicamento** | `schemas/medicamento.schema.ts` | Validação de medicamento |

---

## 15. Utilitários (lib/)

### apiClient.ts

Cliente Axios com:
- **Base URL** via `NEXT_PUBLIC_API_URL`
- **Interceptor de Request**: Injeta `Authorization: Bearer {token}` de `localStorage`
- **Interceptor de Response**:
  - 401 → tenta refresh token com fila de requisições
  - Sem resposta → toast "Verifique sua conexão"
  - 403 → toast "Você não tem permissão"
  - 500+ → toast "Erro no servidor"

### toCamelCase.ts

Função recursiva que converte chaves de objetos/arrays de `snake_case` para `camelCase`. Usada nos services que recebem respostas em snake_case da API.

---

## 16. Segurança

| Medida | Implementação |
|---|---|
| **CSP com Nonce** | Cada request gera um nonce UUID; scripts inline só executam com nonce válido |
| **X-Frame-Options: DENY** | Previne clickjacking |
| **X-Content-Type-Options: nosniff** | Previne MIME sniffing |
| **Referrer-Policy: strict-origin-when-cross-origin** | Controla informações do referer |
| **Permissions-Policy** | Bloqueia câmera, microfone e geolocalização |
| **Token em localStorage** | Access token + refresh token persistidos |
| **Cookie de Auth** | `buffs_auth_token=1` com `SameSite=Lax` e expiração |
| **Refresh Token Queue** | Evita múltiplas requisições de refresh simultâneas |
| **Soft Delete** | Dados não são removidos permanentemente (exceto alertas) |

---

## 17. CI/CD e Deploy

### GitHub Actions (`.github/workflows/deploy.yml`)

| Etapa | Descrição |
|---|---|
| **Trigger** | Push na branch `master` ou workflow_dispatch (manual) |
| **Build** | Node 20, `npm ci`, cria `.env.production`, `npm run build` |
| **Package** | Empacota `.next/`, `public/`, configs em `deploy.tar.gz` |
| **SCP** | Copia para servidor dedicado via SSH |
| **Deploy** | Para PM2 → limpa diretório → extrai → instala deps produção → PM2 start |
| **Health Check** | `curl -f http://localhost:3000` |
| **Resultado** | WAN: `http://187.95.52.86:9007`, LAN: `http://10.37.56.252:3000` |

### PM2 (`ecosystem.config.js`)

```javascript
{
  name: 'buffs-frontend',
  script: 'node_modules/.bin/next',
  args: 'start',
  cwd: '/root/buffs-frontend',
  instances: 1,
  autorestart: true,
  env_production: { NODE_ENV: 'production', PORT: 3000 }
}
```

---

## 18. Análise de Melhorias

### 🔴 Críticas (Devem ser feitas)

| # | Área | Problema | Sugestão |
|---|---|---|---|
| 1 | **Páginas de Cargo** | As páginas de Gerente, Funcionário e Veterinário são **placeholders vazios** — não oferecem funcionalidade | Implementar dashboards e funcionalidades específicas para cada cargo. Priorizar Veterinário (sanitário/vacinação) e Funcionário (ordenha/alimentação) |
| 2 | **Navegação** | Apenas `proprietarioNavigation` está definida em `navigation.ts` — outros cargos não têm sidebar/nav | Criar `gerenteNavigation`, `funcionarioNavigation` e `veterinarioNavigation` |
| 3 | **Filtros de búfalo** | O `bufalos.service.ts` tem **12+ métodos de filtro** com URLs redundantes em vez de usar query params | Migrar para um único endpoint `GET /bufalos/filtro/propriedade/{id}/avancado` com query params (já existe `filterAvancado`) e depreciar os específicos |
| 4 | **Naming inconsistente (snake_case vs camelCase)** | A API retorna campos em snake_case e camelCase de forma inconsistente; os services fazem conversão manual em alguns pontos | Padronizar conversão no `apiClient` com um interceptor de resposta global usando `toCamelCase` |
| 5 | **Token em localStorage** | Armazenar tokens JWT em localStorage é vulnerável a XSS | Migrar para cookies `HttpOnly` gerenciados pelo servidor (ideal) ou ao menos `sessionStorage` |
| 6 | **Sem testes** | Não há testes unitários, de integração ou E2E | Implementar Vitest para unit/integration e Playwright/Cypress para E2E |

### 🟡 Importantes (Deveriam ser feitas)

| # | Área | Problema | Sugestão |
|---|---|---|---|
| 7 | **Interface `PaginationMeta`** | Duplicada em **8+ services** (bufalos, coleta, material-genetico, etc.) | Criar tipo compartilhado em `src/types/pagination.ts` |
| 8 | **Error handling nos services** | Erros de negócio (400, 404) não são tratados de forma padronizada nos componentes | Criar um wrapper de erro padrão ou um hook `useApiError` |
| 9 | **Coleta.service** | Só tem `getByPropriedade` e `getById` — **sem create/update/delete** | Implementar CRUD completo de coletas no frontend |
| 10 | **Loading states** | Apenas um `loading.tsx` genérico para todo o grupo `(buffs)` | Criar skeletons específicos para cada página (propriedades, rebanho, etc.) |
| 11 | **SEO** | Nenhuma configuração de metadata/SEO nas páginas | Adicionar `generateMetadata` em cada `page.tsx` com título, descrição e OpenGraph |
| 12 | **Acessibilidade** | Embora use `focus-trap-react`, não há auditoria de acessibilidade completa | Rodar `axe-core` automaticamente; adicionar `aria-label` em todos os elementos interativos |
| 13 | **Selos de Classificação** | SVGs de classificação (`classificacao-PO.svg`, etc.) existem em `/public/selos/` mas podem não estar sendo usados | Verificar uso e integrar na UI de rebanho |
| 14 | **Docs** | O arquivo `src/docs/componets.txt` (typo) parece ser documentação manual incompleta | Substituir por Storybook ou documentação gerada automaticamente |

### 🟢 Nice to Have (Podem ser feitas)

| # | Área | Sugestão |
|---|---|---|
| 15 | **PWA** | Transformar em Progressive Web App para uso em campo (offline-first) |
| 16 | **Notificações Push** | Alertas de sanidade/reprodução via push notification |
| 17 | **Dark Mode** | Adicionar tema escuro com toggle |
| 18 | **Dashboard Real-time** | WebSocket para atualização em tempo real de ordenhas/alertas |
| 19 | **Relatórios PDF** | Exportação de relatórios consolidados em PDF |
| 20 | **Storybook** | Documentação visual do design system (Button, Modal, DataTable, etc.) |
| 21 | **Monorepo** | Separar UI components em pacote compartilhado se houver mais projetos |
| 22 | **Feature Flags** | Sistema de flags para ativar/desativar funcionalidades por propriedade |
| 23 | **Performance** | Implementar React.lazy + Suspense para code splitting de modais pesados |
| 24 | **Validação de formulários** | Nem todas as páginas usam Zod schema — padronizar uso em todos os forms |
| 25 | **Cache strategy** | Configurar `staleTime` e `gcTime` no React Query de forma mais granular por domínio |

---

## Assets Estáticos

```
public/
├── images/
│   └── login-bg.jpg          # Background da tela de login
├── selos/
│   ├── classificacao-CCG.svg  # Selo Controle de Cruzamento Genético
│   ├── classificacao-PA.svg   # Selo Puro por Avô
│   ├── classificacao-PC.svg   # Selo Puro por Cruza
│   ├── classificacao-PO.svg   # Selo Puro de Origem
│   └── classificacao-SRD.svg  # Selo Sem Raça Definida
├── file.svg
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg
```

---

## Providers

| Provider | Arquivo | Descrição |
|---|---|---|
| `AuthProvider` | `src/providers/AuthProvider.tsx` | Proteção de rotas, hidratação de perfil, tela de loading global |
| `QueryProvider` | `src/providers/QueryProvider.tsx` | Configuração do `QueryClient` do React Query |

---

> **Última atualização**: Julho 2026
> **Versão**: 0.1.0
