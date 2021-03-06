const {describe} = require( "mocha")

const fs = require('fs')
const createReader = require('../index')
const path = require('path')
const assert = require('assert')

const TESTDIR = 'test'

function testSample(xmlfile,jsonfile,resultfile, map) {
    const schema = JSON.parse(fs.readFileSync(path.join(TESTDIR,jsonfile),'utf-8'))
    const xml = fs.readFileSync(path.join(TESTDIR,xmlfile),'utf-8')
    const testResult = JSON.parse(fs.readFileSync(path.join(TESTDIR,resultfile),'utf-8'))
    const rdr = createReader(schema, map)
    const result = JSON.parse(JSON.stringify(rdr(xml)))
    assert.deepStrictEqual(result, testResult)
}

describe('Testing', function() {
    it('test1', () => testSample('sample1.xml', 'test.schema1.json', 'result1.json'))
    it('test2', () => testSample('sample2.xml', 'test.schema2.json', 'result2.json'))
    it('test3', () => testSample('sample3.xml', 'test.schema3.json', 'result3.json'))
    it('test4', () => testSample('sample4.xml', 'test.schema4.json', 'result4.json'))
    it('test5', () => testSample('sample5.xml', 'test.schema5.json', 'result5.json'))
    it('test6', () => testSample('sample6.xml', 'test.schema6.json', 'result6.json'))
    it('test7', () => testSample('sample7.xml', 'test.schema7.json', 'result7.json',
        (c) => ({
            _kind: c.body.content._kind,
            "timestamp": c.body.content.timestamp,
            "autoPay": c.body.content.item.autoPay
        })
    ))
});