/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-01 10:45:26
 * @LastEditTime: 2020-06-03 17:24:01
 * @LastEditors: kay
 */

import multipartRequest from './multipart-request'
import toIterable from './utils/iterator'
import toCamel from './utils/to-camel'
const Tar = require('it-tar')
const all = require('it-all')
const ndjson = require('iterable-ndjson')

export interface addResult {
  Name: string;
  Hash: string;
  Size: number;
}

export class IpfsClient {
  public endpoint: string;
  public fetchBuiltin:
      (input?: Request|string, init?: RequestInit) => Promise<Response>;
  constructor(
      endpoint: string,
      args: {
        fetch?: (input?: string|Request,
                 init?: RequestInit) => Promise<Response>
      } = {},
  ) {
    this.endpoint = endpoint.replace(/\/$/, '');
    if (args.fetch) {
      this.fetchBuiltin = args.fetch;
    } else {
      this.fetchBuiltin = (global as any).fetch;
    }
  }
  
  /**
       Post `body` to `endpoint + path`. Throws detailed error information in
       `RpcError` when available.
   */
  public async fetch(path: string, options: any) {
    let response;
    try {
      const f = this.fetchBuiltin;
      response = await f(this.endpoint + path, {
        headers: options.headers ? options.headers : {},
        body: options.body ? options.body : null,
        method: options.method ? options.method : 'POST',
      });

    } catch (e) {
      e.isFetchError = true;
      throw e;
    }
    // console.log(response)
    if (!response.ok) {
      throw new Error((await response.json()).Message);
    }
    return response;
  }
  
  private async* catStream(cid: string){
    // return await this.fetch(`/api/v0/cat?arg=${cid}`, {})
    var res = await this.fetch(`/api/v0/cat?arg=${cid}`, {})
    yield * toIterable(res.body)
  }
  
  public async cat(cid: string) {
    try {
      for await (const data of this.catStream(cid)) {
        return data
      }
    } catch (err) {
      console.log(err.toString())
    }
  }

  private async* getSteam(cid: string){
    var res = await this.fetch(`/api/v0/get?arg=${cid}`, {})
    var extractor = Tar.extract()
    for await (const { header, body } of extractor(toIterable(res.body))) {
      if (header.type === 'directory') {
        yield {
          path: header.name
        }
      } else {
        yield {
          path: header.name,
          content: body
        }
      }
    }
  }
  public async get(cid: string) {
    return all(this.getSteam(cid))
  }

  public async* add(input: any){
    var res =  await this.fetch('/api/v0/add?pin=true', {
      ...(
        await multipartRequest(input, null)
      )
    })
    for await (let file of ndjson(toIterable(res.body))) {
      yield toCamel(file)
    }
  }

  public async addDir(input: object, directory: string) {
    for await (const data of this.add(input)) {
      if (data.name == directory) {
        return data.hash
      }
    }
  }
  // fileName 等同于 ipfs -w
  public async addFile(input: string | Buffer | Uint8Array, fileName?: string) {
    var file = {
      path: fileName? `${fileName}/${fileName}`: '',
      content: input
    }
    if (fileName) {
      return this.addDir(file, fileName)
    } else {
      for await (const data of this.add(file)) {
        if (data.name == data.hash) {
          return data.hash
        }
      }
    }
  }
}

