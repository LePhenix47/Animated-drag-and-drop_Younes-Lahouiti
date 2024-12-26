/**
 * Dispatches a custom event to the given content container.
 *
 * @param {string} eventName - The name of the custom event to be dispatched.
 * @param {HTMLElement} contentContainer - The HTML element that will receive the custom event.
 */
export function dispatchCustomEvent(
  eventName: string,
  contentContainer: HTMLElement
): void {
  const customEvent = new CustomEvent(eventName);
  contentContainer.dispatchEvent(customEvent);
}

/**
 * Calculates the relative position of the mouse pointer to the viewport as a percentage,
 * 0% being the top of the viewport and 100% being the bottom.
 *
 * @param {PointerEvent} event - The pointer event.
 * @returns {number} The relative position as a percentage.
 */
export function getRelativeToViewport(event: PointerEvent): number {
  const viewportHeight: number =
    window.visualViewport?.height || window.innerHeight;
  const viewportBrowserNavBarOffset: number =
    window.visualViewport?.offsetTop || 0;

  const relativeToViewport: number = Math.round(
    (100 * (event.clientY - viewportBrowserNavBarOffset)) / viewportHeight
  );

  return relativeToViewport;
}
