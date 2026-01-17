/**
 * IsometricWorld - Main PixiJS canvas for isometric rendering
 *
 * Phase 1: Core Isometric Engine
 * - Renders isometric tile grid with real textures
 * - Agent sprites with directional rendering
 * - Camera pan and zoom controls
 * - Asset loading with progress indicator
 */

import { useState, useRef, useEffect } from 'react';
import { Application, extend, useApplication, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle, Ticker, Sprite, Texture } from 'pixi.js';
import { gridToScreen, screenToGrid, TILE_WIDTH, TILE_HEIGHT } from '../../utils/isoCoords';
import { assetLoader, DEFAULT_MANIFEST, loadAgentSprites } from '../../utils/assetLoader';

// Register PixiJS components for JSX use
extend({ Container, Graphics, Text, Sprite });

// Grid configuration
const GRID_SIZE = 10;

// Zoom configuration
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_SPEED = 0.1;

// Colors for fallback rendering
const COLORS = {
  tileFill: 0x1a1a2e,
  tileStroke: 0x8b5cf6,
  tileHover: 0x3b82f6,
  tileHighlight: 0xf59e0b,
  agentPurple: 0x8b5cf6,
  agentGlow: 0xa855f7,
  portalGold: 0xf59e0b,
};

interface IsometricWorldProps {
  width?: number;
  height?: number;
}

export function IsometricWorld({ width = 800, height = 600 }: IsometricWorldProps) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load assets on mount
  useEffect(() => {
    async function loadAssets() {
      try {
        await assetLoader.loadManifest(DEFAULT_MANIFEST, (progress) => {
          setLoadingProgress(progress.percent);
        });
        // Load agent sprites
        await loadAgentSprites('claude');
        await loadAgentSprites('codex');
        await loadAgentSprites('gemini');
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Failed to load assets:', error);
        // Continue anyway with fallback graphics
        setAssetsLoaded(true);
      }
    }
    loadAssets();
  }, []);

  return (
    <Application
      width={width}
      height={height}
      backgroundColor={0x0a0a1a}
      antialias={true}
      resolution={window.devicePixelRatio || 1}
      autoDensity={true}
    >
      {!assetsLoaded ? (
        <LoadingScreen progress={loadingProgress} />
      ) : (
        <IsometricScene width={width} height={height} />
      )}
    </Application>
  );
}

