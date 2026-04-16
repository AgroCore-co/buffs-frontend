# Mapeamento de Propriedades com Leaflet e Visão de Satélite

Este documento descreve a implementação técnica do módulo de mapas utilizado na página de detalhes da propriedade. O objetivo é fornecer uma visão geoespacial precisa dos lotes e piquetes utilizando camadas de satélite de alta resolução.

## 🚀 Tecnologias Utilizadas

- **Leaflet**: Biblioteca open-source padrão para mapas interativos.
- **React-Leaflet**: Componentização do Leaflet para o ecossistema React.
- **Lucide React**: Conjunto de ícones para a interface.
- **Tailwind CSS**: Estilização e posicionamento dos elementos.

---

## 🗺️ 1. Como o Mapa é Construído

### Camada de Satélite (TileLayer)
Diferente dos mapas convencionais de ruas, utilizamos o provedor **Esri World Imagery**. Ele oferece imagens de satélite globais de alta fidelidade, essenciais para a visualização de pastagens e divisões rurais.

**Configuração do TileLayer:**
```jsx
<TileLayer
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  attribution='&copy; Esri'
/>
```

### Altura Dinâmica e Responsiva
Para garantir que o mapa se encaixe perfeitamente na tela do usuário sem gerar barras de rolagem desnecessárias, utilizamos um cálculo dinâmico baseado na altura da janela (Viewport Height):

CSS: `h-[calc(100vh-360px)]`

Isso subtrai a altura aproximada do Header, Navegação e Abas, deixando o mapa ocupando o restante do espaço útil.

## 📍 2. Demarcação de Piquetes (Polígonos)
As áreas são desenhadas utilizando o componente `<Polygon />`.

- **positions**: Um array de coordenadas `[latitude, longitude]` que definem os vértices da área.
- **pathOptions**: Define a cor da borda (`#ce7d0a`) e o preenchimento translúcido (`#ffcf78`) para que o satélite ainda seja visível por baixo.

## 🏷️ 3. Como colocar o Texto na Demarcação
A maior dificuldade em mapas interativos é manter o texto centralizado e visível sem que o usuário precise clicar ou passar o mouse. Resolvemos isso com a "mágica" do Tooltip permanente.

### O Componente Tooltip
Configuramos o Tooltip com duas propriedades cruciais:

- `permanent`: Faz com que o texto fique visível o tempo todo, em vez de aparecer apenas no hover.
- `direction="center"`: Força o Leaflet a calcular o centro geométrico (centroide) do polígono e posicionar o texto exatamente ali.

```tsx
<Polygon positions={coordenadas} pathOptions={estilo}>
  <Tooltip 
    permanent 
    direction="center" 
    className="piquete-label"
  >
    Nome do Piquete
  </Tooltip>
</Polygon>
```

### Estilização do Texto (CSS Customizado)
Para que o texto não pareça um "balão de mensagem" (padrão do Leaflet) e sim uma etiqueta integrada ao mapa, aplicamos o seguinte CSS:

- **Fundo Transparente**: Removemos a caixa branca e a borda.
- **Text Shadow**: Adicionamos uma sombra preta ao redor das letras brancas para garantir a leitura sobre qualquer cor de fundo do satélite (verde, terra, água).
- **Pointer Events**: Configuramos para que o texto não interaja com o mouse, permitindo que cliques passem através dele para o mapa.

```css
.leaflet-tooltip.piquete-label {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: white;
  font-weight: 800;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
}
```

## ⚠️ Observação sobre Next.js (SSR)
O Leaflet depende da API `window` do navegador para funcionar. Por isso, o componente é envolvido em uma verificação de montagem (`isMounted`):

```js
const [isMounted, setIsMounted] = useState(false);
useEffect(() => { setIsMounted(true); }, []);

if (!isMounted) return <SkeletonLoader />;
```
Isso evita erros de hidratação e garante que o mapa carregue apenas no lado do cliente.

---

Espero que este guia ajude a documentar bem o seu projeto! Se precisar de mais detalhes técnicos, só pedir.
