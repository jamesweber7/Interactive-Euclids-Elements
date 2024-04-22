
function titlePage(options={}) {
    return bookPage({
        items: [
            {
                tagName: 'text1',
                innerText: "Welcome to an Interactive Euclid's Elements Visualization"
            },
            {
                tagName: 'text2',
                innerText: "This program lets you work through the first Propositions from Book 1 of Euclid's Elements",
                classList: ['padded', 'centered']
            },
            {
                tagName: 'text3',
                classList: ['padded', 'centered']
            },
            {
                tagName: 'img',
                attributes: [
                    {
                        name: 'src',
                        value: 'icons/shapes.svg'
                    }
                ],
                classList: ['centered', 'centered-vertical'],
                style: 'width: 50%;'
            }
        ],
    }, options);
}

function euclidHistoryPage(options={}) {
    return bookPage({
        items: [
            {
                tagName: 'text1',
                innerText: 'Euclid (Εὐκλείδης)'
            },
            {
                tagName: 'text1',
                innerText: '300 BC',
                classList: ['centered']
            },
            {
                tagName: 'text3',
                innerText: `Euclid was an ancient Greek mathematician known as the "Father of Geometry" for his treatise, Elements.`
            },
            {
                tagName: 'text3',
                innerText: `Euclid's Elements consists of 13 books, each filled with proofs for geometric 'Propositions'.`
            },
            {
                tagName: 'text3',
                innerText: `This is largely believed to be the first major compilation of proofs, and helps signify a standardization of mathematical knowledge.`
            },
            {
                tagName: 'div',
                items: [
                    {
                        tagName: 'quote',
                        /* Among these was Euclid, the author of the most successful mathematics textbook ever written—the Elements (Stoichia) */
                        innerText: `“...the most successful textbook in the history of mathematics.”`,
                    },
                    {
                        tagName: 'quoteauthor',
                        innerText: `~ Carl Boyer`,
                    },
                ],
                classList: ['centered-vertical', 'padded']
            },
        ],
    }, options);
}