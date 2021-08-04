/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-23 16:07:41
 * @LastEditTime: 2020-06-23 16:38:53
 * @LastEditors: kay
 */ 

export async function list(client: any) {
  const res = await client.fetch('/api/v0/bootstrap/list');
  return res.json()
}

export async function add(client: any, peer: string) {
  const res = await client.fetch(`/api/v0/bootstrap/add?arg=${peer}`)
  return res.json()
}

export async function rm(client: any, peer: string) {
  const res = await client.fetch(`/api/v0/bootstrap/rm?arg=${peer}`)
  return res.json()
}