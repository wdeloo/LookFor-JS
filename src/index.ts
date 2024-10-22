interface props {
    tag: string,
    [key: string]: string
}

interface params {
    keySensitive?: boolean,
    detectAccents?: boolean
}


interface position {
    start: number,
    end: number
}

function formatStr(str: string, params: params) { // remove accents and/or uppercases
    const keySensitive: boolean = params?.keySensitive === undefined ? true : params?.keySensitive
    const detectAccents: boolean = params?.detectAccents === undefined ? true : params?.detectAccents

    let formattedStr = str
    if (!keySensitive) formattedStr = formattedStr.toLowerCase()
    if (!detectAccents) formattedStr = formattedStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    return formattedStr
}

function getAllPositions(fullStr: string, query: string) { // get all the positions where the query is in the string
    const positions: position[] = []
    let position = fullStr.indexOf(query)

    while (position !== -1) {
        positions.push({start: position, end: position + query.length})
        position = fullStr.indexOf(query, position + query.length)
    }

    return positions
}

function filterPositionsByIndex(allPositions: position[], index: number | number[]) { // filter the positions with the index argument
    const maxIndex = allPositions.length
    if (typeof index === 'number') {
        const realIndex = index % maxIndex
        const filteredPositions = [allPositions[realIndex >= 0 ? realIndex : allPositions.length + realIndex]]

        return filteredPositions
    } else {
        const realIndex = index.map(i => i % maxIndex)
        const filteredPositions = allPositions.filter((_, i) => realIndex.includes(i >= 0 ? i : allPositions.length + i))

        return filteredPositions
    }
}

export class LookFor {
    props: props
    params: params | undefined

    constructor(props: props, params?: params) {
        this.props = props
        this.params = params
    }

    highlight(fullStr: string, query: string, index?: number | number[]): string {
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

        if (index !== undefined) {
            allPositions = filterPositionsByIndex(allPositions, index)
        }
    
        allPositions.sort((a, b) => b.start - a.start) // sort positions (the first in the array the last in the string and vice versa) in order not to move the positions in the loop on writing the tag
    
        const tag = {
            open: `<${this.props.tag}${propsString}>`,
            close: `</${this.props.tag}>`
        }
    
        let result = fullStr
        allPositions.forEach((position) => { // write the tags in the corresponding positions
            result = result.slice(0, position.end) + tag.close + result.slice(position.end)
            result = result.slice(0, position.start) + tag.open + result.slice(position.start)
        })
    
        return result
    }
}