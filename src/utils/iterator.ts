/*
 * @Description:
 * @Author: kay
 * @Date: 2020-06-02 17:21:27
 * @LastEditTime: 2020-06-03 15:17:34
 * @LastEditors: kay
 */

const toIterable =
    function(source: any) {
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

const isAsyncIterator =
    (obj: any) => {
      return typeof obj === 'object' && obj !== null &&
          // typeof obj.next === 'function' &&
          typeof obj[Symbol.asyncIterator] === 'function'
    }


// const toIterable = (body:any) => {
//   if (body[Symbol.asyncIterator]) return body

//   if (body.getReader) {
//     return (async function * () {
//       const reader = body.getReader()

//       try {
//         while (true) {
//           const { done, value } = await reader.read()
//           if (done) return
//           yield value
//         }
//       } finally {
//         reader.releaseLock()
//       }
//     })()
//   }
//   throw new Error('unknown stream')
// }

export default toIterable