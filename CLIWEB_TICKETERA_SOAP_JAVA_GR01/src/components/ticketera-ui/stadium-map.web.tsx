/**
 * StadiumMap — Mapa Interactivo del Estadio (Web / SVG)
 * Vista 1: Estadio completo con anillos concéntricos (más caro = más cercano a la cancha)
 * Vista 2: Zoom a una tribuna mostrando sus secciones en arco
 */

import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ticketera-ui';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { AsientoCompra } from '@/lib/ticketera-api';
import { formatMoney } from '@/lib/format';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface LocalidadUI {
  codigoLocalidad: string;
  capacidad: number;
  disponibilidad: number;
  precio: number;
  asientos: AsientoCompra[];
}

export interface StadiumMapProps {
  localidades: LocalidadUI[];
  onSelectSection: (localidad: LocalidadUI, sectionIndex: number) => void;
}

// ─── Paleta: índice 0 = más caro = más cercano a la cancha ───────────────────
const ZONE_COLORS = [
  { fill: '#FFD700', stroke: '#9a6f00', text: '#4a3200', name: 'VIP' },       // dorado — primera fila
  { fill: '#5BC8F5', stroke: '#0e7ab0', text: '#073d5e', name: 'Preferente' }, // celeste
  { fill: '#69C97B', stroke: '#1e7a30', text: '#0d3b15', name: 'General' },    // verde
  { fill: '#C084E8', stroke: '#7424b8', text: '#3b0a5e', name: 'Adicional' },  // lila
  { fill: '#FF9A6C', stroke: '#c44c00', text: '#5e2000', name: 'Zona E' },     // naranja
];

const SEATS_PER_SECTION = 100;

