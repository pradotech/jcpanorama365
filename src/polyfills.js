/**
 * Polyfills para navegadores antigos (Chrome no Windows 7)
 */

// --- Array.prototype.flat / flatMap (ES2019) ---
if (typeof Array.prototype.flat !== 'function') {
  Array.prototype.flat = function (depth) {
    var d = depth === undefined ? 1 : Math.floor(depth);
    if (d < 1) return Array.prototype.slice.call(this);
    return (function flatten(arr, currentDepth) {
      return arr.reduce(function (acc, val) {
        if (Array.isArray(val) && currentDepth > 0) {
          return acc.concat(flatten(val, currentDepth - 1));
        }
        return acc.concat(val);
      }, []);
    })(this, d);
  };
}

if (typeof Array.prototype.flatMap !== 'function') {
  Array.prototype.flatMap = function (callback, thisArg) {
    return Array.prototype.map.call(this, callback, thisArg).flat();
  };
}

// --- crypto.randomUUID ---
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
  globalThis.crypto.randomUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

// --- BroadcastChannel (fallback seguro) ---
if (typeof globalThis.BroadcastChannel === 'undefined') {
  globalThis.BroadcastChannel = function (channelName) {
    this.name = channelName;
    this.onmessage = null;
    this.postMessage = function () {};
    this.close = function () {};
    this.addEventListener = function () {};
    this.removeEventListener = function () {};
  };
}


// --- Object.hasOwn (ES2022) ---
if (typeof Object.hasOwn !== 'function') {
  Object.hasOwn = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

// --- Object.fromEntries (ES2019) ---
if (typeof Object.fromEntries !== 'function') {
  Object.fromEntries = function (iterable) {
    const obj = {};
    for (const [key, value] of iterable) {
      obj[key] = value;
    }
    return obj;
  };
}

// --- Promise.allSettled (ES2020) ---
if (typeof Promise.allSettled !== 'function') {
  Promise.allSettled = function (promises) {
    return Promise.all(
      Array.from(promises).map(function (p) {
        return Promise.resolve(p).then(
          function (value) { return { status: 'fulfilled', value: value }; },
          function (reason) { return { status: 'rejected', reason: reason }; }
        );
      })
    );
  };
}

// --- Promise.try (ES2025) ---
if (typeof Promise.try !== 'function') {
  Promise.try = function (fn) {
    return new Promise(function (resolve) {
      resolve(fn());
    });
  };
}

// --- AbortSignal.any (2024) ---
if (typeof AbortSignal.any !== 'function') {
  AbortSignal.any = function (signals) {
    var controller = new AbortController();
    for (var i = 0; i < signals.length; i++) {
      var signal = signals[i];
      if (signal.aborted) {
        controller.abort(signal.reason);
        return controller.signal;
      }
      signal.addEventListener('abort', function () {
        controller.abort(this.reason);
      }.bind(signal), { once: true });
    }
    return controller.signal;
  };
}

// --- AbortSignal.timeout (2022) ---
if (typeof AbortSignal.timeout !== 'function') {
  AbortSignal.timeout = function (ms) {
    var controller = new AbortController();
    setTimeout(function () {
      controller.abort(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
    }, ms);
    return controller.signal;
  };
}

// --- String.prototype.replaceAll (ES2021) ---
if (typeof String.prototype.replaceAll !== 'function') {
  String.prototype.replaceAll = function (search, replacement) {
    if (search instanceof RegExp) {
      if (!search.global) {
        throw new TypeError('String.prototype.replaceAll called with a non-global RegExp argument');
      }
      return this.replace(search, replacement);
    }
    return this.split(search).join(replacement);
  };
}

// --- String.prototype.at (ES2022) ---
if (typeof String.prototype.at !== 'function') {
  String.prototype.at = function (index) {
    index = Math.trunc(index) || 0;
    if (index < 0) index += this.length;
    if (index < 0 || index >= this.length) return undefined;
    return this.charAt(index);
  };
}

// --- Array.prototype.at (ES2022) ---
if (typeof Array.prototype.at !== 'function') {
  Array.prototype.at = function (index) {
    index = Math.trunc(index) || 0;
    if (index < 0) index += this.length;
    if (index < 0 || index >= this.length) return undefined;
    return this[index];
  };
}

// --- Promise.withResolvers (ES2024) ---

if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise(function (res, rej) {
      resolve = res;
      reject = rej;
    });
    return { promise: promise, resolve: resolve, reject: reject };
  };
}

