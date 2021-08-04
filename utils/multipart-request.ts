'use strict'

const normaliseInput = require('../base/normalise-input')
const { Readable } = require('readable-stream-miniprogram')
const {Buffer} = require('buffer')
import modeToString from './mode-to-string'
import mtimeToObject from './mtime-to-object'
const merge = require('merge-options').bind({ ignoreUndefined: true })

async function multipartRequest(source: any, abortController: any, headers = {}, boundary = `-----------------------------${Math.random() * 100000}.${Math.random() * 100000}`) {
  async function* streamFiles(source: any) {
    try {
      let index = 0

      for await (const { content, path, mode, mtime } of normaliseInput(source)) {
        let fileSuffix = ''
        const type = content ? 'file' : 'dir'

        if (index > 0) {
          yield '\r\n'

          fileSuffix = `-${index}`
        }

        yield `--${boundary}\r\n`
        yield `Content-Disposition: form-data; name="${type}${fileSuffix}"; filename="${encodeURIComponent(path)}"\r\n`
        yield `Content-Type: ${content ? 'application/octet-stream' : 'application/x-directory'}\r\n`

        if (mode !== null && mode !== undefined) {
          yield `mode: ${modeToString(mode)}\r\n`
        }

        if (mtime != null) {
          const {
            secs, nsecs
          } = mtimeToObject(mtime)

          yield `mtime: ${secs}\r\n`

          if (nsecs != null) {
            yield `mtime-nsecs: ${nsecs}\r\n`
          }
        }

        yield '\r\n'

        if (content) {
          yield* content
        }

        index++
      }
    } catch (err) {
      // workaround for https://github.com/node-fetch/node-fetch/issues/753
      console.log(err)
      abortController.abort(err)
    } finally {
      yield `\r\n--${boundary}--\r\n`
    }
  }
  if (typeof process === 'object') {
    var toStream = function (iterable:any) {
      let reading = false
      return new Readable({
        async read (size: any) {
          if (reading) return
          reading = true
    
          try {
            while (true) {
              const { value, done } = await iterable.next(size)
              if (done) return this.push(null)
              if (!this.push(value)) break
            }
          } catch (err) {
            this.emit('error', err)
            if (iterable.return) iterable.return()
          } finally {
            reading = false
          }
        }
      })
    }
    return {
      headers: merge(headers, {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      }),
      dataType: 'arraybuffer',
      body: toStream(streamFiles(source))
    }
  } else {
    var data = []
    for await (const file of streamFiles(source)) {
      data.push(Buffer.from(file))
    }
    return {
      headers: merge(headers, {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      }),
      dataType: 'arraybuffer',
      body: toArrayBuffer(Buffer.concat(data))
    }
  }
}

function toArrayBuffer(myBuf: any) {
  var myBuffer = new ArrayBuffer(myBuf.length);
  var res = new Uint8Array(myBuffer);
  for (var i = 0; i < myBuf.length; ++i) {
     res[i] = myBuf[i];
  }
  return myBuffer;
}
export default multipartRequest
