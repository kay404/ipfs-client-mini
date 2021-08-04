/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-18 18:04:07
 * @LastEditTime: 2020-07-06 11:26:44
 * @LastEditors: kay
 */ 

type Link = {
  Name: string,
  Hash: string,
  Size: number,
  Type: number,
  Target: any
};
export = async function* lsStream(client: any, cid: string) {
  var res = await(await client.fetch(`/api/v0/ls?arg=${cid}`, {})).json()
  var result = res.Objects

  if (!result) {
    throw new Error('expected .Objects in results')
  }

  result = result[0]
  if (!result) {
    throw new Error('expected one array in results.Objects')
  }

  result = result.Links
  if (!Array.isArray(result)) {
    throw new Error('expected one array in results.Objects[0].Links')
  }

  for (const link of result) {
    const entry = {
      name: link.Name,
      hash: link.Hash,
      size: link.Size,
      type: typeOf(link),
      depth: link.Depth || 1
    }
    yield entry
  }
  // }
}

function typeOf (link: Link) {
  switch (link.Type) {
    case 1:
    case 5:
      return 'dir'
    case 2:
      return 'file'
    default:
      return 'unknown'
  }
}
// export lsStream
