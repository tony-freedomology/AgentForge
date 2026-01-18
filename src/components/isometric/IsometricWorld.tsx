/**
 * IsometricWorld - Main PixiJS canvas for isometric rendering
 *
 * Phase 1: Core Isometric Engine
 * - Renders isometric tile grid with real textures
 * - Agent sprites with directional rendering
 * - Camera pan and zoom controls
 * - Asset loading with progress indicator
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, useContext } from 'react';
import { Application, extend, useApplication, useTick } from '@pixi/react';
import { Container, Graphics, Text, TextStyle, Ticker, Sprite, Texture } from 'pixi.js';
import { gridToScreen, screenToGrid, TILE_WIDTH, TILE_HEIGHT } from '../../utils/isoCoords';
import { assetLoader, DEFAULT_MANIFEST, loadAgentSprites } from '../../utils/assetLoader';
import { useParticleEffects } from './ParticleEffects';
import { IsometricAgent } from './IsometricAgent';
import { useGameStore } from '../../stores/gameStore';

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
  tileFill: 0x1a472a, // Lush green
  tileStroke: 0x2d6a4f, // Darker green stroke
  tileHover: 0x4ade80, // Bright green hover
  tileHighlight: 0xfacc15, // Golden sunlight highlight
  agentPurple: 0x8b5cf6,
  agentGlow: 0xa855f7,
  portalGold: 0xf59e0b,
};

interface IsometricWorldProps {
  width?: number;
  height?: number;
}

// Selection box context for sharing state between wrapper and scene
interface SelectionBoxState {
  isSelecting: boolean;
  start: { x: number; y: number };
  end: { x: number; y: number };
  setIsSelecting: (v: boolean) => void;
  setStart: (v: { x: number; y: number }) => void;
  setEnd: (v: { x: number; y: number }) => void;
}

const SelectionBoxContext = React.createContext<SelectionBoxState | null>(null);

export function IsometricWorld({ width = 800, height = 600 }: IsometricWorldProps) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Box selection state (lifted up for overlay rendering)
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxStart, setBoxStart] = useState({ x: 0, y: 0 });
  const [boxEnd, setBoxEnd] = useState({ x: 0, y: 0 });

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

  // Calculate selection box dimensions
  const selectionBox = isBoxSelecting ? {
    left: Math.min(boxStart.x, boxEnd.x),
    top: Math.min(boxStart.y, boxEnd.y),
    width: Math.abs(boxEnd.x - boxStart.x),
    height: Math.abs(boxEnd.y - boxStart.y),
  } : null;

  const selectionContextValue: SelectionBoxState = {
    isSelecting: isBoxSelecting,
    start: boxStart,
    end: boxEnd,
    setIsSelecting: setIsBoxSelecting,
    setStart: setBoxStart,
    setEnd: setBoxEnd,
  };

  return (
    <div className="relative" style={{ width, height }}>
      <SelectionBoxContext.Provider value={selectionContextValue}>
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
      </SelectionBoxContext.Provider>

      {/* Selection box overlay */}
      {selectionBox && selectionBox.width > 5 && selectionBox.height > 5 && (
        <div
          className="absolute pointer-events-none border-2 border-cyan-400 bg-cyan-400/20"
          style={{
            left: selectionBox.left,
            top: selectionBox.top,
            width: selectionBox.width,
            height: selectionBox.height,
          }}
        />
      )}
    </div>
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

  // Get agents from store
  const agents = useGameStore((state) => state.agents);
  const selectedAgentIds = useGameStore((state) => state.selectedAgentIds);
  const selectAgent = useGameStore((state) => state.selectAgent);
  const selectAgents = useGameStore((state) => state.selectAgents);
  const deselectAll = useGameStore((state) => state.deselectAll);

  // Box selection from context
  const selectionBox = useContext(SelectionBoxContext);
  const isBoxSelecting = selectionBox?.isSelecting ?? false;
  const boxStart = selectionBox?.start ?? { x: 0, y: 0 };
  const boxEnd = selectionBox?.end ?? { x: 0, y: 0 };
  const setIsBoxSelecting = selectionBox?.setIsSelecting ?? (() => { });
  const setBoxStart = selectionBox?.setStart ?? (() => { });
  const setBoxEnd = selectionBox?.setEnd ?? (() => { });

  // Demo agent for when no real agents exist
  const [demoAgentPosition, setDemoAgentPosition] = useState({ x: 5, y: 5 });
  const [demoAgentTarget, setDemoAgentTarget] = useState({ x: 5, y: 5 });
  const [demoDirection, setDemoDirection] = useState<'s' | 'sw' | 'w' | 'nw'>('s');
  const [isDemoMoving, setIsDemoMoving] = useState(false);
  const wasDemoMoving = useRef(false);

  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [cameraZoom, setCameraZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cameraStart = useRef({ x: 0, y: 0 });
  const [portalPulse, setPortalPulse] = useState(0);

  // Particle effects
  const { spawnEffect, EffectsRenderer } = useParticleEffects();

  // Convert agents Map to array for rendering
  const agentList = useMemo(() => Array.from(agents.values()), [agents]);
  const hasRealAgents = agentList.length > 0;

  // Callback for agent spawn effects
  const handleAgentEffect = useCallback((x: number, y: number, type: 'spawn' | 'teleport') => {
    spawnEffect(x, y, type);
  }, [spawnEffect]);

  // Center the view
  const centerOffsetX = width / 2;
  const centerOffsetY = height / 3;

  // Animate portal pulse and demo agent movement
  useTick((ticker: Ticker) => {
    setPortalPulse((p) => (p + ticker.deltaTime * 0.05) % (Math.PI * 2));

    // Only animate demo agent if no real agents exist
    if (!hasRealAgents) {
      const dx = demoAgentTarget.x - demoAgentPosition.x;
      const dy = demoAgentTarget.y - demoAgentPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.01) {
        const speed = MOVE_SPEED * (ticker.deltaTime / 60);

        if (distance < speed) {
          setDemoAgentPosition({ x: demoAgentTarget.x, y: demoAgentTarget.y });
          setIsDemoMoving(false);

          if (wasDemoMoving.current) {
            const arrivalPos = gridToScreen(demoAgentTarget.x, demoAgentTarget.y);
            spawnEffect(arrivalPos.x, arrivalPos.y - 30, 'teleport');
            wasDemoMoving.current = false;
          }
        } else {
          const nx = dx / distance;
          const ny = dy / distance;
          setDemoAgentPosition((prev) => ({
            x: prev.x + nx * speed,
            y: prev.y + ny * speed,
          }));
          setIsDemoMoving(true);
          wasDemoMoving.current = true;
          setDemoDirection(getDirectionFromDelta(dx, dy));
        }
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

      // Update box selection end point
      if (isBoxSelecting) {
        setBoxEnd({ x, y });
        return;
      }

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

      // Right/middle click for camera pan
      if (e.button === 1 || e.button === 2) {
        setIsDragging(true);
        dragStart.current = { x, y };
        cameraStart.current = { ...cameraOffset };
        return;
      }

      // Left click - start box selection if shift is held and we have real agents
      if (e.shiftKey && hasRealAgents) {
        setIsBoxSelecting(true);
        setBoxStart({ x, y });
        setBoxEnd({ x, y });
        return;
      }

      const screenX = (x - centerOffsetX - cameraOffset.x) / cameraZoom;
      const screenY = (y - centerOffsetY - cameraOffset.y) / cameraZoom;
      const gridPos = screenToGrid(screenX, screenY);

      if (gridPos.x >= 0 && gridPos.x < GRID_SIZE && gridPos.y >= 0 && gridPos.y < GRID_SIZE) {
        setSelectedTile(gridPos);

        // In demo mode (no real agents), move demo agent
        if (!hasRealAgents) {
          if (gridPos.x !== demoAgentTarget.x || gridPos.y !== demoAgentTarget.y) {
            const dx = gridPos.x - demoAgentPosition.x;
            const dy = gridPos.y - demoAgentPosition.y;
            setDemoDirection(getDirectionFromDelta(dx, dy));
            setDemoAgentTarget(gridPos);
            setIsDemoMoving(true);
          }
        } else {
          // Click on empty tile with no modifiers deselects all
          if (!e.ctrlKey && !e.metaKey) {
            deselectAll();
          }
        }
      }
    };

    const handlePointerUp = () => {
      // Complete box selection
      if (isBoxSelecting) {
        const minX = Math.min(boxStart.x, boxEnd.x);
        const maxX = Math.max(boxStart.x, boxEnd.x);
        const minY = Math.min(boxStart.y, boxEnd.y);
        const maxY = Math.max(boxStart.y, boxEnd.y);

        // Find all agents within the box
        const selectedIds: string[] = [];
        agentList.forEach((agent) => {
          const agentGridX = agent.position.q + 5;
          const agentGridY = agent.position.r + 5;
          const screenPos = gridToScreen(agentGridX, agentGridY);

          // Convert to canvas coordinates
          const canvasX = screenPos.x * cameraZoom + centerOffsetX + cameraOffset.x;
          const canvasY = (screenPos.y - 30) * cameraZoom + centerOffsetY + cameraOffset.y;

          if (canvasX >= minX && canvasX <= maxX && canvasY >= minY && canvasY <= maxY) {
            selectedIds.push(agent.id);
          }
        });

        if (selectedIds.length > 0) {
          selectAgents(selectedIds);
        }

        setIsBoxSelecting(false);
        return;
      }

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
  }, [app, isDragging, cameraOffset, cameraZoom, centerOffsetX, centerOffsetY, hasRealAgents, demoAgentTarget, demoAgentPosition, isBoxSelecting, boxStart, boxEnd, agentList, selectAgents, deselectAll]);

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
    { x: 1, y: 1, prop: 'prop_tree_oak' },
    { x: 8, y: 1, prop: 'prop_crystal_blue' },
    { x: 1, y: 8, prop: 'prop_bush_berries' },
    { x: 8, y: 8, prop: 'prop_crystal_purple' },
    { x: 0, y: 4, prop: 'prop_bush_berries' },
    { x: 9, y: 4, prop: 'prop_tree_oak' },
    { x: 4, y: 0, prop: 'prop_rock_mossy' },
    { x: 3, y: 8, prop: 'prop_bush_berries' },
    { x: 6, y: 8, prop: 'prop_crystal_green' },
    { x: 2, y: 3, prop: 'prop_rock_mossy' },
    { x: 7, y: 2, prop: 'prop_tree_oak' },
    { x: 2, y: 7, prop: 'prop_torch_wall' },
    { x: 7, y: 7, prop: 'prop_rock_mossy' },
  ];

  // Get tile texture based on position
  const getTileTexture = (x: number, y: number, isPortal: boolean): Texture | null => {
    if (isPortal) {
      return assetLoader.getTexture('tile_portal_base') || null;
    }

    // Lush green environment logic
    // Create deterministic but organic looking patches
    const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 10;
    const variant = Math.abs(Math.floor(noise * 100)) % 10;

    if (variant > 7) return assetLoader.getTexture('tile_grass_flower') || null;
    if (variant > 5) return assetLoader.getTexture('tile_grass_dense') || null;
    return assetLoader.getTexture('tile_grass_base') || null;
  };

  // Get demo agent sprite texture based on movement state
  const getDemoAgentTexture = (): Texture | null => {
    const animation = isDemoMoving ? 'walk' : 'idle';
    const spriteId = `claude_${animation}_${demoDirection}`;
    return assetLoader.getTexture(spriteId) || null;
  };

  // Get first selected agent for the status panel
  const selectedAgent = useMemo(() => {
    if (selectedAgentIds.size > 0) {
      const firstSelectedId = Array.from(selectedAgentIds)[0];
      return agents.get(firstSelectedId);
    }
    return null;
  }, [agents, selectedAgentIds]);

  // Handle keyboard for effects demo (L = level-up, M = magic)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Get position for effect (use first selected agent or demo agent)
      let effectPos: { x: number; y: number };
      if (selectedAgent) {
        effectPos = gridToScreen(selectedAgent.position.q + 5, selectedAgent.position.r + 5);
      } else {
        effectPos = gridToScreen(demoAgentPosition.x, demoAgentPosition.y);
      }

      if (e.key === 'l' || e.key === 'L') {
        spawnEffect(effectPos.x, effectPos.y - 30, 'levelup');
      }
      if (e.key === 'm' || e.key === 'M') {
        spawnEffect(effectPos.x, effectPos.y - 30, 'magic');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demoAgentPosition, selectedAgent, spawnEffect]);

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
            {tileTexture && tileTexture !== Texture.WHITE ? (() => {
              // Auto-scale tile if it's too large (e.g. 1024px)
              // Tiles are 64px wide (TILE_WIDTH)
              // But usually include some padding/depth, so let's check against target width
              let scale = 1.0;
              if (tileTexture.width > TILE_WIDTH * 1.5) {
                scale = (TILE_WIDTH + 2) / tileTexture.width; // Slight overlap
              }

              return (
                <pixiSprite
                  texture={tileTexture}
                  anchor={{ x: 0.5, y: 0.5 }}
                  scale={scale}
                />
              );
            })() : (
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

        // Auto-scale props to fit relative to tile size
        // Standard prop width should be roughly TILE_WIDTH (64px)
        // If texture is huge (e.g., 1024px), scale it down significantly
        let scale = 1.0;
        let yOffset = TILE_HEIGHT / 2;

        if (propTexture && propTexture !== Texture.WHITE) {
          const targetWidth = TILE_WIDTH * 1.5; // Allow props to be slightly larger than a tile
          if (propTexture.width > targetWidth) {
            scale = targetWidth / propTexture.width;
          }

          // Tree specific overrides if needed effectively
          if (propData.prop.includes('tree')) {
            scale *= 1.5; // Trees can be bigger
            yOffset = TILE_HEIGHT / 2 + (10 * scale);
          }
        }

        return (
          <pixiContainer key={`prop-${index}`} x={screenPos.x} y={screenPos.y} zIndex={zIndex}>
            {propTexture && propTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={propTexture}
                anchor={{ x: 0.5, y: 1 }}
                y={yOffset}
                scale={scale}
              />
            ) : (
              // Fallback prop graphics
              <pixiGraphics
                draw={(g: Graphics) => {
                  g.clear();
                  // Draw a simple green prop placeholder
                  if (propData.prop.includes('tree')) {
                    // Tree trunk
                    g.rect(-5, -10, 10, 10);
                    g.fill({ color: 0x8b4513 });
                    // Leaves
                    g.circle(0, -30, 25);
                    g.fill({ color: 0x22c55e, alpha: 0.9 });
                  } else if (propData.prop.includes('bush')) {
                    g.circle(0, -15, 15);
                    g.fill({ color: 0x16a34a });
                    g.circle(-5, -12, 3);
                    g.fill({ color: 0xef4444 }); // berries
                  } else if (propData.prop.includes('rock')) {
                    g.ellipse(0, -5, 15, 10);
                    g.fill({ color: 0x78716c });
                    g.ellipse(-5, -8, 5, 3);
                    g.fill({ color: 0x4ade80, alpha: 0.7 }); // moss
                  }
                }}
              />
            )}
          </pixiContainer>
        );
      })}

      {/* Portal - Full assembly with frame, swirl, and particles */}
      {(() => {
        const screenPos = gridToScreen(portalPosition.x, portalPosition.y);
        const portalFrameTexture = assetLoader.getTexture('portal_frame');
        const portalSwirlTexture = assetLoader.getTexture('portal_swirl');
        const portalParticlesTexture = assetLoader.getTexture('portal_particles');
        const glowIntensity = 0.6 + Math.sin(portalPulse) * 0.3;
        const swirlRotation = portalPulse * 0.5; // Slow rotation for swirl

        return (
          <pixiContainer x={screenPos.x} y={screenPos.y} zIndex={portalPosition.x + portalPosition.y + 50}>
            {/* Portal swirl effect (behind frame) */}
            {portalSwirlTexture && portalSwirlTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={portalSwirlTexture}
                anchor={{ x: 0.5, y: 0.5 }}
                y={-50}
                scale={0.8}
                rotation={swirlRotation}
                alpha={glowIntensity}
              />
            ) : null}

            {/* Portal frame */}
            {portalFrameTexture && portalFrameTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={portalFrameTexture}
                anchor={{ x: 0.5, y: 1 }}
                y={TILE_HEIGHT / 2 + 10}
                scale={1.0}
              />
            ) : (
              <pixiGraphics
                draw={(g: Graphics) => {
                  g.clear();
                  g.circle(0, -50, 35);
                  g.fill({ color: COLORS.portalGold, alpha: glowIntensity * 0.3 });
                  g.circle(0, -50, 20);
                  g.fill({ color: COLORS.portalGold, alpha: glowIntensity });
                  g.circle(0, -50, 10);
                  g.fill({ color: 0xfef3c7, alpha: 0.9 });
                }}
              />
            )}

            {/* Floating particles */}
            {portalParticlesTexture && portalParticlesTexture !== Texture.WHITE ? (
              <pixiSprite
                texture={portalParticlesTexture}
                anchor={{ x: 0.5, y: 0.5 }}
                y={-60 + Math.sin(portalPulse * 2) * 5}
                scale={0.8}
                alpha={0.7 + Math.sin(portalPulse * 3) * 0.2}
              />
            ) : null}
          </pixiContainer>
        );
      })()}

      {/* Real Agents from Store */}
      {agentList.map((agent) => (
        <IsometricAgent
          key={agent.id}
          agent={agent}
          isSelected={selectedAgentIds.has(agent.id)}
          onSelect={selectAgent}
          onSpawnEffect={handleAgentEffect}
        />
      ))}

      {/* Demo Agent (when no real agents exist) */}
      {!hasRealAgents && (() => {
        const screenPos = gridToScreen(demoAgentPosition.x, demoAgentPosition.y);
        const isDemoSelected = selectedTile?.x === Math.floor(demoAgentPosition.x) &&
          selectedTile?.y === Math.floor(demoAgentPosition.y);
        const agentTexture = getDemoAgentTexture();

        return (
          <pixiContainer x={screenPos.x} y={screenPos.y} zIndex={Math.floor(demoAgentPosition.x + demoAgentPosition.y) + 100}>
            {/* Selection ring */}
            {isDemoSelected && (
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

            {/* Demo label */}
            <pixiText
              text="Demo Agent"
              y={-60}
              anchor={{ x: 0.5, y: 0.5 }}
              style={new TextStyle({
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 'bold',
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 },
              })}
            />
          </pixiContainer>
        );
      })()}

      {/* UI Text */}
      <pixiText
        text={`Click to move | Shift+drag to box select | Right-drag to pan | Scroll to zoom (${Math.round(cameraZoom * 100)}%)`}
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
