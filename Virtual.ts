import Dnd from 'sortable-dnd';
import { debounce, throttle, elementIsDocumentOrWindow } from './utils';

type SIZETYPE = 'INIT' | 'FIXED' | 'DYNAMIC';

type DIRECTION = 'FRONT' | 'BEHIND' | 'STATIONARY';

export interface Range {
  start: number;
  end: number;
  front: number;
  behind: number;
}

export interface ScrollEvent {
  top: boolean;
  bottom: boolean;
  offset: number;
  direction: DIRECTION;
}

export interface VirtualOptions {
  size?: number;
  keeps?: number;
  buffer: number;
  wrapper: HTMLElement;
  scroller?: HTMLElement | Document | Window;
  direction?: 'vertical' | 'horizontal';
  uniqueKeys: (string | number)[];
  debounceTime?: number;
  throttleTime?: number;
  onScroll: (event: ScrollEvent) => void;
  onUpdate: (range: Range) => void;
}

export const VirtualAttrs = [
  'size',
  'keeps',
  'scroller',
  'direction',
  'debounceTime',
  'throttleTime',
];

export class Virtual {
  public sizes: Map<string | number, number>;
  public range: Range;
  public offset: number;
  public options: VirtualOptions;
  public scrollEl: HTMLElement;
  public direction: DIRECTION;
  public sizeType: SIZETYPE;
  public fixedSize: number;
  public averageSize: number;
  private onScroll: () => void;

  constructor(options: VirtualOptions) {
    this.options = options;

    const defaults = {
      size: 0,
      keeps: 0,
      buffer: 0,
      wrapper: null,
      scroller: null,
      direction: 'vertical',
      uniqueKeys: [],
      debounceTime: null,
      throttleTime: null,
    };

    for (const name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }

    this.sizes = new Map(); // store item size
    this.sizeType = 'INIT';
    this.fixedSize = 0;
    this.averageSize = 0;

    this.range = { start: 0, end: 0, front: 0, behind: 0 };
    this.offset = 0;
    this.direction = 'STATIONARY';

    this.updateScrollElement();
    this.updateOnScrollFunction();
    this.addScrollEventListener();
    this.checkIfUpdate(0, options.keeps! - 1);
  }

  public isFixed() {
    return this.sizeType === 'FIXED';
  }

  public isFront() {
    return this.direction === 'FRONT';
  }

  public isBehind() {
    return this.direction === 'BEHIND';
  }

  public isHorizontal() {
    return this.options.direction === 'horizontal';
  }

  public getSize(key: string | number) {
    return this.sizes.get(key) || this.getItemSize();
  }

  public getOffset() {
    const offsetKey = this.isHorizontal() ? 'scrollLeft' : 'scrollTop';
    return this.scrollEl[offsetKey];
  }

  public getScrollSize() {
    const sizeKey = this.isHorizontal() ? 'scrollWidth' : 'scrollHeight';
    return this.scrollEl[sizeKey];
  }

  public getClientSize() {
    const sizeKey = this.isHorizontal() ? 'offsetWidth' : 'offsetHeight';
    return this.scrollEl[sizeKey];
  }

  public scrollToOffset(offset: number) {
    const offsetKey = this.isHorizontal() ? 'scrollLeft' : 'scrollTop';
    this.scrollEl[offsetKey] = offset;
  }

  public scrollToIndex(index: number) {
    if (index >= this.options.uniqueKeys.length - 1) {
      this.scrollToBottom();
    } else {
      const indexOffset = this.getOffsetByRange(0, index);
      const startOffset = this.getScrollStartOffset();
      this.scrollToOffset(indexOffset + startOffset);
    }
  }

  public scrollToBottom() {
    const offset = this.getScrollSize();
    this.scrollToOffset(offset);

    // if the bottom is not reached, execute the scroll method again
    setTimeout(() => {
      const clientSize = this.getClientSize();
      const scrollSize = this.getScrollSize();
      const scrollOffset = this.getOffset();
      if (scrollOffset + clientSize + 1 < scrollSize) {
        this.scrollToBottom();
      }
    }, 5);
  }

