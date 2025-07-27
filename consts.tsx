/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Copyright 2024 Lucas Bicalho, PMP

// Licenciado sob a Licença Apache, Versão 2.0 (a "Licença");
// você não pode usar este arquivo exceto em conformidade com a Licença.
// Você pode obter uma cópia da Licença em

//     https://www.apache.org/licenses/LICENSE-2.0

// A menos que exigido pela lei aplicável ou acordado por escrito, o software
// distribuído sob a Licença é distribuído "COMO ESTÁ",
// SEM GARANTIAS OU CONDIÇÕES DE QUALQUER TIPO, expressas ou implícitas.
// Consulte a Licença para o idioma específico que governa as permissões e
// limitações sob a Licença. 

export const colors = [
  'rgb(0, 0, 0)',
  'rgb(255, 255, 255)',
  'rgb(213, 40, 40)', 
  'rgb(250, 123, 23)',
  'rgb(240, 186, 17)',
  'rgb(8, 161, 72)',
  'rgb(4, 46, 45)', // Atualizado de rgb(122, 204, 63) para #042e2d
  'rgb(161, 66, 244)',
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return [r, g, b];
}

export const segmentationColors = [
  '#E6194B',
  '#3C89D0',
  '#3CB44B',
  '#FFE119',
  '#911EB4',
  '#42D4F4',
  '#F58231',
  '#F032E6',
  '#BFEF45',
  '#469990',
];
export const segmentationColorsRgb = segmentationColors.map((c) => hexToRgb(c));

export const imageOptions: string[] = await Promise.all(
  [
    'pumpkins.jpg',
    'origami.jpg',
    'clock.jpg',
    'socks.jpg',
    'breakfast.jpg',
    'cat.jpg',
    'spill.jpg',
    'fruit.jpg',
    'baklava.jpg',
  ].map(async (i) =>
    URL.createObjectURL(
      await (
        await fetch(
          `https://www.gstatic.com/aistudio/starter-apps/bounding-box/${i}`,
        )
      ).blob(),
    ),
  ),
);

export const lineOptions = {
  size: 8,
  thinning: 0,
  smoothing: 0,
  streamline: 0,
  simulatePressure: false,
};

const safetyPromptBase = `Você é um engenheiro de segurança do trabalho experiente, especializado nas Normas Regulamentadoras (NRs) brasileiras.
Analise a imagem fornecida e identifique potenciais riscos, perigos ou não conformidades com as NRs.
Para cada item identificado relacionado a {TARGET_PLACEHOLDER}, gere uma entrada em uma lista JSON.
Cada entrada DEVE conter os seguintes campos:
- "risco": Uma descrição concisa do risco ou perigo identificado (ex: "Trabalhador sem capacete", "Risco de queda de altura", "Falta de sinalização de emergência").
- "nr": A Norma Regulamentadora principal relacionada ao risco (ex: "NR-6", "NR-35", "NR-23"). Se nenhuma NR específica for claramente aplicável, deixe este campo como uma string vazia.
- "item_nr": O item específico da NR, se aplicável e identificável (ex: "6.3.a", "35.5.1", "23.1"). Se não aplicável ou não identificável, deixe como string vazia.
- "descricao_risco": Uma breve explicação do porquê a situação representa um risco ou não conformidade com base nos princípios de segurança do trabalho ou NRs.
- "plano_acao": Um array JSON com 3 a 5 strings, cada uma sendo uma sugestão prática e acionável de como solucionar ou mitigar o risco identificado.
Limite a resposta a um máximo de 20 itens. Retorne APENAS a lista JSON, sem nenhum texto adicional antes ou depois.`;


export const defaultPromptParts = {
  'Caixas delimitadoras 2D': [
    safetyPromptBase.replace('{TARGET_PLACEHOLDER}', 'itens, áreas de risco ou equipamentos relevantes para segurança do trabalho'),
    `Adicionalmente, cada entrada JSON deve incluir "box_2d": as coordenadas [ymin, xmin, ymax, xmax] da caixa delimitadora normalizadas de 0 a 1000.`,
    'Analise com foco em:', // Espaço reservado para o prompt alvo do usuário
  ],
  'Máscaras de segmentação': [
    safetyPromptBase.replace('{TARGET_PLACEHOLDER}', 'itens, áreas de risco ou equipamentos relevantes para segurança do trabalho'),
    `Adicionalmente, cada entrada JSON deve incluir "box_2d": as coordenadas [ymin, xmin, ymax, xmax] da caixa delimitadora normalizadas de 0 a 1000, e "mask": uma string base64 da máscara de segmentação para o objeto.`,
    'Analise com foco em:',
  ],
  'Caixas delimitadoras 3D': [
    safetyPromptBase.replace('{TARGET_PLACEHOLDER}', 'objetos tridimensionais relevantes para segurança do trabalho'),
    `Adicionalmente, cada entrada JSON deve incluir "box_3d": as coordenadas [center_x, center_y, center_z, size_x, size_y, size_z, rpy_r, rpy_p, rpy_y] da caixa delimitadora 3D. Coordenadas e tamanho em metros, rotação em graus.`,
    'Analise com foco em:',
  ],
  'Pontos': [
    safetyPromptBase.replace('{TARGET_PLACEHOLDER}', 'pontos específicos de risco ou interesse para segurança do trabalho'),
    `Adicionalmente, cada entrada JSON deve incluir "point": as coordenadas [y, x] do ponto normalizadas de 0 a 1000.`,
    'Analise com foco em:',
  ],
};

// Os Prompts Padrão agora são construídos em Prompt.tsx usando getPromptTextForDetectType
export const defaultPrompts = {
  'Caixas delimitadoras 2D': '',
  'Caixas delimitadoras 3D': '',
  'Máscaras de segmentação': '',
  'Pontos': '',
};


const safetyLevel = 'only_high';

export const safetySettings = new Map();

safetySettings.set('harassment', safetyLevel);
safetySettings.set('hate_speech', safetyLevel);
safetySettings.set('sexually_explicit', safetyLevel);
safetySettings.set('dangerous_content', safetyLevel);
safetySettings.set('civic_integrity', safetyLevel);