/**
 * Asset Loader for Isometric Sprites and Textures
 *
 * Handles loading of:
 * - Individual textures (tiles, props)
 * - Sprite sheets with JSON metadata (animated characters)
 * - Provides loading progress callbacks
 */

import { Assets, Texture, Spritesheet } from 'pixi.js';
import type { SpritesheetData } from 'pixi.js';

// Asset manifest types
export interface AssetManifest {
  tiles: TileAsset[];
  agents: AgentAsset[];
  props: PropAsset[];
  effects: EffectAsset[];
  ui: UIAsset[];
}

export interface TileAsset {
  id: string;
  path: string;
  animated?: boolean;
  frames?: number;
}

export interface AgentAsset {
  id: string; // e.g., 'claude', 'codex', 'gemini'
  spritesheetPath: string;
  metadataPath: string;
}

export interface PropAsset {
  id: string;
  path: string;
  animated?: boolean;
  frames?: number;
}

export interface EffectAsset {
  id: string;
  path: string;
  frames: number;
}

export interface UIAsset {
  id: string;
  path: string;
}

// Loading state
export interface LoadingProgress {
  loaded: number;
  total: number;
  percent: number;
  currentAsset: string;
}

// Loaded assets cache
interface LoadedAssets {
  textures: Map<string, Texture>;
  spritesheets: Map<string, Spritesheet>;
}

class AssetLoader {
  private loadedAssets: LoadedAssets = {
    textures: new Map(),
    spritesheets: new Map(),
  };

  private isLoading = false;
  private isLoaded = false;

