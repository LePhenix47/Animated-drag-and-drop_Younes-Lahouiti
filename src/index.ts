import {
  getNumberFromCssStringValue,
  getStyleProperty,
} from "@utils/functions/helper-functions/dom.functions";

import { clamp } from "@utils/functions/helper-functions/number.functions";

import { dispatchCustomEvent } from "@utils/functions/helper-functions/event.functions";

import { pointerInfos } from "@utils/variables/pointer-infos.variables";

//Web components
import "./components/web-component.component";

const { log } = console;

// TODO: Split the code into files

/*
Adding more cards to the container
*/

type DraggableItem = {
  id: string; // Unique identifier for each draggable item
  x: number; // Current X position
  y: number; // Current Y position
  element: HTMLElement; // Reference to the DOM element (optional, but could be useful)
};

let draggableItems: DraggableItem[] = [];

const container = document.querySelector<HTMLElement>(`[data-js=container]`)!;
const CARDS_IN_CONTAINER: number = getNumberFromCssStringValue(
  getStyleProperty("--_cards-in-container", container)
);

/**
 * Adds a specified amount of draggable items to the container element.
 * The function uses the "draggable" class and the "data-draggable-id" attribute to identify the items.
 * The items are added with a gap of 1rem between them and the order is reversed (the last item is placed at the bottom of the container).
 * The content of each item is the index of the item starting from 1.
 * @param {HTMLElement} container The container element where the items will be added.
 * @param {number} itemsAmount The amount of items to be added.
 */
function addCardsToContainer(
  container: HTMLElement,
  itemsAmount: number
): void {
  const svgIcon = /* html */ `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path
    d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z">
  </path>
</svg>`;

  // ? NOTE: This is a draggable element that is in the DOM but with a display: none;
  const sampleDraggable =
    document.querySelector<HTMLElement>(`[data-js=sample]`)!;

  /**
   * Returns a string containing the HTML for a draggable item.
   * The Y position of the item is calculated based on the index and the gap between items.
   * The id of the item is set to `"draggable-<index>"` and the content is set to the index.
   * @param {number} index The index of the item to be created.
   * @returns {string} A string containing the HTML for the draggable item.
   */
  const draggableStringContent = (index: number): string => {
    const gap = getNumberFromCssStringValue(getStyleProperty("gap", container));
    const draggableHeight = getNumberFromCssStringValue(
      getStyleProperty("--_height", sampleDraggable)
    );

    const startYPosition: number =
      index - 1 === itemsAmount ? draggableHeight : gap + draggableHeight;

    const draggablePosition: number = index + 1;

    return /* html */ `
  <li class="draggable" draggable style="--_y: ${
    index * startYPosition
  }px;" data-draggable-id="draggable-${draggablePosition}">
    <button class="draggable__handle">
      <span class="draggable__handle-icon no-pointer-events square-icon" aria-label="Draggable handle icon">
        ${svgIcon}
      </span>
    </button>

    ${draggablePosition}
  </li>
  `;
  };

  let itemsListString: string = "";
  for (let i = 0; i < itemsAmount; i++) {
    itemsListString += draggableStringContent(i);
  }

  container.innerHTML = itemsListString;

  sampleDraggable.remove();

  const draggableElements =
    container.querySelectorAll<HTMLElement>(".draggable");

  for (let i = 0; i < draggableElements.length; i++) {
    const element: HTMLElement = draggableElements[i];

    const { x, y }: DOMRect = element.getBoundingClientRect();

    const id: string = `draggable-${i + 1}`; // Generate a unique ID

    const draggableItem: DraggableItem = {
      id,
      x,
      y,
      element,
    };

    // Add the item to the draggableItems array
    draggableItems.push(draggableItem);
  }

  console.log("Draggable items initialized:", draggableItems);
}

addCardsToContainer(container, CARDS_IN_CONTAINER);

/*

DRAGGING LOGIC

*/

/**
 * Returns true if the given PointerEvent is a left-click event.
 *
 * @param {PointerEvent} event - The PointerEvent to check.
 * @returns {boolean} True if the user is holding the left-click button, false otherwise.
 */
function userIsHoldingLeftClick(event: PointerEvent): boolean {
  return event.pointerType === "mouse" && event.button === 0;
}

/**
 * Returns true if the given PointerEvent is a touch event.
 *
 * @param {PointerEvent} event - The PointerEvent to check.
 * @returns {boolean} True if the user is touching the screen, false otherwise.
 */
