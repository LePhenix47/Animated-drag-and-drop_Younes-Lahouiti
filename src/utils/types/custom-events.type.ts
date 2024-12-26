export type DraggableMoveEvent = Partial<
  Pick<PointerEvent, "pageX" | "pageY" | "clientX" | "clientY">
>;
