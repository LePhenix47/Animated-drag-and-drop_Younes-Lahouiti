import {
  getNumberFromCssStringValue,
  getStyleProperty,
} from "@utils/functions/helper-functions/dom.functions";

import { clamp } from "@utils/functions/helper-functions/number.functions";

import {
  dispatchCustomEvent,
  getYOffsetRelativeToViewport,
} from "@utils/functions/helper-functions/event.functions";

import { pointerInfos } from "@utils/variables/pointer-infos.variables";

//Web components
import "./components/web-component.component";
import { DraggableMoveEvent } from "@utils/types/custom-events.type";

const { log } = console;

/*
Adding more cards to the container
*/

type DraggableItem = {
  id: string;
  x: number;
  y: number;
  element: HTMLElement;
};

/**
 * *Global state variable*
 *
 * An array to store the state of all draggable items in the container.
 * The array contains objects with the following properties:
 * - `id`: Unique identifier for each draggable item
 * - `x`: Current draggable X position
 * - `y`: Current draggable Y position
 * - `element`: Reference to the DOM element
 */
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

    const draggableDomRect = element.getBoundingClientRect();
    const containerDomRect = container.getBoundingClientRect();

    const x: number = draggableDomRect.x - containerDomRect.x;
    const y: number = draggableDomRect.y - containerDomRect.y;

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

* DRAGGING LOGIC

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

container.addEventListener("pointerdown", handlePointerDown);
container.addEventListener("pointermove", handlePointerMove);
container.addEventListener("pointerup", handlePointerLeave);
container.addEventListener("pointerleave", handlePointerLeave);
container.addEventListener("pointercancel", handlePointerCancel);

function updateGlobalPointerInfosFromEvent(event: PointerEvent) {
  const { pageX, pageY, clientX, clientY } = event;

  pointerInfos.pageX = pageX;
  pointerInfos.pageY = pageY;
  pointerInfos.clientX = clientX;
  pointerInfos.clientY = clientY;
}

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

let rAFId: number | null = null;

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

  updateGlobalPointerInfosFromEvent(event);

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

  dispatchCustomEvent("custom:draggable-drag-start", container);
}

/**
 * Handles the pointermove event.
 *
 * When the user moves the pointer, this function is called and it will either dispatch a "custom:draggable-check-swap-down" or "custom:draggable-check-swap-up" event if the user has scrolled down or up respectively.
 *
 * If the user has not scrolled up or down, it will not dispatch any event.
 *
 * It will also update the "--_y" CSS variable of the parent element of the dragged item to the new Y position of the pointer.
 * @param {PointerEvent} event - The pointermove event.
 */
function handlePointerMove(event: PointerEvent): void {
  const { pressedElement } = pointerInfos;

  const isNotHoldingDraggable =
    !pressedElement?.classList?.contains?.("draggable__handle");
  if (!pointerInfos.isPressing || isNotHoldingDraggable) {
    return;
  }

  updateGlobalPointerInfosFromEvent(event);

  const { movementY } = event;

  dispatchCustomEvent("custom:draggable-drag-move", container, {
    detail: {
      movementY,
    },
  });
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

  const hadPreviouslyClickedOnDraggable: boolean =
    pointerInfos.pressedElement.parentElement?.hasAttribute("draggable");

  if (hadPreviouslyClickedOnDraggable) {
    dispatchCustomEvent("custom:draggable-drag-end", container);
  }
}

/**
 * Snaps a released card into place by updating its Y coordinate and removing the "dragging" class.
 *
 * This function is triggered when the user releases a card after dragging it. It removes the
 * "dragging" class from the card, updates the Y coordinate of the card based on its new index in
 * the array of draggable items, and logs the updated array of draggable items to the console.
 */
function snapReleasedCardIntoPlace(): void {
  log("snapReleasedCardIntoPlace");
  const { parentElement: draggedCard } = pointerInfos.pressedElement!;
  draggedCard!.classList.remove("dragging");

  const draggedItem: DraggableItem = getDraggableItem(draggedCard!)!;

  const newIndex: number = draggableItems.indexOf(draggedItem);
  const height: number = getNumberFromCssStringValue(
    getStyleProperty("--_height", draggedCard!)
  );
  const gap: number = getNumberFromCssStringValue(
    getStyleProperty("gap", container)
  );

  draggedItem.y = newIndex * (height + gap);
  draggedCard!.style.setProperty("--_y", `${draggedItem.y}px`);

  draggedCard.addEventListener(
    "transitionend",
    () => {
      draggedCard!.classList.remove("keep-high-z-index");
    },
    { once: true }
  );

  draggedCard;

  console.table(draggableItems);
}

