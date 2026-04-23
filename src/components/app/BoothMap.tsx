'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Footprints } from 'lucide-react';
import type { Meeting, Tier } from '@/lib/types';

/**
 * Mandalay Bay Convention Center — Bayside Halls A–D
 * Schematic of the Licensing Expo 2026 show floor.
 *
 * Source: licensing26.mapyourshow.com · May 19–21, 2026
 * Zones (color-coded per the official floor plan):
 *   networking  — Networking Zone (pink)
 *   brands      — Brands & Agents (yellow)
 *   art         — Art & Design (peach)
 *   exec        — Executive Suites
 *   chars       — Characters & Entertainment (purple, east half)
 *   sports      — Sports Pavilion (orange, inside Characters top)
 *   intl        — International Pavilion (inside Characters south)
 *
 * Booth format: real IDs like A79, G170, N180, R224-1, U210.
 * Walking-time estimate: 1 px ≈ 0.5 m + 30s per stop for entry.
 */

// ============================================================
// ZONES — colored background regions
// ============================================================

type Zone = { id: string; x: number; y: number; w: number; h: number; fill: string; stroke: string; label: string };

const ZONES: Zone[] = [
  { id: 'networking', x: 40,  y: 55,  w: 280, h: 95,  fill: '#F9E1EC', stroke: '#E8B3C7', label: 'NETWORKING ZONE' },
  { id: 'brands',     x: 40,  y: 155, w: 280, h: 170, fill: '#FAF5DC', stroke: '#D9C97B', label: 'BRANDS & AGENTS' },
  { id: 'art',        x: 40,  y: 335, w: 170, h: 95,  fill: '#F5E3D1', stroke: '#CFA879', label: 'ART & DESIGN' },
  { id: 'exec',       x: 40,  y: 440, w: 280, h: 75,  fill: '#F4EEC8', stroke: '#C9B666', label: 'EXECUTIVE SUITES' },
  { id: 'chars',      x: 330, y: 55,  w: 350, h: 460, fill: '#EBE3F2', stroke: '#B9A5D2', label: 'CHARACTERS & ENTERTAINMENT' },
  { id: 'sports',     x: 340, y: 70,  w: 105, h: 60,  fill: '#F9D9BF', stroke: '#D89362', label: 'SPORTS PAVILION' },
  { id: 'intl',       x: 470, y: 445, w: 110, h: 65,  fill: '#DCC6E8', stroke: '#8B6CAE', label: 'INTL PAVILION' },
];

// ============================================================
// BOOTHS — accurate IDs + positions from mapyourshow.com
// ============================================================

type Booth = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tier?: Tier;
  kind?: 'stage' | 'lounge' | 'lounge_green' | 'feature' | 'cluster';
};

