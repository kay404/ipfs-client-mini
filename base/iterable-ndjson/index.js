/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-08-28 10:31:22
 * @LastEditTime: 2020-08-28 10:31:26
 * @LastEditors: kay
 */

module.exports = source => (async function * () {
  const matcher = /\r?\n/
  const decoder = new TextDecoder('utf8')
  let buffer = ''
  for await (let chunk of source) {
    if (typeof chunk === 'string') {
      chunk = new TextEncoder().encode(chunk)
    }
    buffer += decoder.decode(chunk, { stream: true })
    const parts = buffer.split(matcher)
    buffer = parts.pop()
    for (let i = 0; i < parts.length; i++) yield JSON.parse(parts[i])
  }
  buffer += decoder.decode()
  if (buffer) yield JSON.parse(buffer)
})()