/**
 * rAF loop function to handle scrolling and emitting pointermove events.
 *
 * This function is continuously called during dragging to check scroll thresholds
 * and emit pointermove events to keep the draggable element following the cursor.
 */
function handleScrollAndPointerMove() {
  checkScrollingWhileDragging();

  // Continue the rAF loop
  rAFId = requestAnimationFrame(handleScrollAndPointerMove);
}

/**
 * Checks if the user is scrolling while dragging a card and, if so, scrolls the window accordingly.
 */
function checkScrollingWhileDragging() {
  const { clientY } = pointerInfos;

  // Array of objects with thresholds and corresponding speeds
  const SCROLL_SETTINGS = [
    { threshold: 0.55, speed: 1 },
    { threshold: 0.6, speed: 2 },
    { threshold: 0.65, speed: 4 },
    { threshold: 0.7, speed: 10 },
    { threshold: 0.8, speed: 25 },
    { threshold: 0.9, speed: 100 },
  ] as const;

  const yOffsetRelativeToViewport: number =
    getYOffsetRelativeToViewport(clientY);

  // ? Value between [-100, 100], from the center
  const yOffsetFromScreenCenter: number = (yOffsetRelativeToViewport - 50) * 2;
  const isUnderMinThreshold =
    Math.abs(yOffsetFromScreenCenter) < SCROLL_SETTINGS[0]?.threshold * 100;
  if (isUnderMinThreshold) {
    return;
  }

  let scrollDirection: 1 | -1 | 0 = 0;
  if (yOffsetFromScreenCenter > 0) {
    scrollDirection = 1;
  } else if (yOffsetFromScreenCenter < 0) {
    scrollDirection = -1;
  }

  // Compute the scroll speed based on thresholds
  let scrollSpeed = 0;

  for (let i = 0; i < SCROLL_SETTINGS.length; i++) {
    const { threshold: currentThreshold, speed } = SCROLL_SETTINGS[i];

    const nextThreshold = SCROLL_SETTINGS[i + 1]?.threshold ?? Infinity;

    const isWithinThresholdRange: boolean =
      Math.abs(yOffsetFromScreenCenter) >= currentThreshold * 100 &&
      Math.abs(yOffsetFromScreenCenter) < nextThreshold * 100;
    if (isWithinThresholdRange) {
      scrollSpeed = speed;
      break;
    }
  }

  // Apply scrolling if a valid speed is set
  if (scrollSpeed > 0) {
    // Increment the accumulated offset based on speed and direction
    // Use window.scrollTo with the accumulated offset for smooth behavior
    window.scrollTo({
      top: window.scrollY + scrollSpeed * scrollDirection,
      behavior: "instant",
    });

    pointerInfos.pageY = window.scrollY + clientY;

    // Emit pointermove event to update draggable position and other interactions
    dispatchCustomEvent("custom:draggable-drag-move", container, {
      detail: {
        movementY: yOffsetFromScreenCenter,
      },
    });
  }
}

/*
 * CUSTOM EVENT LISTENERS
 */
container.addEventListener("custom:draggable-drag-start", () => {
  const { parentElement } = pointerInfos.pressedElement!;

  const dragginCardClassesToAdd = ["dragging", "keep-high-z-index"] as const;

  for (const draggingClass of dragginCardClassesToAdd) {
    parentElement.classList.add(draggingClass);
  }

  const draggableDomRect: DOMRect = parentElement!.getBoundingClientRect();
  const containerDomRect: DOMRect = container.getBoundingClientRect();

  const computedXAnchor: number =
    pointerInfos.pageX + containerDomRect.x - draggableDomRect.x;
  const computedYAnchor: number =
    pointerInfos.pageY + containerDomRect.y - draggableDomRect.y;

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

  dispatchCustomEvent("custom:draggable-drag-hold", container);
});

container.addEventListener("custom:draggable-drag-hold", () => {
  if (rAFId) {
    return;
  }

  rAFId = requestAnimationFrame(handleScrollAndPointerMove);
});

container.addEventListener(
  "custom:draggable-drag-move",
  (event: CustomEvent<DraggableMoveEvent>) => {
    // * Switch top or bottom draggable position
    const { movementY } = event.detail;

    const hasScrolledDown: boolean = movementY > 0;
    const hasScrolledUp: boolean = movementY < 0;

    if (hasScrolledDown) {
      dispatchCustomEvent("custom:draggable-check-swap-down", container);
    } else if (hasScrolledUp) {
      dispatchCustomEvent("custom:draggable-check-swap-up", container);
    } else {
      console.log("No Y direction change while dragging");
    }

    // * Changing the draggable Y positon to follow the cursor
    const containerDomRect: DOMRect = container.getBoundingClientRect();

    const { pageY } = pointerInfos;

    const arrayOfAxis = [
      // {
      //   axisName: "x",
      //   computedOffset: clamp(
      //     0,
      //     pageX - pointerInfos.initialXAnchor,
      //     containerDomRect.width
      //   ),
      // },
      {
        axisName: "y",
        computedOffset: clamp(
          0,
          pageY - pointerInfos.initialYAnchor,
          containerDomRect.height
        ),
      },
    ];

    for (const axis of arrayOfAxis) {
      const { axisName, computedOffset } = axis;

      const { parentElement } = pointerInfos.pressedElement!;
      parentElement!.style.setProperty(`--_${axisName}`, `${computedOffset}px`);

      const draggedItem: DraggableItem = getDraggableItem(parentElement!);
      if (draggedItem) {
        draggedItem.y = computedOffset;
      }
    }
  }
);

