/**
 * IsometricWorld - Main PixiJS canvas for isometric rendering
 *
 * Phase 0 Proof of Concept:
 * - Renders a basic isometric tile grid
 * - Includes a clickable test sprite
 * - Supports camera pan with mouse drag
 */

import { useState, useRef, useEffect } from 'react';
import { Application, extend, useApplication, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle, Ticker } from 'pixi.js';
import { gridToScreen, screenToGrid, TILE_WIDTH, TILE_HEIGHT } from '../../utils/isoCoords';

// Register PixiJS components for JSX use
extend({ Container, Graphics, Text });

// Grid configuration
const GRID_SIZE = 10;

// Colors for the fantasy theme
const COLORS = {
  tileFill: 0x1a1a2e, // Shadow black base
  tileStroke: 0x8b5cf6, // Arcane purple border
  tileHover: 0x3b82f6, // Frost blue hover
  tileHighlight: 0xf59e0b, // Holy gold selection
  agentPurple: 0x8b5cf6, // Claude purple
  agentGlow: 0xa855f7, // Lighter purple glow
  portalGold: 0xf59e0b, // Portal highlight
};

interface IsometricWorldProps {
  width?: number;
  height?: number;
}

export function IsometricWorld({ width = 800, height = 600 }: IsometricWorldProps) {
  return (
    <Application
      width={width}
      height={height}
      backgroundColor={0x0a0a1a}
      antialias={true}
      resolution={window.devicePixelRatio || 1}
      autoDensity={true}
    >
      <IsometricScene width={width} height={height} />
    </Application>
  );
}

interface IsometricSceneProps {
  width: number;
  height: number;
}

