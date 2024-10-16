import Dnd, { Group, ScrollSpeed, SortableEvent, SortableOptions as DndOptions } from 'sortable-dnd';

type EmitEvents = 'onDrag' | 'onDrop' | 'onChoose' | 'onUnchoose';

export interface DragEvent<T> {
  item: T;
  key: any;
  index?: number;
  event: SortableEvent;
}

export interface DropEvent<T> {
  key: any;
  item: T;
  list: T[];
  event: SortableEvent;
  changed: boolean;
  oldList: T[];
  oldIndex: number;
  newIndex: number;
}

export interface SortableOptions<T> {
  list: T[];
  uniqueKeys: any[];
  delay?: number;
  group?: string | Group;
  handle?: string;
  lockAxis?: 'x' | 'y';
  disabled?: boolean;
  sortable?: boolean;
  draggable?: string;
  animation?: number;
  autoScroll?: boolean;
  ghostClass?: string;
  ghostStyle?: CSSStyleDeclaration;
  chosenClass?: string;
  placeholderClass?: string;
  scrollSpeed?: ScrollSpeed;
  fallbackOnBody?: boolean;
  scrollThreshold?: number;
  delayOnTouchOnly?: boolean;
  onDrag?: (event: DragEvent<T>) => void;
  onDrop?: (event: DropEvent<T>) => void;
  onChoose?: (event: SortableEvent) => void;
  onUnchoose?: (event: SortableEvent) => void;
}

export const SortableAttrs = [
  'delay',
  'group',
  'handle',
  'lockAxis',
  'disabled',
  'sortable',
  'draggable',
  'animation',
  'autoScroll',
  'ghostClass',
  'ghostStyle',
  'chosenClass',
  'scrollSpeed',
  'fallbackOnBody',
  'scrollThreshold',
  'delayOnTouchOnly',
  'placeholderClass',
];

export class Sortable<T> {
  el: HTMLElement;
  options: SortableOptions<T>;
  sortable: Dnd;
  reRendered: boolean;
  constructor(el: HTMLElement, options: SortableOptions<T>) {
    this.el = el;
    this.options = options;
    this.reRendered = false;

    this.installSortable();
  }

  destroy() {
    this.sortable.destroy();
    this.reRendered = false;
  }

  option<K extends keyof SortableOptions<T>>(key: K, value: SortableOptions<T>[K]) {
    this.options[key] = value;
    if (SortableAttrs.includes(key)) {
      this.sortable.option(key as keyof DndOptions, value);
    }
  }

  installSortable() {
    const props = SortableAttrs.reduce((res, key) => {
      res[key] = this.options[key];
      return res;
    }, {});

    this.sortable = new Dnd(this.el, {
      ...props,
      emptyInsertThreshold: 0,
      swapOnDrop: (event) => event.from === event.to,
      onDrag: (event) => this.onDrag(event),
      onDrop: (event) => this.onDrop(event),
      onChoose: (event) => this.onChoose(event),
      onUnchoose: (event) => this.onUnchoose(event),
    });
  }

  onChoose(event: SortableEvent) {
    this.dispatchEvent('onChoose', event);
  }

  onUnchoose(event: SortableEvent) {
    this.dispatchEvent('onUnchoose', event);
  }

  onDrag(event: SortableEvent) {
    const key = event.node.getAttribute('data-key');
    const index = this.getIndex(key);
    const item = this.options.list[index];

    // store the dragged item
    this.sortable.option('store', { item, key, index });
    this.dispatchEvent('onDrag', { item, key, index, event });
  }

  onDrop(event: SortableEvent) {
    const { item, key, index } = Dnd.get(event.from)?.option('store');
    const list = this.options.list;
    const params: DropEvent<T> = {
      key,
      item,
      list,
      event,
      changed: false,
      oldList: [...list],
      oldIndex: index,
      newIndex: index,
    };

    if (!(event.from === event.to && event.node === event.target)) {
      this.handleDropEvent(event, params, index);
    }

    this.dispatchEvent('onDrop', params);

    if (event.from === this.el && this.reRendered) {
      Dnd.dragged?.remove();
    }
    if (event.from !== event.to && event.pullMode === 'clone') {
      Dnd.clone?.remove();
    }

    this.reRendered = false;
  }

  handleDropEvent(event: SortableEvent, params: DropEvent<T>, index: number) {
    const targetKey = event.target.getAttribute('data-key');
    let newIndex = -1;
    let oldIndex = index;

    // changes position in current list
    if (event.from === event.to) {
      // re-get the dragged element's index
      oldIndex = this.getIndex(params.key);
      newIndex = this.getIndex(targetKey);
      if (
        (oldIndex < newIndex && event.relative === -1) ||
        (oldIndex > newIndex && event.relative === 1)
      ) {
        newIndex += event.relative;
      }

      if (newIndex !== oldIndex) {
        params.list.splice(oldIndex, 1);
        params.list.splice(newIndex, 0, params.item);
      }
    } else {
      // remove from
      if (event.from === this.el) {
        oldIndex = this.getIndex(params.key);
        params.list.splice(oldIndex, 1);
      }

      // added to
      if (event.to === this.el) {
        oldIndex = -1;
        newIndex = this.getIndex(targetKey);
        if (event.relative === 0) {
          // added to last
          newIndex = params.list.length;
        } else if (event.relative === 1) {
          newIndex += event.relative;
        }

        params.list.splice(newIndex, 0, params.item);
      }
    }

    params.changed = event.from !== event.to || newIndex !== oldIndex;
    params.oldIndex = oldIndex;
    params.newIndex = newIndex;
  }

  getIndex(key) {
    return this.options.uniqueKeys.indexOf(key);
  }

  dispatchEvent(name: EmitEvents, params) {
    const cb = this.options[name];
    cb && cb(params);
  }
}
