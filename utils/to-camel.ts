/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-02 18:13:54
 * @LastEditTime: 2020-06-03 15:16:10
 * @LastEditors: kay
 */ 

'use strict'

// Convert object properties to camel case.
// NOT recursive!
// e.g.
// AgentVersion => agentVersion
// ID => id
var toCamel = (obj:any) => {
  if (obj == null) return obj
  const caps = /^[A-Z]+$/
  return Object.keys(obj).reduce((camelObj:any, k:any) => {
    if (caps.test(k)) { // all caps
      camelObj[k.toLowerCase()] = obj[k]
    } else if (caps.test(k[0])) { // pascal
      camelObj[k[0].toLowerCase() + k.slice(1)] = obj[k]
    } else {
      camelObj[k] = obj[k]
    }
    return camelObj
  }, {})
}

export default toCamel