  public option<K extends keyof VirtualOptions>(key: K, value: VirtualOptions[K]) {
    const oldValue = this.options[key];

    this.options[key] = value;

    if (key === 'uniqueKeys') {
      this.sizes.forEach((_v, k) => {
        if (!(value as (string | number)[]).includes(k)) {
          this.sizes.delete(k);
        }
      });
    }
    if (key === 'scroller') {
      oldValue && Dnd.utils.off(oldValue as HTMLElement, 'scroll', this.onScroll);
      this.updateScrollElement();
      this.addScrollEventListener();
    }
  }

  public updateRange(range?: Range) {
    if (range) {
      this.handleUpdate(range.start);
      return;
    }

    let start = this.range.start;
    start = Math.max(start, 0);

    this.handleUpdate(start);
  }

  public onItemResized(key: string | number, size: number) {
    if (this.sizes.get(key) === size) {
      return;
    }

    this.sizes.set(key, size);

    if (this.sizeType === 'INIT') {
      this.sizeType = 'FIXED';
      this.fixedSize = size;
    } else if (this.isFixed() && this.fixedSize !== size) {
      this.sizeType = 'DYNAMIC';
      this.fixedSize = 0;
    }

    // calculate the average size only once
    if (
      !this.averageSize &&
      this.sizeType === 'DYNAMIC' &&
      this.sizes.size === this.options.keeps
    ) {
      this.updateAverageSize();
    }
  }

  public updateAverageSize() {
    const total = [...this.sizes.values()].reduce((t, i) => t + i, 0);
    this.averageSize = Math.round(total / this.sizes.size);
  }

  public addScrollEventListener() {
    if (this.options.scroller) {
      Dnd.utils.on(this.options.scroller as HTMLElement, 'scroll', this.onScroll);
    }
  }

  public removeScrollEventListener() {
    if (this.options.scroller) {
      Dnd.utils.off(this.options.scroller as HTMLElement, 'scroll', this.onScroll);
    }
  }

  public enableScroll(scrollable: boolean) {
    const { scroller } = this.options;
    const eventFn = scrollable ? Dnd.utils.off : Dnd.utils.on;
    const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    eventFn(scroller as HTMLElement, 'DOMMouseScroll', this.preventDefault);
    eventFn(scroller as HTMLElement, wheelEvent, this.preventDefault);
    eventFn(scroller as HTMLElement, 'touchmove', this.preventDefault);
    eventFn(scroller as HTMLElement, 'keydown', this.preventDefaultForKeyDown);
  }

  private preventDefault(e: Event) {
    e.preventDefault();
  }

  private preventDefaultForKeyDown(e: KeyboardEvent) {
    const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
    if (keys[e.keyCode]) {
      this.preventDefault(e);
      return false;
    }
  }

  private updateScrollElement() {
    const scroller = this.options.scroller;
    if (elementIsDocumentOrWindow(scroller)) {
      const scrollEl = document.scrollingElement || document.documentElement || document.body;
      this.scrollEl = scrollEl as HTMLElement;
    } else {
      this.scrollEl = scroller as HTMLElement;
    }
  }

  private updateOnScrollFunction() {
    const { debounceTime, throttleTime } = this.options;
    if (debounceTime) {
      this.onScroll = debounce(() => this.handleScroll(), debounceTime);
    } else if (throttleTime) {
      this.onScroll = throttle(() => this.handleScroll(), throttleTime);
    } else {
      this.onScroll = () => this.handleScroll();
    }
  }

