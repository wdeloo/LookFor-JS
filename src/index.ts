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
        
export class LookFor {
    props: props
    params: params | undefined

    constructor(props: props, params?: params) {
        this.props = props
        this.params = params
    }

    highlight(fullStr: string, query: string, index?: number): string {
        const valProp = /^[a-zA-Z0-9\-]+$/
    
        if (!this.props.tag) throw new Error("Missing 'tag' parameter") // tag is compulsory
    
        let propsString = ""
        for (const propName in this.props) {
            if (propName === "tag") continue // tag is not really a prop, so it must not be shown in the "propsString"
            if (!valProp.test(propName)) throw new Error(`Invalid prop name "${propName}"`) // check that props have a valid name
    
            propsString += ` ${propName}="${this.props[propName]}"` // is the string containing the props, to the right of the tag name in html.
        }
    
        const formattedFullStr = this.params ? formatStr(fullStr, this.params) : fullStr
        const formattedQuery = this.params ? formatStr(query, this.params) : query
    
        let allPositions = getAllPositions(formattedFullStr, formattedQuery)
        allPositions = index !== undefined ? [allPositions[index]] : allPositions
        if (allPositions.length === 0) return fullStr
    
        allPositions.sort((a, b) => b.start - a.start)
    
        const tag = {
            open: `<${this.props.tag}${propsString}>`,
            close: `</${this.props.tag}>`
        }
    
        let result = fullStr
        allPositions.forEach((position) => {
            result = result.slice(0, position.end) + tag.close + result.slice(position.end)
            result = result.slice(0, position.start) + tag.open + result.slice(position.start)
        })
    
        return result
    }
}