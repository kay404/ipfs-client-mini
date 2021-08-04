/*
 * @Description: 
 * @Author: kay
 * @Date: 2020-06-02 10:39:18
 * @LastEditTime: 2021-08-04 17:18:08
 * @LastEditors: kay
 */ 

// import IpfsClient from '../index';
const { IpfsClient }  = require('../../index')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const pipe = require('it-pipe')
const { map } = require('streaming-iterables')
const toIterable = require('stream-to-it')

describe('IPFS Client', function(){
  var client = new IpfsClient('http://x.x.x.x:5001', { fetch })
  
  // 只上传文件内容
  var fileCid
  it('add file', async function(){
    // content could be a stream, a url, a Buffer, a File etc
    fileCid = await client.add('my test file.')
    console.log('fileCid: ', fileCid)
  })

  // 流形式上传文件
  var streamCid
  it('add stream', async function () {
    streamCid = await client.add(fs.createReadStream(__dirname + '/client.test.js'))
    console.log('streamCid: ', streamCid)
  })
  // 上传文件内容及其对应文件名
  var fileWithNameCid
  it('add file with fileName', async function(){
    // addFile(content, filseName)
    fileWithNameCid = await client.add('a', 'a.txt')
    console.log('fileWithNameCid: ', fileWithNameCid)
  })

  // 上传具有根目录的文件, 返回根目录的 cid
  var dirCid
  it('add files with root directory', async function(){
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
    dirCid = await client.add(files, rootDir)
    console.log('dirCid: ', dirCid)
  })

  // cat file
  it('cat file', async function(){
    // cat 返回的是 Buffer
    // let res = await all(client.cat(fileCid))
    const res = await client.cat(fileCid)
    console.log('cat: ', res.toString())
  })
  
  it('get file test', async function () {
    // save file local
    let output = './'
    // option default : {save: false}
    for await (const file of await client.get(dirCid, {save: true})){
      const fullFilePath = path.join(output, file.path)
      if (file.content) {
        await fs.promises.mkdir(path.join(output, path.dirname(file.path)), { recursive: true })
        await pipe(
          file.content,
          map((chunk) => chunk.slice()),
          toIterable.sink(fs.createWriteStream(fullFilePath))
        )
      } else (
        await fs.promises.mkdir(fullFilePath, {recursive: true})
      )
    }
  }, 30000)

});