// --- Object.groupBy (ES2024) ---
if (typeof Object.groupBy !== 'function') {
  Object.groupBy = function (iterable, callbackFn) {
    const obj = Object.create(null);
    let index = 0;
    for (const item of iterable) {
      const key = callbackFn(item, index++);
      if (key in obj) {
        obj[key].push(item);
      } else {
        obj[key] = [item];
      }
    }
    return obj;
  };
}

// --- Array.fromAsync (ES2024) ---
if (typeof Array.fromAsync !== 'function') {
  Array.fromAsync = async function (asyncIterable, mapFn, thisArg) {
    const result = [];
    let index = 0;
    for await (const item of asyncIterable) {
      result.push(mapFn ? mapFn.call(thisArg, item, index++) : item);
    }
    return result;
  };
}

// --- structuredClone (se não existir) ---
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// --- URL.parse (2024) ---
if (typeof URL.parse !== 'function') {
  URL.parse = function (url, base) {
    try {
      return new URL(url, base);
    } catch (e) {
      return null;
    }
  };
}

// --- URL.canParse (2023) ---
if (typeof URL.canParse !== 'function') {
  URL.canParse = function (url, base) {
    try {
      new URL(url, base);
      return true;
    } catch (e) {
      return false;
    }
  };
}

if (typeof globalThis.Iterator === 'undefined') {
  globalThis.Iterator = function Iterator() {};
  globalThis.Iterator.prototype = Object.create(null);
  globalThis.Iterator.prototype[Symbol.iterator] = function () {
    return this;
  };
}

if (typeof Iterator.prototype.join !== 'function') {
  Iterator.prototype.join = function (separator) {
    const result = [];
    for (const item of this) {
      result.push(item);
    }
    return result.join(separator);
  };
}

if (typeof Iterator.prototype.map !== 'function') {
  Iterator.prototype.map = function (fn) {
    const result = [];
    let index = 0;
    for (const item of this) {
      result.push(fn(item, index++));
    }
    return result[Symbol.iterator]();
  };
}

if (typeof Iterator.prototype.filter !== 'function') {
  Iterator.prototype.filter = function (fn) {
    const result = [];
    let index = 0;
    for (const item of this) {
      if (fn(item, index++)) {
        result.push(item);
      }
    }
    return result[Symbol.iterator]();
  };
}

if (typeof Iterator.prototype.forEach !== 'function') {
  Iterator.prototype.forEach = function (fn) {
    let index = 0;
    for (const item of this) {
      fn(item, index++);
    }
  };
}

if (typeof Iterator.prototype.toArray !== 'function') {
  Iterator.prototype.toArray = function () {
    return Array.from(this);
  };
}

if (typeof Iterator.prototype.some !== 'function') {
  Iterator.prototype.some = function (fn) {
    let index = 0;
    for (const item of this) {
      if (fn(item, index++)) return true;
    }
    return false;
  };
}

if (typeof Iterator.prototype.every !== 'function') {
  Iterator.prototype.every = function (fn) {
    let index = 0;
    for (const item of this) {
      if (!fn(item, index++)) return false;
    }
    return true;
  };
}

if (typeof Iterator.prototype.find !== 'function') {
  Iterator.prototype.find = function (fn) {
    let index = 0;
    for (const item of this) {
      if (fn(item, index++)) return item;
    }
    return undefined;
  };
}

if (typeof Iterator.prototype.reduce !== 'function') {
  Iterator.prototype.reduce = function (fn, initialValue) {
    let accumulator = initialValue;
    let index = 0;
    let started = arguments.length >= 2;
    for (const item of this) {
      if (!started) {
        accumulator = item;
        started = true;
        index++;
        continue;
      }
      accumulator = fn(accumulator, item, index++);
    }
    if (!started) {
      throw new TypeError('Reduce of empty iterator with no initial value');
    }
    return accumulator;
  };
}

if (typeof Iterator.from !== 'function') {
  Iterator.from = function (iterable) {
    if (iterable != null && typeof iterable[Symbol.iterator] === 'function') {
      const iter = iterable[Symbol.iterator]();
      if (typeof Iterator === 'function' && iter instanceof Iterator) {
        return iter;
      }
      const wrapper = Object.create(Iterator.prototype);
      wrapper.next = function () {
        return iter.next();
      };
      if (typeof iter.return === 'function') {
        wrapper.return = function () {
          return iter.return();
        };
      }
      return wrapper;
    }
    throw new TypeError('Iterator.from requires an iterable');
  };
}
