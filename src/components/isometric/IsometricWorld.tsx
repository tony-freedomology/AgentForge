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
import { useParticleEffects } from './ParticleEffects';

// Register PixiJS components for JSX use
extend({ Container, Graphics, Text, Sprite });

// Grid configuration
const GRID_SIZE = 10;

// Zoom configuration
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_SPEED = 0.1;

// Movement configuration
const MOVE_SPEED = 4; // Grid units per second

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

  // Agent state - separate current position from target for smooth movement
  const [agentTarget, setAgentTarget] = useState({ x: 5, y: 5 });
  const [agentPosition, setAgentPosition] = useState({ x: 5, y: 5 });
  const [agentDirection, setAgentDirection] = useState<'s' | 'sw' | 'w' | 'nw'>('s');
  const [isMoving, setIsMoving] = useState(false);

  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [cameraZoom, setCameraZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cameraStart = useRef({ x: 0, y: 0 });
  const [portalPulse, setPortalPulse] = useState(0);

  // Particle effects
  const { spawnEffect, EffectsRenderer } = useParticleEffects();
  const wasMoving = useRef(false);

  // Center the view
  const centerOffsetX = width / 2;
  const centerOffsetY = height / 3;

  // Animate portal pulse and agent movement
  useTick((ticker: Ticker) => {
    setPortalPulse((p) => (p + ticker.deltaTime * 0.05) % (Math.PI * 2));

    // Smooth agent movement
    const dx = agentTarget.x - agentPosition.x;
    const dy = agentTarget.y - agentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.01) {
      const speed = MOVE_SPEED * (ticker.deltaTime / 60);

      if (distance < speed) {
        // Arrived at target
        setAgentPosition({ x: agentTarget.x, y: agentTarget.y });
        setIsMoving(false);

        // Spawn arrival effect
        if (wasMoving.current) {
          const arrivalPos = gridToScreen(agentTarget.x, agentTarget.y);
          spawnEffect(arrivalPos.x, arrivalPos.y - 30, 'teleport');
          wasMoving.current = false;
        }
      } else {
        // Move towards target
        const nx = dx / distance;
        const ny = dy / distance;
        setAgentPosition((prev) => ({
          x: prev.x + nx * speed,
          y: prev.y + ny * speed,
        }));
        setIsMoving(true);
        wasMoving.current = true;

        // Update direction while moving
        setAgentDirection(getDirectionFromDelta(dx, dy));
      }
    }
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
        if (gridPos.x !== agentTarget.x || gridPos.y !== agentTarget.y) {
          // Set target for smooth movement
          const dx = gridPos.x - agentPosition.x;
          const dy = gridPos.y - agentPosition.y;
          setAgentDirection(getDirectionFromDelta(dx, dy));
          setAgentTarget(gridPos);
          setIsMoving(true);
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
  }, [app, isDragging, cameraOffset, cameraZoom, centerOffsetX, centerOffsetY, agentTarget, agentPosition]);

  // Generate tiles in render order
  const tiles: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      tiles.push({ x, y });
    }
  }
  tiles.sort((a, b) => (a.x + a.y) - (b.x + b.y));

  const portalPosition = { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) };

  // Environment props - decorative elements around the map
  const environmentProps = [
    { x: 1, y: 1, prop: 'crystal_purple' },
    { x: 8, y: 1, prop: 'crystal_blue' },
    { x: 1, y: 8, prop: 'crystal_green' },
    { x: 8, y: 8, prop: 'tree_magical' },
    { x: 0, y: 4, prop: 'torch_wall' },
    { x: 9, y: 4, prop: 'torch_wall' },
    { x: 4, y: 0, prop: 'banner_guild' },
    { x: 3, y: 8, prop: 'cauldron' },
    { x: 6, y: 8, prop: 'bookshelf' },
    { x: 2, y: 3, prop: 'mushroom_cluster' },
    { x: 7, y: 2, prop: 'chest_closed' },
  ];

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

  // Get agent sprite texture based on movement state
  const getAgentTexture = (): Texture | null => {
    const animation = isMoving ? 'walk' : 'idle';
    const spriteId = `claude_${animation}_${agentDirection}`;
    return assetLoader.getTexture(spriteId) || null;
  };

  // Handle keyboard for effects demo (L = level-up, M = magic)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        const pos = gridToScreen(agentPosition.x, agentPosition.y);
        spawnEffect(pos.x, pos.y - 30, 'levelup');
      }
      if (e.key === 'm' || e.key === 'M') {
        const pos = gridToScreen(agentPosition.x, agentPosition.y);
        spawnEffect(pos.x, pos.y - 30, 'magic');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [agentPosition, spawnEffect]);

  return (
    <pixiContainer x={centerOffsetX + cameraOffset.x} y={centerOffsetY + cameraOffset.y} scale={cameraZoom} sortableChildren={true}>
      {/* Tiles */}
      {tiles.map(({ x, y }) => {
        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
        const isSelected = selectedTile?.x === x && selectedTile?.y === y;
        const isPortal = portalPosition.x === x && portalPosition.y === y;
        const screenPos = gridToScreen(x, y);
        const tileTexture = getTileTexture(x, y, isPortal);

        return (
          <pixiContainer key={`tile-${x}-${y}`} x={screenPos.x} y={screenPos.y} zIndex={x + y}>
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

      {/* Environment Props */}
      {environmentProps.map((propData, index) => {
        const screenPos = gridToScreen(propData.x, propData.y);
        const propTexture = assetLoader.getTexture(propData.prop);
        const zIndex = propData.x + propData.y + 10;

        return (
          <pixiContainer key={`prop-${index}`} x={screenPos.x} y={screenPos.y} zIndex={zIndex}>
            {propTexture && propTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={propTexture}
                anchor={{ x: 0.5, y: 1 }}
                y={TILE_HEIGHT / 2}
              />
            ) : (
              // Fallback prop graphics
              <pixiGraphics
                draw={(g: Graphics) => {
                  g.clear();
                  // Draw a simple prop placeholder
                  if (propData.prop.includes('crystal')) {
                    const color = propData.prop.includes('purple') ? 0x8b5cf6 :
                                  propData.prop.includes('blue') ? 0x3b82f6 : 0x22c55e;
                    g.moveTo(0, -40);
                    g.lineTo(-10, -10);
                    g.lineTo(10, -10);
                    g.closePath();
                    g.fill({ color, alpha: 0.8 });
                    g.stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
                  } else if (propData.prop.includes('tree')) {
                    g.circle(0, -35, 25);
                    g.fill({ color: 0x22c55e, alpha: 0.8 });
                    g.rect(-5, -15, 10, 20);
                    g.fill({ color: 0x8b4513 });
                  } else if (propData.prop.includes('torch')) {
                    g.rect(-3, -30, 6, 25);
                    g.fill({ color: 0x8b4513 });
                    g.circle(0, -35, 8);
                    g.fill({ color: 0xf59e0b, alpha: 0.9 });
                  } else if (propData.prop.includes('chest')) {
                    g.rect(-15, -20, 30, 18);
                    g.fill({ color: 0x8b4513 });
                    g.rect(-12, -25, 24, 8);
                    g.fill({ color: 0xa0522d });
                    g.rect(-3, -17, 6, 6);
                    g.fill({ color: 0xf59e0b });
                  } else {
                    // Generic prop
                    g.rect(-12, -25, 24, 20);
                    g.fill({ color: 0x4a5568, alpha: 0.8 });
                  }
                }}
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
        text={`Click to move | Right-drag to pan | Scroll to zoom (${Math.round(cameraZoom * 100)}%) | L=LevelUp M=Magic`}
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

      {/* Agent Status Panel - UI Overlay */}
      <pixiContainer
        x={(-centerOffsetX + 10) / cameraZoom}
        y={(-centerOffsetY + 50) / cameraZoom}
        scale={1 / cameraZoom}
        zIndex={10000}
      >
        {/* Panel background */}
        {(() => {
          const panelTexture = assetLoader.getTexture('panel_stone');
          if (panelTexture && panelTexture !== Texture.WHITE) {
            return (
              <pixiSprite
                texture={panelTexture}
                width={180}
                height={80}
                alpha={0.9}
              />
            );
          }
          return (
            <pixiGraphics
              draw={(g: Graphics) => {
                g.clear();
                g.roundRect(0, 0, 180, 80, 8);
                g.fill({ color: 0x1a1a2e, alpha: 0.95 });
                g.stroke({ color: 0x8b5cf6, width: 2 });
              }}
            />
          );
        })()}

        {/* Portrait frame */}
        <pixiContainer x={10} y={10}>
          {(() => {
            const frameTexture = assetLoader.getTexture('frame_portrait');
            const agentIdleTexture = assetLoader.getTexture('claude_idle_s');
            return (
              <>
                {agentIdleTexture && agentIdleTexture !== Texture.WHITE ? (
                  <pixiSprite
                    texture={agentIdleTexture}
                    width={50}
                    height={50}
                    anchor={{ x: 0, y: 0 }}
                  />
                ) : (
                  <pixiGraphics
                    draw={(g: Graphics) => {
                      g.clear();
                      g.rect(0, 0, 50, 50);
                      g.fill({ color: 0x8b5cf6 });
                      g.circle(25, 25, 18);
                      g.fill({ color: 0xa855f7 });
                    }}
                  />
                )}
                {frameTexture && frameTexture !== Texture.WHITE ? (
                  <pixiSprite
                    texture={frameTexture}
                    width={54}
                    height={54}
                    x={-2}
                    y={-2}
                  />
                ) : (
                  <pixiGraphics
                    draw={(g: Graphics) => {
                      g.clear();
                      g.rect(-2, -2, 54, 54);
                      g.stroke({ color: 0xf59e0b, width: 2 });
                    }}
                  />
                )}
              </>
            );
          })()}
        </pixiContainer>

        {/* Agent name */}
        <pixiText
          text="Claude"
          x={70}
          y={10}
          style={new TextStyle({
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0xf59e0b,
          })}
        />

        {/* HP bar */}
        <pixiContainer x={70} y={30}>
          <pixiGraphics
            draw={(g: Graphics) => {
              g.clear();
              // Background
              g.rect(0, 0, 100, 12);
              g.fill({ color: 0x1a1a2e });
              g.stroke({ color: 0x4b5563, width: 1 });
              // Fill (85% HP)
              g.rect(1, 1, 83, 10);
              g.fill({ color: 0x22c55e });
            }}
          />
          <pixiText
            text="HP"
            x={-20}
            y={-1}
            style={new TextStyle({
              fontFamily: 'monospace',
              fontSize: 10,
              fill: 0x888888,
            })}
          />
        </pixiContainer>

        {/* XP bar */}
        <pixiContainer x={70} y={48}>
          <pixiGraphics
            draw={(g: Graphics) => {
              g.clear();
              // Background
              g.rect(0, 0, 100, 12);
              g.fill({ color: 0x1a1a2e });
              g.stroke({ color: 0x4b5563, width: 1 });
              // Fill (60% XP)
              g.rect(1, 1, 60, 10);
              g.fill({ color: 0x8b5cf6 });
            }}
          />
          <pixiText
            text="XP"
            x={-20}
            y={-1}
            style={new TextStyle({
              fontFamily: 'monospace',
              fontSize: 10,
              fill: 0x888888,
            })}
          />
        </pixiContainer>

        {/* Level badge */}
        <pixiText
          text="Lv 5"
          x={135}
          y={62}
          style={new TextStyle({
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 'bold',
            fill: 0xf59e0b,
          })}
        />
      </pixiContainer>

      {/* Particle Effects Layer */}
      <EffectsRenderer />
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
