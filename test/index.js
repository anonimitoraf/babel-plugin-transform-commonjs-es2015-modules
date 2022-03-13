const { join } = require('path')
const { readdirSync, readFileSync } = require('fs')
const { equal } = require('assert')
const { transformFileSync } = require('@babel/core')
const plugin = require('../dist/index')

const caseNameFilter = /.*/;

describe(require('../package.json').description, () => {
  const fixturesDir = join(__dirname, 'fixtures')
  readdirSync(fixturesDir)
    .filter(caseName => caseNameFilter.test(caseName))
    .map((caseName) => {
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
