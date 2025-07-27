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

import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { DetectTypes, BoundingBox2DType, BoundingBoxMaskType, BoundingBox3DType, PointingType, SafetyAnalysisFields } from './Types';
import { BatchResultItem } from './atoms';
import { segmentationColorsRgb } from './consts';


export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q'],
  );

  d.push('Z');
  return d.join(' ');
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Tentativa de lidar com problemas de CORS se as imagens vierem de outros domínios no futuro
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export async function createThumbnail(imageSrc: string, size: number): Promise<string> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const aspectRatio = image.width / image.height;
    if (aspectRatio > 1) { // Paisagem
        canvas.width = size;
        canvas.height = size / aspectRatio;
    } else { // Retrato ou quadrado
        canvas.height = size;
        canvas.width = size * aspectRatio;
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8); // Usa JPEG para melhor compressão
}

// Função para obter o prompt apropriado para o tipo de detecção
export function getPromptTextForDetectType(
  detectType: DetectTypes,
  promptsAtomValue: Record<DetectTypes, string[]>,
  target: string // Área de foco fornecida pelo usuário
): string {
  const [base, details, targetPrefix] = promptsAtomValue[detectType];
  const fullTarget = target ? `${targetPrefix} ${target}` : targetPrefix.slice(0, -1); // Remove os dois pontos finais se o alvo estiver vazio
  return `${base} ${details} ${fullTarget}`;
}

export function downloadJson(data: unknown, filename: string) {
  const jsonString = JSON.stringify(data, null, 2); // Formata o JSON para melhor legibilidade
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadHtml(htmlContent: string, filename: string) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const getHtmlTemplate = (title: string, bodyContent: string): string => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            background-color: #1a202c; 
            color: #e2e8f0; 
            padding: 20px; 
            line-height: 1.6;
        }
        h1, h2 { 
            color: #2dd4bf; 
            border-bottom: 2px solid #4a5568; 
            padding-bottom: 10px; 
            margin-top: 40px;
        }
        h1:first-child, h2:first-child {
            margin-top: 0;
        }
        .image-container {
            margin-bottom: 20px;
            text-align: center;
        }
        .image-container img {
            max-width: 100%;
            max-height: 500px;
            border-radius: 8px;
            border: 1px solid #4a5568;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            table-layout: fixed;
        }
        th, td { 
            border: 1px solid #4a5568; 
            padding: 12px; 
            text-align: left; 
            word-wrap: break-word;
            vertical-align: top;
        }
        thead { 
            background-color: #042e2d; 
            color: #ffffff; 
            font-weight: bold; 
        }
        tbody tr:nth-child(even) { 
            background-color: #2d3748; 
        }
        tbody tr:hover {
            background-color: #374151;
        }
        td[contenteditable="true"]:focus { 
            outline: 2px solid #2dd4bf; 
            background-color: #3c5067; 
            box-shadow: 0 0 5px rgba(45, 212, 191, 0.5);
        }
        .error {
            color: #f87171;
            background-color: rgba(248, 113, 113, 0.1);
            padding: 10px;
            border-left: 4px solid #f87171;
            border-radius: 4px;
        }
        ul {
            margin: 0;
            padding-left: 20px;
        }
        .disclaimer {
            margin-top: 40px;
            padding: 15px;
            background-color: #2d3748;
            border-left: 5px solid #f59e0b; /* Amarelo/Laranja */
            color: #fcd34d;
            font-size: 12px;
            border-radius: 4px;
        }
        .disclaimer h3 {
            margin-top: 0;
            color: #fbbf24;
            font-weight: bold;
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 1px solid #4a5568;
            text-align: center; 
            font-size: 12px; 
            color: #94a3b8; 
        }
    </style>