const BOOTHS: Booth[] = [
  // NETWORKING ZONE
  { id: 'A79',    name: 'License Global Main Stage',     x: 50,  y: 65,  w: 78, h: 50, kind: 'stage' },
  { id: 'A119',   name: 'Licensing International',       x: 185, y: 65,  w: 50, h: 30 },
  { id: 'A131',   name: 'The Networking Hub',            x: 250, y: 65,  w: 55, h: 55, kind: 'lounge' },
  { id: 'A122',   name: 'Matchmaking Lounge',            x: 137, y: 95,  w: 45, h: 28, kind: 'lounge_green' },
  { id: 'A116',   name: 'Global Licensing Group Hub',    x: 187, y: 100, w: 52, h: 22 },

  // BRANDS & AGENTS
  { id: 'C88',    name: 'Cool Brands Café',              x: 50,  y: 160, w: 60, h: 24, kind: 'lounge_green' },
  { id: 'B154',   name: 'The Coca-Cola Company',         x: 155, y: 160, w: 60, h: 36, tier: 'tier_1' },
  { id: 'A138',   name: 'Earthbound Brands',             x: 115, y: 160, w: 38, h: 26 },
  { id: 'D102',   name: 'Cool Brands',                   x: 63,  y: 192, w: 38, h: 22 },
  { id: 'C144',   name: 'NASCAR',                        x: 225, y: 170, w: 40, h: 22, tier: 'tier_1' },
  { id: 'D136',   name: 'Artestar',                      x: 155, y: 200, w: 35, h: 22 },
  { id: 'F106',   name: 'Adventure Media',               x: 75,  y: 225, w: 48, h: 22 },
  { id: 'G142',   name: 'IMG',                           x: 130, y: 225, w: 45, h: 22 },
  { id: 'G156',   name: 'CAA Brand Mgmt / Beanstalk',    x: 185, y: 215, w: 118, h: 65, tier: 'tier_1' },
  { id: 'F142',   name: 'OUTERSTUFF',                    x: 130, y: 255, w: 50, h: 22 },
  { id: 'E142',   name: 'Republic Brands Group',         x: 65,  y: 260, w: 55, h: 22 },
  { id: 'D124',   name: 'Jewel Branding',                x: 63,  y: 294, w: 48, h: 24 },

  // ART & DESIGN
  { id: 'G118',   name: 'Creative Hub',                  x: 55,  y: 350, w: 48, h: 24, kind: 'lounge' },
  { id: 'H108',   name: 'PAN AM',                        x: 110, y: 350, w: 38, h: 22 },
  { id: 'H114',   name: 'Hang Ten',                      x: 155, y: 350, w: 42, h: 22 },
  { id: 'G124',   name: 'Evolution',                     x: 63,  y: 385, w: 45, h: 22 },
  { id: 'ART_POOL', name: 'Art · 30+ exhibitors',        x: 115, y: 385, w: 85, h: 34, kind: 'cluster' },

  // EXECUTIVE SUITES
  { id: 'SANRIO', name: 'Sanrio (cluster)',              x: 50,  y: 455, w: 55, h: 48 },
  { id: 'J122',   name: 'Toei Animation',                x: 115, y: 455, w: 42, h: 28 },
  { id: 'J132',   name: 'Platinum Lounge · Angry Birds', x: 163, y: 455, w: 60, h: 28, kind: 'lounge_green' },
  { id: 'J108',   name: 'Global Icons',                  x: 232, y: 455, w: 40, h: 22 },
  { id: 'K122',   name: 'Informa',                       x: 225, y: 485, w: 80, h: 26 },

  // SPORTS PAVILION
  { id: 'A204_2', name: 'OneTeam Partners',              x: 345, y: 78,  w: 45, h: 20 },
  { id: 'A204_3', name: 'NFLPA',                         x: 392, y: 78,  w: 30, h: 20, tier: 'tier_1' },
  { id: 'A204_4', name: 'MLB Players, Inc.',             x: 345, y: 100, w: 45, h: 22, tier: 'tier_1' },
  { id: 'B203_1', name: 'Newcastle United FC',           x: 392, y: 100, w: 43, h: 22, tier: 'tier_1' },

  // CHARACTERS & ENTERTAINMENT (top — north)
  { id: 'A188',   name: 'Tokyo Broadcasting Sys. (TBS)', x: 455, y: 78,  w: 50, h: 24, tier: 'tier_2' },
  { id: 'A209',   name: 'Nintendo',                      x: 520, y: 68,  w: 70, h: 56, tier: 'tier_2' },
  { id: 'A214',   name: 'Perryscope',                    x: 600, y: 78,  w: 45, h: 22 },

  // Row 2 — entertainment row
  { id: 'C214',   name: 'Kodansha, Ltd.',                x: 540, y: 130, w: 55, h: 25 },
  { id: 'D170',   name: 'Bravado',                       x: 340, y: 140, w: 52, h: 35 },
  { id: 'D188',   name: 'The Smiley Company',            x: 400, y: 140, w: 48, h: 25 },
  { id: 'E196',   name: 'Aniplex of America',            x: 455, y: 140, w: 45, h: 25 },

  // Row 3 — Bandai / Riot / hololive
  { id: 'F170',   name: 'BANDAI NAMCO Entertainment',    x: 340, y: 180, w: 60, h: 30, tier: 'tier_2' },
  { id: 'F182',   name: 'tokidoki',                      x: 405, y: 175, w: 35, h: 22 },
  { id: 'F188',   name: 'Avatar World',                  x: 445, y: 175, w: 35, h: 22 },
  { id: 'F204',   name: 'Riot Games',                    x: 485, y: 175, w: 45, h: 22 },
  { id: 'G214',   name: 'hololive production',           x: 555, y: 165, w: 50, h: 30 },
  { id: 'H226',   name: 'B.DUCK',                        x: 615, y: 165, w: 32, h: 22 },

  // Row 4 — Hasbro/LEGO
  { id: 'G170',   name: 'Hasbro Licensed Consumer Products', x: 340, y: 215, w: 70, h: 55, tier: 'tier_1' },
  { id: 'G188',   name: 'LEGO Systems A/S',              x: 415, y: 215, w: 50, h: 40, tier: 'tier_1' },
  { id: 'G204',   name: 'Peanuts Worldwide',             x: 470, y: 215, w: 50, h: 30 },
  { id: 'H214',   name: 'Legendary Entertainment',       x: 540, y: 202, w: 55, h: 28 },
  { id: 'L218',   name: 'Tetris',                        x: 605, y: 202, w: 38, h: 28 },

  // Row 5 — Pokémon/Sony/Panini
  { id: 'N180',   name: 'The Pokémon Company Intl.',     x: 340, y: 275, w: 70, h: 50, tier: 'tier_1' },
  { id: 'N204',   name: 'BBC Studios',                   x: 415, y: 275, w: 50, h: 30 },
  { id: 'N214',   name: 'Sony Pictures / Crunchyroll',   x: 470, y: 265, w: 70, h: 42, tier: 'tier_2' },
  { id: 'K230',   name: 'CD PROJEKT RED',                x: 545, y: 245, w: 45, h: 25 },
  { id: 'N236',   name: 'Panini America',                x: 545, y: 280, w: 52, h: 30, tier: 'tier_1' },
  { id: 'N250',   name: 'Bushiroad',                     x: 600, y: 280, w: 40, h: 30, tier: 'tier_2' },

  // Row 6 — Paramount/WBD
  { id: 'O180',   name: 'Paramount Skydance',            x: 340, y: 330, w: 70, h: 45, tier: 'tier_1' },
  { id: 'O214',   name: 'Warner Bros. Discovery',        x: 470, y: 315, w: 75, h: 50, tier: 'tier_1' },
  { id: 'R214',   name: 'Moonbug Entertainment',         x: 415, y: 330, w: 50, h: 30 },
  { id: 'S226',   name: 'Amazon MGM Studios',            x: 555, y: 325, w: 60, h: 50, tier: 'tier_2' },

  // Row 7 — Mattel row
  { id: 'J192',   name: 'Spin Master',                   x: 340, y: 380, w: 52, h: 30 },
  { id: 'Q202',   name: 'Crayola / Crayola Studios',     x: 398, y: 380, w: 50, h: 32, tier: 'tier_2' },
  { id: 'Q214',   name: 'Ubisoft',                       x: 455, y: 380, w: 48, h: 32, tier: 'tier_2' },
  { id: 'R180',   name: 'Mattel',                        x: 340, y: 418, w: 58, h: 50, tier: 'tier_1' },
  { id: 'S214',   name: 'Jazwares / Negosh',             x: 405, y: 418, w: 55, h: 25 },

  // Bottom row — NBCU/SEGA
  { id: 'U188',   name: 'NBC Universal',                 x: 340, y: 475, w: 60, h: 32, tier: 'tier_2' },
  { id: 'U210',   name: 'SEGA',                          x: 405, y: 475, w: 50, h: 32, tier: 'tier_1' },
  { id: 'U224',   name: 'SEGA Café',                     x: 460, y: 475, w: 60, h: 32, kind: 'lounge_green' },

  // INTERNATIONAL PAVILION
  { id: 'R224_1', name: 'MINISO',                        x: 475, y: 455, w: 30, h: 22, tier: 'tier_2' },
  { id: 'R224_4', name: 'Pony Canyon Inc.',              x: 508, y: 455, w: 30, h: 22 },
  { id: 'S225_4', name: 'Kadokawa Corp',                 x: 540, y: 478, w: 36, h: 28 },

  // FEATURES — outside zones
  { id: 'U252',   name: 'Tetris Obstacle Course',        x: 652, y: 410, w: 26, h: 80, kind: 'feature' },
];

