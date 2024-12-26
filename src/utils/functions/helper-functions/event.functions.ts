/**
 * Dispatches a custom event to the given content container element.
 *
 * @param {string} eventName - The name of the custom event.
 * @param {HTMLElement} contentContainer - The element to which the event will be dispatched.
 * @param {CustomEventInit<unknown>} [options] - Options for the custom event.
 * @returns {void}
 */
export function dispatchCustomEvent(
  eventName: string,
  contentContainer: HTMLElement,
  options?: CustomEventInit<unknown>
): void {
  const customEvent = new CustomEvent(eventName, options);
  contentContainer.dispatchEvent(customEvent);
}

/**
 * Calculates the relative position of the given y coordinate to the viewport as a percentage,
 * 0% being the top of the viewport and 100% being the bottom.
 *
 * @param {number} clientY - The visible part of the browser window to calculate the relative position of.
 * @returns {number} The relative position as a percentage.
 */
export function getYOffsetRelativeToViewport(clientY: number): number {
  const viewportHeight: number =
    window.visualViewport?.height || window.innerHeight;

  const viewportBrowserNavBarOffset: number =
    window.visualViewport?.offsetTop || 0;

  const relativeToViewport: number =
    (clientY - viewportBrowserNavBarOffset) / viewportHeight;

  return Math.round(100 * relativeToViewport);
}