</head>
<body>
    ${bodyContent}
    <div class="disclaimer">
        <h3>ISENÇÃO DE RESPONSABILIDADE</h3>
        <p>Este relatório foi gerado com o auxílio de uma ferramenta de Inteligência Artificial (AI.MÉTODO EXPERT) e deve ser usado apenas para fins de referência. A IA pode cometer erros e as análises não substituem o julgamento, a verificação e a responsabilidade técnica de um profissional qualificado em Segurança e Saúde no Trabalho. A validação, interpretação e aplicação das informações aqui contidas são de inteira responsabilidade do usuário final. Lucas Bicalho, Verum Institute e os desenvolvedores isentam-se de qualquer responsabilidade pelo uso deste relatório.</p>
    </div>
    <div class="footer">
        Relatório gerado por AI.MÉTODO EXPERT | Desenvolvido por: Lucas Bicalho, PMP
    </div>
</body>
</html>
`;

export const generateTableHtml = (data: (SafetyAnalysisFields & { [key: string]: any })[]): string => {
    if (data.length === 0) {
        return '<p>Nenhum dado de detecção para exibir.</p>';
    }

    const headers = ['ID', 'Risco', 'Fonte', 'Descrição do Risco', 'Plano de Ação'];
    const headHtml = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    
    const bodyHtml = `<tbody>${data.map((item, index) => `
        <tr>
            <td contenteditable="true">${index + 1}</td>
            <td contenteditable="true">${item.risco || ''}</td>
            <td contenteditable="true">${item.fonte || 'N/A'}</td>
            <td contenteditable="true">${item.descricaoRisco || ''}</td>
            <td contenteditable="true">
                ${(item.planoAcao && Array.isArray(item.planoAcao) && item.planoAcao.length > 0)
                    ? `<ul>${item.planoAcao.map((s: string) => `<li>${s}</li>`).join('')}</ul>`
                    : 'N/A'
                }
            </td>
        </tr>
    `).join('')}</tbody>`;

    return `<table>${headHtml}${bodyHtml}</table>`;
};

export function generateHtmlReport(
  detectType: DetectTypes,
  detectionData: any[],
  imageBase64: string | null,
  filenamePrefix: string = 'relatorio_deteccao_editavel'
) {
  const title = `Relatório de Análise de Riscos - ${detectType}`;
  const imageHtml = imageBase64
    ? `<div class="image-container"><h2>Imagem Analisada</h2><img src="${imageBase64}" alt="Imagem Analisada"></div>`
    : '';

  const bodyContent = `
    <h1>${title}</h1>
    ${imageHtml}
    ${generateTableHtml(detectionData)}
  `;

  const fullHtml = getHtmlTemplate(title, bodyContent);
  const filename = `${filenamePrefix}_${detectType.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.html`;
  downloadHtml(fullHtml, filename);
}

export async function generateBatchHtmlReport(
  batchResults: BatchResultItem[],
  filenamePrefix: string = 'relatorio_lote_editavel'
) {
  const title = "Relatório de Lote - Análise de Riscos";
  let bodyContent = `<h1>${title}</h1>`;
  
  for (const result of batchResults) {
      let finalImageSrc = result.imageBase64;
      if (result.imageBase64 && result.detectionData && result.detectionData.length > 0) {
        finalImageSrc = await getAnnotatedReportImageAsBase64(result.imageBase64, result.detectionData, result.detectType);
      }
      
      const imageHtml = finalImageSrc
        ? `<div class="image-container"><img src="${finalImageSrc}" alt="Imagem ${result.imageName}"></div>`
        : '';

      bodyContent += `<h2>Imagem: ${result.imageName}</h2>`;
      if (result.error) {
          bodyContent += `<div class="error"><strong>Erro:</strong> ${result.error}</div>`;
      } else {
          bodyContent += imageHtml;
          bodyContent += generateTableHtml(result.detectionData);
      }
  };

  const fullHtml = getHtmlTemplate(title, bodyContent);
  const filename = `${filenamePrefix}_${new Date().getTime()}.html`;
  downloadHtml(fullHtml, filename);
}

const addHeaderAndFooter = (doc: jsPDF, title: string, pageNum?: number) => {
    const pageCount = (doc.internal as any).getNumberOfPages();
    const currentPageNum = pageNum || (doc.internal as any).getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Cabeçalho
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Texto preto
    doc.setFont(undefined, 'bold');
    doc.text("AI.MÉTODO EXPERT", 15, 15);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    doc.text(title, pageWidth / 2, 22, { align: 'center' });
  
    // Rodapé
    const footerY = pageHeight - 40; // Aumentado o espaço para o rodapé
    doc.setLineWidth(0.2);
    doc.line(15, footerY, pageWidth - 15, footerY); // Linha separadora do rodapé
  
    // Isenção de Responsabilidade
    doc.setFontSize(7);
    doc.setTextColor(150, 0, 0); // Cor de aviso sutil
    doc.setFont(undefined, 'italic');
    const disclaimerText = "AVISO: Este relatório foi gerado com auxílio de IA e pode conter erros. As informações são para referência e não substituem o julgamento de um profissional qualificado. A validação e aplicação das informações são de inteira responsabilidade do usuário. Os criadores se isentam de qualquer responsabilidade pelo uso deste documento.";
    
    const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 30);
    doc.text(disclaimerLines, 15, footerY + 5, { align: 'justify' });
    const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor; // Altura da linha em mm
    const disclaimerHeight = disclaimerLines.length * lineHeight;
  
    doc.setFont(undefined, 'normal');
  
    // Informações do Desenvolvedor
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const devInfoY = footerY + 5 + disclaimerHeight + 2; // Posição Y dinâmica
    const devInfoLine1 = `Desenvolvido por: Lucas Bicalho, PMP | Versão: Beta.07.2025`;
    const devInfoLine2 = `LinkedIn: linkedin.com/in/bicalhobim | Instagram: @bicalhobim.eng`;
    doc.text(devInfoLine1, 15, devInfoY);
    doc.text(devInfoLine2, 15, devInfoY + 4);
    
    // Paginação
    doc.text(`Página ${currentPageNum} de ${pageCount}`, pageWidth - 15, devInfoY + 4, { align: 'right' });
    doc.setTextColor(0, 0, 0); // Reseta a cor do texto para o conteúdo principal
};


export async function generatePdfReport(
  detectType: DetectTypes,
  detectionData: BoundingBox2DType[] | BoundingBox3DType[] | BoundingBoxMaskType[] | PointingType[],
  imageBase64: string | null,
  filenamePrefix: string = 'relatorio_deteccao'
) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  let yOffset = 30; // Deslocamento inicial após o cabeçalho

  addHeaderAndFooter(doc, `Relatório de Análise de Riscos - ${detectType}`);

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text("Imagem Analisada:", 15, yOffset);
  doc.setFont(undefined, 'normal');
  yOffset += 7; // Espaço após o título

  if (imageBase64) {
    try {
      const img = await loadImage(imageBase64);
      const aspectRatio = img.width / img.height;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      let imgWidth = pageWidth - 30; // margens de 15mm de cada lado
      let imgHeight = imgWidth / aspectRatio;

      const availableHeightForImage = pageHeight - yOffset - 40; // Espaço para título da tabela e rodapé

      if (imgHeight > availableHeightForImage) {
        imgHeight = availableHeightForImage;
        imgWidth = imgHeight * aspectRatio;
      }
       if (imgWidth > pageWidth - 30) {
            imgWidth = pageWidth - 30;
            imgHeight = imgWidth / aspectRatio;
        }
      
      const xImg = (pageWidth - imgWidth) / 2;

      if (yOffset + imgHeight > pageHeight - 40) { 
          doc.addPage();
          yOffset = 30;
          addHeaderAndFooter(doc, `Relatório de Análise de Riscos - ${detectType}`);
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text("Imagem Analisada:", 15, yOffset);
          doc.setFont(undefined, 'normal');
          yOffset += 7;
      }
      
      doc.addImage(imageBase64, 'JPEG', xImg, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 8; // Espaço aumentado após a imagem
    } catch (error) {
      console.error("Erro ao carregar imagem para PDF:", error);
      doc.text("Erro ao carregar a imagem.", 15, yOffset);
      yOffset += 7;
    }
  } else {
    doc.text("Nenhuma imagem base fornecida.", 15, yOffset);
    yOffset += 7;
  }

  if (yOffset + 25 > pageHeight - 40) { 
      doc.addPage();
      yOffset = 30;
      addHeaderAndFooter(doc, `Relatório de Análise de Riscos - ${detectType}`);
  }
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text("Detalhes das Detecções:", 15, yOffset);
  doc.setFont(undefined, 'normal');
  yOffset += 7; // Espaço após o título

  let head: RowInput[] = [];
  let body: RowInput[] = [];
  let columnStylesConfig: any = {};
  
  const commonHead = ['ID', 'Risco', 'Fonte', 'Descrição do Risco', 'Plano de Ação'];
  const dataToBody = (data: any[]) => data.map((item, index) => [
      index + 1,
      item.risco,
      item.fonte || 'N/A',
      item.descricaoRisco,
      (item.planoAcao || []).map((s: string) => `- ${s}`).join('\n')
  ]);
  const commonColumnStyles = {
    0: { cellWidth: 8 },    // ID
    1: { cellWidth: 30 },   // Risco
    2: { cellWidth: 25 },   // Fonte
    3: { cellWidth: 45 },   // Descrição
    4: { cellWidth: 'auto' as const } // Plano de Ação
  };

  switch (detectType) {
    case 'Caixas delimitadoras 2D':
    case 'Máscaras de segmentação':
    case 'Pontos':
    case 'Caixas delimitadoras 3D':
      head = [commonHead];
      body = dataToBody(detectionData);
      columnStylesConfig = commonColumnStyles;
      break;
  }

  if (detectionData.length > 0) {
    autoTable(doc, {
      head: head, body: body, startY: yOffset, theme: 'striped',
      styles: { cellPadding: 2, fontSize: 8, valign: 'middle' },
      headStyles: { fillColor: [4, 46, 45], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
      columnStyles: columnStylesConfig,
      margin: { bottom: 45 }, // Garante espaço para o rodapé
      didDrawPage: (data) => { 
        addHeaderAndFooter(doc, `Relatório de Análise de Riscos - ${detectType}`, data.pageNumber);
      }
    });
  } else {
    doc.text("Nenhum dado de detecção para exibir.", 15, yOffset);
  }
  
  const filename = `${filenamePrefix}_${detectType.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf`;
  doc.save(filename);
}


export async function generateBatchPdfReport(
  batchResults: BatchResultItem[],
  filenamePrefix: string = 'relatorio_lote_analise_riscos'
) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  let isFirstImageProcessed = true;

  for (let i = 0; i < batchResults.length; i++) {
    const result = batchResults[i];
    if (!isFirstImageProcessed) {
      doc.addPage();
    }
    isFirstImageProcessed = false;
    let yOffset = 30; // Reseta o yOffset para cada nova seção de imagem

    const sectionTitle = `Análise de Risco: ${result.imageName}`;
    addHeaderAndFooter(doc, sectionTitle);
    
    if (result.error) {
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0); // Vermelho para erros
        doc.text(`Erro ao processar imagem: ${result.error}`, 15, yOffset, {maxWidth: doc.internal.pageSize.getWidth() - 30});
        doc.setTextColor(0, 0, 0); // Reseta a cor
        if (i < batchResults.length - 1) continue; 
        else break; 
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Imagem Analisada:", 15, yOffset);
    doc.setFont(undefined, 'normal');
    yOffset += 7; // Espaço após o título
    
    let finalImageSrc = result.imageBase64;
    if (result.imageBase64 && result.detectionData && result.detectionData.length > 0) {
        finalImageSrc = await getAnnotatedReportImageAsBase64(result.imageBase64, result.detectionData, result.detectType);
    }
    
    if (finalImageSrc) {
      try {
        const img = await loadImage(finalImageSrc);
        const aspectRatio = img.width / img.height;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        let imgWidth = pageWidth - 30; 
        let imgHeight = imgWidth / aspectRatio;
        
        const availableHeightForImage = pageHeight - yOffset - 40;

        if (imgHeight > availableHeightForImage) {
          imgHeight = availableHeightForImage;
          imgWidth = imgHeight * aspectRatio;
        }
         if (imgWidth > pageWidth - 30) { 
            imgWidth = pageWidth - 30;
            imgHeight = imgWidth / aspectRatio;
        }
        
        const xImg = (pageWidth - imgWidth) / 2;

        if (yOffset + imgHeight > pageHeight - 40) { 
            doc.addPage();
            yOffset = 30;
            addHeaderAndFooter(doc, sectionTitle);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("Imagem Analisada:", 15, yOffset);
            doc.setFont(undefined, 'normal');
            yOffset += 7;
        }
        
        doc.addImage(finalImageSrc, 'JPEG', xImg, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 8; // Espaço aumentado após a imagem

      } catch (error) {
        console.error(`Erro ao carregar imagem ${result.imageName} para PDF:`, error);
        doc.text("Erro ao carregar a imagem para esta seção.", 15, yOffset);
        yOffset += 7;
      }
    } else {
      doc.text("Nenhuma imagem processada para esta seção.", 15, yOffset);
      yOffset += 7;
    }

    if (yOffset + 25 > pageHeight - 40) {
        doc.addPage();
        yOffset = 30;
        addHeaderAndFooter(doc, sectionTitle);
    }
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("Detalhes das Detecções:", 15, yOffset);
    doc.setFont(undefined, 'normal');
    yOffset += 7; // Espaço após o título

    let head: RowInput[] = [['ID', 'Risco', 'Fonte', 'Descrição do Risco', 'Plano de Ação']];
    let body: RowInput[] = (result.detectionData as any[]).map((item, index) => [
        index + 1, item.risco, item.fonte || 'N/A', item.descricaoRisco,
        (item.planoAcao || []).map((s: string) => `- ${s}`).join('\n')
    ]);
    const columnStylesConfig = {
        0: { cellWidth: 8 }, 
        1: { cellWidth: 30 }, 
        2: { cellWidth: 25 }, 
        3: { cellWidth: 45 },
        4: { cellWidth: 'auto' as const } 
    };

    if (result.detectionData && Array.isArray(result.detectionData) && result.detectionData.length > 0) {
      autoTable(doc, {
        head: head, body: body, startY: yOffset, theme: 'striped',
        styles: { cellPadding: 2, fontSize: 8, valign: 'middle' },
        headStyles: { fillColor: [4, 46, 45], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
        columnStyles: columnStylesConfig,
        margin: { bottom: 45 }, // Garante espaço para o rodapé
        didDrawPage: (data) => { 
            addHeaderAndFooter(doc, sectionTitle, data.pageNumber);
        }
      });
    } else if (!result.error) {
      doc.text("Nenhum dado de detecção para esta imagem.", 15, yOffset);
    }
  }
  
  const filename = `${filenamePrefix}_${new Date().getTime()}.pdf`;
  doc.save(filename);
}

export async function getActiveImageAsBase64(
  imageSrc: string | null,
  stream: MediaStream | null,
  videoRef: {current: HTMLVideoElement | null}
): Promise<string | null> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let source: HTMLImageElement | HTMLVideoElement;
    if (stream && videoRef.current) {
      source = videoRef.current;
      canvas.width = source.videoWidth;
      canvas.height = source.videoHeight;
    } else if (imageSrc) {
      try {
        source = await loadImage(imageSrc);
        canvas.width = source.width;
        canvas.height = source.height;
      } catch (e) {
        console.error("Falha ao carregar a imagem para o relatório:", e);
        return null;
      }
    } else {
      return null;
    }
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
}

export async function getAnnotatedReportImageAsBase64(
    baseImageSrc: string,
    detectionData: any[],
    detectType: DetectTypes,
    hiddenIndices: number[] = [],
): Promise<string | null> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    try {
        const image = await loadImage(baseImageSrc);
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
    } catch (e) {
        console.error("Falha ao carregar imagem base para anotação:", e);
        return baseImageSrc; // Retorna a imagem original em caso de erro
    }
    
    // Configurações de desenho
    const baseLineWidth = Math.max(2, canvas.width / 400);
    const baseFontSize = Math.max(12, canvas.width / 80);
    ctx.font = `bold ${baseFontSize}px "Inter", sans-serif`;

    const drawLabel = (x: number, y: number, text: string) => {
      const padding = baseFontSize / 2;
      ctx.textBaseline = 'top';
      const textMetrics = ctx.measureText(text);
      const rectHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent + padding;
      const rectWidth = textMetrics.width + padding;

      ctx.fillStyle = '#042e2d';
      ctx.fillRect(x, y - rectHeight, rectWidth, rectHeight);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, x + padding / 2, y - rectHeight + padding / 2);
    };

    switch (detectType) {
        case 'Caixas delimitadoras 2D':
            ctx.lineWidth = baseLineWidth;
            ctx.strokeStyle = '#042e2d';
            (detectionData as BoundingBox2DType[]).forEach((box, i) => {
                if (hiddenIndices.includes(i)) return;
                const x = box.x * canvas.width;
                const y = box.y * canvas.height;
                const w = box.width * canvas.width;
                const h = box.height * canvas.height;
                ctx.strokeRect(x, y, w, h);
                const labelText = `${box.nr || ''} ${box.itemNr || ''}`.trim();
                if (labelText) {
                    drawLabel(x, y, labelText);
                }
            });
            break;
        
        case 'Máscaras de segmentação':
            ctx.lineWidth = baseLineWidth;
            ctx.strokeStyle = '#042e2d';
            for (const [i, box] of (detectionData as BoundingBoxMaskType[]).entries()) {
                if (hiddenIndices.includes(i)) continue;
                const x = box.x * canvas.width;
                const y = box.y * canvas.height;
                const w = box.width * canvas.width;
                const h = box.height * canvas.height;
                ctx.strokeRect(x, y, w, h);
                
                try {
                    const maskImg = await loadImage(box.imageData);
                    const maskCanvas = document.createElement('canvas');
                    const maskCtx = maskCanvas.getContext('2d');
                    if(maskCtx) {
                      maskCanvas.width = maskImg.width;
                      maskCanvas.height = maskImg.height;
                      maskCtx.drawImage(maskImg, 0, 0);
                      const pixels = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
                      const data = pixels.data;
                      const rgb = segmentationColorsRgb[i % segmentationColorsRgb.length];
                      for (let p = 0; p < data.length; p += 4) {
                          data[p + 3] = data[p];
                          data[p] = rgb[0];
                          data[p + 1] = rgb[1];
                          data[p + 2] = rgb[2];
                      }
                      maskCtx.putImageData(pixels, 0, 0);
                      ctx.globalAlpha = 0.5;
                      ctx.drawImage(maskCanvas, x, y, w, h);
                      ctx.globalAlpha = 1.0;
                    }
                } catch(e) {
                    console.error("Falha ao processar máscara de segmentação para relatório:", e);
                }

                const labelText = `${box.nr || ''} ${box.itemNr || ''}`.trim();
                if (labelText) {
                    drawLabel(x, y, labelText);
                }
            }
            break;

        case 'Pontos':
            (detectionData as PointingType[]).forEach((p, i) => {
                if (hiddenIndices.includes(i)) return;
                const x = p.point.x * canvas.width;
                const y = p.point.y * canvas.height;
                const radius = baseFontSize / 1.5;

                ctx.fillStyle = '#042e2d';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = baseLineWidth / 2;
                ctx.stroke();

                const labelText = `${p.nr || ''} ${p.itemNr || ''}`.trim();
                if (labelText) {
                    drawLabel(x + radius, y - (baseFontSize + radius), labelText);
                }
            });
            break;
    }

    return canvas.toDataURL('image/jpeg', 0.9);
}

export function getReportAsHtmlString(
    detectType: DetectTypes,
    detectionData: any[],
    imageBase64: string | null
): string {
  const title = `Relatório de Análise de Riscos - ${detectType}`;
  const imageHtml = imageBase64
    ? `<div class="image-container"><h2>Imagem Analisada</h2><img src="${imageBase64}" alt="Imagem Analisada"></div>`
    : '';

  const bodyContent = `
    <h1>${title}</h1>
    ${imageHtml}
    ${generateTableHtml(detectionData)}
  `;

  return getHtmlTemplate(title, bodyContent);
}