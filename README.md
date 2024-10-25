# LookFor-JS

**LookFor-JS** is a JavaScript library that **highlights** in HTML specific substrings of a string.

#### Example:

```js
const LookFor = require('lookfor-js')

const lookFor = new LookFor({tag: 'span', class: 'red'}, {keySensitive: false})
const highlighted = lookFor.highlight('Hello, world!', 'hello')

console.log(highlighted) // <span class="red">Hello</span>, world!
```

# Installation

```
npm i lookfor-js
```

# Usage

```js
const LookFor = require('lookfor-js')
// or
import LookFor from 'lookfor-js'


const lookFor = new LookFor(attributes, parameters)
const highlighted = lookFor.highlight(text, query, id)
```

## Constructor

```js
new LookFor(attributes, parameters)
```

### Attributes (required)

The **attributes** object defines how the highlight **tag** is. E.g:

```js
const attributes = {
    tag: 'span', // required
    class: 'text-red',
    'any-attribute': 'any value'
}
```

If this is passed as **first argument** to `LookFor()` constructor, the highlighting tag will be:

```html
<span class="text-red" any-attribute="any value"></span>
```

### Parameters (optional)

There are three parameters that can be passed to the constructor:

```js
const parameters = {
    keySensitive: true,
    detectAccents: true,
    forceIndex: false
}
```

#### keySensitive

* Default: `true`

If set to `false`, it will match a character regardless of whether it is capitalized. E.g.

```js
lookFor.highlight('hello, HELLO, Hello.', 'hello')

// if keySensitive is set to false: "<tag>hello</tag>, <tag>HELLO</tag>, <tag>Hello</tag>."
// if keySensitive is set to true: "<tag>hello</tag>, HELLO, Hello."
```

#### detectAccents

* Default: `true`

If set to `false`, it will match a character regardless of whether it has an accent. E.g.

```js
lookFor.highlight('hello, héllo, hëllò.', 'hello')

// if detectAccents is set to false: "<tag>hello</tag>, <tag>héllo</tag>, <tag>hëllò</tag>."
// if detectAccents is set to true: "<tag>hello</tag>, héllo, hëllò."
```

#### forceIndex

* Default: `false`

If set to `true`, it will show one of the matches even if the `id` is greater that the number of matches. E.g.

```js
lookFor.highlight('hello, hello, hello.', 'hello', 4)
//                   0      1      2

// if forceIndex is set to false: "hello, hello, hello."
// if forceIndex is set to true: "hello, <tag>hello</tag>, hello."
```

## Highlight function

```js
lookFor.highlight(text, query, id)
```

### Text

Is the full string where you want to highlight parts inside.

### Query

Is the substring you want to highlight in the `text`.

* Regular expressions are not supported for the moment. **COMING SOON**

### ID (optional)

Is the index of the match you want to highlight.

It can be a number (positive or negative) or a number array (to highlight more than one at the same time).

If no id is passed to the function, all the matches will be highlighted.