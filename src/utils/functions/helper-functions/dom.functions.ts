/**
 * Simpler version of `document.getElementsByClassName()`
 * Selects all elements with a given class name inside a given container or the whole document.
 *
 * @param {string} className - The class name of the elements to select.
 * @param {any} container - The parent element to search within.
 *
 * @returns {HTMLElement[]|[]} A collection of elements with the specified class name.
 */
export function selectByClass(
  className: string,
  container?: any
): HTMLElement[] | [] {
  const hasNoParentContainer: boolean = !container;
  if (hasNoParentContainer) {
    return Array.from(
      document.getElementsByClassName(className)
    ) as HTMLElement[];
  }

  /**
   * We check if it's a web component, they always have a hyphen in their tag name
   */
  const containerIsWebComponent: boolean = container?.tagName?.includes("-");

  if (containerIsWebComponent) {
    return Array.from(
      container.shadowRoot.getElementsByClassName(className)
    ) as HTMLElement[];
  }
  return Array.from(
    container.getElementsByClassName(className)
  ) as HTMLElement[];
}

/**
 * Simpler version of `document.getElementById()`
 * Selects an element with a given ID inside a given container or the whole document.
 *
 * @param {string} id - The ID of the element to select.
 * @param {any} container - The parent element to search within.
 *
 * @returns {HTMLElement} The element with the specified ID.
 */
export function selectById(id: string, container?: any): HTMLElement {
  const hasNoParentContainer: boolean = !container;
  if (hasNoParentContainer) {
    return document.getElementById(id);
  }

  /**
   * We check if it's a web component, they always have a hyphen in their tag name
   */
  const containerIsWebComponent: boolean = container?.tagName?.includes("-");

  if (containerIsWebComponent) {
    return container.shadowRoot.getElementById(id);
  }
  return container.getElementById(id);
}

/**
 * A simplified version of `document.querySelector()`
 *
 * @param {string} query - CSS query of the HTML Element to select
 * @param {any} container - HTML Element to select the query from
 *
 * @returns {HTMLElement} - The element selected or `null` if the element doesn't exist
 */

export function selectQuery(query: string, container?: any): HTMLElement {
  const hasNoParentContainer: boolean = !container;
  if (hasNoParentContainer) {
    return document.querySelector(query);
  }
  /**
   * We check if it's a web component, they always have a hyphen in their tag name
   */
  const containerIsWebComponent: boolean = container?.tagName?.includes("-");

  if (containerIsWebComponent) {
    return container.shadowRoot.querySelector(query);
  }

  return container.querySelector(query);
}

/**
 * A simplified version of `document.querySelectorAll()`
 *
 * @param {string} query - CSS query of the HTML Elements to select
 * @param {any} container - HTML Element to select the query from
 * @returns {HTMLElement[] | []} - An array with all the elements selected or `null` if the element doesn't exist
 */
export function selectQueryAll(
  query: string,
  container?: any
): HTMLElement[] | [] {
  const hasNoParentContainer: boolean = !container;
  if (hasNoParentContainer) {
    return Array.from(document.querySelectorAll(query));
  }

  const isWebComponent: boolean = container.tagName.includes("-");

  if (isWebComponent) {
    return Array.from(container.shadowRoot.querySelectorAll(query));
  }

  return Array.from(container.querySelectorAll(query));
}

/**
 * Function that returns an array containing all child nodes of an HTML element.
 *
 * @param {HTMLElement} elementOfReference The parent HTML element whose children to select.
 * @returns {HTMLElement[]} An array containing all child nodes of the parent element or null if the parent element has no children.
 */
export function getChildren(elementOfReference: any | null): HTMLElement[] {
  return Array.from(elementOfReference.children);
}

/**
 * Returns the parent element of a given element.
 * @param {HTMLElement} elementOfReference - The child element for which to find the parent.
 * @returns {HTMLElement} - The parent element of the child element, or null if the parent cannot be found.
 */
export function getParent(elementOfReference: HTMLElement): HTMLElement {
  return elementOfReference.parentElement;
}

/**
 * Returns the closest ancestor element of a given HTML element based on a CSS selector.
 *
 * @param {HTMLElement} elementOfReference - The HTML element of reference.
 * @param {string} cssSelector - The CSS selector to use to select the ancestor element. Default is an empty string.
 *
 * @returns {HTMLElement|null} The closest ancestor element that matches the CSS selector, or null if no ancestor element matches the selector.
 */

export function getAncestor(
  elementOfReference: HTMLElement,
  cssSelector: string
): HTMLElement | null {
  return elementOfReference.closest(cssSelector);
}

/**
 *Returns the host element of a web component given a reference element within it.
 *
 *@param {HTMLElement} elementOfReference - An element that is a child of the web component.
 *
 * @returns {ShadowRoot | null} - The host element of the web component.
 */

export function getComponentHost(
  elementOfReference: HTMLElement
): ShadowRoot | null {
  const rootNode: Node = elementOfReference.getRootNode();

  const elementIsInShadowRoot: boolean = rootNode instanceof ShadowRoot;
  if (elementIsInShadowRoot) {
    return rootNode as ShadowRoot;
  }
  return null;
}

/**
 * Returns the next sibling element of the specified element.
 *
 * @param {HTMLElement} elementOfReference - The reference element whose sibling to return.
 * @returns {any | null} The next sibling element, or null if there is none.
 */
export function getSibling(
  elementOfReference: HTMLElement
): HTMLElement | null {
  return elementOfReference.nextElementSibling as HTMLElement;
}

/**
 *
 * Returns an array of strings representing the classes of the specified element.
 *
 * @param {HTMLElement} elementOfReference - The element to retrieve class values from.
 *
 * @returns An array of strings representing the classes of the specified element.
 */
export function getClassListValues(elementOfReference: HTMLElement): string[] {
  return Array.from(elementOfReference.classList);
}

/**
 * Sets the value of a specified CSS property for the given HTML element.
 *
 * @param {string} property - The name of the style property to set.
 * @param {any} value - The value to set for the specified style property.
 * @param {any} [element=document.body] - The HTML element to set the style property for, ***NOT mandatory***.

* @returns {void}
 */
export function setStyleProperty(
  property: string,
  value: any,
  element: HTMLElement = document.body
): void {
  const stringifiedValue = value.toString();
  return element.style.setProperty(property, stringifiedValue);
}

/**
 * Retrieves the value of a CSS property from an element's computed style.
 *
 * @param {string} property - The name of the CSS property to retrieve.
 * @param {HTMLElement | Element} element - The element to get the computed style from.
 *
 * @returns {string} The value of the specified CSS property.
 */
export function getStyleProperty(
  property: string,
  element: HTMLElement | Element
): string {
  const computedStyle: CSSStyleDeclaration = getComputedStyle(element);
  return computedStyle.getPropertyValue(property);
}

/**
 * Converts a CSS string value to a number by removing any units (%, px, em, rem) and parsing the result.
 *
 * @param {string} cssStringValue - The string value to convert to a number.
 *
 * @returns {number} The numerical value of the input string.
 */
export function getNumberFromCssStringValue(cssStringValue: string): number {
  return Number(cssStringValue.replaceAll(/%|px|em|rem/g, ""));
}
