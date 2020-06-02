/*
 * @Description: 
 * @Author: sandman sandmanhome@hotmail.com
 * @Date: 2020-06-02 15:33:22
 * @LastEditTime: 2020-06-02 15:33:50
 * @LastEditors: sandman
 */
export default function (mode: any) {
  if (mode === undefined || mode === null) {
    return undefined
  }

  if (typeof mode === 'string' || mode instanceof String) {
    return mode
  }

  return mode.toString(8).padStart(4, '0')
}
