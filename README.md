# virtual-dnd-list-core

**Sortbale**
```js
import Sortable from './index.js';

let sortable = new Sortable(elem, {
  list: [],
  dataKey: 'data-key',
  delay: 0,
  group: '',
  handle: '',
  lockAxis: '',
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
  onDrag: (params) => {
    let { item, key, index } = params;
    // code
  },
  onDrop: (params) => {
    let { changed, list, item, key, from, to } = params;
    // code
  },
  onAdd: (params) => {
    let { item, key, index } = params;
    // code
  },
  onRemove: (params) => {
    let { item, key, index } = params;
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
  wrapper: document.getElementById('wrapper'),
  scroller: document.getElementById('scroller'),
  direction: 'vertical',
  uniqueKeys: [],
  debounceTime: 0,
  throttleTime: 0,
  onScroll: (params) => {
    let { top, bottom, offset, direction } = params;
    // code
  },
  onUpdate: (range) => {
    let { start, end, front, behind } = range;
    // code
  }
});
```