  /**
   * Load all assets from manifest
   */
  async loadManifest(
    manifest: AssetManifest,
    onProgress?: (progress: LoadingProgress) => void
  ): Promise<void> {
    if (this.isLoading) {
      console.warn('Asset loading already in progress');
      return;
    }

    this.isLoading = true;

    // Count total assets
    const totalAssets =
      manifest.tiles.length +
      manifest.agents.length +
      manifest.props.length +
      manifest.effects.length +
      manifest.ui.length;

    let loadedCount = 0;

    const updateProgress = (assetName: string) => {
      loadedCount++;
      onProgress?.({
        loaded: loadedCount,
        total: totalAssets,
        percent: (loadedCount / totalAssets) * 100,
        currentAsset: assetName,
      });
    };

    try {
      // Load tiles
      for (const tile of manifest.tiles) {
        await this.loadTexture(tile.id, tile.path);
        updateProgress(tile.id);
      }

      // Load agent spritesheets
      for (const agent of manifest.agents) {
        await this.loadSpritesheet(agent.id, agent.spritesheetPath, agent.metadataPath);
        updateProgress(agent.id);
      }

      // Load props
      for (const prop of manifest.props) {
        await this.loadTexture(prop.id, prop.path);
        updateProgress(prop.id);
      }

      // Load effects
      for (const effect of manifest.effects) {
        await this.loadTexture(effect.id, effect.path);
        updateProgress(effect.id);
      }

      // Load UI elements
      for (const ui of manifest.ui) {
        await this.loadTexture(ui.id, ui.path);
        updateProgress(ui.id);
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load assets:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load a single texture
   */
  async loadTexture(id: string, path: string): Promise<Texture> {
    if (this.loadedAssets.textures.has(id)) {
      return this.loadedAssets.textures.get(id)!;
    }

    try {
      const texture = await Assets.load<Texture>(path);
      this.loadedAssets.textures.set(id, texture);
      return texture;
    } catch (error) {
      console.warn(`Failed to load texture ${id} from ${path}, using placeholder`);
      // Return a placeholder texture (1x1 white pixel)
      const placeholder = Texture.WHITE;
      this.loadedAssets.textures.set(id, placeholder);
      return placeholder;
    }
  }

  /**
   * Load a spritesheet with JSON metadata
   */
  async loadSpritesheet(id: string, imagePath: string, metadataPath: string): Promise<Spritesheet> {
    if (this.loadedAssets.spritesheets.has(id)) {
      return this.loadedAssets.spritesheets.get(id)!;
    }

    try {
      // Load the texture
      const texture = await Assets.load<Texture>(imagePath);

      // Load metadata
      const response = await fetch(metadataPath);
      const metadata: SpritesheetData = await response.json();

      // Create spritesheet
      const spritesheet = new Spritesheet(texture, metadata);
      await spritesheet.parse();

      this.loadedAssets.spritesheets.set(id, spritesheet);
      return spritesheet;
    } catch (error) {
      console.warn(`Failed to load spritesheet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a loaded texture by ID
   */
  getTexture(id: string): Texture | undefined {
    return this.loadedAssets.textures.get(id);
  }

  /**
   * Get a loaded spritesheet by ID
   */
  getSpritesheet(id: string): Spritesheet | undefined {
    return this.loadedAssets.spritesheets.get(id);
  }

  /**
   * Get animation frames from a spritesheet
   */
  getAnimationFrames(spritesheetId: string, animationName: string): Texture[] {
    const spritesheet = this.loadedAssets.spritesheets.get(spritesheetId);
    if (!spritesheet) {
      console.warn(`Spritesheet ${spritesheetId} not found`);
      return [];
    }

    const animation = spritesheet.animations[animationName];
    if (!animation) {
      console.warn(`Animation ${animationName} not found in spritesheet ${spritesheetId}`);
      return [];
    }

    return animation;
  }

  /**
   * Check if assets are loaded
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Check if currently loading
   */
  get loading(): boolean {
    return this.isLoading;
  }

  /**
   * Clear all loaded assets
   */
  clear(): void {
    this.loadedAssets.textures.clear();
    this.loadedAssets.spritesheets.clear();
    this.isLoaded = false;
  }
}

// Singleton instance
export const assetLoader = new AssetLoader();

/**
 * Default asset manifest for AgentForge
 * Paths match the generated assets in public/assets_isometric/
 */
export const DEFAULT_MANIFEST: AssetManifest = {
  tiles: [
    { id: 'tile_stone_base', path: '/assets_isometric/tiles/tile_stone_base.png' },
    { id: 'tile_stone_mossy', path: '/assets_isometric/tiles/tile_stone_mossy.png' },
    { id: 'tile_stone_cracked', path: '/assets_isometric/tiles/tile_stone_cracked.png' },
    { id: 'tile_grass', path: '/assets_isometric/tiles/tile_grass.png' },
    { id: 'tile_dirt', path: '/assets_isometric/tiles/tile_dirt.png' },
    { id: 'tile_water', path: '/assets_isometric/tiles/tile_water.png' },
    { id: 'tile_lava', path: '/assets_isometric/tiles/tile_lava.png' },
    { id: 'tile_void', path: '/assets_isometric/tiles/tile_void.png' },
    { id: 'tile_arcane', path: '/assets_isometric/tiles/tile_arcane.png' },
    { id: 'tile_gold', path: '/assets_isometric/tiles/tile_gold.png' },
    { id: 'tile_portal_base', path: '/assets_isometric/tiles/tile_portal_base.png' },
    { id: 'tile_portal_glow', path: '/assets_isometric/tiles/tile_portal_glow.png' },
    { id: 'tile_highlight_select', path: '/assets_isometric/tiles/tile_highlight_select.png' },
    { id: 'tile_highlight_move', path: '/assets_isometric/tiles/tile_highlight_move.png' },
    { id: 'tile_highlight_attack', path: '/assets_isometric/tiles/tile_highlight_attack.png' },
  ],
  agents: [], // Agent sprites are individual images, loaded via loadAgentSprites()
  props: [
    { id: 'portal_frame', path: '/assets_isometric/props/portal_frame.png' },
    { id: 'portal_swirl', path: '/assets_isometric/props/portal_swirl.png' },
    { id: 'portal_particles', path: '/assets_isometric/props/portal_particles.png' },
    { id: 'crystal_purple', path: '/assets_isometric/props/crystal_purple.png' },
    { id: 'crystal_green', path: '/assets_isometric/props/crystal_green.png' },
    { id: 'crystal_blue', path: '/assets_isometric/props/crystal_blue.png' },
    { id: 'cauldron', path: '/assets_isometric/props/cauldron.png' },
    { id: 'bookshelf', path: '/assets_isometric/props/bookshelf.png' },
    { id: 'chest_closed', path: '/assets_isometric/props/chest_closed.png' },
    { id: 'chest_open', path: '/assets_isometric/props/chest_open.png' },
    { id: 'tree_magical', path: '/assets_isometric/props/tree_magical.png' },
    { id: 'banner_guild', path: '/assets_isometric/props/banner_guild.png' },
    { id: 'torch_wall', path: '/assets_isometric/props/torch_wall.png' },
    { id: 'mushroom_cluster', path: '/assets_isometric/props/mushroom_cluster.png' },
  ],
  effects: [
    { id: 'effect_spawn', path: '/assets_isometric/effects/effect_spawn.png', frames: 16 },
    { id: 'effect_levelup', path: '/assets_isometric/effects/effect_levelup.png', frames: 12 },
    { id: 'effect_teleport', path: '/assets_isometric/effects/effect_teleport.png', frames: 8 },
    { id: 'effect_quest_complete', path: '/assets_isometric/effects/effect_quest_complete.png', frames: 12 },
    { id: 'effect_magic_purple', path: '/assets_isometric/effects/effect_magic_purple.png', frames: 8 },
    { id: 'effect_magic_green', path: '/assets_isometric/effects/effect_magic_green.png', frames: 8 },
    { id: 'effect_magic_blue', path: '/assets_isometric/effects/effect_magic_blue.png', frames: 8 },
    { id: 'effect_magic_gold', path: '/assets_isometric/effects/effect_magic_gold.png', frames: 8 },
  ],
  ui: [
    { id: 'frame_portrait', path: '/assets_isometric/ui/frames/frame_portrait.png' },
    { id: 'frame_portrait_selected', path: '/assets_isometric/ui/frames/frame_portrait_selected.png' },
    { id: 'healthbar_frame', path: '/assets_isometric/ui/frames/healthbar_frame.png' },
    { id: 'healthbar_fill_hp', path: '/assets_isometric/ui/frames/healthbar_fill_hp.png' },
    { id: 'healthbar_fill_xp', path: '/assets_isometric/ui/frames/healthbar_fill_xp.png' },
    { id: 'healthbar_fill_mana', path: '/assets_isometric/ui/frames/healthbar_fill_mana.png' },
    { id: 'panel_stone', path: '/assets_isometric/ui/frames/panel_stone.png' },
    { id: 'panel_dark', path: '/assets_isometric/ui/frames/panel_dark.png' },
    { id: 'panel_parchment', path: '/assets_isometric/ui/frames/panel_parchment.png' },
  ],
};

/**
 * Agent sprite paths helper
 * Agent sprites are individual images, not spritesheets
 */
export function getAgentSpritePath(
  agentType: 'claude' | 'codex' | 'gemini',
  animation: 'idle' | 'walk' | 'cast' | 'celebrate',
  direction: 's' | 'sw' | 'w' | 'nw'
): string {
  return `/assets_isometric/agents/${agentType}/${agentType}_${animation}_${direction}.png`;
}

/**
 * Load all agent sprites for a given agent type
 */
export async function loadAgentSprites(agentType: 'claude' | 'codex' | 'gemini'): Promise<void> {
  const animations = ['idle', 'walk', 'cast', 'celebrate'] as const;
  const directions = ['s', 'sw', 'w', 'nw'] as const;

  for (const animation of animations) {
    for (const direction of directions) {
      const id = `${agentType}_${animation}_${direction}`;
      const path = getAgentSpritePath(agentType, animation, direction);
      await assetLoader.loadTexture(id, path);
    }
  }
}
