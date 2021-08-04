/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-07-03 11:46:20
 * @LastEditTime: 2021-08-04 16:30:11
 * @LastEditors: kay
 */ 

import multipartRequest from '../utils/multipart-request'
import toCamel from '../utils/to-camel'
import toIterable = require('../utils/iterator')
const ndjson = require('../base/iterable-ndjson')

export async function *add(client: any, input: Uint8Array | string | {path: string, content: Buffer} | {path: string, content: Buffer}[] |AsyncGenerator<{path: string;content: any;}, void, unknown>) {
  var res =  await client.fetch('/api/v0/add?pin=true', {
    ...(
      await multipartRequest(input, null)
    )
  })
  for await (let file of ndjson(toIterable(res.body))) {
    yield toCamel(file)
  }
}