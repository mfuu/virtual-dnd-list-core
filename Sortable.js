import Dnd from 'sortable-dnd';
import { getDataKey } from './utils';

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
  'fallbackOnBody',
  'scrollThreshold',
  'delayOnTouchOnly',
];

function Sortable(el, options) {
  this.el = el;
  this.options = options;

  this.list = options.list;
  this.reRendered = false;

  this.init();
}

Sortable.prototype = {
  constructor: Sortable,

  destroy() {
    this.sortable && this.sortable.destroy();
    this.sortable = this.reRendered = null;
  },

  option(key, value) {
    if (key === 'list') {
      this.list = [...value];
    } else {
      this.sortable.option(key, value);
    }
  },

  init() {
    const props = SortableAttrs.reduce((res, key) => {
      res[key] = this.options[key];
      return res;
    }, {});

    this.sortable = new Dnd(this.el, {
      ...props,
      swapOnDrop: (params) => params.from === params.to,
      onDrag: (params) => this.onDrag(params),
      onDrop: (params) => this.onDrop(params),
      onAdd: (params) => this.onAdd(params),
      onRemove: (params) => this.onRemove(params),
    });
  },

  onAdd(event) {
    const { item, key } = Dnd.get(event.from).option('store');
    this.dispatchEvent('onAdd', { item, key, event });
  },

  onRemove(event) {
    const { item, key } = Dnd.get(event.from).option('store');
    this.dispatchEvent('onRemove', { item, key, event });
  },

  onDrag(event) {
    const key = event.node.getAttribute('data-key');
    const index = this.getIndex(this.list, key);
    const item = this.list[index];

    // store the drag item
    this.sortable.option('store', { item, key, index, list: this.list });
    this.dispatchEvent('onDrag', { item, key, index, event });
  },

  onDrop(event) {
    const cloneList = [...this.list];
    const { list, item, key, index } = Dnd.get(event.from).option('store');
    const params = {
      key,
      item,
      event,
      changed: false,
      list: cloneList,
      oldList: this.list,
      oldIndex: index,
      newIndex: index,
      listOnDrag: list,
      indexOnDrag: index,
    };

    if (!(event.from === event.to && event.node === event.target)) {
      const targetKey = event.target.getAttribute('data-key');
      let targetIndex = this.getIndex(cloneList, targetKey);
      let oldIndex = index;

      // changes position in current list
      if (event.from === event.to) {
        // re-get the dragged element's index
        oldIndex = this.getIndex(this.list, event.node.getAttribute('data-key'));
        if (
          (oldIndex < targetIndex && event.relative === -1) ||
          (oldIndex > targetIndex && event.relative === 1)
        ) {
          targetIndex += event.relative;
        }

        if (targetIndex !== oldIndex) {
          cloneList.splice(oldIndex, 1);
          cloneList.splice(targetIndex, 0, item);
        }
        params.oldIndex = oldIndex;
      } else {
        // remove from
        if (event.from === this.el) {
          oldIndex = this.getIndex(this.list, event.node.getAttribute('data-key'));
          cloneList.splice(oldIndex, 1);
        }

        // added to
        if (event.to === this.el) {
          if (event.relative === 0) {
            // added to last
            targetIndex = cloneList.length;
          } else if (event.relative === 1) {
            targetIndex += event.relative;
          }

          cloneList.splice(targetIndex, 0, item);
        }
      }

      params.changed = event.from !== event.to || targetIndex !== oldIndex;
      params.list = cloneList;
      params.oldIndex = oldIndex;
      params.newIndex = targetIndex;
    }

    this.dispatchEvent('onDrop', params);

    if (event.from === this.el && this.reRendered) {
      Dnd.dragged?.remove();
    }
    if (event.from !== event.to && event.pullMode === 'clone') {
      Dnd.clone?.remove();
    }

    this.reRendered = false;
  },

  getIndex(list, key) {
    for (let i = 0; i < list.length; i++) {
      if (getDataKey(list[i], this.options.dataKey) == key) {
        return i;
      }
    }
    return -1;
  },

  dispatchEvent(name, params) {
    const cb = this.options[name];
    cb && cb(params);
  },
};

export { Sortable };
