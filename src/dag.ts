/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-22 09:55:59
 * @LastEditTime: 2021-08-04 17:14:43
 * @LastEditors: kay
 */

import multipartRequest from "../utils/multipart-request"
const CID = require('../base/cids/src/index.js')
const dagCBOR = require('../base/ipld-dag-cbor/src/index')
// const dagPB = require('ipld-dag-pb')
const raw = require('../base/ipld-raw/src/index')
const resolvers: any = {
  'dag-cbor': dagCBOR.resolver,
  // 'dag-pb': dagPB.resolver,
  raw: raw.resolver
}

export async function put(client: any, input: any, options?: {format?: string, hashAlg?: string, inputEnc?: string}) {
  options = {
    format: 'dag-cbor',
    hashAlg: 'sm3-256',
    inputEnc: 'raw',
    ...options
  }

  var serialize

  if (options.format === 'dag-cbor') {
    var obj = convertToCborIshObj(input)
    if (obj.error != null) {
      throw new Error(obj.error)
    }
    serialize = dagCBOR.util.serialize(obj.obj)
  } else if (options.format == 'dag-pb') {
    serialize = input.serialize()
  } else {
    serialize = input
  }
  
  const res = await client.fetch(`/api/v0/dag/put?format=${options.format}&input-enc=${options.inputEnc}&hash=${options.hashAlg}`, {
    ...(
      await multipartRequest(serialize, null)
    )
  })
  const data = await res.json()
  return data.Cid['/']
}

export async function get(client: any, cid: string, path?: string) {
  const resolved = await resolve(client, cid, path)
  const block = await (await import('./block')).get(client, resolved.cid)
  const dagResolver = resolvers[block.cid.codec]
  if (!dagResolver) {
    throw Object.assign(
      new Error(`Missing IPLD format "${block.cid.codec}"`)
    )
  }
  return dagResolver.resolve(block.data, resolved.remPath)
}

export async function resolve(client: any, cid: string, path?: string) {
  var url = path? `/api/v0/dag/resolve?arg=${cid}/` + path : `/api/v0/dag/resolve?arg=${cid}`
  const res = await client.fetch(url)
  const data = await res.json()

  return {cid: data.Cid['/'], remPath: data.RemPath }
}

function convertToCborIshObj(input: any) :any {
  if (Array.isArray(input)) {
    var out = []
    for(var i = 0, len = input.length; i < len; i++) {
      var res = convertToCborIshObj(input[i])
      if (res.error != null) {
        return { 'obj': null, 'error': res.error}
      }

      out.push(res.obj)
    }
    return { 'obj': out, 'error': null} 
  } else if (typeof input === 'object') {
    if (Object.keys(input).length == 0) {
      return { 'obj': input, 'error': null}
    }

    if (input.hasOwnProperty('/') && Object.keys(input).length == 1) {
      var value = input['/']
      if (typeof value != 'string') {
        return { 'obj': null, 'error': 'links not string'} 
      }
      
      return { 'obj': new CID(value), 'error': null}
    }

    for(let key in input){
      var res = convertToCborIshObj(input[key])
      if (res.error != null) {
        return res
      }

      input[key] = res.obj
    }

    return { 'obj': input, 'error': null}
  } else {
    return { 'obj': input, 'error': null}
  }
}

// module.exports={put, get, resolve} 