const BOOTH_BY_ID: Record<string, Booth> = Object.fromEntries(BOOTHS.map((b) => [b.id, b]));

// Entrances — three access points along the central aisle per real floor plan
const ENTRANCES = [
  { id: 'n',  x: 175, y: 50,  label: 'N Entrance', dir: 'down' as const },
  { id: 'w1', x: 322, y: 380, label: 'W Entrance', dir: 'right' as const },
  { id: 'w2', x: 322, y: 460, label: 'W Entrance', dir: 'right' as const },
];

// ============================================================
// Helpers
// ============================================================

type MeetingWithTarget = Meeting & {
  target?: { company_name: string; tier: Tier } | null;
};

function parseBooth(location: string | null): Booth | null {
  if (!location) return null;
  const m = location.match(/\b([A-Z]\d{2,4}(?:[-_]\d+)?)\b/);
  if (!m) return null;
  const id = m[1].replace('-', '_');
  return BOOTH_BY_ID[id] ?? null;
}

function pinPosition(booth: Booth, index: number): { x: number; y: number } {
  const jitter = (index % 3) * 4 - 4;
  return {
    x: booth.x + booth.w / 2 + jitter,
    y: booth.y + booth.h / 2 + jitter,
  };
}

function tierColor(tier: Tier | null | undefined): string {
  if (tier === 'tier_1') return '#C08A30';
  if (tier === 'tier_2') return '#14595B';
  if (tier === 'retailer') return '#8B2A1F';
  return '#5A6B6D';
}

