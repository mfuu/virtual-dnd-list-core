# virtual-dnd-list-core

## Usage

```js
import { VirtualSortable } from './index';

let vs = new VirtualSortable(elem, {
  delay: 0,
  group: '',
  handle: '',
  lockAxis: '',
  sortable: true,
  disabled: false,
  draggable: '',
  animation: 150,
  autoScroll: true,
  scrollSpeed: { x: 10, y: 10 },
  appendToBody: false,
  scrollThreshold: 55,
  delayOnTouchOnly: false,
  dropOnAnimationEnd: true,
  ghostClass: '',
  ghostStyle: {},
  ghostContainer: null,
  chosenClass: '',
  placeholderClass: '',

  size: 0,
  keeps: 0,
  buffer: 0,
  wrapper: HTMLElement,
  scroller: HTMLElement,
  direction: 'vertical', // or `horizontal`
  uniqueKeys: [],
  debounceTime: 0,
  throttleTime: 0,

  onDrag: (event) => {},
  onDrop: (event) => {},
  onScroll: (event) => {},
  onUpdate: (range, changed) => {},
});
```