// ─── Utilidades SVG ───────────────────────────────────────────────────────────

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function annularPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startDeg: number, endDeg: number
): string {
  const s1 = polar(cx, cy, innerR, startDeg);
  const s2 = polar(cx, cy, outerR, startDeg);
  const e1 = polar(cx, cy, outerR, endDeg);
  const e2 = polar(cx, cy, innerR, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return (
    `M ${s1.x.toFixed(1)} ${s1.y.toFixed(1)} ` +
    `L ${s2.x.toFixed(1)} ${s2.y.toFixed(1)} ` +
    `A ${outerR} ${outerR} 0 ${large} 1 ${e1.x.toFixed(1)} ${e1.y.toFixed(1)} ` +
    `L ${e2.x.toFixed(1)} ${e2.y.toFixed(1)} ` +
    `A ${innerR} ${innerR} 0 ${large} 0 ${s1.x.toFixed(1)} ${s1.y.toFixed(1)} Z`
  );
}

function annularCenter(cx: number, cy: number, innerR: number, outerR: number, startDeg: number, endDeg: number) {
  const midR = (innerR + outerR) / 2;
  const midDeg = (startDeg + endDeg) / 2;
  return polar(cx, cy, midR, midDeg);
}

// ─── Constantes del estadio (overview SVG 700×460) ───────────────────────────
const SVG_W = 700, SVG_H = 460;
const CX = SVG_W / 2, CY = SVG_H / 2; // 350, 230

// Límite exterior del estadio
const STADIUM_RX = 318, STADIUM_RY = 202;
// Pista (banda entre la cancha y la primera fila de asientos)
const TRACK_RX = 148, TRACK_RY = 89;
// La cancha (rectangulo interior)
const FIELD_W = 274, FIELD_H = 158;
const FIELD_X = CX - FIELD_W / 2, FIELD_Y = CY - FIELD_H / 2;
// Espacio disponible para los anillos de graderías
const STAND_W = STADIUM_RX - TRACK_RX; // 170
const STAND_H = STADIUM_RY - TRACK_RY; // 113

// ─── Vista General del Estadio ────────────────────────────────────────────────

interface OverviewProps {
  localidades: LocalidadUI[];
  hoveredIdx: number | null;
  onHover: (idx: number | null) => void;
  onSelect: (idx: number) => void;
  isDark: boolean;
}

function StadiumOverviewSVG({ localidades, hoveredIdx, onHover, onSelect, isDark }: OverviewProps) {
  // Ordenar ASCENDENTE por precio → el más barato (índice 0) = anillo exterior
  // El más caro = índice n-1 = anillo más interno (junto a la cancha)
  const sorted = [...localidades].sort((a, b) => a.precio - b.precio);
  const n = Math.min(sorted.length, ZONE_COLORS.length);

  const stepRX = STAND_W / n;
  const stepRY = STAND_H / n;

  // Construir datos de cada anillo
  type RingData = {
    loc: LocalidadUI;
    realIdx: number;
    outerRX: number; outerRY: number;
    innerRX: number; innerRY: number;
    midRX: number; midRY: number;
    color: typeof ZONE_COLORS[0];
    priceIdx: number; // 0 = más caro, n-1 = más barato (para asignar color)
  };

  const rings: RingData[] = sorted.map((loc, i) => {
    const outerRX = TRACK_RX + stepRX * (n - i);
    const outerRY = TRACK_RY + stepRY * (n - i);
    const innerRX = TRACK_RX + stepRX * (n - i - 1);
    const innerRY = TRACK_RY + stepRY * (n - i - 1);
    // Color: más caro (i = n-1) → ZONE_COLORS[0] (dorado); más barato (i=0) → ZONE_COLORS[n-1]
    const priceIdx = n - 1 - i; // 0 = más caro
    return {
      loc,
      realIdx: localidades.indexOf(loc),
      outerRX, outerRY,
      innerRX, innerRY,
      midRX: (outerRX + innerRX) / 2,
      midRY: (outerRY + innerRY) / 2,
      color: ZONE_COLORS[Math.min(priceIdx, ZONE_COLORS.length - 1)],
      priceIdx,
    };
  });

  // Líneas divisorias de secciones (decorativas)
  const DIVIDERS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id="ov-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isDark ? '#0e2240' : '#c8dcf5'} />
          <stop offset="100%" stopColor={isDark ? '#050e1a' : '#9ab8d8'} />
        </radialGradient>
        <radialGradient id="ov-field" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4caf50" />
          <stop offset="45%" stopColor="#388e3c" />
          <stop offset="100%" stopColor="#1b5e20" />
        </radialGradient>
        <filter id="ov-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.55)" />
        </filter>
        <filter id="ov-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Clip del estadio */}
        <clipPath id="ov-stadium-clip">
          <ellipse cx={CX} cy={CY} rx={STADIUM_RX} ry={STADIUM_RY} />
        </clipPath>
      </defs>

      {/* Sombra exterior */}
      <ellipse cx={CX} cy={CY + 8} rx={STADIUM_RX + 4} ry={STADIUM_RY + 4}
        fill="rgba(0,0,0,0.4)" filter="url(#ov-shadow)" />

      {/* Pared exterior del estadio */}
      <ellipse cx={CX} cy={CY} rx={STADIUM_RX + 6} ry={STADIUM_RY + 6}
        fill={isDark ? '#0a1520' : '#7a96b0'}
        stroke={isDark ? '#1a3050' : '#5a7898'} strokeWidth={3}
      />
      {/* Estructura interior del estadio (base de todos los anillos) */}
      <ellipse cx={CX} cy={CY} rx={STADIUM_RX} ry={STADIUM_RY}
        fill={isDark ? '#0d1e38' : '#b8d0ea'}
      />

      {/* ── Anillos de graderías (de afuera hacia adentro) ── */}
      {rings.map(({ loc, realIdx, outerRX, outerRY, color }) => {
        const isHov = hoveredIdx === realIdx;
        const hasSeats = (loc.asientos?.length ?? 0) > 0;
        // Colores: normal, hovered, con asientos
        const fillColor = isHov
          ? color.fill
          : hasSeats
          ? color.fill + 'E8'
          : color.fill + 'B0';
        const strokeColor = isHov ? color.stroke : color.stroke + '70';

        return (
          <g key={loc.codigoLocalidad}>
            {/* Ellipse sólida (desde su radio exterior hacia el interior) */}
            <ellipse
              cx={CX} cy={CY} rx={outerRX} ry={outerRY}
              fill={fillColor}
              stroke={strokeColor} strokeWidth={isHov ? 2.5 : 1}
              filter={isHov ? 'url(#ov-glow)' : undefined}
              style={{ cursor: 'pointer', transition: 'fill 0.18s, stroke-width 0.18s' }}
              onMouseEnter={() => onHover(realIdx)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(realIdx)}
            />
          </g>
        );
      })}

      {/* Líneas divisorias radiales decorativas */}
      {DIVIDERS.map(angle => {
        const inner = polar(CX, CY, TRACK_RX + 1, angle);
        const outer = polar(CX, CY, STADIUM_RX - 1, angle);
        return (
          <line key={angle}
            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke={isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)'}
            strokeWidth={1}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}

      {/* Pista / track alrededor de la cancha */}
      <ellipse cx={CX} cy={CY} rx={TRACK_RX} ry={TRACK_RY}
        fill={isDark ? '#1b2e1b' : '#4d7a3a'}
        style={{ pointerEvents: 'none' }}
      />

      {/* ── Cancha de fútbol ── */}
      {/* Fondo verde */}
      <rect x={FIELD_X} y={FIELD_Y} width={FIELD_W} height={FIELD_H}
        fill="url(#ov-field)"
        style={{ pointerEvents: 'none' }}
      />
      {/* Bandas del césped (franjas decorativas horizontales) */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i}
          x={FIELD_X} y={FIELD_Y + i * (FIELD_H / 6)}
          width={FIELD_W} height={FIELD_H / 6}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent'}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* ── Marcas de la cancha ── */}
      {/* Borde exterior de la cancha */}
      <rect x={FIELD_X + 4} y={FIELD_Y + 4} width={FIELD_W - 8} height={FIELD_H - 8}
        fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1.5}
        style={{ pointerEvents: 'none' }}
      />
      {/* Línea central */}
      <line x1={CX} y1={FIELD_Y + 4} x2={CX} y2={FIELD_Y + FIELD_H - 4}
        stroke="rgba(255,255,255,0.75)" strokeWidth={1.5}
        style={{ pointerEvents: 'none' }}
      />
      {/* Círculo central */}
      <circle cx={CX} cy={CY} r={26}
        fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={1.5}
        style={{ pointerEvents: 'none' }}
      />
      {/* Punto central */}
      <circle cx={CX} cy={CY} r={2.5}
        fill="rgba(255,255,255,0.85)"
        style={{ pointerEvents: 'none' }}
      />
      {/* Área grande izquierda */}
      <rect x={FIELD_X + 4} y={CY - 40} width={52} height={80}
        fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.2}
        style={{ pointerEvents: 'none' }}
      />
      {/* Área pequeña izquierda */}
      <rect x={FIELD_X + 4} y={CY - 18} width={22} height={36}
        fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.2}
        style={{ pointerEvents: 'none' }}
      />
      {/* Punto penal izquierdo */}
      <circle cx={FIELD_X + 38} cy={CY} r={2}
        fill="rgba(255,255,255,0.75)"
        style={{ pointerEvents: 'none' }}
      />
      {/* Área grande derecha */}
      <rect x={FIELD_X + FIELD_W - 56} y={CY - 40} width={52} height={80}
        fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.2}
        style={{ pointerEvents: 'none' }}
      />
      {/* Área pequeña derecha */}
      <rect x={FIELD_X + FIELD_W - 26} y={CY - 18} width={22} height={36}
        fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.2}
        style={{ pointerEvents: 'none' }}
      />
      {/* Punto penal derecho */}
      <circle cx={FIELD_X + FIELD_W - 38} cy={CY} r={2}
        fill="rgba(255,255,255,0.75)"
        style={{ pointerEvents: 'none' }}
      />
      {/* Arcos de córner */}
      {[
        { cx: FIELD_X + 4, cy: FIELD_Y + 4, start: 0, end: 90 },
        { cx: FIELD_X + FIELD_W - 4, cy: FIELD_Y + 4, start: 90, end: 180 },
        { cx: FIELD_X + FIELD_W - 4, cy: FIELD_Y + FIELD_H - 4, start: 180, end: 270 },
        { cx: FIELD_X + 4, cy: FIELD_Y + FIELD_H - 4, start: 270, end: 360 },
      ].map(({ cx, cy, start, end }, i) => {
        const x1 = cx + 10 * Math.cos((start * Math.PI) / 180);
        const y1 = cy + 10 * Math.sin((start * Math.PI) / 180);
        const x2 = cx + 10 * Math.cos((end * Math.PI) / 180);
        const y2 = cy + 10 * Math.sin((end * Math.PI) / 180);
        return (
          <path key={i}
            d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A 10 10 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
            fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.2}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
      {/* Arcos de penales */}
      <path
        d={`M ${(FIELD_X + 60).toFixed(1)} ${(CY - 20).toFixed(1)} A 28 28 0 0 1 ${(FIELD_X + 60).toFixed(1)} ${(CY + 20).toFixed(1)}`}
        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1}
        style={{ pointerEvents: 'none' }}
      />
      <path
        d={`M ${(FIELD_X + FIELD_W - 60).toFixed(1)} ${(CY + 20).toFixed(1)} A 28 28 0 0 1 ${(FIELD_X + FIELD_W - 60).toFixed(1)} ${(CY - 20).toFixed(1)}`}
        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1}
        style={{ pointerEvents: 'none' }}
      />

      {/* ── Etiquetas de cada anillo ── */}
      {rings.map(({ loc, realIdx, midRX, midRY, color, priceIdx }) => {
        const isHov = hoveredIdx === realIdx;
        const fontSize = isHov ? 12 : 10;
        const priceLabel = priceIdx === 0 ? '★ ' : '';

        return (
          <g key={`lbl-${loc.codigoLocalidad}`} style={{ pointerEvents: 'none' }}>
            {/* Etiqueta ARRIBA */}
            <rect
              x={CX - 58} y={CY - midRY - 9}
              width={116} height={16}
              rx={4} ry={4}
              fill={isHov ? color.fill + 'CC' : 'rgba(0,0,0,0.3)'}
            />
            <text x={CX} y={CY - midRY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={fontSize} fontWeight={isHov ? 'bold' : 'normal'}
              fill={isHov ? color.text : '#fff'}
            >
              {priceLabel}{loc.codigoLocalidad.length > 14 ? loc.codigoLocalidad.slice(0, 13) + '…' : loc.codigoLocalidad}
            </text>
            {/* Etiqueta ABAJO */}
            <rect
              x={CX - 44} y={CY + midRY - 8}
              width={88} height={14}
              rx={4} ry={4}
              fill={isHov ? color.fill + 'CC' : 'rgba(0,0,0,0.3)'}
            />
            <text x={CX} y={CY + midRY}
              textAnchor="middle" dominantBaseline="central"
              fontSize={9} fill={isHov ? color.text : 'rgba(255,255,255,0.85)'}
            >
              {formatMoney(loc.precio || 0)}
            </text>

            {/* Badge de asientos ya en el carrito */}
            {(loc.asientos?.length ?? 0) > 0 && (
              <>
                <circle
                  cx={CX + midRX - 4} cy={CY - midRY + 14}
                  r={11} fill={color.stroke}
                />
                <text
                  x={CX + midRX - 4} y={CY - midRY + 14}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={9} fontWeight="bold" fill="#fff"
                >
                  {loc.asientos.length}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Instrucción cuando no hay hover */}
      {hoveredIdx === null && (
        <text x={CX} y={SVG_H - 16}
          textAnchor="middle" fontSize={11}
          fill={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
          style={{ pointerEvents: 'none' }}
        >
          🖱 Haz clic en una zona para ver las secciones
        </text>
      )}
    </svg>
  );
}

// ─── Vista Zoom: Secciones de una Tribuna ────────────────────────────────────

interface ZoomProps {
  localidad: LocalidadUI;
  colorScheme: typeof ZONE_COLORS[0];
  onSectionClick: (sectionIndex: number) => void;
  isDark: boolean;
}

function LocalitySectionsView({ localidad, colorScheme, onSectionClick, isDark }: ZoomProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  // Guardamos contra capacidad undefined/0 → fallback 1000
  const capacidad = localidad.capacidad || 1000;
  const totalSections = Math.ceil(capacidad / SEATS_PER_SECTION);

  // Secciones que ya tienen asientos seleccionados
  const selectedSectionNames = new Set(
    (localidad.asientos || []).map(a => a.seccion)
  );

  // ── Geometría del arco ──────────────────────────────────────────────────────
  // CZY está MÁS ABAJO que el viewport (360px) → el arco abre hacia ARRIBA
  // polar(cx,cy,r,0°) = punto ARRIBA del centro, por eso centramos en 0°
  const CZX = 350, CZY = 375;
  const INNER_R = 200;  // borde interior de la gradería (cerca de la cancha)
  const OUTER_R = 280;  // borde exterior de la gradería

  // Arco de -75° a 75° centrado en 0° (recto hacia arriba)
  // Con CZY=430, INNER_R=195, los extremos quedan en y ≈ 430-195×cos(75°) ≈ 380 → visible
  const ARC_START = -75;
  const ARC_END = 75;
  const ARC_SPAN = ARC_END - ARC_START; // 150°

  // Máximo 20 secciones por fila para que sean legibles
  const MAX_PER_ROW = Math.min(totalSections, 20);
  const ROWS = Math.max(1, Math.ceil(totalSections / MAX_PER_ROW));
  const RING_THICKNESS = Math.max(1, (OUTER_R - INNER_R) / ROWS);

  type Sector = {
    sectionIdx: number;
    path: string;
    cx: number; cy: number;
  };

  const sectors: Sector[] = [];

  for (let row = 0; row < ROWS; row++) {
    const innerR = INNER_R + row * RING_THICKNESS;
    const outerR = innerR + RING_THICKNESS - 2;
    const firstSection = row * MAX_PER_ROW;
    const lastSection = Math.min(firstSection + MAX_PER_ROW, totalSections);
    const sectionsInRow = lastSection - firstSection;
    if (sectionsInRow <= 0) break;

    const sectorSpan = ARC_SPAN / sectionsInRow;

    for (let col = 0; col < sectionsInRow; col++) {
      const sectionIdx = firstSection + col;
      const startAngle = ARC_START + col * sectorSpan;
      const endAngle = startAngle + sectorSpan - 0.6;
      const path = annularPath(CZX, CZY, innerR, outerR, startAngle, endAngle);
      const { x: scx, y: scy } = annularCenter(CZX, CZY, innerR, outerR, startAngle, endAngle);
      sectors.push({ sectionIdx, path, cx: scx, cy: scy });
    }
  }

  const getSectorFill = (idx: number): string => {
    const name = `Sección ${idx + 1}`;
    if (hoveredSection === idx) return colorScheme.stroke;
    if (selectedSectionNames.has(name)) return colorScheme.stroke + 'CC';
    return colorScheme.fill + 'BB';
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg
        viewBox="0 0 700 360"
        style={{ width: '100%', maxWidth: 720, display: 'block' }}
      >
        <defs>
          <radialGradient id="zv-bg" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor={colorScheme.fill} stopOpacity="0.18" />
            <stop offset="100%" stopColor={colorScheme.fill} stopOpacity="0.03" />
          </radialGradient>
          <filter id="zv-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Fondo degradado */}
        <rect x="0" y="0" width="700" height="360" fill="url(#zv-bg)" rx="12" />

        {/* Sectores clickeables */}
        {sectors.map(({ sectionIdx, path, cx, cy }) => {
          const isHov = hoveredSection === sectionIdx;
          const isSelected = selectedSectionNames.has(`Sección ${sectionIdx + 1}`);
          return (
            <g key={sectionIdx}>
              <path
                d={path}
                fill={getSectorFill(sectionIdx)}
                stroke={isHov || isSelected ? colorScheme.stroke : colorScheme.stroke + '55'}
                strokeWidth={isHov ? 2 : 1}
                filter={isHov ? 'url(#zv-glow)' : undefined}
                style={{ cursor: 'pointer', transition: 'fill 0.12s' }}
                onMouseEnter={() => setHoveredSection(sectionIdx)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => onSectionClick(sectionIdx)}
              />
              {totalSections <= 60 && (
                <text
                  x={cx} y={cy}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={ROWS > 2 ? 7 : ROWS > 1 ? 8 : totalSections <= 12 ? 13 : 10}
                  fontWeight={isHov || isSelected ? 'bold' : 'normal'}
                  fill={isHov || isSelected ? '#fff' : colorScheme.text}
                  style={{ pointerEvents: 'none' }}
                >
                  {String(sectionIdx + 1)}
                </text>
              )}
              {/* Punto de selección para secciones muy pequeñas */}
              {totalSections > 50 && isSelected && (
                <circle cx={cx} cy={cy} r={3} fill="#fff" style={{ pointerEvents: 'none' }} />
              )}
            </g>
          );
        })}

        {/* Zona de la cancha (decorativa) */}
        <path
          d={annularPath(CZX, CZY, INNER_R - 18, INNER_R - 3, ARC_START, ARC_END)}
          fill={isDark ? '#1a3a1a' : '#2d6b30'}
          stroke={isDark ? '#2e5a2e' : '#3a8c40'}
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
        <text
          x={350} y={CZY - INNER_R + 6}
          textAnchor="middle" dominantBaseline="auto"
          fontSize={10} fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.85)'}
          style={{ pointerEvents: 'none' }}
        >
          ⚽ Cancha
        </text>

        {/* Tooltip hover */}
        {hoveredSection !== null && (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={224} y={8} width={252} height={44} rx={10}
              fill={isDark ? '#0f1e2f' : '#fff'}
              stroke={colorScheme.stroke} strokeWidth={1.5}
              opacity={0.96}
            />
            <text x={350} y={24} textAnchor="middle" fontSize={13} fontWeight="bold"
              fill={isDark ? '#E6F2FF' : '#0B1B2B'}>
              Sección {hoveredSection + 1}
            </text>
            <text x={350} y={42} textAnchor="middle" fontSize={10}
              fill={isDark ? '#9CB7D7' : '#3B5F84'}>
              Haz clic para seleccionar asientos
            </text>
          </g>
        )}

        {/* Instrucción */}
        {hoveredSection === null && (
          <text x={350} y={22} textAnchor="middle" fontSize={11}
            fill={isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.32)'}
            style={{ pointerEvents: 'none' }}
          >
            Haz clic en una sección del arco para ver los asientos disponibles
          </text>
        )}
      </svg>

      {totalSections > 50 && (
        <div style={{
          fontSize: 11,
          color: isDark ? '#9CB7D7' : '#3B5F84',
          textAlign: 'center',
          padding: '0 16px',
        }}>
          {String(totalSections)} secciones en total · Cada sector del arco representa una sección
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function StadiumMap({ localidades, onSelectSection }: StadiumMapProps) {
  const theme = useTheme();
  const isDark = theme.background === '#07121D';

  const [viewMode, setViewMode] = useState<'overview' | 'zoom'>('overview');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedLocalidadIdx, setSelectedLocalidadIdx] = useState<number | null>(null);

  // Orden de colores basado en precio descendente (más caro = ZONE_COLORS[0] = dorado)
  const sortedDesc = [...localidades].sort((a, b) => b.precio - a.precio);

  const handleZoneSelect = useCallback((localidadIdx: number) => {
    setSelectedLocalidadIdx(localidadIdx);
    setViewMode('zoom');
  }, []);

  const handleBack = useCallback(() => {
    setViewMode('overview');
    setSelectedLocalidadIdx(null);
    setHoveredIdx(null);
  }, []);

  const selectedLocalidad = selectedLocalidadIdx !== null ? localidades[selectedLocalidadIdx] : null;

  // Encontrar el color correcto para la localidad seleccionada
  const selectedColorIdx = selectedLocalidad
    ? sortedDesc.findIndex(l => l.codigoLocalidad === selectedLocalidad.codigoLocalidad)
    : 0;
  const selectedColor = ZONE_COLORS[Math.min(selectedColorIdx, ZONE_COLORS.length - 1)];

  // Guardamos contra capacidad undefined
  const capacidad = selectedLocalidad?.capacidad || 1000;
  const totalSections = Math.ceil(capacidad / SEATS_PER_SECTION);

  return (
    <View style={[styles.container, { borderColor: theme.stroke, backgroundColor: theme.background }]}>
      {/* ── Cabecera ── */}
      <View style={styles.header}>
        {viewMode === 'zoom' && (
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              ← Volver al Estadio
            </ThemedText>
          </Pressable>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText type="smallBold" style={{ fontSize: 15 }}>
            {viewMode === 'overview' ? '🏟️ Mapa del Estadio' : `📍 ${selectedLocalidad?.codigoLocalidad}`}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {viewMode === 'overview'
              ? 'Haz clic en una zona — el anillo dorado (más cercano) es la localidad más cara'
              : `${String(totalSections)} secciones · ${String(selectedLocalidad?.disponibilidad ?? 0)} asientos disponibles`}
          </ThemedText>
        </View>
      </View>

      {/* ── Leyenda de localidades (overview) ── */}
      {viewMode === 'overview' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendContainer}>
          {sortedDesc.map((loc, i) => {
            const col = ZONE_COLORS[Math.min(i, ZONE_COLORS.length - 1)];
            const realIdx = localidades.indexOf(loc);
            const isHov = hoveredIdx === realIdx;
            return (
              <Pressable
                key={loc.codigoLocalidad}
                onPress={() => handleZoneSelect(realIdx)}
                style={[
                  styles.legendItem,
                  { borderColor: isHov ? col.stroke : theme.stroke,
                    backgroundColor: isHov ? col.fill + '33' : 'transparent' },
                ]}
              >
                <View style={[styles.legendDot, { backgroundColor: col.fill, borderColor: col.stroke }]} />
                <View>
                  <ThemedText type="smallBold"
                    style={{ fontSize: 11, color: isHov ? col.stroke : theme.text }}>
                    {i === 0 ? '★ ' : ''}{loc.codigoLocalidad}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 10 }}>
                    {formatMoney(loc.precio || 0)} · {String(loc.disponibilidad)} disp.
                    {(loc.asientos?.length ?? 0) > 0 ? ` · ✓ ${String(loc.asientos.length)}` : ''}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* ── Área del mapa SVG ── */}
      <View style={styles.mapArea}>
        {viewMode === 'overview' ? (
          <StadiumOverviewSVG
            localidades={localidades}
            hoveredIdx={hoveredIdx}
            onHover={setHoveredIdx}
            onSelect={handleZoneSelect}
            isDark={isDark}
          />
        ) : selectedLocalidad ? (
          <LocalitySectionsView
            localidad={selectedLocalidad}
            colorScheme={selectedColor}
            onSectionClick={idx => onSelectSection(selectedLocalidad, idx)}
            isDark={isDark}
          />
        ) : null}
      </View>

      {/* ── Panel de info: hover en overview ── */}
      {viewMode === 'overview' && hoveredIdx !== null && (() => {
        const loc = localidades[hoveredIdx];
        const ci = sortedDesc.findIndex(l => l.codigoLocalidad === loc.codigoLocalidad);
        const col = ZONE_COLORS[Math.min(ci, ZONE_COLORS.length - 1)];
        return (
          <View style={[styles.infoPanel, { backgroundColor: theme.backgroundElement, borderColor: theme.stroke }]}>
            <View style={styles.infoPanelRow}>
              <View style={[styles.legendDot, { backgroundColor: col.fill, borderColor: col.stroke }]} />
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText type="smallBold">{loc.codigoLocalidad}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatMoney(loc.precio || 0)} por asiento · {String(loc.disponibilidad)} disponibles / {String(loc.capacidad || 0)} capacidad
                </ThemedText>
              </View>
              <ActionButton label="Ver Secciones" variant="primary"
                onPress={() => handleZoneSelect(hoveredIdx)} />
            </View>
          </View>
        );
      })()}

      {/* ── Panel de info: zoom ── */}
      {viewMode === 'zoom' && selectedLocalidad && (
        <View style={[styles.infoPanel, { backgroundColor: theme.backgroundElement, borderColor: theme.stroke }]}>
          <View style={styles.infoPanelGrid}>
            {[
              { label: 'Precio base', value: formatMoney(selectedLocalidad.precio || 0), accent: true },
              { label: 'Disponibles', value: String(selectedLocalidad.disponibilidad), accent: false },
              { label: 'Secciones', value: String(totalSections), accent: false },
              { label: 'Seleccionados', value: String(selectedLocalidad.asientos?.length ?? 0), accent: (selectedLocalidad.asientos?.length ?? 0) > 0 },
            ].map(({ label, value, accent }) => (
              <View key={label} style={styles.infoPanelCell}>
                <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
                <ThemedText type="smallBold" style={accent ? { color: theme.accent } : undefined}>
                  {value}
                </ThemedText>
              </View>
            ))}
          </View>
          <ThemedText type="small" themeColor="textSecondary"
            style={{ textAlign: 'center', marginTop: 4 }}>
            ↑ Selecciona una sección del arco para ver y elegir asientos
          </ThemedText>
        </View>
      )}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  backBtn: {
    paddingVertical: Spacing.one,
    paddingRight: Spacing.two,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  mapArea: {
    paddingHorizontal: Spacing.two,
    minHeight: 300,
  },
  infoPanel: {
    marginHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  infoPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  infoPanelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  infoPanelCell: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    gap: 2,
  },
});
