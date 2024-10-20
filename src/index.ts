interface props {
    tag: string,
    [key: string]: string
}

export function highlight(fullStr: string, strToHighlight: string, props: props) {
    const valProp = /^[a-zA-Z0-9\-]+$/

    if (!props.tag) throw new Error("Missing 'tag' parameter") // tag is compulsory

    let propsString = ""
    for (const propName in props) {
        if (propName === "tag") continue // tag is not really a prop, so it must not be shown in the "propsString"
        if (!valProp.test(propName)) throw new Error(`Invalid prop name "${propName}"`) // check that props have a valid name

        propsString += ` ${propName}="${props[propName]}"` // is the string containing the props, to the right of the tag name in html.
    }

    if (!fullStr.includes(strToHighlight)) return fullStr

    const tag = {
        open: `<${props.tag}${propsString}>`,
        close: `</${props.tag}>`
    }

    const splitString = fullStr.split(strToHighlight)

    let result = ""
    for (const i in splitString) {
        const piece = splitString[i]
        const index = Number(i)

        if (result) result += tag.close // if it is not the first piece of string it will close the tag of the previous one

        result += piece

        if (splitString[index + 1] !== undefined) { // if it is not the last one it will open a string for the next one just before the string the user want to highligh
            result += tag.open
            result += strToHighlight
        }
    }

    return result
}