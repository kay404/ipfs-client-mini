/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-22 10:00:44
 * @LastEditTime: 2021-08-04 17:14:14
 * @LastEditors: kay
 */ 
const Block = require('../base/ipld-block/index')
const CID = require('../base/cids/src/index')
const Buffer = require('buffer').Buffer

export async function get(client: any, cid: string) {
  const res = await client.fetch(`/api/v0/block/get?arg=${cid}`, {responseType: 'arraybuffer'})
  var Cid = new CID(cid)
  return new Block(Buffer.from(await res.arrayBuffer()), Cid)
}