function userIsTouchingScreen(event: PointerEvent): boolean {
  return event.pointerType === "touch";
}

container.addEventListener("pointerup", handlePointerLeave);
container.addEventListener("pointerdown", handlePointerDown);
container.addEventListener("pointermove", handlePointerMove);
container.addEventListener("pointercancel", handlePointerCancel);
container.addEventListener("pointerleave", handlePointerLeave);

/**
 * Handles the pointer cancel event.
 *
 * When the user releases the pointer, this function is called and it will log the event to the console.
 *
 * @param {PointerEvent} event - The pointer cancel event.
 */
function handlePointerCancel(event: PointerEvent): void {
  log("Pointer cancel", event);
}

/**
 * Handles the pointerdown event.
 *
 * This function is triggered when the user presses down on a target element.
 * It prevents the default behavior and determines whether the user is pressing
 * with a mouse or touching the screen. If the pressed element is draggable,
 * it stores the element in the `pointerInfos` and calculates the initial offset
 * anchors for the drag operation. Additionally, it adds a "dragging" class to
 * the draggable element.
 *
 * @param {PointerEvent} event - The pointerdown event.
 */
function handlePointerDown(event: PointerEvent): void {
  event.preventDefault();

  pointerInfos.isPressing =
    userIsHoldingLeftClick(event) || userIsTouchingScreen(event);

  // Save initial offset
  const element = event.target! as HTMLElement;
  pointerInfos.pressedElement = element;

  const hasNotClickedOnDraggable =
    !element?.parentElement?.hasAttribute?.("draggable");
  if (hasNotClickedOnDraggable) {
    return;
  }

  element.parentElement!.classList.add("dragging"); // Need to toggle the class ONLY on the draggable element

  const rect = element!.getBoundingClientRect();
  const containerDomRect = container.getBoundingClientRect();

  const computedXAnchor = event.pageX + containerDomRect.x - rect.x;
  const computedYAnchor = event.pageY + containerDomRect.y - rect.y;

  pointerInfos.initialXAnchor = clamp(
    0,
    computedXAnchor,
    containerDomRect.width
  );

  pointerInfos.initialYAnchor = clamp(
    0,
    computedYAnchor,
    containerDomRect.height
  );

  log("Pointer info down ↓:", pointerInfos);
}

/**
 * Handles the pointermove event.
 *
 * When the user moves the pointer, this function is called and it will either dispatch a "custom:draggable-scroll-down" or "custom:draggable-scroll-up" event if the user has scrolled down or up respectively.
 *
 * If the user has not scrolled up or down, it will not dispatch any event.
 *
 * It will also update the "--_y" CSS variable of the parent element of the dragged item to the new Y position of the pointer.
 * @param {PointerEvent} event - The pointermove event.
 */
function handlePointerMove(event: PointerEvent): void {
  const { pressedElement } = pointerInfos;

  const isNotHoldingDraggable =
    !pointerInfos.isPressing ||
    !pressedElement?.classList?.contains?.("draggable__handle");
  if (isNotHoldingDraggable) {
    return;
  }

  if (!pointerInfos.previousX) {
    pointerInfos.previousX = event.pageX;
  }

  if (!pointerInfos.previousY) {
    pointerInfos.previousY = event.pageY;
  }

  const hasScrolledDown: boolean = event.pageY > pointerInfos.previousY;
  const hasScrolledUp: boolean = event.pageY < pointerInfos.previousY;

  if (hasScrolledDown) {
    dispatchCustomEvent("custom:draggable-scroll-down", container);
  } else if (hasScrolledUp) {
    dispatchCustomEvent("custom:draggable-scroll-up", container);
  } else {
    console.log("No Y direction change while dragging");
  }

  pointerInfos.previousX = event.pageX;
  pointerInfos.previousY = event.pageY;

  //  log("Moving", pointerInfos.isPressing, isNotPressingSquare);

  const containerDomRect = container.getBoundingClientRect();

  const arrayOfAxis = [
    //    {
    //      axisName: "x",
    //      computedOffset: clamp(
    //        0,
    //        event.pageX - pointerInfos.initialXAnchor,
    //        containerDomRect.width
    //      ),
    //    },
    {
      axisName: "y",
      computedOffset: clamp(
        0,
        event.pageY - pointerInfos.initialYAnchor,
        containerDomRect.height
      ),
    },
  ];

  for (const axis of arrayOfAxis) {
    const { axisName, computedOffset } = axis;

    const { parentElement } = pressedElement!;
    parentElement!.style.setProperty(`--_${axisName}`, `${computedOffset}px`);

    const draggedItem = getDraggableItem(parentElement!);
    if (draggedItem) {
      draggedItem.y = computedOffset;
    }
  }
}

