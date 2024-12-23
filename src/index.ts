//Web components
import "./components/web-component.component";

const { log } = console;

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

function addCardsToContainer(container: HTMLElement, itemsAmount: number) {
  const svgIcon = /* html */ `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
  <path
    d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z">
  </path>
</svg>`;

  // ? NOTE: This is a draggable element that is in the DOM but with a display: none;
  const sampleDraggable =
    document.querySelector<HTMLElement>(`[data-js=sample]`)!;
  const draggableStringContent = (index: number) => {
    const gap = getNumberFromCssStringValue(getStyleProperty("gap", container));
    const draggableHeight = getNumberFromCssStringValue(
      getStyleProperty("--_height", sampleDraggable)
    );

    const startYPosition =
      index - 1 === itemsAmount ? draggableHeight : gap + draggableHeight;

    const draggablePosition = index + 1;

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

  let itemsListString = "";
  for (let i = 0; i < itemsAmount; i++) {
    itemsListString += draggableStringContent(i);
  }

  container.innerHTML = itemsListString;

  sampleDraggable.remove();

  const draggableElements =
    container.querySelectorAll<HTMLElement>(".draggable");

  for (let i = 0; i < draggableElements.length; i++) {
    const element = draggableElements[i];

    const { x, y }: DOMRect = element.getBoundingClientRect();

    const id = `draggable-${i + 1}`; // Generate a unique ID

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

/* HELPER FUNCTIONS */
function clamp(min: number, value: number, max: number): number {
  const checkedMinValue: number = Math.max(value, min);
  const checkedMaxValue: number = Math.min(checkedMinValue, max);
  return checkedMaxValue;
}

function getStyleProperty(
  property: string,
  element: HTMLElement | Element
): string {
  const computedStyle: CSSStyleDeclaration = getComputedStyle(element);
  return computedStyle.getPropertyValue(property);
}

function getNumberFromCssStringValue(cssStringValue: string) {
  return Number(cssStringValue.replaceAll(/%|px|em|rem/g, ""));
}

function dispatchCustomEvent(eventName: string, contentContainer: HTMLElement) {
  const customEvent = new CustomEvent(eventName);
  contentContainer.dispatchEvent(customEvent);
}
/*

DRAGGING LOGIC

*/
type PointerInfos = {
  isPressing: boolean;
  pressedElement: HTMLElement | null;
  initialXAnchor: number;
  initialYAnchor: number;
  previousX: number;
  previousY: number;
};

const pointerInfos: PointerInfos = {
  isPressing: false,
  pressedElement: null,
  initialXAnchor: 0,
  initialYAnchor: 0,
  previousX: NaN,
  previousY: NaN,
};

function userIsHoldingLeftClick(event: PointerEvent): boolean {
  return event.pointerType === "mouse" && event.button === 0;
}

function userIsTouchingScreen(event: PointerEvent): boolean {
  return event.pointerType === "touch";
}

container.addEventListener("pointerup", handlePointerLeave);
container.addEventListener("pointerdown", handlePointerDown);
container.addEventListener("pointermove", handlePointerMove);
container.addEventListener("pointercancel", handlePointerCancel);
container.addEventListener("pointerleave", handlePointerLeave);

function handlePointerCancel(event: PointerEvent) {
  log("Pointer cancel", event);
}

function handlePointerDown(event: PointerEvent) {
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

function handlePointerMove(event: PointerEvent) {
  const { pressedElement } = pointerInfos;

  const isNotPressingSquare =
    !pointerInfos.isPressing ||
    !pressedElement ||
    !pressedElement?.classList?.contains?.("draggable__handle");
  if (isNotPressingSquare) {
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

function handlePointerLeave(event: PointerEvent) {
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

function snapReleasedCardIntoPlace() {
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

  const candidates = draggableItems.slice(0, draggedItemIndex).reverse(); // Above elements
  handleSwap(candidates); // Check from the bottom of dragged card
});

container.addEventListener("custom:draggable-scroll-down", () => {
  const draggedElement = pointerInfos.pressedElement?.parentElement;
  if (!draggedElement) {
    return;
  }

  const draggedItemIndex = draggableItems.findIndex(
    (item) => item.id === draggedElement.getAttribute("data-draggable-id")
  );

  const isLastItem: boolean = draggedItemIndex > draggableItems.length - 1;
  if (isLastItem) {
    return;
  }

  const candidates = draggableItems.slice(draggedItemIndex + 1); // Below elements
  handleSwap(candidates); // Check from the top of dragged card
});

/*
SWAPPING LOGIC
*/
// Helper to get the draggable item by element
function getDraggableItem(element: HTMLElement): DraggableItem | null {
  return (
    draggableItems.find(
      (item) => item.id === element.getAttribute("data-draggable-id")
    ) || null
  );
}

// Custom swapping logic
function handleSwap(
  candidates: DraggableItem[],
  edgePoint: "mid" | "top" | "bottom" = "mid"
) {
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
  let draggedReferenceY: number;
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
  const closestItem = getClosestItem(draggedReferenceY, candidates);
  if (!closestItem) {
    return;
  }

  // Check the threshold for swap
  const threshold = closestItem.element.offsetHeight / 2;
  const candidateCenterY = closestItem.y + closestItem.element.offsetHeight / 2;
  const distance = Math.abs(draggedReferenceY - candidateCenterY);

  log({
    distance,
    candidateCenterY,
    threshold,
    "closestItem.y": closestItem.y,
  });
  if (distance <= threshold) {
    swapItems(draggedItem, closestItem, candidates);
  }
}
function getClosestItem(
  draggedReferenceY: number,
  candidates: DraggableItem[]
): DraggableItem | null {
  let closestItem: DraggableItem | null = null;
  let minDistance = Infinity;

  for (const candidate of candidates) {
    const candidateItemHeight = getNumberFromCssStringValue(
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

function swapItems(
  draggedItem: DraggableItem,
  targetItem: DraggableItem,
  candidates: DraggableItem[]
) {
  const draggedElement = draggedItem.element;
  const targetElement = targetItem.element;

  const draggedIndex = draggableItems.indexOf(draggedItem);
  const targetIndex = draggableItems.indexOf(targetItem);

  [draggableItems[draggedIndex], draggableItems[targetIndex]] = [
    draggableItems[targetIndex],
    draggableItems[draggedIndex],
  ];

  const gap = getNumberFromCssStringValue(getStyleProperty("gap", container));
  const height = getNumberFromCssStringValue(
    getStyleProperty("--_height", draggedElement)
  );

  for (let i = 0; i < draggableItems.length; i++) {
    const item = draggableItems[i];
    const newY = i * (height + gap);
    item.y = newY;
    item.element.style.setProperty("--_y", `${newY}px`);
  }

  console.log("Swapped items:", { draggedItem, targetItem });
}