function boothFill(b: Booth): string {
  if (b.kind === 'stage') return '#0B2F31';
  if (b.kind === 'lounge_green') return '#B7DFC5';
  if (b.kind === 'lounge') return '#F9D9E6';
  if (b.kind === 'feature') return '#F9D9BF';
  if (b.kind === 'cluster') return 'rgba(255,255,255,0.5)';
  if (b.tier === 'tier_1') return '#FBF1DA';
  if (b.tier === 'tier_2') return '#EAF1F0';
  return '#FFFFFF';
}

function boothStroke(b: Booth): string {
  if (b.tier === 'tier_1') return '#C08A30';
  if (b.tier === 'tier_2') return '#14595B';
  if (b.kind === 'stage') return '#0B2F31';
  if (b.kind === 'feature') return '#D89362';
  return 'rgba(11,47,49,0.25)';
}

function boothTextColor(b: Booth): string {
  if (b.kind === 'stage') return '#FFFFFF';
  if (b.tier === 'tier_1') return '#8B6215';
  if (b.tier === 'tier_2') return '#0B2F31';
  return '#14171A';
}

function walkSeconds(pxDistance: number): number {
  const metersPerPx = 0.5;
  const walkSpeedMs = 1.1;
  return Math.round((pxDistance * metersPerPx) / walkSpeedMs);
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  return `${m}m`;
}

function hmLA(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
}

// ============================================================
// Component
// ============================================================

type Pin = {
  meeting: MeetingWithTarget;
  booth: Booth;
  x: number;
  y: number;
};

