const createHandler = require('./handlers')

function compileMap(obj, isBaseArray) {

    const map = new Map()
    let statics = undefined

    for (let key in obj) {
        const value = obj[key]
        if (key.startsWith('!')) {
            if (!statics) statics = {}
            statics[key.substring(1)] = value
        } else {
            const [tagName, propertyName, isArray] = parseName(key)
            map.set(
                tagName,
                (typeof value === 'object')
                    ? createObjectProperty(value, propertyName, isArray)
                    : createTerminalProperty(value, propertyName, isBaseArray ? 2 : isArray ? 1 : 0)
            )
        }
    }

    return {
        map,
        properties: getProperties,
        create: isBaseArray
            ? createArray
            : statics
                ? createTemplateObject(statics)
                : createSimpleObject
    }
}


function createArray() {
    return []
}

function createSimpleObject() {
    return {}
}

function createTemplateObject(template) {
    return () => {
        return {
            ...template
        }
    }
}


function parseName(name) {
    const s = name.split('|')
    const isArray = s[0].endsWith('*')
    const tagName = isArray ? s[0].substr(0, s[0].length - 1) : s[0]
    return [tagName, s.length > 1 ? s[1] : tagName, isArray]
}

function createObjectProperty(propertyType, propertyName, isArray) {
    return Object.freeze({
        type: isArray ? 2 : 1,
        name: propertyName,
        setValue: isArray ? arraySetter : objectSetter,
        ...compileMap(propertyType, isArray),
    })
}

function objectSetter(store, name, value) {
    store[name] = value
    return store
}
function arraySetter(store, name, value) {
    store.push(value)
    return store
}

function createTerminalProperty(propertyType, propertyName, setterType) {
    return Object.freeze({
        type: 0,
        name: propertyName,
        map: null,
        properties: noopProperties,
        setValue: createHandler(propertyType, setterType)
    })
}

function noopProperties() {
    return dummyState
}

function getProperties(tagName) {
    return this.map.get(tagName) || dummyState
}

const dummyState = Object.freeze({
    type: -1,
    name: '$$DUMMY$$',
    properties: noopProperties,
    setValue: null
})

module.exports =  (root) => {
    return Object.freeze({
        type: 1,
        name: '$$ROOT$$',
        setValue(_, nm, value) {
            return value
        },
        ...compileMap(root, false)
    })
}
