/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-01 10:45:26
 * @LastEditTime: 2020-06-02 16:18:35
 * @LastEditors: sandman
 */

import { nanoid } from 'nanoid'
import multipartRequest from './multipart-request';

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
    try {
      const f = this.fetchBuiltin;
      var headers = options.headers
      response = await f(this.endpoint + path, {
        headers: options.headers ? options.headers : {},
        body: options.body ? options.body : null,
        method: options.method ? options.method : 'POST',
      });

    } catch (e) {
      e.isFetchError = true;
      throw e;
    }
    
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  }
  
  public async cat(cid: string): Promise<any> {
    return await this.fetch(`/api/v0/cat?arg=${cid}`, {})
  }
  
  public async get(cid: string): Promise<any> {
    return await this.fetch(`/api/v0/get?arg=${cid}`, {})
  }

  public async add(input: object): Promise<any> {
    return await this.fetch('/api/v0/add?pin=true', {
      ...(
        await multipartRequest(input, null)
      )
    })
  }
}