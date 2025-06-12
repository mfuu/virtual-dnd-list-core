export function throttle(fn: Function, wait: number) {
  let timer: NodeJS.Timeout | null;

  const result = function (...args) {
    if (timer) return;

    if (wait <= 0) {
      fn.apply(this, args);
    } else {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, args);
      }, wait);
    }
  };

  result['cancel'] = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return result;
}

export function debounce(fn: Function, wait: number) {
  const throttled = throttle(fn, wait);
  const result = function () {
    throttled['cancel']();
    throttled.apply(this, arguments);
  };

  result['cancel'] = function () {
    throttled['cancel']();
  };

  return result;
}

export function isSameValue(a: string | number, b: string | number) {
  return a === 0 ? a === b : a == b;
}

export function getDataKey(item, dataKey: string | string[]): string | number {
  return (
    !Array.isArray(dataKey) ? dataKey.replace(/\[/g, '.').replace(/\]/g, '.').split('.') : dataKey
  ).reduce((o, k) => (o || {})[k], item);
}

export function elementIsDocumentOrWindow(element) {
  return (element instanceof Document && element.nodeType === 9) || element instanceof Window;
}
