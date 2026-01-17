import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '../../stores/gameStore';

const EDGE_SCROLL_ZONE = 50; // Pixels from screen edge
const PAN_SPEED = 0.3;
const ZOOM_SPEED = 2;
const MIN_ZOOM = 8;
const MAX_ZOOM = 40;
const MIN_ANGLE = 0.4; // Radians - how steep the camera can look down
const MAX_ANGLE = 1.2; // Radians

export function RTSCamera() {
  const { camera, gl, size } = useThree();
  const targetRef = useRef(new Vector3(0, 0, 0));
  const currentPosRef = useRef(new Vector3(0, 25, 25));
  const distanceRef = useRef(25);
  const angleRef = useRef(0.8);

  const setCameraPosition = useGameStore((s) => s.setCameraPosition);
  const setCameraTarget = useGameStore((s) => s.setCameraTarget);
  const isPaused = useGameStore((s) => s.isPaused);

  // Mouse state - initialize to center to prevent edge scroll on load
  const mouseRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500,
    isMiddleDown: false,
    lastX: 0,
    lastY: 0,
    hasMovedMouse: false  // Don't edge scroll until mouse has moved
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.hasMovedMouse = true;

      // Middle mouse drag for rotation
      if (mouseRef.current.isMiddleDown) {
        const deltaY = e.clientY - mouseRef.current.lastY;

        // Rotate around target
        angleRef.current = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angleRef.current - deltaY * 0.005));

        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.01;
      distanceRef.current = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, distanceRef.current + delta * ZOOM_SPEED));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse
        mouseRef.current.isMiddleDown = true;
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        mouseRef.current.isMiddleDown = false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const panAmount = 2;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          targetRef.current.z -= panAmount;
          break;
        case 'ArrowDown':
        case 's':
          targetRef.current.z += panAmount;
          break;
        case 'ArrowLeft':
        case 'a':
          targetRef.current.x -= panAmount;
          break;
        case 'ArrowRight':
        case 'd':
          targetRef.current.x += panAmount;
          break;
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (isPaused) return;

    const { x, y, hasMovedMouse } = mouseRef.current;
    const panDelta = new Vector3();

    // Edge scrolling - only if mouse has moved (prevents fly-away on load)
    if (hasMovedMouse) {
      if (x < EDGE_SCROLL_ZONE) {
        panDelta.x -= PAN_SPEED * (1 - x / EDGE_SCROLL_ZONE);
      } else if (x > size.width - EDGE_SCROLL_ZONE) {
        panDelta.x += PAN_SPEED * (1 - (size.width - x) / EDGE_SCROLL_ZONE);
      }

      if (y < EDGE_SCROLL_ZONE) {
        panDelta.z -= PAN_SPEED * (1 - y / EDGE_SCROLL_ZONE);
      } else if (y > size.height - EDGE_SCROLL_ZONE) {
        panDelta.z += PAN_SPEED * (1 - (size.height - y) / EDGE_SCROLL_ZONE);
      }
    }

    // Apply panning
    targetRef.current.add(panDelta);

    // Clamp target to map bounds
    const bounds = 15;
    targetRef.current.x = Math.max(-bounds, Math.min(bounds, targetRef.current.x));
    targetRef.current.z = Math.max(-bounds, Math.min(bounds, targetRef.current.z));

    // Calculate camera position based on angle and distance
    const targetPos = new Vector3(
      targetRef.current.x,
      targetRef.current.y + distanceRef.current * Math.sin(angleRef.current),
      targetRef.current.z + distanceRef.current * Math.cos(angleRef.current)
    );

    // Smooth camera movement
    currentPosRef.current.lerp(targetPos, delta * 5);
    camera.position.copy(currentPosRef.current);
    camera.lookAt(targetRef.current);

    // Update store
    setCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    setCameraTarget([targetRef.current.x, targetRef.current.y, targetRef.current.z]);
  });

  return null;
}
