const emptyGetter = new Map()

function compileMap(obj, isBaseArray) {
    return new Map(Object.entries(obj).map(([key, value]) => {
        const [tagName, propertyName, isArray] = parseName(key)
        return [
            tagName,
            (typeof value === 'object')
                ? createObjectProperty(value, propertyName, isArray)
                : createTerminalProperty(value, propertyName, isArray, isBaseArray)
        ]
    }))
}

function createObjectProperty(propertyType, propertyName, isArray) {
    return Object.freeze({
        type: isArray?2:1,
        name: propertyName,
        map: compileMap(propertyType, isArray),
        properties: getProperties,
        setValue: isArray ? arraySetter : objectSetter
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

function createTerminalProperty(propertyType, propertyName, isArray, isBaseArray) {
    return Object.freeze({
        type: 0,
        name: propertyName,
        map: null,
        properties: noopProperties,
        setValue: createTerminalSetter(isBaseArray, isArray)(getHandler(propertyType), propertyName)
    })
}

function createTerminalSetter(isBaseArray, isArray) {
    return isBaseArray ? terminalBaseArraySetter : isArray ? terminalArraySetter : terminalObjectSetter
}

function terminalObjectSetter(fn, name) {
    return (store, value) => {
        store[name] = fn(value)
    }
}
function terminalArraySetter(fn, name) {
    return function (store, value) {
        (store[name] || (store[name] = [])).push(fn(value))
    }
}
function terminalBaseArraySetter(fn) {
    return function (store, value) {
        store.push(fn(value))
    }
}

function noopProperties() {
    return emptyGetter
}

function getProperties(tagName) {
    return this.map.get(tagName) || dummyState
}



function parseName(name) {
    const s = name.split('|')
    const isArray = s[0].endsWith('*')
    const tagName = isArray ? s[0].substr(0, s[0].length - 1) : s[0]
    return [tagName, s.length > 1 ? s[1] : tagName, isArray]
}

const dummyState = Object.freeze({
    type: -1,
    name: '$$DUMMY$$',
    properties: emptyGetter,
    setValue: null
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

module.exports =  (root) => {
    return Object.freeze({
        type: 1,
        name: '$$ROOT$$',
        map: compileMap(root, false),
        properties: getProperties,
        setValue(_, nm, value) {
            return value
        }
    })
}
