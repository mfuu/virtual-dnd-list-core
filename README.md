# virtual-dnd-list-core

**Sortbale**
```js
import Sortable from './index.js';

let sortable = new Sortable(elem, {
  list: [],
  uniqueKeys: [],
  delay: 0,
  group: '',
  handle: '',
  lockAxis: '',
  sortable: true,
  disabled: false,
  draggable: '',
  animation: 150,
  autoScroll: true,
  ghostClass: '',
  ghostStyle: {},
  chosenClass: '',
  fallbackOnBody: false,
  scrollThreshold: 55,
  delayOnTouchOnly: false,
  onDrag: (event) => {
    let { item, key, index, event } = event;
    // code
  },
  onDrop: (event) => {
    let { changed, list, item, key, event, oldList, oldIndex, newIndex } = event;
    // code
  },
  onAdd: (event) => {
    let { item, key, event } = event;
    // code
  },
  onRemove: (event) => {
    let { item, key, event } = event;
    // code
  },
});

sortable.reRendered; // true: remove the dragged element on drop
```

**Virtual**
```js
import Virtual from './index.js';

let virtual = new Virtual({
  size: 0,
  keeps: 0,
  buffer: 0,
  wrapper: HTMLElement,
  scroller: HTMLElement,
  direction: 'vertical', // or `horizontal`
  uniqueKeys: [],
  debounceTime: 0,
  throttleTime: 0,
  onScroll: (event) => {
    let { top, bottom, offset, direction } = event;
    // code
  },
  onUpdate: (range) => {
    let { start, end, front, behind } = range;
    // code
  }
});
```
