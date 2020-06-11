const sax = require('sax')
const compileMap = require('./compile')

module.exports = function createReader(root, map) {
    const parser = sax.parser(true, {
        trim: true
    })

    parser.onopentag = function startElement(tag) {
        propertyStack.push(property)
        property = property.properties(tag.name)
        switch (property.type) {
            case 0:
                textBuilder = null
                return
            case 1:
                storeStack.push(store)
                store = property.create()
                return
            case 2:
                storeStack.push(store)
                store = store[tag.name]||property.create()
                return
            default:
                return
        }
    }

    parser.onclosetag = function endElement() {
        switch(property.type) {
            case 0: // Terminal
                property.setValue(store, textBuilder)
                property = propertyStack.pop()
                return
            case 1: // Object
            case 2: // Array
                const n1 = property.name
                property = propertyStack.pop()
                store = property.setValue(storeStack.pop(), n1, store)
                return
            default: // Unknown
                property = propertyStack.pop()
                return
        }
    }

    parser.ontext = function text(value) {
        textBuilder = textBuilder ? textBuilder + value : value
    }

    parser.onerror = function (error) {
        console.error(error)
    }

    const compiledRoot = compileMap(root)
    let property = null;
    let store = {}
    let propertyStack = [];
    let storeStack = [];
    let textBuilder = null

    return (xml) => {
        store = {}
        propertyStack = []
        storeStack = []
        property = compiledRoot
        parser.write(xml).close()
        return map?map(store):store
    }
}
