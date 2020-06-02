import { Readable, Writable, Duplex } from 'stream'
const Fifo = require('p-fifo')
const END_CHUNK = Buffer.alloc(0)

function getIterator(obj: any) {
  if (obj) {
    if (typeof obj[Symbol.iterator] === 'function') {
      return obj[Symbol.iterator]()
    }
    if (typeof obj[Symbol.asyncIterator] === 'function') {
      return obj[Symbol.asyncIterator]()
    }
    if (typeof obj.next === 'function') {
      return obj // probably an iterator
    }
  }
  throw new Error('argument is not an iterator or iterable')
};

function toDuplex(duplex: any, options?: any) {
  options = options || {}

  let reading = false
  const fifo = new Fifo()

  duplex = {
    sink: duplex.sink,
    source: duplex.source ? getIterator(duplex.source) : null
  }

  let Stream;
  
  Stream = Duplex;
  if (!duplex.source) {
    Stream = Writable
  } else if (!duplex.sink) {
    Stream = Readable
  }

  Object.assign(
    options,
    duplex.source ? {
      async read(size: any) {
        if (reading) return
        reading = true

        try {
          while (true) {
            const { value, done } = await duplex.source.next(size)
            if (done) return this.push(null)
            if (!this.push(value)) break
          }
        } catch (err) {
          this.emit('error', err)
        } finally {
          reading = false
        }
      }
    } : {},
    duplex.sink ? {
      write(chunk: any, enc: any, cb: any) {
        fifo.push(chunk).then(() => cb(), cb)
      },
      final(cb: any) {
        fifo.push(END_CHUNK).then(() => cb(), cb)
      }
    } : {}
  )

  const stream = new Stream(options)

  if (duplex.sink) {
    duplex.sink({
      [Symbol.asyncIterator]() {
        return this
      },
      async next() {
        const chunk = await fifo.shift()
        return chunk === END_CHUNK ? { done: true } : { value: chunk }
      },
      async throw(err: any) {
        stream.destroy(err)
        return { done: true }
      },
      async return() {
        stream.destroy()
        return { done: true }
      }
    })
  }

  return stream
}

function toReadable (source: any, options?: any) {
  return toDuplex({ source }, options)
}

function toWritable (sink: any, options?: any) {
  return toDuplex({ sink }, options)
}

export default {
  toReadable,
  toWritable,
  toDuplex
}