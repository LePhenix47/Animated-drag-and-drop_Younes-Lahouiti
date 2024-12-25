type PointerInfos = {
  isPressing: boolean;
  pressedElement: HTMLElement | null;
  initialXAnchor: number;
  initialYAnchor: number;
};

export const pointerInfos: PointerInfos = {
  isPressing: false,
  pressedElement: null,
  initialXAnchor: 0,
  initialYAnchor: 0,
};
