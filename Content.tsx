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

import {useAtom, useSetAtom} from 'jotai/react';
import getStroke from 'perfect-freehand';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizePayload, useResizeDetector} from 'react-resize-detector';
import {
  ActiveColorAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  DetectTypeAtom,
  DrawModeAtom,
  FOVAtom,
  ImageSentAtom,
  ImageSrcAtom,
  LinesAtom,
  PointsAtom,
  RevealOnHoverModeAtom,
  ShareStream,
  VideoRefAtom,
  ActiveResultIndexAtom,
  AnnotationsVisibleAtom,
  HiddenAnnotationIndicesAtom,
  ReportHtmlToViewAtom,
  HoveredBoxAtom,
} from './atoms';
import {lineOptions, segmentationColorsRgb} from './consts';
import {getActiveImageAsBase64, getReportAsHtmlString, getSvgPathFromStroke, getAnnotatedReportImageAsBase64} from './utils';
import { BoundingBoxMaskType as BoundingBoxMaskTypeInternal, DetectTypes } from './Types'; // Renomeado para evitar conflito

export function Content() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [stream] = useAtom(ShareStream);
  const [detectType] = useAtom(DetectTypeAtom);
  const [videoRef] = useAtom(VideoRefAtom);
  const [fov] = useAtom(FOVAtom);
  const [, setImageSent] = useAtom(ImageSentAtom);
  const [points] = useAtom(PointsAtom);
  const [revealOnHover] = useAtom(RevealOnHoverModeAtom);
  const [hoverEntered, setHoverEntered] = useState(false);
  const [hoveredBox, setHoveredBox] = useAtom(HoveredBoxAtom);
  const [drawMode] = useAtom(DrawModeAtom);
  const [lines, setLines] = useAtom(LinesAtom);
  const [activeColor] = useAtom(ActiveColorAtom);
  const [activeResultIndex] = useAtom(ActiveResultIndexAtom);
  const [annotationsVisible] = useAtom(AnnotationsVisibleAtom);
  const [hiddenAnnotationIndices, setHiddenAnnotationIndices] = useAtom(HiddenAnnotationIndicesAtom);
  const setReportHtml = useSetAtom(ReportHtmlToViewAtom);

  // Lidando com redimensionamento e proporções
  const boundingBoxContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDims, setContainerDims] = useState({
    width: 0,
    height: 0,
  });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({
    width: 1,
    height: 1,
  });

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) {
      setContainerDims({
        width: el.width,
        height: el.height,
      });
    }
  }, []);

  const {ref: containerRef} = useResizeDetector({onResize});

  const boundingBoxContainer = useMemo(() => {
    const {width, height} = activeMediaDimensions;
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    if (aspectRatio < containerAspectRatio) {
      return {
        height: containerDims.height,
        width: containerDims.height * aspectRatio,
      };
    } else {
      return {
        width: containerDims.width,
        height: containerDims.width / aspectRatio,
      };
    }
  }, [containerDims, activeMediaDimensions]);

  // Funções auxiliares
  function matrixMultiply(m: number[][], v: number[]): number[] {
    return m.map((row: number[]) =>
      row.reduce((sum, val, i) => sum + val * v[i], 0),
    );
  }

  const linesAndLabels3D = useMemo(() => {
    if (!boundingBoxContainer) {
      return null;
    }
    let allLines: any[] = [];
    let allLabels: any[] = [];
    boundingBoxes3D.forEach((box, boxIndex) => { // Alterado para forEach para obter o índice
      const {center, size, rpy} = box;

      // Converte ângulos de Euler para quaternião
      const [sr, sp, sy] = rpy.map((x) => Math.sin(x / 2));
      const [cr, cp, cz] = rpy.map((x) => Math.cos(x / 2));
      const quaternion = [
        sr * cp * cz - cr * sp * sy,
        cr * sp * cz + sr * cp * sy,
        cr * cp * sy - sr * sp * cz,
        cr * cp * cz + sr * sp * sy,
      ];

      // Calcula os parâmetros da câmera
      const height = boundingBoxContainer.height;
      const width = boundingBoxContainer.width;
      const f = width / (2 * Math.tan(((fov / 2) * Math.PI) / 180));
      const cx = width / 2;
      const cy = height / 2;
      const intrinsics = [
        [f, 0, cx],
        [0, f, cy],
        [0, 0, 1],
      ];

      // Obtém os vértices da caixa
      const halfSize = size.map((s) => s / 2);
      let corners = [];
      for (let x of [-halfSize[0], halfSize[0]]) {
        for (let y of [-halfSize[1], halfSize[1]]) {
          for (let z of [-halfSize[2], halfSize[2]]) {
            corners.push([x, y, z]);
          }
        }
      }
      corners = [
        corners[1],
        corners[3],
        corners[7],
        corners[5],
        corners[0],
        corners[2],
        corners[6],
        corners[4],
      ];

      // Aplica a rotação do quaternião
      const q = quaternion;
      const rotationMatrix = [
        [
          1 - 2 * q[1] ** 2 - 2 * q[2] ** 2,
          2 * q[0] * q[1] - 2 * q[3] * q[2],
          2 * q[0] * q[2] + 2 * q[3] * q[1],
        ],
        [
          2 * q[0] * q[1] + 2 * q[3] * q[2],
          1 - 2 * q[0] ** 2 - 2 * q[2] ** 2,
          2 * q[1] * q[2] - 2 * q[3] * q[0],
        ],
        [
          2 * q[0] * q[2] - 2 * q[3] * q[1],
          2 * q[1] * q[2] + 2 * q[3] * q[0],
          1 - 2 * q[0] ** 2 - 2 * q[1] ** 2,
        ],
      ];

      const boxVertices = corners.map((corner) => {
        const rotated = matrixMultiply(rotationMatrix, corner);
        return rotated.map((val, idx) => val + center[idx]);
      });

      // Projeta pontos 3D para 2D
      const tiltAngle = 90.0;
      const viewRotationMatrix = [
        [1, 0, 0],
        [
          0,
          Math.cos((tiltAngle * Math.PI) / 180),
          -Math.sin((tiltAngle * Math.PI) / 180),
        ],
        [
          0,
          Math.sin((tiltAngle * Math.PI) / 180),
          Math.cos((tiltAngle * Math.PI) / 180),
        ],
      ];

      const points = boxVertices;
      const rotatedPoints = points.map((p) =>
        matrixMultiply(viewRotationMatrix, p),
      );
      const translatedPoints = rotatedPoints.map((p) => p.map((v) => v + 0));
      const projectedPoints = translatedPoints.map((p) =>
        matrixMultiply(intrinsics, p),
      );
      const vertices = projectedPoints.map((p) => [p[0] / p[2], p[1] / p[2]]);

      const topVertices = vertices.slice(0, 4);
      const bottomVertices = vertices.slice(4, 8);

      for (let i = 0; i < 4; i++) {
        const lines = [
          [topVertices[i], topVertices[(i + 1) % 4]],
          [bottomVertices[i], bottomVertices[(i + 1) % 4]],
          [topVertices[i], bottomVertices[i]],
        ];

        for (let [start, end] of lines) {
          const dx = end[0] - start[0];
          const dy = end[1] - start[1];
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          allLines.push({start, end, length, angle, boxIndex}); // Adiciona boxIndex
        }
      }

      // Adiciona rótulo com efeito de fade
      const textPosition3d = points[0].map(
        (_, idx) => points.reduce((sum, p) => sum + p[idx], 0) / points.length,
      );
      textPosition3d[2] += 0.1;

      const textPoint = matrixMultiply(
        intrinsics,
        matrixMultiply(
          viewRotationMatrix,
          textPosition3d.map((v) => v + 0),
        ),
      );
      const textPos = [
        textPoint[0] / textPoint[2],
        textPoint[1] / textPoint[2],
      ];
      allLabels.push({ ...box, pos: textPos, boxIndex }); // Adiciona todos os dados da box
    });
    return [allLines, allLabels] as const;
  }, [boundingBoxes3D, boundingBoxContainer, fov]);

  function findAndSetHoveredBox(e: React.PointerEvent) {
    const boxes = document.querySelectorAll('.bbox');
    const dimensionsAndIndex = Array.from(boxes).map((box, i) => {
      const {top, left, width, height} = box.getBoundingClientRect();
      return {
        top,
        left,
        width,
        height,
        index: i,
      };
    });
    // Ordena do menor para o maior
    const sorted = dimensionsAndIndex.sort(
      (a, b) => a.width * a.height - b.width * b.height,
    );
    // Encontra a menor caixa que contém o mouse
    const {clientX, clientY} = e;
    const found = sorted.find(({top, left, width, height}) => {
      return (
        clientX > left &&
        clientX < left + width &&
        clientY > top &&
        clientY < top + height
      );
    });
    if (found) {
      setHoveredBox(found.index);
    } else {
      setHoveredBox(null);
    }
  }

  const downRef = useRef<Boolean>(false);

  const hasResults = useMemo(() => {
    switch(detectType) {
        case 'Caixas delimitadoras 2D': return boundingBoxes2D.length > 0;
        case 'Máscaras de segmentação': return boundingBoxMasks.length > 0;
        case 'Pontos': return points.length > 0;
        case 'Caixas delimitadoras 3D': return boundingBoxes3D.length > 0;
        default: return false;
    }
  }, [detectType, boundingBoxes2D, boundingBoxMasks, points, boundingBoxes3D]);

  const handleViewReport = async () => {
    let detectionData: any[] = [];
    let annotations = {};

    switch (detectType) {
        case 'Caixas delimitadoras 2D': 
            detectionData = boundingBoxes2D;
            annotations = { boundingBoxes2D };
            break;
        case 'Máscaras de segmentação': 
            detectionData = boundingBoxMasks;
            annotations = { boundingBoxMasks };
            break;
        case 'Pontos': 
            detectionData = points;
            annotations = { points };
            break;
        case 'Caixas delimitadoras 3D': 
            detectionData = boundingBoxes3D;
            annotations = { boundingBoxes3D };
            break;
    }

    if (detectionData.length === 0) {
        alert("Nenhum resultado para visualizar.");
        return;
    }
    
    const baseImage = await getActiveImageAsBase64(imageSrc, stream, videoRef);
    if (!baseImage) {
        alert("Não foi possível obter a imagem para o relatório.");
        return;
    }
    const annotatedImage = await getAnnotatedReportImageAsBase64(baseImage, detectionData, detectType, hiddenAnnotationIndices);

    const htmlString = getReportAsHtmlString(detectType, detectionData, annotatedImage);
    setReportHtml(htmlString);
  };

  return (
    <div ref={containerRef} className="w-full grow relative">
      {hasResults && (
        <div className="absolute top-4 right-4 z-30">
            <button
                onClick={handleViewReport}
                className="button-new secondary flex items-center gap-2"
                title="Visualizar Relatório"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Visualizar
            </button>
        </div>
      )}
      {stream ? (
        <video
          className="absolute top-0 left-0 w-full h-full object-contain"
          autoPlay
          onLoadedMetadata={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.videoWidth,
              height: e.currentTarget.videoHeight,
            });
          }}
          ref={(video) => {
            videoRef.current = video;
            if (video && !video.srcObject) {
              video.srcObject = stream;
            }
          }}
        />
      ) : imageSrc ? (
        <img
          src={imageSrc}
          className="absolute top-0 left-0 w-full h-full object-contain"
          alt="Imagem carregada"
          onLoad={(e) => {
            setActiveMediaDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      ) : null}
      <div
        className={`absolute w-full h-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${hoverEntered ? 'hide-box' : ''} ${drawMode ? 'cursor-crosshair' : ''}`}
        ref={boundingBoxContainerRef}
        onPointerEnter={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            findAndSetHoveredBox(e);
          }
        }}
        onPointerMove={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(true);
            findAndSetHoveredBox(e);
          }
          if (downRef.current) {
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev.slice(0, prev.length - 1),
              [
                [
                  ...prev[prev.length - 1][0],
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                prev[prev.length - 1][1],
              ],
            ]);
          }
        }}
        onPointerLeave={(e) => {
          if (revealOnHover && !drawMode) {
            setHoverEntered(false);
            findAndSetHoveredBox(e);
          }
        }}
        onPointerDown={(e) => {
          if (drawMode) {
            setImageSent(false);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            downRef.current = true;
            const parentBounds =
              boundingBoxContainerRef.current!.getBoundingClientRect();
            setLines((prev) => [
              ...prev,
              [
                [
                  [
                    (e.clientX - parentBounds.left) /
                      boundingBoxContainer!.width,
                    (e.clientY - parentBounds.top) /
                      boundingBoxContainer!.height,
                  ],
                ],
                activeColor,
              ],
            ]);
          }
        }}
        onPointerUp={(e) => {
          if (drawMode) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            downRef.current = false;
          }
        }}
        style={{
          width: boundingBoxContainer.width,
          height: boundingBoxContainer.height,
        }}>
        {lines.length > 0 && (
          <svg
            className="absolute top-0 left-0 w-full h-full"
            style={{
              pointerEvents: 'none',
              width: boundingBoxContainer?.width,
              height: boundingBoxContainer?.height,
            }}>
            {lines.map(([points, color], i) => (
              <path
                key={i}
                d={getSvgPathFromStroke(
                  getStroke(
                    points.map(([x, y]) => [
                      x * boundingBoxContainer!.width,
                      y * boundingBoxContainer!.height,
                      0.5,
                    ]),
                    lineOptions,
                  ),
                )}
                fill={color}
              />
            ))}
          </svg>
        )}
        {annotationsVisible && (
          <>
            {detectType === 'Caixas delimitadoras 2D' &&
              boundingBoxes2D.map((box, i) => {
                if (hiddenAnnotationIndices.includes(i)) return null;
                const isSelected = i === activeResultIndex;
                const labelText = `${box.nr || ''} ${box.itemNr || ''}`.trim();

                return (
                  <div
                    key={i}
                    className={`group absolute bbox border-2 transition-all duration-200 ${isSelected ? 'border-red-500 scale-105 z-10' : 'border-[#042e2d]'} ${i === hoveredBox ? 'reveal' : ''}`}
                    style={{
                      transformOrigin: '0 0',
                      top: box.y * 100 + '%',
                      left: box.x * 100 + '%',
                      width: box.width * 100 + '%',
                      height: box.height * 100 + '%',
                    }}>
                    <div className={`relative w-full h-full`} title={`${box.risco} (NR: ${box.nr || 'N/A'}, Item: ${box.itemNr || 'N/A'}) - ${box.descricaoRisco}`}>
                      {labelText && (
                        <div className={`text-white absolute left-0 -top-6 text-xs px-1 rounded-sm transition-colors ${isSelected ? 'bg-red-500' : 'bg-[#042e2d]'}`}>
                          {labelText}
                        </div>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setHiddenAnnotationIndices((prev) => [...prev, i]);}} 
                        className="absolute -top-6 right-0 bg-gray-900 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20" 
                        title="Ocultar anotação">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            {detectType === 'Máscaras de segmentação' &&
              boundingBoxMasks.map((box, i) => {
                if (hiddenAnnotationIndices.includes(i)) return null;
                const isSelected = i === activeResultIndex;
                const labelText = `${box.nr || ''} ${box.itemNr || ''}`.trim();
                return (
                  <div
                    key={i}
                    className={`group absolute bbox border-2 transition-all duration-200 ${isSelected ? 'border-red-500 scale-105 z-10' : 'border-[#042e2d]'} ${i === hoveredBox ? 'reveal' : ''}`}
                    style={{
                      transformOrigin: '0 0',
                      top: box.y * 100 + '%',
                      left: box.x * 100 + '%',
                      width: box.width * 100 + '%',
                      height: box.height * 100 + '%',
                    }}>
                    <BoxMask box={box} index={i} isSelected={isSelected} />
                     <div className="w-full h-full absolute top-0 left-0" title={`${box.risco} (NR: ${box.nr || 'N/A'}, Item: ${box.itemNr || 'N/A'}) - ${box.descricaoRisco}`}>
                       {labelText && (
                        <div className={`text-white absolute -left-[2px] -top-6 text-xs px-1 rounded-sm transition-colors ${isSelected ? 'bg-red-500' : 'bg-[#042e2d]'}`}>
                          {labelText}
                        </div>
                       )}
                       <button 
                         onClick={(e) => { e.stopPropagation(); setHiddenAnnotationIndices((prev) => [...prev, i]);}} 
                         className="absolute -top-6 right-0 bg-gray-900 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20" 
                         title="Ocultar anotação">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                       </button>
                    </div>
                  </div>
                );
              })}

            {detectType === 'Pontos' &&
              points.map((point, i) => {
                if (hiddenAnnotationIndices.includes(i)) return null;
                const isSelected = i === activeResultIndex;
                const labelText = `${point.nr || ''} ${point.itemNr || ''}`.trim();
                return (
                  <div
                    key={i}
                    className="group absolute"
                    style={{
                      left: `${point.point.x * 100}%`,
                      top: `${point.point.y * 100}%`,
                    }}>
                    <div className="relative" title={`${point.risco} (NR: ${point.nr || 'N/A'}, Item: ${point.itemNr || 'N/A'}) - ${point.descricaoRisco}`}>
                      {labelText && (
                        <div className={`absolute text-center text-white text-xs px-1 bottom-4 rounded-sm -translate-x-1/2 left-1/2 transition-colors ${isSelected ? 'bg-red-500' : 'bg-[#042e2d]'}`}>
                          {labelText}
                        </div>
                      )}
                      <div className={`absolute w-4 h-4 rounded-full border-white border-[2px] -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${isSelected ? 'bg-red-500 scale-125' : 'bg-[#042e2d]'}`}></div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setHiddenAnnotationIndices((prev) => [...prev, i]);}}
                         className="absolute -top-3 -right-5 bg-gray-900 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                         title="Ocultar anotação">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                       </button>
                    </div>
                  </div>
                );
              })}
            {detectType === 'Caixas delimitadoras 3D' && linesAndLabels3D ? (
              <>
                {linesAndLabels3D[0].map((line, i) => {
                  if (hiddenAnnotationIndices.includes(line.boxIndex)) return null;
                  const isSelected = line.boxIndex === activeResultIndex;
                  return (
                    <div
                      key={i}
                      className={`absolute h-[2px] transition-colors ${isSelected ? 'bg-red-500' : 'bg-[#042e2d]'}`}
                      style={{
                        width: `${line.length}px`,
                        transform: `translate(${line.start[0]}px, ${line.start[1]}px) rotate(${line.angle}rad)`,
                        transformOrigin: '0 0',
                        zIndex: isSelected ? 1 : 0,
                      }}></div>
                  );
                })}
                {linesAndLabels3D[1].map((labelData, i) => {
                  if (hiddenAnnotationIndices.includes(labelData.boxIndex)) return null;
                  const isSelected = labelData.boxIndex === activeResultIndex;
                  const labelText = `${labelData.nr || ''} ${labelData.itemNr || ''}`.trim();
                  return (
                    <div
                      key={i}
                      className={`group absolute text-white text-xs px-1 transition-colors ${isSelected ? 'bg-red-500' : 'bg-[#042e2d]'}`}
                      style={{
                        top: `${labelData.pos[1]}px`,
                        left: `${labelData.pos[0]}px`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isSelected ? 1 : 0,
                      }}
                      title={`${labelData.risco} (NR: ${labelData.nr || 'N/A'}, Item: ${labelData.itemNr || 'N/A'}) - ${labelData.descricaoRisco}`}
                      > 
                      {labelText}
                       <button 
                         onClick={(e) => { e.stopPropagation(); setHiddenAnnotationIndices((prev) => [...prev, labelData.boxIndex]);}}
                         className="absolute -top-1 -right-7 bg-gray-900 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20" 
                         title="Ocultar anotação">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                       </button>
                    </div>
                  );
                })}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function BoxMask({
  box,
  index,
  isSelected,
}: {
  box: BoundingBoxMaskTypeInternal; // Usa o tipo com alias
  index: number;
  isSelected: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgb = segmentationColorsRgb[index % segmentationColorsRgb.length];
  const highlightRgb = [239, 68, 68]; // Cor de destaque vermelha (red-500)

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.src = box.imageData;
        image.onload = () => {
          canvasRef.current!.width = image.width;
          canvasRef.current!.height = image.height;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, image.width, image.height);
          const data = pixels.data;
          const colorToUse = isSelected ? highlightRgb : rgb;
          for (let i = 0; i < data.length; i += 4) {
            // canal alfa da máscara
            data[i + 3] = data[i];
            // cor da paleta
            data[i] = colorToUse[0];
            data[i + 1] = colorToUse[1];
            data[i + 2] = colorToUse[2];
          }
          ctx.putImageData(pixels, 0, 0);
        };
      }
    }
  }, [canvasRef, box.imageData, rgb, isSelected, highlightRgb]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{opacity: 0.5}}
    />
  );
}