interface props {
    tag: string,
    [key: string]: string
}

interface params {
    keySensitive?: boolean,
    detectAccents?: boolean
}

function formatStr(str: string, params: params) {
    const keySensitive: boolean = params?.keySensitive === undefined ? true : params?.keySensitive
    const detectAccents: boolean = params?.detectAccents === undefined ? true : params?.detectAccents

    let formattedStr = str
    if (!keySensitive) formattedStr = formattedStr.toLowerCase()
    if (!detectAccents) formattedStr = formattedStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    return formattedStr
}

function getAllPositions(fullStr: string, query: string) {
    const positions = []
    let position = fullStr.indexOf(query)

    while (position !== -1) {
        positions.push({start: position, end: position + query.length})
        position = fullStr.indexOf(query, position + query.length)
    }

    return positions
}

export function highlight(fullStr: string, query: string, props: props, params?: params) {
    const valProp = /^[a-zA-Z0-9\-]+$/

    if (!props.tag) throw new Error("Missing 'tag' parameter") // tag is compulsory

    let propsString = ""
    for (const propName in props) {
        if (propName === "tag") continue // tag is not really a prop, so it must not be shown in the "propsString"
        if (!valProp.test(propName)) throw new Error(`Invalid prop name "${propName}"`) // check that props have a valid name

        propsString += ` ${propName}="${props[propName]}"` // is the string containing the props, to the right of the tag name in html.
    }

    const formattedFullStr = params ? formatStr(fullStr, params) : fullStr
    const formattedQuery = params ? formatStr(query, params) : query

    const allPositions = getAllPositions(formattedFullStr, formattedQuery)
    if (allPositions.length === 0) return fullStr

    allPositions.sort((a, b) => b.start - a.start)

    const tag = {
        open: `<${props.tag}${propsString}>`,
        close: `</${props.tag}>`
    }

    let result = fullStr
    allPositions.forEach((position) => {
        result = result.slice(0, position.end) + tag.close + result.slice(position.end)
        result = result.slice(0, position.start) + tag.open + result.slice(position.start)
    })

    return result
}