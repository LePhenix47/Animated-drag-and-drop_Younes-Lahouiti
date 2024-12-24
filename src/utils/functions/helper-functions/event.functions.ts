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