container.addEventListener("custom:draggable-check-swap-up", () => {
  const draggedElement = pointerInfos.pressedElement?.parentElement;
  if (!draggedElement) {
    return;
  }

  const draggedItemIndex = draggableItems.findIndex(
    (item) => item.id === draggedElement.getAttribute("data-draggable-id")
  );

  const isFirstItem: boolean = draggedItemIndex === 0;
  const itemHasNotBeenFound = draggedItemIndex < 0;
  if (itemHasNotBeenFound || isFirstItem) {
    return;
  }

  //* Check above elements
  handleSwap(draggedItemIndex, "up");
});

container.addEventListener("custom:draggable-check-swap-down", () => {
  const draggedElement: HTMLElement =
    pointerInfos.pressedElement?.parentElement;
  if (!draggedElement) {
    return;
  }

  const draggedItemIndex: number = draggableItems.findIndex(
    (item) => item.id === draggedElement.getAttribute("data-draggable-id")
  );

  const isLastItem: boolean = draggedItemIndex === draggableItems.length - 1;
  const itemHasNotBeenFound = draggedItemIndex < 0;
  if (itemHasNotBeenFound || isLastItem) {
    return;
  }

  //* Check below elements
  handleSwap(draggedItemIndex, "down");
});

container.addEventListener("custom:draggable-drag-end", () => {
  snapReleasedCardIntoPlace();

  pointerInfos.pressedElement = null;

  if (!rAFId) {
    return;
  }

  cancelAnimationFrame(rAFId);
  rAFId = null;
});
/*
 * SWAPPING LOGIC
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

/**
 * Calculates the center Y position of a draggable item.
 *
 * @param {DraggableItem} item - The draggable item whose center Y needs to be calculated.
 * @returns {number} The center Y position of the item.
 */
function calculateCenterY(item: DraggableItem): number {
  const height = getNumberFromCssStringValue(
    getStyleProperty("--_height", item.element)
  );
  return item.y + height / 2;
}
/**
 * Handles the swapping of the dragged item with an adjacent item.
 *
 * @param {number} draggedIndex - The index of the currently dragged item.
 * @param {"up" | "down"} direction - The direction of the swap (up or down).
 */
function handleSwap(draggedIndex: number, direction: "up" | "down"): void {
  const draggedItem = draggableItems[draggedIndex];
  if (!draggedItem) {
    return;
  }

  // Determine the target index based on the direction
  const targetIndex: number =
    direction === "up" ? draggedIndex - 1 : draggedIndex + 1;

  const targetItem: DraggableItem = draggableItems[targetIndex];
  if (!targetItem) {
    return;
  }

  // Calculate the center Y positions of dragged and target items
  const draggedCenterY: number = calculateCenterY(draggedItem);
  const targetCenterY: number = calculateCenterY(targetItem);
  // Calculate the threshold for swapping
  const threshold: number = targetItem.element.offsetHeight / 2;
  const distance: number = Math.abs(draggedCenterY - targetCenterY);

  if (distance <= threshold) {
    // Perform the swap
    swapItems(draggedItem, targetItem);
  }
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
  const targetElement: HTMLElement = targetItem.element;

  const draggedIndex: number = draggableItems.indexOf(draggedItem);
  const targetIndex: number = draggableItems.indexOf(targetItem);

  const gap: number = getNumberFromCssStringValue(
    getStyleProperty("gap", container)
  );
  const height: number = getNumberFromCssStringValue(
    getStyleProperty("--_height", draggedElement)
  );

  // ? Update Y positions for both items
  targetItem.y = draggedIndex * (height + gap);

  //?  Swap the items in the array
  [draggableItems[draggedIndex], draggableItems[targetIndex]] = [
    draggableItems[targetIndex],
    draggableItems[draggedIndex],
  ];

  // ? Update the CSS variables for the targeted item
  targetElement.style.setProperty("--_y", `${targetItem.y}px`);

  log("Swapped items and updated positions:", {
    draggedItem,
    targetItem,
    draggableItems,
  });
}
