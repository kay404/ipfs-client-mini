/*
 * @Description:
 * @Author: kay
 * @Date: 2020-06-02 17:21:27
 * @LastEditTime: 2020-06-04 17:48:29
 * @LastEditors: kay
 */

const toIterable = function(source: any) {
  if (isAsyncIterator(source)) {
    // Workaround for https://github.com/node-fetch/node-fetch/issues/766
    if (Object.prototype.hasOwnProperty.call(source, 'readable') &&
        Object.prototype.hasOwnProperty.call(source, 'writable')) {
      const iter = source[Symbol.asyncIterator]()

      const wrapper = {
        next: iter.next.bind(iter),
        return: () => {
          source.destroy()

          return iter.return()
        },
        [Symbol.asyncIterator]: () => {
          return wrapper
        }
      }

      return wrapper
    }

    return source
  }

  const reader = source.getReader()

  return {
    next() {
      return reader.read()
    }
    , return () {
      reader.releaseLock()
      return {}
    }
    , [Symbol.asyncIterator]() {
      return this
    }
  }
}

const isAsyncIterator = (obj: any) => {
  return typeof obj === 'object' && obj !== null &&
          // typeof obj.next === 'function' &&
  typeof obj[Symbol.asyncIterator] === 'function'
}

export default toIterable