// Loading screen component
function LoadingScreen({ progress }: { progress: number }) {
  return (
    <pixiContainer x={400} y={300}>
      <pixiText
        text={`Loading assets... ${Math.round(progress)}%`}
        anchor={{ x: 0.5, y: 0.5 }}
        style={new TextStyle({
          fontFamily: 'monospace',
          fontSize: 18,
          fill: 0xf59e0b,
        })}
      />
      <pixiGraphics
        y={30}
        draw={(g: Graphics) => {
          g.clear();
          // Background bar
          g.rect(-100, -5, 200, 10);
          g.fill({ color: 0x1a1a2e });
          g.stroke({ color: 0x8b5cf6, width: 2 });
          // Progress fill
          g.rect(-98, -3, (progress / 100) * 196, 6);
          g.fill({ color: 0xf59e0b });
        }}
      />
    </pixiContainer>
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
  const [agentDirection, setAgentDirection] = useState<'s' | 'sw' | 'w' | 'nw'>('s');
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [cameraZoom, setCameraZoom] = useState(1.0);
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

      const screenX = (x - centerOffsetX - cameraOffset.x) / cameraZoom;
      const screenY = (y - centerOffsetY - cameraOffset.y) / cameraZoom;
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

      const screenX = (x - centerOffsetX - cameraOffset.x) / cameraZoom;
      const screenY = (y - centerOffsetY - cameraOffset.y) / cameraZoom;
      const gridPos = screenToGrid(screenX, screenY);

      if (gridPos.x >= 0 && gridPos.x < GRID_SIZE && gridPos.y >= 0 && gridPos.y < GRID_SIZE) {
        setSelectedTile(gridPos);
        if (gridPos.x !== agentPosition.x || gridPos.y !== agentPosition.y) {
          // Calculate direction towards target
          const dx = gridPos.x - agentPosition.x;
          const dy = gridPos.y - agentPosition.y;
          setAgentDirection(getDirectionFromDelta(dx, dy));
          setAgentPosition(gridPos);
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
      setCameraZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const canvas = app.app.canvas as HTMLCanvasElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [app, isDragging, cameraOffset, cameraZoom, centerOffsetX, centerOffsetY, agentPosition]);

  // Generate tiles in render order
  const tiles: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      tiles.push({ x, y });
    }
  }
  tiles.sort((a, b) => (a.x + a.y) - (b.x + b.y));

  const portalPosition = { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) };

  // Get tile texture based on position
  const getTileTexture = (x: number, y: number, isPortal: boolean): Texture | null => {
    if (isPortal) {
      return assetLoader.getTexture('tile_portal_base') || null;
    }
    // Vary tiles based on position for visual interest
    const tileTypes = ['tile_stone_base', 'tile_stone_mossy', 'tile_grass', 'tile_dirt'];
    const index = (x * 3 + y * 7) % tileTypes.length;
    return assetLoader.getTexture(tileTypes[index]) || null;
  };

  // Get agent sprite texture
  const getAgentTexture = (): Texture | null => {
    const spriteId = `claude_idle_${agentDirection}`;
    return assetLoader.getTexture(spriteId) || null;
  };

  return (
    <pixiContainer x={centerOffsetX + cameraOffset.x} y={centerOffsetY + cameraOffset.y} scale={cameraZoom}>
      {/* Tiles */}
      {tiles.map(({ x, y }) => {
        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
        const isSelected = selectedTile?.x === x && selectedTile?.y === y;
        const isPortal = portalPosition.x === x && portalPosition.y === y;
        const screenPos = gridToScreen(x, y);
        const tileTexture = getTileTexture(x, y, isPortal);

        return (
          <pixiContainer key={`tile-${x}-${y}`} x={screenPos.x} y={screenPos.y}>
            {/* Base tile - use texture if available, otherwise fallback to graphics */}
            {tileTexture && tileTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={tileTexture}
                anchor={{ x: 0.5, y: 0.5 }}
              />
            ) : (
              <pixiGraphics
                draw={(g: Graphics) => {
                  g.clear();
                  const fillColor = isPortal ? 0x1a0a2e : COLORS.tileFill;
                  const strokeColor = isPortal ? COLORS.portalGold : COLORS.tileStroke;
                  g.poly([
                    0, -TILE_HEIGHT / 2,
                    TILE_WIDTH / 2, 0,
                    0, TILE_HEIGHT / 2,
                    -TILE_WIDTH / 2, 0,
                  ]);
                  g.fill({ color: fillColor, alpha: 0.8 });
                  g.stroke({ color: strokeColor, width: 1 });
                }}
              />
            )}

            {/* Hover highlight */}
            {isHovered && (
              <pixiSprite
                texture={assetLoader.getTexture('tile_highlight_move') || Texture.WHITE}
                anchor={{ x: 0.5, y: 0.5 }}
                alpha={0.6}
              />
            )}

            {/* Selection highlight */}
            {isSelected && (
              <pixiSprite
                texture={assetLoader.getTexture('tile_highlight_select') || Texture.WHITE}
                anchor={{ x: 0.5, y: 0.5 }}
                alpha={0.8}
              />
            )}
          </pixiContainer>
        );
      })}

      {/* Portal effect */}
      {(() => {
        const screenPos = gridToScreen(portalPosition.x, portalPosition.y);
        const portalTexture = assetLoader.getTexture('portal_frame');
        const glowIntensity = 0.5 + Math.sin(portalPulse) * 0.3;

        return (
          <pixiContainer x={screenPos.x} y={screenPos.y} zIndex={portalPosition.x + portalPosition.y + 50}>
            {portalTexture && portalTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={portalTexture}
                anchor={{ x: 0.5, y: 1 }}
                y={TILE_HEIGHT / 2}
                alpha={glowIntensity}
              />
            ) : (
              <pixiGraphics
                draw={(g: Graphics) => {
                  g.clear();
                  g.circle(0, -30, 35);
                  g.fill({ color: COLORS.portalGold, alpha: glowIntensity * 0.3 });
                  g.circle(0, -30, 20);
                  g.fill({ color: COLORS.portalGold, alpha: glowIntensity });
                  g.circle(0, -30, 10);
                  g.fill({ color: 0xfef3c7, alpha: 0.9 });
                }}
              />
            )}
          </pixiContainer>
        );
      })()}

      {/* Agent */}
      {(() => {
        const screenPos = gridToScreen(agentPosition.x, agentPosition.y);
        const isAgentSelected = selectedTile?.x === agentPosition.x && selectedTile?.y === agentPosition.y;
        const agentTexture = getAgentTexture();

        return (
          <pixiContainer x={screenPos.x} y={screenPos.y} zIndex={agentPosition.x + agentPosition.y + 100}>
            {/* Selection ring */}
            {isAgentSelected && (
              <pixiGraphics
                draw={(g: Graphics) => {
                  g.clear();
                  g.circle(0, -48, 30);
                  g.stroke({ color: COLORS.tileHighlight, width: 3, alpha: 0.8 });
                }}
              />
            )}

            {/* Agent sprite */}
            {agentTexture && agentTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={agentTexture}
                anchor={{ x: 0.5, y: 1 }}
                y={TILE_HEIGHT / 2}
              />
            ) : (
              <pixiGraphics
                draw={(g: Graphics) => {
                  g.clear();
                  g.circle(0, -20, 18);
                  g.fill({ color: COLORS.agentPurple });
                  g.circle(0, -20, 12);
                  g.fill({ color: COLORS.agentGlow, alpha: 0.6 });
                  g.ellipse(0, 0, 14, 7);
                  g.fill({ color: 0x000000, alpha: 0.3 });
                  g.circle(-5, -22, 3);
                  g.circle(5, -22, 3);
                  g.fill({ color: 0xffffff, alpha: 0.9 });
                }}
              />
            )}
          </pixiContainer>
        );
      })()}

      {/* UI Text */}
      <pixiText
        text={`Click to move | Right-drag to pan | Scroll to zoom (${Math.round(cameraZoom * 100)}%)`}
        x={(-centerOffsetX + 10) / cameraZoom}
        y={(-centerOffsetY + height - 30) / cameraZoom}
        scale={1 / cameraZoom}
        style={new TextStyle({
          fontFamily: 'monospace',
          fontSize: 12,
          fill: 0x888888,
        })}
      />

      {hoveredTile && (
        <pixiText
          text={`Tile: (${hoveredTile.x}, ${hoveredTile.y})`}
          x={(-centerOffsetX + 10) / cameraZoom}
          y={(-centerOffsetY + 10) / cameraZoom}
          scale={1 / cameraZoom}
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

/**
 * Calculate direction from movement delta
 */
function getDirectionFromDelta(dx: number, dy: number): 's' | 'sw' | 'w' | 'nw' {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Map to 4 main directions available in sprites
  if (angle >= -45 && angle < 45) return 'w'; // East maps to west (mirrored)
  if (angle >= 45 && angle < 135) return 's';
  if (angle >= 135 || angle < -135) return 'w';
  return 'nw';
}
