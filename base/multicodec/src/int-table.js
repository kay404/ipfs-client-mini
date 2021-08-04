'use strict'
const baseTable = require('./base-table.js')

// map for hexString -> codecName
const nameTable = new Map()

for (const encodingName in baseTable) {
  const code = baseTable[encodingName]
  nameTable.set(code, encodingName)
}

module.exports = Object.freeze(nameTable)
