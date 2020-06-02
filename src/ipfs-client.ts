/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-01 10:45:26
 * @LastEditTime: 2020-06-02 10:45:50
 * @LastEditors: kay
 */

import { nanoid } from 'nanoid'

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
    let json;
    let body
    try {
      const f = this.fetchBuiltin;
      var headers = {}
      if (options.payload && options.boundary) {
        headers = {
          'Content-Type': `multipart/form-data; boundary=${options.boundary}`
        }
      }
      if (options.payload) {
        body = options.payload
      }
      response = await f(this.endpoint + path, {
        headers,
        body: body,
        method: 'POST',
      });
      // console.log(response.text())

      json = await response.json();
      // console.log()
      
      // console.log(response)
      // if (json.processed && json.processed.except) {
      //   throw new Error(json);
      // }
    } catch (e) {
      e.isFetchError = true;
      throw e;
    }
    if (!response.ok) {
      throw new Error(json);
    }
    return json;
  }
  
  private createBoundary(data: string) {
    while (true) {
      var boundary = `----IpfsClient${Math.random() * 100000}.${Math.random() * 100000}`;
      if (data.indexOf(boundary) === -1) {
        return boundary;
      }
    }
  }
  
  public async add(input: string): Promise<any> {
    // var data = ((typeof input === 'object' && input.isBuffer) ? input.toString('binary') : input);
    // var boundary = `-----------------------------${nanoid()}`
    var boundary = this.createBoundary(input);
    var payload = `--${boundary}\r\nContent-Disposition: form-data; name="path"\r\nContent-Type: application/octet-stream\r\n\r\n${input}\r\n--${boundary}--`;
    return await this.fetch('/api/v0/add?pin=true', {payload, boundary})
  }

  public async cat(cid: string): Promise<any> {
    return await this.fetch(`/api/v0/cat?arg=${cid}`, {})
  }
  
  public async get(cid: string): Promise<any> {
    return await this.fetch(`/api/v0/get?arg=${cid}`, {})
  }
}