  private handleScroll() {
    const offset = this.getOffset();
    const clientSize = this.getClientSize();
    const scrollSize = this.getScrollSize();

    if (offset === this.offset) {
      this.direction = 'STATIONARY';
    } else {
      this.direction = offset < this.offset ? 'FRONT' : 'BEHIND';
    }

    this.offset = offset;

    const top = this.isFront() && offset <= 0;
    const bottom = this.isBehind() && clientSize + offset + 1 >= scrollSize;

    this.options.onScroll({ top, bottom, offset, direction: this.direction });

    if (this.isFront()) {
      this.handleScrollFront();
    } else if (this.isBehind()) {
      this.handleScrollBehind();
    }
  }

  private handleScrollFront() {
    const scrolls = this.getScrollItems();
    if (scrolls >= this.range.start) {
      return;
    }

    const start = Math.max(scrolls - this.options.buffer, 0);
    this.checkIfUpdate(start, this.getEndByStart(start));
  }

  private handleScrollBehind() {
    const scrolls = this.getScrollItems();
    if (scrolls < this.range.start + this.options.buffer) {
      return;
    }

    this.checkIfUpdate(scrolls, this.getEndByStart(scrolls));
  }

  private getScrollItems() {
    const offset = this.offset - this.getScrollStartOffset();

    if (offset <= 0) {
      return 0;
    }

    if (this.isFixed()) {
      return Math.floor(offset / this.fixedSize);
    }

    let low = 0;
    let high = this.options.uniqueKeys.length;
    let middle = 0;
    let middleOffset = 0;

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2);
      middleOffset = this.getOffsetByRange(0, middle);

      if (middleOffset === offset) {
        return middle;
      } else if (middleOffset < offset) {
        low = middle + 1;
      } else if (middleOffset > offset) {
        high = middle - 1;
      }
    }

    return low > 0 ? --low : 0;
  }

  private checkIfUpdate(start: number, end: number) {
    const keeps = this.options.keeps!;
    const total = this.options.uniqueKeys.length;

    if (total <= keeps) {
      start = 0;
    } else if (end - start < keeps - 1) {
      start = end - keeps + 1;
    }

    if (this.range.start !== start) {
      this.handleUpdate(start);
    }
  }

  private handleUpdate(start: number) {
    this.range.start = start;
    this.range.end = this.getEndByStart(start);
    this.range.front = this.getFrontOffset();
    this.range.behind = this.getBehindOffset();

    this.options.onUpdate({ ...this.range });
  }

  private getFrontOffset() {
    if (this.isFixed()) {
      return this.fixedSize * this.range.start;
    } else {
      return this.getOffsetByRange(0, this.range.start);
    }
  }

  private getBehindOffset() {
    const end = this.range.end;
    const last = this.getLastIndex();

    if (this.isFixed()) {
      return (last - end) * this.fixedSize;
    }

    return (last - end) * this.getItemSize();
  }

  private getOffsetByRange(start: number, end: number) {
    if (start >= end) {
      return 0;
    }

    let offset = 0;
    for (let i = start; i < end; i++) {
      const size = this.sizes.get(this.options.uniqueKeys[i]);
      offset = offset + (typeof size === 'number' ? size : this.getItemSize());
    }

    return offset;
  }

  private getEndByStart(start: number) {
    return Math.min(start + this.options.keeps! - 1, this.getLastIndex());
  }

  private getLastIndex() {
    const { uniqueKeys, keeps } = this.options;
    return uniqueKeys.length > 0 ? uniqueKeys.length - 1 : keeps! - 1;
  }

  private getItemSize() {
    return this.isFixed() ? this.fixedSize : this.options.size || this.averageSize;
  }

  private getScrollStartOffset() {
    const { wrapper, scroller } = this.options;

    if (scroller === wrapper) {
      return 0;
    }

    let offset = 0;
    if (scroller && wrapper) {
      const offsetKey = this.isHorizontal() ? 'left' : 'top';
      const rect = elementIsDocumentOrWindow(scroller)
        ? Dnd.utils.getRect(wrapper)
        : Dnd.utils.getRect(wrapper, true, scroller as HTMLElement);

      offset = this.offset + rect[offsetKey];
    }

    return offset;
  }
}
