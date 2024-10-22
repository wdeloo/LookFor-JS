interface props {
    tag: string,
    [key: string]: string
}

interface params { //default
    keySensitive?: boolean, // true
    detectAccents?: boolean, // true
    forceIndex?: boolean // false
}


interface position {
    start: number,
    end: number
}

function formatStr(str: string, keySensitive: boolean, detectAccents: boolean) { // remove accents and/or uppercases
    let formattedStr = str
    if (!keySensitive) formattedStr = formattedStr.toLowerCase()
    if (!detectAccents) formattedStr = formattedStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    return formattedStr
}

function getAllPositions(fullStr: string, query: string) { // get all the positions where the query is in the string
    const positions: position[] = []
    let position = fullStr.indexOf(query)

    while (position !== -1) {
        positions.push({ start: position, end: position + query.length })
        position = fullStr.indexOf(query, position + query.length)
    }

    return positions
}

function filterPositionsByIndex(allPositions: position[], index: number | number[], forceIndex: boolean) { // filter the positions with the index argument
    const maxIndex = allPositions.length
    if (typeof index === 'number') { // handle index if passed as a number
        if (!forceIndex && Math.abs(index) > (index >= 0 ? maxIndex - 1 : maxIndex)) return [] // if forceIndex is set to false and the index is greater than the number of matches in the string, nothing will be highlighted
        const realIndex = index % maxIndex
        const filteredPositions = [allPositions[realIndex >= 0 ? realIndex : maxIndex + realIndex]]

        return filteredPositions
    } else { // handle index if passed as an array
        let realIndex
        if (!forceIndex) { // if forceIndex is set to false, delete all the indexes that are greater than the number of matches in the string
            realIndex = index
                .filter(i => !(Math.abs(i) > (i >= 0 ? maxIndex - 1 : maxIndex)))
                .map(i => i >= 0 ? i : maxIndex + i)
        } else {
            realIndex = index.map(i => {
                const index = i % maxIndex
                return index >= 0 ? index : maxIndex + index
            })
        }

        const filteredPositions = allPositions.filter((_, i) => realIndex.includes(i))

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
        const keySensitive: boolean = this.params?.keySensitive === undefined ? true : this.params?.keySensitive
        const detectAccents: boolean = this.params?.detectAccents === undefined ? true : this.params?.detectAccents
        const forceIndex: boolean = !!this.params?.forceIndex

        const valProp = /^[a-zA-Z0-9\-]+$/

        if (!this.props.tag) throw new Error("Missing 'tag' parameter") // tag is compulsory

        let propsString = ""
        for (const propName in this.props) {
            if (propName === "tag") continue // tag is not really a prop, so it must not be shown in the "propsString"
            if (!valProp.test(propName)) throw new Error(`Invalid prop name "${propName}"`) // check that props have a valid name

            propsString += ` ${propName}="${this.props[propName]}"` // is the string containing the props, to the right of the tag name in html.
        }

        const formattedFullStr = formatStr(fullStr, keySensitive, detectAccents)
        const formattedQuery = formatStr(query, keySensitive, detectAccents)

        let allPositions = getAllPositions(formattedFullStr, formattedQuery)

        if (index !== undefined) {
            allPositions = filterPositionsByIndex(allPositions, index, forceIndex)
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