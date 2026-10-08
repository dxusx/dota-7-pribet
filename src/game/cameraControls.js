/**
 * Camera Control Utilities:
 * Dota 2 style camera grip (middle mouse button / wheel click) and viewport panning.
 */

export function isCameraDragButton(button, modifiers = {}) {
  // Button 1 is Middle Mouse Button (wheel click / Camera Grip as in Dota 2)
  if (button === 1) return true;
  // Optional modifier fallback for trackpad users without middle button (e.g. Alt + Left Click)
  if (button === 0 && (modifiers.altKey || modifiers.ctrlKey)) return true;
  return false;
}

export function panCamera(camera, deltaX, deltaY) {
  if (!camera) return { x: 0, y: 0, zoom: 1 };
  return {
    ...camera,
    x: (camera.x || 0) + deltaX,
    y: (camera.y || 0) + deltaY,
  };
}

export function zoomCamera(camera, deltaY, viewportRect, mousePos) {
  const currentZoom = camera?.zoom || 0.45;
  const zoomFactor = deltaY < 0 ? 1.15 : 0.87;
  const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.15), 3.0);

  if (!viewportRect || !mousePos) {
    return { ...camera, zoom: newZoom };
  }

  const mouseX = mousePos.x - viewportRect.left;
  const mouseY = mousePos.y - viewportRect.top;

  return {
    ...camera,
    x: mouseX - (mouseX - (camera.x || 0)) * (newZoom / currentZoom),
    y: mouseY - (mouseY - (camera.y || 0)) * (newZoom / currentZoom),
    zoom: newZoom,
  };
}
