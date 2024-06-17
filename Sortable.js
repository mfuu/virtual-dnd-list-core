import Dnd from 'sortable-dnd';

const SortableAttrs = [
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
  this.reRendered = false;

  this.installSortable();
}

Sortable.prototype = {
  constructor: Sortable,

  destroy() {
    this.sortable && this.sortable.destroy();
    this.sortable = this.reRendered = null;
  },

  option(key, value) {
    this.options[key] = value;
    if (SortableAttrs.includes(key)) {
      this.sortable.option(key, value);
    }
  },

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
    });
  },

  onDrag(event) {
    const key = event.node.getAttribute('data-key');
    const index = this.getIndex(key);
    const item = this.options.list[index];

    // store the dragged item
    this.sortable.option('store', { item, key, index });
    this.dispatchEvent('onDrag', { item, key, index, event });
  },

  onDrop(event) {
    const { item, key, index } = Dnd.get(event.from).option('store');
    const list = this.options.list;
    const params = {
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
      this.handleDropEvent(params, event, item, key, index, list);
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

  handleDropEvent(params, event, item, key, index, list) {
    const targetKey = event.target.getAttribute('data-key');
    let newIndex = -1;
    let oldIndex = index;

    // changes position in current list
    if (event.from === event.to) {
      // re-get the dragged element's index
      oldIndex = this.getIndex(key);
      newIndex = this.getIndex(targetKey);
      if (
        (oldIndex < newIndex && event.relative === -1) ||
        (oldIndex > newIndex && event.relative === 1)
      ) {
        newIndex += event.relative;
      }

      if (newIndex !== oldIndex) {
        list.splice(oldIndex, 1);
        list.splice(newIndex, 0, item);
      }
    } else {
      // remove from
      if (event.from === this.el) {
        oldIndex = this.getIndex(key);
        list.splice(oldIndex, 1);
      }

      // added to
      if (event.to === this.el) {
        oldIndex = -1;
        newIndex = this.getIndex(targetKey);
        if (event.relative === 0) {
          // added to last
          newIndex = list.length;
        } else if (event.relative === 1) {
          newIndex += event.relative;
        }

        list.splice(newIndex, 0, item);
      }
    }

    params.changed = event.from !== event.to || newIndex !== oldIndex;
    params.list = list;
    params.oldIndex = oldIndex;
    params.newIndex = newIndex;
  },

  getIndex(key) {
    return this.options.uniqueKeys.indexOf(key);
  },

  dispatchEvent(name, params) {
    const cb = this.options[name];
    cb && cb(params);
  },
};

export { Sortable, SortableAttrs };
