export type FloatingPopoverPosition = {
  top: number;
  left: number;
  maxHeight: number;
};

export function computeFloatingPopoverPosition(
  anchor: DOMRect,
  width: number,
  gap = 4,
  minHeight = 160
): FloatingPopoverPosition {
  const viewportPadding = 12;
  const spaceBelow = window.innerHeight - anchor.bottom - viewportPadding;
  const spaceAbove = anchor.top - viewportPadding;
  const openBelow = spaceBelow >= minHeight || spaceBelow >= spaceAbove;

  const maxHeight = Math.max(minHeight, openBelow ? spaceBelow - gap : spaceAbove - gap);
  const top = openBelow
    ? anchor.bottom + gap
    : Math.max(viewportPadding, anchor.top - gap - maxHeight);

  let left = anchor.left;
  const maxLeft = window.innerWidth - width - viewportPadding;
  left = Math.min(Math.max(viewportPadding, left), maxLeft);

  return { top, left, maxHeight };
}

export function getFloatingPopoverRoot(): HTMLElement {
  return document.getElementById('modal-root') ?? document.body;
}
