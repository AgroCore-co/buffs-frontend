# Storybook - Buffs Frontend

Este projeto utiliza o Storybook para documentar e testar os componentes de interface do usuário de forma isolada.

## Componentes Documentados

### UI Components (`src/components/ui`)

- **Button** - Botão reutilizável com múltiplas variantes e tamanhos
  - Variantes: `primary`, `secondary`, `outline`, `success`, `danger`, `info`, `report`
  - Tamanhos: `small`, `medium`, `large`, `full`
  - Suporte para estado de carregamento e desabilitado

- **Badge** - Etiqueta para indicar status
  - Tipos: `active`, `inactive`, `info`

- **Table** - Tabela responsiva e customizável
  - Suporte para células customizadas
  - Estado vazio integrado
  - Responsivo com scroll horizontal

- **Pagination** - Componente de paginação
  - Navegação entre páginas
  - Botões numerados configuráveis
  - Variantes customizáveis

- **MetricCard** - Card para exibir métricas
  - Suporte para ícones
  - Layout responsivo

- **Loading** - Indicador de carregamento
  - Texto customizável
  - Animação com ícone Lucide

- **DashboardContainer** - Container para dashboards
  - Estilização consistente
  - Flexível para qualquer conteúdo

### Layout Components (`src/components/Layout`)

- **Header** - Cabeçalho da aplicação
  - Informações do usuário
  - Ações de logout
  - Botão de fullscreen
  - Avatar com iniciais

- **Sidebar** - Menu lateral de navegação
  - Menu expansível/colapsável
  - Rotas dinâmicas por cargo
  - Ícones Lucide
  - Indicador de rota ativa

### Proprietário Components (`src/components/proprietario`)

- **PropriedadeCard** - Card para exibir informações de propriedades
  - Badges de status e ABCB
  - Informações de endereço e proprietário
  - Ações de editar e deletar
  - Hover effects

- **PropriedadeTab** - Dashboard de estatísticas da propriedade
  - Cards de métricas (machos, fêmeas, lotes, usuários)
  - Layout responsivo em grid
  - Valores numéricos destacados

- **GruposTab** - Tabela de grupos de animais
  - Visualização de grupos com cores
  - Informações de nível de maturidade
  - Data de criação e dias no local
  - Suporte para estado vazio

- **PiquetesTab** - Visualização de piquetes com mapa
  - Mapa interativo com Leaflet
  - Rotação de piquetes
  - Container responsivo

- **AlimentacaoTab** - Gerenciamento de alimentação
  - Definições de tipos de ração
  - Registros de alimentação por grupo
  - Métricas de consumo

## Como Usar

### Iniciar o Storybook

```bash
npm run storybook
```

O Storybook será iniciado em `http://localhost:6006`

### Build do Storybook

Para criar uma versão estática do Storybook:

```bash
npm run build-storybook
```

Os arquivos serão gerados na pasta `storybook-static/`

## Estrutura dos Arquivos

As stories estão organizadas separadamente dos componentes em `src/stories/components/`:

```
src/
├── components/          # Componentes originais
│   ├── ui/
│   │   ├── Button.js
│   │   ├── Badge.js
│   │   └── ...
│   ├── Layout/
│   │   ├── Header.js
│   │   └── Sidebar.js
│   └── proprietario/
│       ├── propriedades/
│       │   └── PropriedadeCard.js
│       └── propriedade/
│           ├── PropriedadeTab.js
│           ├── GruposTab.js
│           ├── PiquetesTab.js
│           └── AlimentacaoTab.js
└── stories/
    ├── Introduction.mdx
    └── components/      # Stories centralizadas
        ├── ui/
        │   ├── Button.stories.js
        │   ├── Badge.stories.js
        │   └── ...
        ├── layout/
        │   ├── Header.stories.js
        │   └── Sidebar.stories.js
        └── proprietario/
            ├── PropriedadeCard.stories.js
            ├── PropriedadeTab.stories.js
            ├── GruposTab.stories.js
            ├── PiquetesTab.stories.js
            └── AlimentacaoTab.stories.js
```

## Exemplos de Stories

### Story Básica

```javascript
export const Default = {
  args: {
    children: 'Meu Botão',
    variant: 'primary',
    size: 'medium',
  },
};
```

### Story com Render Customizado

```javascript
export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  ),
};
```

### Story Interativa

```javascript
export const Interactive = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={10}
        onPageChange={setCurrentPage}
      />
    );
  },
};
```

## Addons Disponíveis

- **Controls** - Editar props dos componentes em tempo real
- **Actions** - Visualizar eventos disparados
- **Viewport** - Testar em diferentes tamanhos de tela
- **Backgrounds** - Alternar cores de fundo
- **Docs** - Documentação automática dos componentes

## Convenções

1. Nome do arquivo story: `ComponentName.stories.js`
2. Cada variação importante do componente deve ter sua própria story
3. Use `args` para stories simples e `render` para stories complexas
4. Sempre adicione `tags: ['autodocs']` para gerar documentação automática
5. Use `argTypes` para documentar e controlar props

## Configuração

### `.storybook/main.js`

Configuração principal do Storybook, incluindo:
- Localização dos arquivos story em `src/stories/`
- Addons habilitados (styling-webpack, essentials, interactions)
- Framework: React com Webpack 5
- Alias `@` para `src/`
- Mock do `next/link` para Storybook
- Webpack ProvidePlugin para React global
- PostCSS para processar Tailwind CSS

### `.storybook/preview.js`

Configuração global de visualização:
- Importação dos estilos globais (Tailwind CSS)
- React disponibilizado globalmente
- Configuração de backgrounds (light, dark, gray)
- Parâmetros do Next.js

### `.storybook/nextLinkMock.js`

Mock do componente Link do Next.js para funcionar no Storybook

## Dicas

- Use o Storybook para desenvolvimento de componentes isolados
- Teste diferentes estados e variações dos componentes
- Compartilhe o link do Storybook com designers para validação visual
- Use o addon Controls para testar interações rapidamente
- Documente casos extremos (sem dados, muitos dados, etc.)

## Troubleshooting

### Erro de versão do Node.js

Se encontrar erro de versão, o Storybook 8.x requer Node.js 18+

### Conflitos de dependências

Use `--legacy-peer-deps` ao instalar novos pacotes:

```bash
npm install <pacote> --legacy-peer-deps
```

### Estilos não carregando

Certifique-se de que:
1. `src/styles/globals.css` está importado em `.storybook/preview.js`
2. O addon `@storybook/addon-styling-webpack` está configurado
3. PostCSS está processando o Tailwind CSS corretamente

### Componentes do Next.js não funcionam

O Storybook usa mocks para componentes do Next.js:
- `next/link` é substituído por um mock em `.storybook/nextLinkMock.js`
- Componentes que dependem de contextos do Next.js podem precisar de decorators

### React is not defined

O webpack está configurado com `ProvidePlugin` para disponibilizar React globalmente. Se o erro persistir, verifique se a importação `import React from 'react'` está presente nos arquivos de stories.

## Recursos

- [Documentação do Storybook](https://storybook.js.org/docs)
- [Storybook com React](https://storybook.js.org/docs/get-started/react-webpack5)
- [Component Story Format (CSF)](https://storybook.js.org/docs/api/csf)
- [Tailwind CSS no Storybook](https://storybook.js.org/recipes/tailwindcss)

## Tecnologias

- **Storybook**: 8.6.14
- **Framework**: React 19.2.0 com Webpack 5
- **UI Library**: Tailwind CSS 4
- **Next.js**: 16.0.6 (com mocks para Storybook)
- **Ícones**: Lucide React, React Icons
