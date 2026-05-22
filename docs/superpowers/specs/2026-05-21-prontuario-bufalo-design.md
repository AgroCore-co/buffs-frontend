# Prontuário do Búfalo — Design Spec
**Data:** 2026-05-21

## Objetivo

Ao clicar em uma linha da tabela de búfalos (página de Rebanho), o usuário navega para uma página dedicada com os dados completos do búfalo — o "prontuário". A página é expansível: começa com abas simples e vai crescendo conforme novas funcionalidades forem adicionadas.

---

## Rota

```
/[locale]/(buffs)/proprietario/rebanho/[id]/page.tsx
```

Segue o mesmo padrão de `propriedade/[id]/page.tsx`.

---

## Navegação

- **Rebanho → Prontuário:** `TableRow` recebe `onClick` com `router.push('/proprietario/rebanho/${bufalo.idBufalo}')` em `rebanho/page.tsx`
- **Prontuário → Rebanho:** botão "← Voltar para o Rebanho" usa `router.back()`

---

## Fonte de dados

| Hook | Onde usar |
|---|---|
| `useBufalo(id)` | Dados principais do búfalo |
| `useGruposById(idGrupo)` | Nome do grupo na aba Resumo Geral |
| `useMovLoteStatusByGrupo(idGrupo)` | `localizacaoAtual` para o mapa na aba Localização |
| `useLotesByPropriedade(idPropriedade)` | Polígonos dos piquetes para o mapa |

Todos os hooks já existem em `src/hooks/`.

---

## Header da Página

Dentro de um `Container`:

| Elemento | Dados |
|---|---|
| Avatar circular | Iniciais do nome (ex: "PÉ"), fundo âmbar `#CE7D0A` |
| Nome | `bufalo.nome` |
| Badge status | "Ativo" / "Inativo" |
| Badge categoria | `bufalo.categoria` (PA, PO, PC, etc.) |
| Linha secundária | Brinco · Raça · Idade calculada de `dtNascimento` |
| Botão Imprimir | Desabilitado (placeholder) |
| Botão Editar | Desabilitado (placeholder) |

---

## Abas

Usando `TabNav` (já existente). 5 abas:

| Key | Label |
|---|---|
| `resumo-geral` | Resumo Geral |
| `localizacao` | Localização |
| `genealogia` | Genealogia |
| `sanitario` | Sanitário |
| `zootecnico` | Zootécnico |

---

## Aba: Resumo Geral

Layout duas colunas: `grid lg:grid-cols-3 gap-6`

### Coluna principal (col-span-2)

**Card "Dados de Identificação"**
- Brinco Visual (`brinco`)
- Microchip / Eletrônico (`microchip` ou "Não implantado")
- Data de Nascimento + idade calculada (`dtNascimento`)
- Sexo (`sexo`: M → "Macho", F → "Fêmea")
- Registro Provisório (`registroProv` ou "—")
- Registro Definitivo (`registroDef` ou "—")
- Origem (`origem` ou "—")
- Brinco Original (`brincoOriginal` ou "—")

**Card "Manejo & Localização"**
- Propriedade (do `usePropriedadeStore`)
- Grupo / Lote (`idGrupo` — nome buscado se disponível, senão ID)
- Categoria (`categoria`)
- Nível de Maturidade (`nivelMaturidade`: B→Bezerro, N→Novilha, V→Vaca, T→Touro)

### Sidebar (col-span-1)

**Card "Classificação Racial"**
- Código da categoria com nome completo:
  - PO → Puro de Origem
  - PC → Puro por Cruzamento
  - PA → Puro por Avaliação
  - CCG → Com Controle de Genealogia
  - SRD → Sem Raça Definida
- Estilo visual em destaque (similar ao screenshot)

**Card "Genealogia Rápida"**
- Pai (`idPai` — "Não informado" se ausente)
- Mãe (`idMae` — "Não informado" se ausente)
- Link "Ver genealogia completa" → navega para aba Genealogia

**Footer de timestamps**
- Criado em: `createdAt`
- Atualizado em: `updatedAt`

---

## Aba: Localização

Reutiliza a lógica do `DetailsGrupoModal` (aba de mapa):

- Busca o `statusGrupo` via `idGrupo` do búfalo para obter `localizacaoAtual.idLote`
- Busca os lotes da propriedade para renderizar polígonos
- Mapa satélite Leaflet com destaque no piquete atual do grupo
- Legenda: grupo atual vs outros lotes
- Controles: zoom in/out, botão de foco no piquete
- Estado vazio: "Búfalo sem grupo ou grupo sem alocação registrada"

---

## Abas: Genealogia, Sanitário, Zootécnico

Cada uma renderiza um card placeholder:

```
[ícone] Em construção
Esta seção será implementada em breve.
```

---

## Arquivos

| Ação | Arquivo |
|---|---|
| Criar | `src/app/[locale]/(buffs)/proprietario/rebanho/[id]/page.tsx` |
| Criar | `src/components/proprietario/rebanho/prontuario/ResumoGeralTab.tsx` |
| Criar | `src/components/proprietario/rebanho/prontuario/LocalizacaoTab.tsx` |
| Alterar | `src/app/[locale]/(buffs)/proprietario/rebanho/page.tsx` (adicionar `onClick` nas linhas) |

---

## Fora de escopo (por agora)

- Edição do búfalo
- Impressão
- Histórico de vacinas, reprodução, pesagem
- Busca de nome de raça e grupo por API separada
- Árvore genealógica completa