/**
 * Handles the pointer leave event.
 *
 * This function is triggered when the pointer leaves the container element.
 * It prevents the default behavior, sets the `isPressing` flag to false, and
 * checks if the previously pressed element was draggable. If so, it snaps the
 * released card into place. Finally, it clears the reference to the pressed element.
 *
 * @param {PointerEvent} event - The pointer leave event.
 */
function handlePointerLeave(event: PointerEvent): void {
  console.log("handlePointerLeave");
  event.preventDefault();
  pointerInfos.isPressing = false;

  if (!pointerInfos.pressedElement) {
    return;
  }

  const hadPreviouslyClickedOnDraggable =
    pointerInfos.pressedElement.parentElement?.hasAttribute("draggable");

  if (hadPreviouslyClickedOnDraggable) {
    snapReleasedCardIntoPlace();
  }

  pointerInfos.pressedElement = null;
}

/**
 * Snaps a released card into place by updating its Y coordinate and removing the "dragging" class.
 *
 * This function is triggered when the user releases a card after dragging it. It removes the
 * "dragging" class from the card, updates the Y coordinate of the card based on its new index in
 * the array of draggable items, and logs the updated array of draggable items to the console.
 */
function snapReleasedCardIntoPlace(): void {
  const { parentElement: draggedCard } = pointerInfos.pressedElement!;
  draggedCard!.classList.remove("dragging");

  const draggedItem = getDraggableItem(draggedCard!)!;

  // TODO create a function to update a cards Y
  const newIndex = draggableItems.indexOf(draggedItem);
  const height = getNumberFromCssStringValue(
    getStyleProperty("--_height", draggedCard!)
  );
  const gap = getNumberFromCssStringValue(getStyleProperty("gap", container));

  draggedItem.y = newIndex * (height + gap);
  draggedCard!.style.setProperty("--_y", `${draggedItem.y}px`);

  console.table(draggableItems);
}

/*
CUSTOM EVENT LISTENERS
*/

container.addEventListener("custom:draggable-scroll-up", () => {
  const draggedElement = pointerInfos.pressedElement?.parentElement;
  if (!draggedElement) {
    return;
  }

  const draggedItemIndex = draggableItems.findIndex(
    (item) => item.id === draggedElement.getAttribute("data-draggable-id")
  );

  const isFirstItem: boolean = draggedItemIndex === 0;
  if (isFirstItem) {
    return;
  }

  const candidates: DraggableItem[] = draggableItems
    .slice(0, draggedItemIndex)
    .reverse(); // Above elements
  handleSwap(candidates); // Check from the bottom of dragged card
});

container.addEventListener("custom:draggable-scroll-down", () => {
  const draggedElement: HTMLElement =
    pointerInfos.pressedElement?.parentElement;
  if (!draggedElement) {
    return;
  }

  const draggedItemIndex: number = draggableItems.findIndex(
    (item) => item.id === draggedElement.getAttribute("data-draggable-id")
  );

  const isLastItem: boolean = draggedItemIndex > draggableItems.length - 1;
  if (isLastItem) {
    return;
  }

  const candidates: DraggableItem[] = draggableItems.slice(
    draggedItemIndex + 1
  ); // Below elements
  handleSwap(candidates); // Check from the top of dragged card
});

/*
SWAPPING LOGIC
*/
// Helper to get the draggable item by element

/**
 * Finds a DraggableItem in the draggableItems array by comparing its ID attribute with the element's `data-draggable-id` attribute.
 * @param {HTMLElement} element - The element to find the DraggableItem for.
 * @returns {DraggableItem | null} The DraggableItem associated with the element, or null if not found.
 */
function getDraggableItem(element: HTMLElement): DraggableItem | null {
  return (
    draggableItems.find(
      (item) => item.id === element.getAttribute("data-draggable-id")
    ) || null
  );
}

// Custom swapping logic

