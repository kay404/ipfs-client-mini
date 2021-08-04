/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-22 17:47:47
 * @LastEditTime: 2020-08-27 17:54:30
 * @LastEditors: kay
 */

import toCamel from '../utils/to-camel'
// import toIterable = require ('./utils/iterator')
// const ndjson = require('iterable-ndjson')

export async function publish(client: any, path: string, options?: { key: string }) {
  let url = `/api/v0/name/publish?arg=${path}`
  if (options.key) {
    url = url + `&key=${options.key}`
  }
  const res = await client.fetch(url)
  return toCamel(await res.json())
}

// export async function * resolve(client: any, path: string) {
//   const res = await client.fetch(`/api/v0/name/resolve?arg=${path}`)

//   for await (const result of ndjson(toIterable(res.body))) {
//     yield result.Path
//   }
// }

export namespace pubsub {
  export async function subs(client: any) {
    const res = await client.fetch('/api/v0/name/pubsub/subs')
    const data = await res.json()
    return data.Strings || []
  }

  export async function state(client: any) {
    const res = await client.fetch('/api/v0/name/pubsub/state')
    return toCamel(await res.json())
  }

  export async function cancel(client: any, name: string) {
    const res = await client.fetch(`/api/v0/name/pubsub/cancel/${name}`)

    return toCamel(await res.json())
  }
}