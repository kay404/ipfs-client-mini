/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-19 16:11:28
 * @LastEditTime: 2020-08-27 17:54:18
 * @LastEditors: kay
 */ 

import toCamel from '../utils/to-camel'

export async function gen(client: any, name: string){
  const res = await (await client.fetch(`/api/v0/key/gen?arg=${name}`)).json()
  return toCamel(res)
}

export async function list(client: any) {
  const res = await (await client.fetch(`/api/v0/key/list`)).json()
  return (res.Keys || []).map((k: any) => toCamel(k))
}

export async function rm(client: any, name: string) {
  const res = await (await client.fetch(`/api/v0/key/rm?arg=${name}`)).json()
  return toCamel(res.Keys[0])
}