/**
 * Handles the swapping of the dragged item with a candidate item.
 *
 * This function is called when the user drags an item and the
 * `custom:draggable-scroll-up` or `custom:draggable-scroll-down` event is
 * triggered. It takes an array of candidate items and an optional
 * `edgePoint` parameter. The default value for `edgePoint` is `"mid"`.
 *
 * @param {DraggableItem[]} candidates - The array of candidate items to
 *   check for swapping.
 * @param {"mid" | "top" | "bottom"} [edgePoint="mid"] - The edge point of
 *   the dragged item to check for swapping. The default value is `"mid"`.
 */
function handleSwap(
  candidates: DraggableItem[],
  edgePoint: "mid" | "top" | "bottom" = "mid"
): void {
  const draggedElement = pointerInfos.pressedElement?.parentElement;
  if (!draggedElement) {
    return;
  }

  const draggedItem = getDraggableItem(draggedElement);
  if (!draggedItem) {
    return;
  }

  const draggedItemHeight = getNumberFromCssStringValue(
    getStyleProperty("--_height", draggedItem.element)
  );

  // Calculate the dragged reference Y
  let draggedReferenceY: number = NaN;
  switch (edgePoint) {
    case "top":
      draggedReferenceY = draggedItem.y;
      break;
    case "bottom":
      draggedReferenceY = draggedItem.y + draggedItemHeight;
      break;
    default:
      draggedReferenceY = draggedItem.y + draggedItemHeight / 2;
      break;
  }

  // Find the closest valid candidate
  const closestItem: DraggableItem = getClosestItem(
    draggedReferenceY,
    candidates
  );
  if (!closestItem) {
    return;
  }

  // Check the threshold for swap
  const threshold: number = closestItem.element.offsetHeight / 2;
  const candidateCenterY: number =
    closestItem.y + closestItem.element.offsetHeight / 2;
  const distance: number = Math.abs(draggedReferenceY - candidateCenterY);

  log({
    distance,
    candidateCenterY,
    threshold,
    "closestItem.y": closestItem.y,
  });
  if (distance <= threshold) {
    swapItems(draggedItem, closestItem);
  }
}

/**
 * Finds the closest item to the dragged item by comparing their Y positions.
 * Returns the closest item or null if no valid candidate is found.
 *
 * @param {number} draggedReferenceY - The Y position of the dragged item to compare with.
 * @param {DraggableItem[]} candidates - The array of candidate items to check for closeness.
 *
 * @returns {DraggableItem | null} The closest item to the dragged item, or null if no valid candidate is found.
 */
function getClosestItem(
  draggedReferenceY: number,
  candidates: DraggableItem[]
): DraggableItem | null {
  let closestItem: DraggableItem | null = null;
  let minDistance: number = Infinity;

  for (const candidate of candidates) {
    const candidateItemHeight: number = getNumberFromCssStringValue(
      getStyleProperty("--_height", candidate.element)
    );

    if (Number.isNaN(candidateItemHeight)) {
      console.error("Invalid candidateItemHeight:", candidateItemHeight);
      continue;
    }

    const candidateCenterY = candidate.y + candidateItemHeight / 2;

    if (Number.isNaN(candidateCenterY)) {
      console.error("Invalid candidateCenterY:", candidateCenterY);
      continue;
    }

    const distance = Math.abs(draggedReferenceY - candidateCenterY);

    if (Number.isNaN(distance)) {
      console.error("Invalid distance:", distance);
      continue;
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestItem = candidate;
    }
  }

  return closestItem;
}

/**
 * Swaps two items in the array of draggable items and updates their positions accordingly.
 *
 * @param {DraggableItem} draggedItem - The item that was dragged.
 * @param {DraggableItem} targetItem - The item that is the target of the swap.
 */
function swapItems(
  draggedItem: DraggableItem,
  targetItem: DraggableItem
): void {
  const draggedElement: HTMLElement = draggedItem.element;

  const draggedIndex: number = draggableItems.indexOf(draggedItem);
  const targetIndex: number = draggableItems.indexOf(targetItem);

  [draggableItems[draggedIndex], draggableItems[targetIndex]] = [
    draggableItems[targetIndex],
    draggableItems[draggedIndex],
  ];

  const gap: number = getNumberFromCssStringValue(
    getStyleProperty("gap", container)
  );
  const height: number = getNumberFromCssStringValue(
    getStyleProperty("--_height", draggedElement)
  );

  for (let i = 0; i < draggableItems.length; i++) {
    const item: DraggableItem = draggableItems[i];
    const newY: number = i * (height + gap);
    item.y = newY;
    item.element.style.setProperty("--_y", `${newY}px`);
  }

  console.log("Swapped items:", { draggedItem, targetItem });
}
