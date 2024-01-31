import Dnd from 'sortable-dnd';
import { getDataKey } from './utils';

export const attributes = [
  'delay',
  'group',
  'handle',
  'disabled',
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

/**
 * 
 * @param {HTMLElement} el sortable container
 * @param {Object} options sortable options
 * 
 * @example
 * options = {
 *  list: [], // list to drag and drop
 *  dataKey: '', // list item key
 *  onDrag: () => {},
 *  onDrop: () => {},
 *  onAdd: () => {},
 *  onRemove: () => {},
 * }
 */
function Sortable(el, options) {
  this.el = el;
  this.options = options;

  this.list = [...options.list];
  this.store = {};
  this.reRendered = false;

  this._init();
}

Sortable.prototype = {
  constructor: Sortable,

  destroy() {
    this.sortable && this.sortable.destroy();
    this.sortable = this.store = this.reRendered = null;
  },

  option(key, value) {
    if (key === 'list') {
      this.list = [...value];
    } else {
      this.sortable.option(key, value);
    }
  },

  _init() {
    let props = {};
    for (let i = 0; i < attributes.length; i++) {
      let key = attributes[i]
      props[key] = this.options[key];
    }

    this.sortable = new Dnd(this.el, {
      ...props,
      swapOnDrop: (params) => params.from === params.to,
      onDrag: (params) => this._onDrag(params),
      onAdd: (params) => this._onAdd(params),
      onRemove: (params) => this._onRemove(params),
      onChange: (params) => this._onChange(params),
      onDrop: (params) => this._onDrop(params),
    });
  },

  _onDrag(params) {
    const key = params.node.dataset.key;
    const index = this._getIndex(this.list, key);
    const item = this.list[index];

    // store the drag item
    this.store = {
      item,
      key,
      origin: { index, list: this.list },
      from: { index, list: this.list },
      to: { index, list: this.list },
    };
    this.sortable.option('store', this.store);

    this._dispatchEvent('onDrag', { item, key, index });
  },

  _onRemove(params) {
    const key = params.node.dataset.key;
    const index = this._getIndex(this.list, key);
    const item = this.list[index];

    this.list.splice(index, 1);

    Object.assign(this.store, { key, item });
    this.sortable.option('store', this.store);

    this._dispatchEvent('onRemove', { item, key, index });
  },

  _onAdd(params) {
    const { from, target, relative } = params;
    const { key, item } = Dnd.get(from).option('store');

    let index = this._getIndex(this.list, target.dataset.key);

    if (relative === -1) {
      index += 1;
    }

    this.list.splice(index, 0, item);

    Object.assign(this.store, {
      to: {
        index,
        list: this.list,
      },
    });
    this.sortable.option('store', this.store);

    this._dispatchEvent('onAdd', { item, key, index });
  },

  _onChange(params) {
    const store = Dnd.get(params.from).option('store');

    if (params.revertDrag) {
      this.list = [...this.options.list];

      Object.assign(this.store, {
        from: store.origin,
      });

      return;
    }

    const { node, target, relative, backToOrigin } = params;

    const fromIndex = this._getIndex(this.list, node.dataset.key);
    const fromItem = this.list[fromIndex];

    let toIndex = this._getIndex(this.list, target.dataset.key);

    if (backToOrigin) {
      if (relative === 1 && store.from.index < toIndex) {
        toIndex -= 1;
      }
      if (relative === -1 && store.from.index > toIndex) {
        toIndex += 1;
      }
    }

    this.list.splice(fromIndex, 1);
    this.list.splice(toIndex, 0, fromItem);

    Object.assign(this.store, {
      from: {
        index: toIndex,
        list: this.list,
      },
      to: {
        index: toIndex,
        list: this.list,
      },
    });
  },

  _onDrop(params) {
    const { from, to } = this._getStore(params);
    const changed = params.from !== params.to || from.origin.index !== to.to.index;

    this._dispatchEvent('onDrop', {
      changed,
      list: this.list,
      item: from.item,
      key: from.key,
      from: from.origin,
      to: to.to,
    });

    if (params.from === this.el && this.reRendered) {
      Dnd.dragged?.remove();
    }
    if (params.from !== params.to && params.pullMode === 'clone') {
      Dnd.clone?.remove();
    }

    this.reRendered = false;
  },

  _getIndex(list, key) {
    for (let i = 0; i < list.length; i++) {
      if (getDataKey(list[i], this.options.dataKey) == key) {
        return i;
      }
    }
    return -1;
  },

  _getStore(params) {
    return {
      from: Dnd.get(params.from).option('store'),
      to: Dnd.get(params.to).option('store'),
    };
  },

  _dispatchEvent(name, params) {
    const cb = this.options[name];
    if (cb) cb(params);
  }
};

export default Sortable;
