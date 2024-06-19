export interface DragEvent {
  item: any;
  key: any;
  index?: number;
  event: any;
}

export interface DropEvent {
  key: any;
  item: any;
  list: any[];
  event: any;
  changed: boolean;
  oldList: any[];
  oldIndex: number;
  newIndex: number;
}

export interface ScrollSpeed {
  x: number;
  y: number;
}

export interface SortableOptions {
  list: any[];
  uniqueKeys: any[];
  delay?: number;
  group?: any;
  handle?: string;
  lockAxis?: 'x' | 'y';
  disabled?: boolean;
  sortable?: boolean;
  draggable?: string;
  animation?: number;
  autoScroll?: boolean;
  ghostClass?: string;
  ghostStyle?: any;
  chosenClass?: string;
  scrollSpeed?: ScrollSpeed;
  fallbackOnBody?: boolean;
  scrollThreshold?: number;
  delayOnTouchOnly?: boolean;
  onDrag?: (event: DragEvent) => void;
  onDrop?: (event: DropEvent) => void;
}

declare const SortableAttrs: string[];

declare class Sortable {
  public el: HTMLElement;
  public options: SortableOptions;

  constructor(el: HTMLElement, options: SortableOptions);

  reRendered: boolean;

  option<K extends keyof SortableOptions>(name: K, value: SortableOptions[K]): void;

  destroy(): void;
}

export interface ScrollEvent {
  top: boolean;
  bottom: boolean;
  offset: number;
  direction: 'FRONT' | 'BEHIND' | 'STATIONARY';
}

export interface VirtualOptions {
  size?: number;
  keeps?: number;
  buffer?: number;
  wrapper?: HTMLElement;
  scroller?: HTMLElement | Document;
  direction?: 'vertical' | 'horizontal';
  uniqueKeys?: any[];
  debounceTime?: number;
  throttleTime?: number;
  onScroll?: (event: ScrollEvent) => void;
  onUpdate?: (range: Range) => void;
}

export interface Range {
  start: number;
  end: number;
  front: number;
  behind: number;
}

declare const VirtualAttrs: string[];

declare class Virtual {
  public options: VirtualOptions;
  constructor(options: VirtualOptions);

  sizes: Map<string | number, number>;

  offset: number;

  option<K extends keyof VirtualOptions>(name: K, value: VirtualOptions[K]): void;

  enableScroll(enable: boolean): void;

  updateRange(range?: Range): void;

  getSize(key: string | number): number;

  getOffset(): number;

  getScrollSize(): number;

  getClientSize(): number;

  scrollToOffset(offset: number): void;

  scrollToIndex(index: number): void;

  scrollToBottom(): void;

  onItemResized(key: string | number, size: number): void;

  addScrollEventListener(): void;

  removeScrollEventListener(): void;
}

declare function throttle(fn: Function, wait: number): Function;

declare function debounce(fn: Function, wait: number): Function;

declare function getDataKey(item: any, dataKey: any): any;

export { Virtual, Sortable, throttle, debounce, getDataKey, SortableAttrs, VirtualAttrs };
