/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-02 10:39:18
 * @LastEditTime: 2020-06-03 18:29:49
 * @LastEditors: kay
 */ 

// import assert from 'assert'
import { IpfsClient } from '../ipfs-client';
const fetch = require('node-fetch')
const concat = require('it-concat')

describe('IPFS Client', async () => {
  var client = new IpfsClient('http://127.0.0.1:5001', { fetch })
  
  // 只上传内容
  it('add file', async () => {
    // content could be a stream, a url, a Buffer, a File etc
    let res = await client.addFile('test')
    console.log(res)
  })

  // 上传内容及其对应文件名
  it('add file with fileName', async () => {
    // addFile(content, filseName)
    let res = await client.addFile('a', 'a.txt')
    console.log(res)
  })

  // 上传具有根目录的文件
  it('add files with root directory', async () => {
    let rootDir = 'test'
    let files = [{
      path: `${rootDir}/file1.txt`,
      // content could be a stream, a url, a Buffer, a File etc
      content: 'one'
    }, {
      path: `${rootDir}/file2.txt`,
      content: 'two'
    }, {
      path: `${rootDir}/file3.txt`,
      content: 'three'
    }]
    let res = await client.addDir(files, rootDir)
    console.log(res)
  })

  // cat file
  it('cat file', async () => {
    // cat 返回的是 Buffer
    let res = await client.cat('bafk43jqbec2g7rmq7jbk7cf6yrlvprkolplbkidpjwyifnk5a6zxblcw4rnry')
    console.log(res.toString())
  })
  
  // get 单个文件无目录
  it('get file', async () => {
    // res content 返回的是 AsyncGenerator with path 和 content
    let res = await client.get('bafk43jqbebk6clurmugs73cw5r2odu7e3w744lxtuzmjbqvbt3hyriyh45vcg')
    let content = await concat(res[0].content)
    console.log(content.toString())
  })

  // get 目录文件 
  it('get files', async () => {
    let res = await client.get('bafym3jqbebap2p3g2trgcgk3mynja5xai4vx4ab55ydmapxlwjd3fnalcln24')
    let files: Array<object> = new Array<object>();
    for (let i in res) {
      let result = {
        path: res[i].path,
        content: ''
      }
      if (res[i].content) {
        let content = await concat(res[i].content)
        result.content = content.toString()
      }
      files.push(result)
    }
    console.log(files)
  })
});