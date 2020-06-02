/*
 * @Description: 
 * @Author: sandman sandmanhome@hotmail.com
 * @Date: 2020-06-02 15:50:53
 * @LastEditTime: 2020-06-02 16:03:26
 * @LastEditors: sandman
 */ 

 const { IpfsClient } = require('./dist/index')
 const fetch = require('node-fetch')

 const client = new IpfsClient('http://192.168.100.241:5001', {fetch});
//  client.add('test').then(res => {
//    console.log(res);
//  })

 const dir = [{
  path: `testdir/file1.txt`,

  // content could be a stream, a url, a Buffer, a File etc
  content: 'one'
}, {
  path: `testdir/file2.txt`,
  content: 'two'
}, {
  path: `testdir/file3.txt`,
  content: 'three'
}]
 
 client.addMultipart(dir).then(res => {
  console.log(res);
})