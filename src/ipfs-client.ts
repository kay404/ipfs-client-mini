/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-01 10:45:26
 * @LastEditTime: 2021-10-09 16:39:22
 * @LastEditors: kay
 */

import toIterable = require('../utils/iterator')
import * as Interface from './ipfs-api-interface'

export class IpfsClient {
  public endpoint: string;
  public fetchBuiltin:
      (input?: Request|string, init?: any) => Promise<any>;
  constructor(
      endpoint: string,
      args: {
        fetch?: (input?: string|Request,
                 init?: RequestInit) => Promise<any>
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
  public async fetch(path: string, options?: any) {
    let response;
    try {
      const f = this.fetchBuiltin;
      if (!options) options = {}
      let url = this.endpoint + path
      if (options.disableEndpoint) {
        url = path
      }
      response = await f(url, {
        headers: options.headers ? options.headers : {},
        body: options.body,
        method: options.method ? options.method : 'POST',
        dataType: options.dataType ? options.dataType : 'text',
        responseType: options.responseType ? options.responseType : 'text',
        signal: options.signal
      });
    } catch (e) {
      e.isFetchError = true;
      throw e;
    }
    if (!response.ok) {
      throw new Error((await response.json()).Message);
    }
    return response;
  }
  
  // cat
  public async cat(cid: string): Promise<Buffer[]> {
    return (await import('./cat')).cat(this, cid)
  }

  // add
  public async add(input: Uint8Array | string | { path: string, content: Buffer } | { path: string, content: Buffer }[] | AsyncGenerator<{ path: string; content: any; }, void, unknown>, directory?: string): Promise<Interface.addResult> {
    if (typeof input === 'object' && directory === undefined) {
      directory = (<{ path: string, content: Buffer }>input).path
    }
    const res = (await import('./add')).add(this, input)
    var result
    for await (const data of res) {
      if (directory) {
        if (data.name == directory) {
          result = data
          break
        }
      }
      result = data
    }
    return result
  }

  public async addUrl(url: string) {
    return this.add(this.urlSource(url))
  }
  
  async * urlSource(url: string) {
    const response = await this.fetch(url, { method: 'GET', disableEndpoint: true})
    yield {
      path: typeof process === 'object'? decodeURIComponent(new URL(url).pathname.split('/').pop() || '') : (url.split('/').pop() || ''),
      content: typeof process === 'object'? toIterable(response.body) : response.body
    }
  }

  // get
  public async get(cid: string, option?: { save?: Boolean }){
    const res = (await import('./get')).get(this, cid)
    if (option && option.save) {
      return res
    } else {
      var arr = []
      for await (const file of res) {
        if (file.content) {
          for await (const content of file.content) {
            arr.push({ path: file.path, content: content })
          }
        } else {
          arr.push(file)
        }
      }
      return arr
    }
  }

  // ls
  public async ls(cid: string): Promise<Interface.LsResult[]>{
    var res = (await import('./ls'))(this, cid)
    let arr = []
    for await (const file of res) {
      arr.push(file)
    }
    return arr
  }

  // pin
  public async pinLs(cid?: string[] | string) {
    var res = (await import('./pin')).ls(this, cid)
    var arr = []
    for await (const file of res) {
      arr.push(file)
    }
    return arr
  }

  public async pinAdd(cid?: string[] | string) {
    return (await import('./pin')).add(this, cid)
  }

  public async pinRm(cid: string) {
    return (await import('./pin')).rm(this, cid)
  }

  // key
  public async keyGen(name: string) {
    return (await import('./key')).gen(this, name)
  }

  public async keyList() {
    return (await import('./key')).list(this)
  }
  
  public async keyRm(name: string) {
    return (await import('./key')).rm(this, name)
  }

  // swarm
  public async swarmPeers(): Promise<Interface.swarmPeersResult[]> {
    return (await import('./swarm')).peers(this)
  }

  public async swarmAddrs(): Promise<Interface.swarmAddrsResult[]> {
    return (await import('./swarm')).addrs(this)
  }
  
  // dag
  public async dagPut(input: object | string): Promise<string> {
    return (await import('./dag')).put(this, input)
  }
  public async dagPutUrl(url: string) {
    const response = await this.fetch(url, { method: 'GET', disableEndpoint: true })
    return (await import('./dag')).put(this, await response.json())
  }

  public async dagGet(cid: string, path: string): Promise<Interface.dagGetResult> {
    return (await import('./dag')).get(this, cid, path)
  }
  public async dagResolve(cid: string, path?: string): Promise<Interface.dagResolveResult> {
    return (await import('./dag')).resolve(this, cid, path)
  }
  
  // block
  public async blockGet(cid: string) {
    return (await import('./block')).get(this, cid)
  }

  // name
  public async namePublish(path: string, key?: string): Promise<Interface.namePublishResult>{
    return (await import('./name')).publish(this, path, {key: key})
  }

  // public async nameResolve(path: string): Promise<{ Path: string }[]> {
  //   var arr: Array<{ Path: string }> = new Array<{ Path: string }>()
  //   let res = (await import('./name')).resolve(this, path)
  //   for await (const path of res) {
  //     arr.push({Path: path})
  //   }
  //   return arr
  // }
  
  public async namePubsubSubs(): Promise<string[]> {
    return (await import('./name')).pubsub.subs(this)
  }

  public async namePubsubState(): Promise<{ enabled: Boolean }> {
    return (await import('./name')).pubsub.state(this)
  }

  public async namePubsubCancel(name: string): Promise<{ canceled: Boolean }>{
    return (await import('./name')).pubsub.cancel(this, name)
  }

  // boootstrap
  public async bootstrapList() {
    return (await import('./bootstrap')).list(this)
  }

  public async bootstrapAdd(peer: string) {
    return (await import('./bootstrap')).add(this, peer)
  }

  public async bootstrapRm(peer: string) {
    return (await import('./bootstrap')).rm(this, peer)
  }

  // pubsub
  public async pubsubLs() {
    return (await import('./pubsub')).ls(this)
  }

  public async pubsubPeers(topic?: string | string[]) : Promise<string[]>{
    return (await import('./pubsub')).peers(this, topic)
  }
  
  public async pubsubPub(topic: string, data: string) {
    return (await import('./pubsub')).pub(this, topic, data)
  }

  public async pubsubSub(topic: string, handler: any) {
    // console.log(topic)
    return (await import('./pubsub')).sub(this, topic, handler)
  }

  public async pubsubUnsub(topic: string, handler?: any) {
    return (await import('./pubsub')).unsub(topic, handler)
  }
}