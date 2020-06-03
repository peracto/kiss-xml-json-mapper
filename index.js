const sax = require('sax')

const emptyGetter = new Map()

function compileMap(obj) {
    return new Map(Object.entries(obj).map(kvp => {
        const [tagName, propertyName, isArray] = parseName(kvp[0])
        return [
            tagName,
            Object.freeze(createProperty(kvp[1], propertyName, isArray))
        ]
    }))
}

function createProperty(propertyType, propertyName, isArray) {
    if (typeof (propertyType) === 'object') {
        return {
            terminal: false,
            name: propertyName,
            create: isArray
                ? createArray
                : createObject,
            properties: compileMap(propertyType, isArray),
            setValue: isArray
                ? xxxxArray(propertyName)
                : xxxxObject(propertyName)
        }
    } else {
        return {
            terminal: true,
            name: propertyName,
            setValue: isArray
                ? setterArrayValue(propertyName, getHandler(propertyType))
                : setterObjectValue(propertyName, getHandler(propertyType)),
            properties: emptyGetter
        }
    }
}

function xxxxObject(name) {
    return (store, value) => {
        store[name] = value
    }
}
function xxxxArray() {
    return (store, value) => {
        store.push(value)
    }
}

function setterObjectValue(name, fn) {
    return (store, value) => {
        store[name] = fn(value)
    }
}
function setterArrayValue(name, fn) {
    return (store, value) => {
        const a = store[name] ||  (store[name] = [])
        a.push(fn(value))
    }
}

function parseName(name) {
    const s = name.split('|')
    const isArray = s[0].endsWith('*')
    const tagName = isArray ? s[0].substr(0, s[0].length - 1) : s[0]
    return [tagName, s.length > 1 ? s[1] : tagName, isArray]
}

function createArray() {
    return []
}
function createObject() {
    return {}
}


const dummyState = Object.freeze({
    terminal: false,
    properties: emptyGetter,
    create: noop,
    setValue: noop,
    name: '$$DUMMY$$'
})

const handlerFunctions = {
    "integer" : (value) => parseInt(value),
    "float" : (value) => parseFloat(value),
    "string" : (value) => value,
    "text" : (value) => value,
    "datetime": (value) => new Date(value)
}

function getHandler(name) {
    return handlerFunctions[name] || handlerFunctions.string
}

function noop() {
}

module.exports = function createReader(root) {

    const parser = sax.parser(true, {
        trim: true
    })

    const compiledRoot = {
        properties: compileMap(root, 0),
        name: '$$ROOT$$',
        setValue(_, value) {
            store = value
        }
    }

    parser.onopentag = function startElement(tag) {
        storeStack.push(store)
        propertyStack.push(property)
        property = property.properties.get(tag.name) || dummyState
        textBuilder = null
        if (property.terminal) return
        store = property.create()
    }

    parser.onclosetag = function endElement() {
        if (property.terminal) {
            property.setValue(store, textBuilder)
            property = propertyStack.pop()
            store = storeStack.pop()
        } else {
            const value = store
            property = propertyStack.pop()
            store = storeStack.pop()
            property.setValue(store, value)
        }
    }

    parser.ontext = function text(value) {
        textBuilder = textBuilder ? textBuilder + value : value
    }

    parser.onerror = function (error) {
        console.error(error)
    }

    let property = null;
    let store = {}
    let propertyStack = [];
    let storeStack = [];
    let textBuilder = null

    return (xml) => {
        store = {}
        propertyStack = [];
        storeStack = [];
        property = compiledRoot
        parser.write(xml).close()
        return store
    }
}
