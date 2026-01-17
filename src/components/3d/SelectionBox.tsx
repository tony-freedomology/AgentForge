import { useEffect, useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { hexToPixel } from '../../utils/hexUtils';

export function SelectionBox() {
  const { camera, gl, scene, size } = useThree();

  const raycaster = useRef(new THREE.Raycaster());

  // Use refs to persist state across re-renders
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Convert screen coordinates to normalized device coordinates
  const screenToNDC = useCallback(
    (x: number, y: number): THREE.Vector2 => {
      return new THREE.Vector2(
        (x / size.width) * 2 - 1,
        -(y / size.height) * 2 + 1
      );
    },
    [size]
  );

  // Check if agent is within selection box
  const isAgentInSelection = useCallback(
    (agentPos: { q: number; r: number }, box: { start: { x: number; y: number }; end: { x: number; y: number } }) => {
      const [worldX, worldZ] = hexToPixel(agentPos.q, agentPos.r);
      const worldPos = new THREE.Vector3(worldX, 0.5, worldZ);

      // Project agent position to screen
      const projected = worldPos.project(camera);
      const screenX = ((projected.x + 1) / 2) * size.width;
      const screenY = ((-projected.y + 1) / 2) * size.height;

      // Check if within box bounds
      const minX = Math.min(box.start.x, box.end.x);
      const maxX = Math.max(box.start.x, box.end.x);
      const minY = Math.min(box.start.y, box.end.y);
      const maxY = Math.max(box.start.y, box.end.y);

      return screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY;
    },
    [camera, size]
  );

  useEffect(() => {
    const canvas = gl.domElement;

    // Get store actions once (they're stable references)
    const { startSelection, updateSelection, endSelection, selectAgents, deselectAll } = useGameStore.getState();

    const handleMouseDown = (e: MouseEvent) => {
      // Only left click for selection
      if (e.button !== 0) return;

      // Store start position in ref
      startPosRef.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Left button must be held
      if (!(e.buttons & 1)) return;

      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;

      // Start selection box if dragged enough
      if (!isDraggingRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isDraggingRef.current = true;
        startSelection(startPosRef.current.x, startPosRef.current.y);
      }

      if (isDraggingRef.current) {
        updateSelection(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;

      if (isDraggingRef.current) {
        // Get current state from store
        const state = useGameStore.getState();
        const { selectionBox, agents } = state;

        if (selectionBox.start && selectionBox.end) {
          // Find agents within selection box
          const selectedIds: string[] = [];
          agents.forEach((agent) => {
            if (isAgentInSelection(agent.position, selectionBox as { start: { x: number; y: number }; end: { x: number; y: number } })) {
              selectedIds.push(agent.id);
            }
          });

          if (selectedIds.length > 0) {
            selectAgents(selectedIds);
          } else if (!e.shiftKey) {
            deselectAll();
          }
        }

        endSelection();
        isDraggingRef.current = false;
      } else if (!e.shiftKey) {
        // Click on empty space - deselect all
        const ndc = screenToNDC(e.clientX, e.clientY);
        raycaster.current.setFromCamera(ndc, camera);

        // Check if we clicked on anything
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        const clickedAgent = intersects.find((i) => {
          let obj = i.object;
          while (obj.parent) {
            if ((obj as THREE.Group).userData?.isAgent) return true;
            obj = obj.parent;
          }
          return false;
        });

        if (!clickedAgent) {
          deselectAll();
        }
      }
    };

    // Handle mouseup on window level to catch releases outside canvas
    const handleWindowMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        endSelection();
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [gl, camera, scene, screenToNDC, isAgentInSelection]);

  return null;
}

// 2D overlay for selection box visualization
export function SelectionBoxOverlay() {
  const selectionBox = useGameStore((s) => s.selectionBox);

  if (!selectionBox.isSelecting || !selectionBox.start || !selectionBox.end) {
    return null;
  }

  const left = Math.min(selectionBox.start.x, selectionBox.end.x);
  const top = Math.min(selectionBox.start.y, selectionBox.end.y);
  const width = Math.abs(selectionBox.end.x - selectionBox.start.x);
  const height = Math.abs(selectionBox.end.y - selectionBox.start.y);

  return (
    <div
      className="fixed pointer-events-none border-2 border-cyan-400 bg-cyan-400/10"
      style={{
        left,
        top,
        width,
        height,
      }}
    />
  );
}