function IsometricScene({ width, height }: IsometricSceneProps) {
  const app = useApplication();
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [agentPosition, setAgentPosition] = useState({ x: 5, y: 5 });
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cameraStart = useRef({ x: 0, y: 0 });
  const [portalPulse, setPortalPulse] = useState(0);

  // Center the view
  const centerOffsetX = width / 2;
  const centerOffsetY = height / 3;

  // Animate portal pulse
  useTick((ticker: Ticker) => {
    setPortalPulse((p) => (p + ticker.deltaTime * 0.05) % (Math.PI * 2));
  });

  // Setup interaction handlers
  useEffect(() => {
    if (!app?.app?.stage) return;

    const stage = app.app.stage;
    stage.eventMode = 'static';
    stage.hitArea = app.app.screen;

    const handlePointerMove = (e: PointerEvent) => {
      const bounds = (app.app.canvas as HTMLCanvasElement).getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      if (isDragging) {
        const dx = x - dragStart.current.x;
        const dy = y - dragStart.current.y;
        setCameraOffset({
          x: cameraStart.current.x + dx,
          y: cameraStart.current.y + dy,
        });
        return;
      }

      // Convert screen position to grid coordinates
      const screenX = x - centerOffsetX - cameraOffset.x;
      const screenY = y - centerOffsetY - cameraOffset.y;
      const gridPos = screenToGrid(screenX, screenY);

      if (gridPos.x >= 0 && gridPos.x < GRID_SIZE && gridPos.y >= 0 && gridPos.y < GRID_SIZE) {
        setHoveredTile(gridPos);
      } else {
        setHoveredTile(null);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const bounds = (app.app.canvas as HTMLCanvasElement).getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      if (e.button === 1 || e.button === 2) {
        setIsDragging(true);
        dragStart.current = { x, y };
        cameraStart.current = { ...cameraOffset };
        return;
      }

      const screenX = x - centerOffsetX - cameraOffset.x;
      const screenY = y - centerOffsetY - cameraOffset.y;
      const gridPos = screenToGrid(screenX, screenY);

      if (gridPos.x >= 0 && gridPos.x < GRID_SIZE && gridPos.y >= 0 && gridPos.y < GRID_SIZE) {
        setSelectedTile(gridPos);
        if (gridPos.x !== agentPosition.x || gridPos.y !== agentPosition.y) {
          setAgentPosition(gridPos);
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const canvas = app.app.canvas as HTMLCanvasElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [app, isDragging, cameraOffset, centerOffsetX, centerOffsetY, agentPosition]);

  // Generate tiles in render order
  const tiles: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      tiles.push({ x, y });
    }
  }
  tiles.sort((a, b) => (a.x + a.y) - (b.x + b.y));

  const portalPosition = { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) };

  return (
    <pixiContainer x={centerOffsetX + cameraOffset.x} y={centerOffsetY + cameraOffset.y}>
      {/* Tiles */}
      {tiles.map(({ x, y }) => {
        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
        const isSelected = selectedTile?.x === x && selectedTile?.y === y;
        const isPortal = portalPosition.x === x && portalPosition.y === y;
        const screenPos = gridToScreen(x, y);

        return (
          <pixiGraphics
            key={`tile-${x}-${y}`}
            x={screenPos.x}
            y={screenPos.y}
            draw={(g: Graphics) => {
              g.clear();

              let fillColor = COLORS.tileFill;
              let strokeColor = COLORS.tileStroke;
              let strokeWidth = 1;
              let alpha = 0.8;

              if (isPortal) {
                fillColor = 0x1a0a2e;
                strokeColor = COLORS.portalGold;
                strokeWidth = 2;
              }
              if (isHovered) {
                fillColor = COLORS.tileHover;
                alpha = 0.4;
              }
              if (isSelected) {
                strokeColor = COLORS.tileHighlight;
                strokeWidth = 3;
              }

              g.poly([
                0, -TILE_HEIGHT / 2,
                TILE_WIDTH / 2, 0,
                0, TILE_HEIGHT / 2,
                -TILE_WIDTH / 2, 0,
              ]);
              g.fill({ color: fillColor, alpha });
              g.stroke({ color: strokeColor, width: strokeWidth });
            }}
          />
        );
      })}

      {/* Portal */}
      {(() => {
        const screenPos = gridToScreen(portalPosition.x, portalPosition.y);
        const glowIntensity = 0.3 + Math.sin(portalPulse) * 0.2;

        return (
          <pixiGraphics
            x={screenPos.x}
            y={screenPos.y}
            zIndex={portalPosition.x + portalPosition.y + 50}
            draw={(g: Graphics) => {
              g.clear();

              // Outer glow
              g.circle(0, -30, 35);
              g.fill({ color: COLORS.portalGold, alpha: glowIntensity * 0.3 });

              // Inner portal swirl
              g.circle(0, -30, 20);
              g.fill({ color: COLORS.portalGold, alpha: glowIntensity });

              // Center bright spot
              g.circle(0, -30, 10);
              g.fill({ color: 0xfef3c7, alpha: 0.9 });
            }}
          />
        );
      })()}

      {/* Agent */}
      {(() => {
        const screenPos = gridToScreen(agentPosition.x, agentPosition.y);
        const isAgentSelected = selectedTile?.x === agentPosition.x && selectedTile?.y === agentPosition.y;

        return (
          <pixiGraphics
            x={screenPos.x}
            y={screenPos.y}
            zIndex={agentPosition.x + agentPosition.y + 100}
            draw={(g: Graphics) => {
              g.clear();

              // Selection ring
              if (isAgentSelected) {
                g.circle(0, -20, 22);
                g.stroke({ color: COLORS.tileHighlight, width: 2, alpha: 0.8 });
              }

              // Agent body
              g.circle(0, -20, 18);
              g.fill({ color: COLORS.agentPurple });

              // Inner glow
              g.circle(0, -20, 12);
              g.fill({ color: COLORS.agentGlow, alpha: 0.6 });

              // Shadow
              g.ellipse(0, 0, 14, 7);
              g.fill({ color: 0x000000, alpha: 0.3 });

              // Eyes
              g.circle(-5, -22, 3);
              g.circle(5, -22, 3);
              g.fill({ color: 0xffffff, alpha: 0.9 });
            }}
          />
        );
      })()}

      {/* UI Text */}
      <pixiText
        text="Phase 0 PoC - Click to move agent | Right-drag to pan"
        x={-centerOffsetX + 10}
        y={-centerOffsetY + height - 30}
        style={new TextStyle({
          fontFamily: 'monospace',
          fontSize: 12,
          fill: 0x888888,
        })}
      />

      {hoveredTile && (
        <pixiText
          text={`Tile: (${hoveredTile.x}, ${hoveredTile.y})`}
          x={-centerOffsetX + 10}
          y={-centerOffsetY + 10}
          style={new TextStyle({
            fontFamily: 'monospace',
            fontSize: 14,
            fill: 0xf59e0b,
          })}
        />
      )}
    </pixiContainer>
  );
}
