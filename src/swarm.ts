/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-19 17:11:47
 * @LastEditTime: 2020-06-22 09:44:14
 * @LastEditors: kay
 */

type peerInfo = {
  /** peer 地址**/
  addr?: string;
  /** peer cid**/
  peer?: string;

  latency?: string;
 
  streams?: string[];

  direction?: number;

  error?: any

  rawPeerInfo?: any
}

export async function peers(client: any) {
  const res = await (await client.fetch('/api/v0/swarm/peers')).json()

  return (res.Peers || []).map((peer: any) => {
    var info: peerInfo = {}
    try {
      info.addr = peer.Addr
      info.peer = peer.Peer
    } catch (error) {
      info.error = error
      info.rawPeerInfo = peer
    }
    if (peer.Muxer) {
      info.latency = peer.Latency
    }
    if (peer.Latency) {
      info.latency = peer.Latency
    }
    if (peer.Streams) {
      info.streams = peer.Streams
    }
    if (peer.Direction != null) {
      info.direction = peer.Direction
    }
    return info
  })
}

export async function addrs(client: any) {
  const { Addrs } = await (await client.fetch('/api/v0/swarm/addrs')).json()

  return Object.keys(Addrs).map((id: string) => ({
    id,
    addrs: (Addrs[id] || []).map((a: string)=> a)
  }))
}