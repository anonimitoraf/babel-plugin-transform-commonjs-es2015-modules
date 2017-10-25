const { join } = require('path')
const { readdirSync, readFileSync } = require('fs')
const { equal } = require('assert')
const { transformFileSync } = require('babel-core')
const plugin = require('../src')

describe(require('../package.json').description, () => {
  const fixturesDir = join(__dirname, 'fixtures')
  readdirSync(fixturesDir).map((caseName) => {
    it(`should ${caseName.split('-').join(' ')}`, () => {
      const fixtureDir = join(fixturesDir, caseName)
      const actualPath = join(fixtureDir, 'actual.js')
      const actual = transformFileSync(actualPath).code

      const expected = readFileSync(
        join(fixtureDir, 'expected.js')
      ).toString()

      equal(actual.trim(), expected.trim())
    })
  })
})
