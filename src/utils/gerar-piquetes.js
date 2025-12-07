// gerar-piquetes.js  ←  VERSÃO AUTO-CONTIDA (não precisa instalar uuid)
const fs = require('fs');

// Função simples de gerar UUID v4 (sem dependência externa, compatível com Node.js)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const GRUPOS = [
  {
    id_grupo: '5365a78d-a337-4213-b36b-0a4c1f83233b',
    nome: 'Secagem',
    prefixo: 'Secagem',
  },
  {
    id_grupo: '5d286ffa-bbb0-429e-b009-d09bfb554659',
    nome: 'Início Lactação',
    prefixo: 'Inicio',
  },
  {
    id_grupo: 'acb95814-3119-4b2f-8f03-5902e5094c9b',
    nome: 'Recria',
    prefixo: 'Recria',
  },
];

const ID_PROPRIEDADE = 'e7625c27-da8d-4ffa-a514-0c191b1fb1e3';
const PIQUETES_POR_GRUPO = 30;
const AREA_M2 = 19197.0;
const QTD_MAX = 50;
const LARGURA = 0.00137; // ≈ 137 metros
const ALTURA = 0.00125; // ≈ 137 metros

let startLng = -47.99;
let startLat = -24.71;
let globalCounter = 1;

const linhas = [];
linhas.push(
  'id_lote,tipo_lote,nome_lote,id_propriedade,status,descricao,qtd_max,geo_mapa,area_m2,created_at,updated_at,id_grupo,deleted_at'
);

GRUPOS.forEach((grupo) => {
  let lng = startLng;
  let lat = startLat;

  for (let i = 1; i <= PIQUETES_POR_GRUPO; i++) {
    const id_lote = uuidv4();
    const nome_lote = `${grupo.prefixo} ${String(i).padStart(2, '0')}`;

    const geo = {
      type: 'Polygon',
      coordinates: [
        [
          [lng, lat],
          [lng + LARGURA, lat],
          [lng + LARGURA, lat + ALTURA],
          [lng, lat + ALTURA],
          [lng, lat],
        ],
      ],
    };

    const created_at =
      new Date(Date.now() + globalCounter * 60000)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 23) + '+00';
    const updated_at =
      new Date(Date.now() + globalCounter * 60000 + 5000)
        .toISOString()
        .replace('T', ' ')
        .slice(0, 23) + '+00';

    // Formato do geo_mapa igual ao exemplo: aspas duplas duplas e campo deleted_at termina com vírgula
    const geoStr = JSON.stringify(geo).replace(/"/g, '""');
    const linha =
      [
        id_lote,
        '', // tipo_lote
        nome_lote,
        ID_PROPRIEDADE,
        'ativo',
        nome_lote,
        QTD_MAX,
        `"${geoStr}"`,
        AREA_M2.toFixed(2),
        created_at,
        updated_at,
        grupo.id_grupo,
      ].join(',') + ','; // sempre termina com vírgula para campo deleted_at vazio

    linhas.push(linha);
    globalCounter++;

    // Avança na grade (10 piquetes por linha)
    lng += LARGURA;
    if (i % 10 === 0) {
      lng = startLng;
      lat += ALTURA;
    }
  }

  // Espaço grande entre grupos
  startLat += ALTURA * 4;
});

// Salva em arquivo CSV
const outputPath = 'piquetes.csv';
fs.writeFileSync(outputPath, linhas.join('\n'), 'utf8');
console.log(`Arquivo salvo: ${outputPath}`);
