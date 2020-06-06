const handlerFunctions = {
    "integer" : (value) => parseInt(value),
    "float" : (value) => parseFloat(value),
    "decimal" : (value) => parseFloat(value),
    "boolean" : parseBoolean,
    "string" : (value) => value,
    "text" : (value) => value,
    "datetime": (value) => new Date(value)
}

const handlers = new Map()

function parseBoolean(s) {
    if(typeof s!=='string')
        return !!s

    switch(s.toLowerCase()) {
        case "true" : return true
        case "false" : return false
    }
    return undefined
}

const setters = [
    function terminalObjectSetter(fn) {
        return function(store, value) {
            store[this.name] = fn(value)
        }
    },
    function terminalArraySetter(fn) {
        return function (store, value) {
            (store[this.name] || (store[this.name] = [])).push(fn(value))
        }
    },
    function terminalBaseArraySetter(fn) {
        return function (store, value) {
            store.push(fn(value))
        }
    }
]

function getHandler(name, setterType) {
    const key = name + setterType
    return handlers.get(key) || createHandler(name, key, setterType)
}

function createHandler(name, key, setterType) {
    const fn = handlerFunctions[name] || handlerFunctions.string
    const h = setters[setterType](fn)
    handlers.set(key, h)
    return h
}

module.exports = getHandler