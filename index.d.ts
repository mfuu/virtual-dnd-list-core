export interface SortableParams {
  item: any;
  key: any;
  index: number;
}

export interface SortableFromTo {
  index: number;
  list: any[];
}

export interface DropParams {
  changed: boolean;
  list: any[];
  item: any;
  key: any;
  from: SortableFromTo;
  to: SortableFromTo;
}

export interface SortableOptions {
  list: any[];
  dataKey: string;
  delay?: number;
  group?: any;
  handle?: any;
  lockAxis?: 'x' | 'y';
  disabled?: boolean;
  draggable?: string;
  animation?: number;
  autoScroll?: boolean;
  ghostClass?: string;
  ghostStyle?: any;
  chosenClass?: string;
  fallbackOnBody?: boolean;
  scrollThreshold?: number;
  delayOnTouchOnly?: boolean;
  onDrag?: (params: SortableParams) => void;
  onAdd?: (params: SortableParams) => void;
  onRemove?: (params: SortableParams) => void;
  onDrop?: (params: DropParams) => void;
}

declare const SortableAttrs: any[];

declare class Sortable {
  public el: HTMLElement;
  public options: SortableOptions;

  constructor(el: HTMLElement, options: SortableOptions);

  reRendered: boolean;

  option<K extends keyof SortableOptions>(name: K, value: SortableOptions[K]): void;

  destroy(): void;
}

export interface ScrollParams {
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
  onScroll?: (params: ScrollParams) => void;
  onUpdate?: (range: Range) => void;
}

export interface Range {
  start: number;
  end: number;
  front: number;
  behind: number;
}

declare const VirtualAttrs: any[];

declare class Virtual {
  public options: VirtualOptions;
  constructor(options: VirtualOptions);

  sizes: Map<any, number>;

  offset: number;

  option<K extends keyof VirtualOptions>(name: K, value: VirtualOptions[K]): void;

  updateRange(range?: Range): void;

  getSize(key: any): number;

  getOffset(): number;

  getScrollSize(): number;

  getClientSize(): number;

  scrollToOffset(offset: number): void;

  scrollToIndex(index: number): void;

  scrollToBottom(): void;

  onItemResized(key: any, size: number): void;

  addScrollEventListener(): void;

  removeScrollEventListener(): void;
}

declare function throttle(fn: Function, wait: number): Function;

declare function debounce(fn: Function, wait: number): Function;

declare function getDataKey(item: any, dataKey: any): any;

export { Virtual, Sortable, throttle, debounce, getDataKey, SortableAttrs, VirtualAttrs };
