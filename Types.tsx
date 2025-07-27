

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

export type DetectTypes =
  | 'Caixas delimitadoras 2D'
  | 'Máscaras de segmentação'
  | 'Caixas delimitadoras 3D'
  | 'Pontos';

export type SafetyAnalysisFields = {
  risco: string;
  nr: string; // Norma Regulamentadora (ex: "NR-10")
  itemNr: string; // Item específico da NR (ex: "10.2.1")
  descricaoRisco: string; // Descrição da não conformidade ou perigo
  fonte?: string; // Referência da fonte da análise (ex: "NR-6, item 6.3.a")
  planoAcao?: string[]; // Sugestões de ações corretivas
};

export type BoundingBox2DType = SafetyAnalysisFields & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BoundingBoxMaskType = SafetyAnalysisFields & {
  x: number;
  y: number;
  width: number;
  height: number;
  imageData: string;
};

export type BoundingBox3DType = SafetyAnalysisFields & {
  center: [number, number, number];
  size: [number, number, number];
  rpy: [number, number, number];
};

export type PointingType = SafetyAnalysisFields & {
  point: {
    x: number;
    y: number;
  };
};