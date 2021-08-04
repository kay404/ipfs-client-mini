/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-07-10 10:09:45
 * @LastEditTime: 2021-08-04 17:15:03
 * @LastEditors: kay
 */

const ndjson = require('../base/iterable-ndjson')
const SubscriptionTracker = require('../base/subscription-tracker')

import toIterable = require('../utils/iterator')
import { Buffer } from 'buffer'

export async function ls(client: any) {
  var { Strings } = await (await client.fetch(`/api/v0/pubsub/ls`)).json()
  return Strings || []
}

export async function peers(client: any, topic?: string | string[]) {
  var arg = ''
  if (topic) {
    var path = Array.isArray(topic) ? topic : [topic]
    path.forEach((cid: string) => arg += 'arg=' + cid)
  }
  const { Strings } = await (await client.fetch('/api/v0/pubsub/peers?' + arg)).json()
  return Strings || []
}

export async function pub(client: any, topic: string, data: string) {
  const url = `/api/v0/pubsub/pub?arg=${encodeURIComponent(topic)}&arg=${encodeBuffer(Buffer.from(data))}`
  const res = await (await client.fetch(url)).text()

  return res
}

export async function sub(client: any, topic: string, handler?: any, options?: { onError?: any }) {
  if (typeof process != 'object') {
    throw new Error('only support node')
  }
  const subsTracker = SubscriptionTracker.singleton()
  var signal = subsTracker.subscribe(topic, handler)
  const url = `/api/v0/pubsub/sub?arg=${topic}`
  var res: any
  try {
    res = await client.fetch(url, {signal: signal})
  } catch (err) {
    subsTracker.unsubscribe(topic, handler)
    throw err
  }
  const onError = options ? options.onError : ((err: any) => console.error(err));
  (async () => {
    try {
      for await (const msg of ndjson(toIterable(res.body))) {
        try {
          handler({
            from: Buffer.from(msg.from, 'base64'),
            data: Buffer.from(msg.data, 'base64'),
            seqno: Buffer.from(msg.seqno, 'base64'),
            topicIDs: msg.topicIDs
          })
        } catch (err) {
          onError(err, false)
        }
      }
    } catch (err) {
      if (err.type !== 'aborted' && err.name !== 'AbortError') {
        onError(err, true)
      }
    } finally {
      subsTracker.unsubscribe(topic, handler)
    }
  })()
}

export async function unsub(topic: string, handler?: any) {
  const subsTracker = SubscriptionTracker.singleton()
  return subsTracker.unsubscribe(topic, handler)
}

function encodeBuffer (buf: any) {
  let uriEncoded = ''
  for (const byte of buf) {
    // https://tools.ietf.org/html/rfc3986#page-14
    // ALPHA (%41-%5A and %61-%7A), DIGIT (%30-%39), hyphen (%2D), period (%2E),
    // underscore (%5F), or tilde (%7E)
    if (
      (byte >= 0x41 && byte <= 0x5A) ||
      (byte >= 0x61 && byte <= 0x7A) ||
      (byte >= 0x30 && byte <= 0x39) ||
      (byte === 0x2D) ||
      (byte === 0x2E) ||
      (byte === 0x5F) ||
      (byte === 0x7E)
    ) {
      uriEncoded += String.fromCharCode(byte)
    } else {
      uriEncoded += `%${byte.toString(16).padStart(2, '0')}`
    }
  }
  return uriEncoded
}