type PointerInfos = {
  isPressing: boolean;
  pressedElement: HTMLElement | null;
  initialXAnchor: number;
  initialYAnchor: number;
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;
};

export const pointerInfos: PointerInfos = {
  isPressing: false,
  pressedElement: null,
  initialXAnchor: 0,
  initialYAnchor: 0,
  pageX: 0,
  pageY: 0,
  clientX: 0,
  clientY: 0,
};