export function BoothMap({ meetings, date }: { meetings: MeetingWithTarget[]; date: string }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const pins = useMemo<Pin[]>(() => {
    const items: Pin[] = [];
    for (const m of meetings) {
      if (m.start_at.slice(0, 10) !== date) continue;
      const booth = parseBooth(m.location);
      if (!booth) continue;
      const pos = pinPosition(booth, items.length);
      items.push({ meeting: m, booth, ...pos });
    }
    return items.sort((a, b) => a.meeting.start_at.localeCompare(b.meeting.start_at));
  }, [meetings, date]);

  // Walking route legs
  const totalWalkSec = useMemo(() => {
    if (pins.length < 2) return pins.length * 30;
    let total = pins.length * 30;
    for (let i = 1; i < pins.length; i++) {
      const dx = pins[i].x - pins[i - 1].x;
      const dy = pins[i].y - pins[i - 1].y;
      total += walkSeconds(Math.sqrt(dx * dx + dy * dy));
    }
    return total;
  }, [pins]);

  const routePath = pins.length > 1
    ? 'M' + pins.map((p) => `${p.x},${p.y}`).join(' L ')
    : '';

  function meetingState(m: Meeting): 'done' | 'live' | 'upcoming' {
    if (m.status === 'completed' || m.status === 'no_show' || m.status === 'cancelled') return 'done';
    const start = new Date(m.start_at).getTime();
    const end = new Date(m.end_at).getTime();
    if (now >= start && now <= end) return 'live';
    if (now > end) return 'done';
    return 'upcoming';
  }

  if (pins.length === 0) {
    return (
      <div className="card card-p text-center text-xs text-tag-cold">
        No booth-based meetings on this day. Add a booth ID like <span className="font-mono">G156</span> or <span className="font-mono">N180</span> to meetings to map them.
      </div>
    );
  }

  return (
    <div>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-gold-dark">Booth Map</div>
            <h3 className="text-sm font-semibold leading-tight">Mandalay Bay · Bayside Halls A–D · {pins.length} stops</h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-tag-cold">
            <Footprints size={13} className="text-tag-gold" />
            <span>~{formatDuration(totalWalkSec)} walking total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-2 border-b border-hairline flex items-center gap-3 flex-wrap text-[10px] text-tag-cold">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#FBF1DA', border: '1.5px solid #C08A30' }} />Tier 1</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#EAF1F0', border: '1.5px solid #14595B' }} />Tier 2</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#B7DFC5' }} />Lounge / Café</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#0B2F31' }} />Main Stage</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#F9D9BF' }} />Feature</span>
        </div>

        <div className="p-3 md:p-4">
          <svg
            viewBox="0 0 720 560"
            className="w-full h-auto"
            style={{ maxHeight: 580 }}
            role="img"
            aria-label="Booth map — Licensing Expo 2026 floor plan"
          >
            {/* Hall outline */}
            <rect x={35} y={48} width={650} height={475} fill="#F8FAFA" stroke="#C0CCCC" strokeWidth={1.5} rx={4} />

            {/* Zone backgrounds */}
            {ZONES.map((z) => (
              <g key={z.id}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.fill} stroke={z.stroke} strokeWidth={1} rx={3} />
                <text
                  x={z.x + 5}
                  y={z.y + 12}
                  fontSize={8}
                  fontWeight={700}
                  letterSpacing={0.08 * 10}
                  fill={z.stroke}
                  style={{ textTransform: 'uppercase' }}
                >
                  {z.label}
                </text>
              </g>
            ))}

            {/* Frank Sinatra Drive — east edge */}
            <g transform="translate(700, 290) rotate(90)">
              <text x={0} y={0} textAnchor="middle" fontSize={9} fontWeight={600} letterSpacing={1.5} fill="#8B97A0" style={{ textTransform: 'uppercase' }}>
                Frank Sinatra Drive
              </text>
            </g>

            {/* Booth rectangles */}
            {BOOTHS.map((b) => {
              const isHovered = hoveredId === b.id;
              return (
                <g
                  key={b.id}
                  onMouseEnter={() => setHoveredId(b.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    fill={boothFill(b)}
                    stroke={boothStroke(b)}
                    strokeWidth={b.tier === 'tier_1' ? 1.5 : 1}
                    rx={2}
                    style={{ filter: isHovered ? 'brightness(0.92)' : 'none', transition: 'filter 120ms' }}
                  />
                  {b.w >= 40 && b.h >= 22 && (
                    <text
                      x={b.x + b.w / 2}
                      y={b.y + b.h / 2 + 2}
                      textAnchor="middle"
                      fontSize={b.w >= 60 ? 8 : 7}
                      fontWeight={b.tier === 'tier_1' ? 700 : 500}
                      fill={boothTextColor(b)}
                      style={{ pointerEvents: 'none' }}
                    >
                      {b.name.length > b.w / 5 ? b.name.slice(0, Math.floor(b.w / 4.5)) + '…' : b.name}
                    </text>
                  )}
                  {b.w >= 30 && (
                    <text
                      x={b.x + 3}
                      y={b.y + 8}
                      fontSize={6}
                      fontWeight={600}
                      fill={boothTextColor(b)}
                      opacity={0.7}
                      style={{ pointerEvents: 'none' }}
                    >
                      {b.id.replace('_', '-')}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Entrances */}
            {ENTRANCES.map((e) => (
              <g key={e.id}>
                <circle cx={e.x} cy={e.y} r={7} fill="#14595B" />
                <text x={e.x} y={e.y + 2.5} textAnchor="middle" fontSize={8} fontWeight={700} fill="#FFFFFF">
                  {e.dir === 'down' ? '↓' : '→'}
                </text>
                <text
                  x={e.dir === 'down' ? e.x : e.x - 10}
                  y={e.dir === 'down' ? e.y - 9 : e.y + 2}
                  textAnchor={e.dir === 'down' ? 'middle' : 'end'}
                  fontSize={7}
                  fontWeight={600}
                  fill="#14595B"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {e.label}
                </text>
              </g>
            ))}

            {/* Walking route */}
            {routePath && (
              <>
                <path
                  d={routePath}
                  fill="none"
                  stroke="#C08A30"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.85}
                />
                {pins.length >= 2 && (() => {
                  const last = pins[pins.length - 1];
                  const prev = pins[pins.length - 2];
                  const dx = last.x - prev.x;
                  const dy = last.y - prev.y;
                  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                  return (
                    <polygon
                      points="0,-6 12,0 0,6"
                      fill="#C08A30"
                      transform={`translate(${last.x},${last.y}) rotate(${angle})`}
                    />
                  );
                })()}
              </>
            )}

            {/* Meeting pins */}
            {pins.map((pin, i) => {
              const state = meetingState(pin.meeting);
              const isHovered = hoveredId === 'pin_' + pin.meeting.id;
              const accent = tierColor(pin.meeting.target?.tier);
              const ringBase = state === 'live' ? '#C08A30' : state === 'done' ? '#8B97A0' : '#0B2F31';
              const fillColor = state === 'done' ? '#FFFFFF' : state === 'live' ? '#C08A30' : '#0B2F31';
              const textFill = state === 'done' ? '#5A6B6D' : '#FFFFFF';
              const pinR = isHovered ? 12 : 10;

              return (
                <Link href={`/schedule/${pin.meeting.id}`} key={pin.meeting.id}>
                  <g
                    onMouseEnter={() => setHoveredId('pin_' + pin.meeting.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {state === 'live' && (
                      <circle cx={pin.x} cy={pin.y} r={pinR + 6} fill="none" stroke="#C08A30" strokeWidth={2} opacity={0.4}>
                        <animate attributeName="r" from={pinR + 2} to={pinR + 12} dur="1.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from={0.6} to={0} dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={pin.x} cy={pin.y} r={pinR + 2} fill={accent} opacity={isHovered ? 0.9 : 0.6} />
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={pinR}
                      fill={fillColor}
                      stroke={ringBase}
                      strokeWidth={state === 'done' ? 2 : 1}
                    />
                    <text x={pin.x} y={pin.y + 4} fontSize={11} fontWeight={700} fill={textFill} textAnchor="middle">
                      {i + 1}
                    </text>
                  </g>
                </Link>
              );
            })}

            {/* Hover tooltips */}
            {hoveredId && hoveredId.startsWith('pin_') && (() => {
              const pin = pins.find((p) => 'pin_' + p.meeting.id === hoveredId);
              if (!pin) return null;
              const state = meetingState(pin.meeting);
              const tx = Math.min(620, Math.max(20, pin.x + 14));
              const ty = Math.max(20, pin.y - 40);
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={tx} y={ty} width={170} height={42} fill="#0B2F31" rx={4} />
                  <text x={tx + 6} y={ty + 14} fontSize={9} fontWeight={700} fill="#FFFFFF">
                    {pin.meeting.title.slice(0, 32)}
                  </text>
                  <text x={tx + 6} y={ty + 27} fontSize={7.5} fill="#C0D4D4">
                    {hmLA(pin.meeting.start_at)} · {pin.booth.id.replace('_', '-')} · {pin.booth.name.slice(0, 22)}
                  </text>
                  <text x={tx + 6} y={ty + 38} fontSize={7} fill="#E8B95B">
                    {state === 'live' ? '● LIVE NOW' : state.toUpperCase()}
                  </text>
                </g>
              );
            })()}

            {hoveredId && !hoveredId.startsWith('pin_') && (() => {
              const b = BOOTH_BY_ID[hoveredId];
              if (!b) return null;
              const tx = Math.min(570, Math.max(20, b.x + b.w + 6));
              const ty = Math.max(20, b.y - 10);
              const tierLabel = b.tier === 'tier_1' ? '★ TIER 1' : b.tier === 'tier_2' ? '☆ Tier 2' : '';
              return (
                <g style={{ pointerEvents: 'none' }}>
                  <rect x={tx} y={ty} width={140} height={tierLabel ? 32 : 22} fill="#0B2F31" rx={4} />
                  <text x={tx + 6} y={ty + 13} fontSize={9} fontWeight={700} fill="#FFFFFF">
                    {b.name.slice(0, 22)}
                  </text>
                  <text x={tx + 6} y={ty + 25} fontSize={7} fill="#C0D4D4">
                    Booth {b.id.replace('_', '-')}
                  </text>
                  {tierLabel && (
                    <text x={tx + 92} y={ty + 13} fontSize={7.5} fontWeight={700} fill="#E8B95B">
                      {tierLabel}
                    </text>
                  )}
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Pin list */}
        <div className="border-t border-hairline divide-y divide-hairline">
          <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-tag-gold-dark">
            Today's walking route
          </div>
          {pins.map((pin, i) => {
            const state = meetingState(pin.meeting);
            const color = tierColor(pin.meeting.target?.tier);
            return (
              <Link
                key={pin.meeting.id}
                href={`/schedule/${pin.meeting.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-tag-50 dark:hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate leading-tight">{pin.meeting.title}</div>
                  <div className="text-[11px] text-tag-cold truncate">
                    {hmLA(pin.meeting.start_at)} · {pin.booth.id.replace('_', '-')} · {pin.booth.name}
                  </div>
                </div>
                {state === 'live' && (
                  <span
                    className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: '#0B2F31' }}
                  >
                    ● LIVE
                  </span>
                )}
                {state === 'done' && (
                  <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full shrink-0 text-tag-cold border border-hairline">
                    DONE
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t border-hairline text-[10px] text-tag-cold text-center">
          Schematic based on licensing26.mapyourshow.com · simplified for route planning
        </div>
      </div>
    </div>
  );
}
