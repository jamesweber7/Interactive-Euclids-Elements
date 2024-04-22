
const standard_book_contents = [
        {
            page: titlePage,
            name: 'Title',
        },
        {
            page: euclidHistoryPage,
            name: "Intro to Euclid's Elements",
        },
        // Tutorial Pages...
        // Proposition Pages...
        {
            page: contentsPage,
            name: "Contents",
        },
        {
            page: definitionsPage,
            name: "Definitions",
        },
        {
            page: postulatesPage,
            name: "Postulates",
        },
        {
            page: axiomsPage,
            name: "Axioms",
        },
    ];

function standardBookPages() {
    const pages = [];
    standard_book_contents.forEach(page_info => {
        pages.push(page_info.page());
    })
    return pages;
}

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

function contentsPage(options={}) {
    const contents_buttons = [];
    standard_book_contents.forEach((page_info, index) => {
        contents_buttons.push({
            tagName: 'button',
            innerText: page_info.name,
            onclick: () => {
                goToBookPage(index);
            }
        });
    });
    return bookPage({
        items: [
            {
                tagName: 'text1',
                innerText: 'Contents'
            },
            {
                tagName: 'div',
                id: 'contents-container',
                classList: ['padded'],
                items: contents_buttons
            }
        ]
    }, options);
}

function definitionsPage(options={}) {
    return bookPage({
        items: [
            {
                tagName: 'text1',
                innerText: 'Definitions',
            },
            {
                tagName: 'ol',
                style: 'height: 70%; overflow-y: scroll;',
                items: [
                    /* Translations by Oliver Byrne, 1847 */
                    {
                        "tagName": "li",
                        "innerText": "A point is that which has no parts."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A line is length without breadth."
                    },
                    {
                        "tagName": "li",
                        "innerText": "The extremities of a line are points."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A straight or right line is that which lies evenly between its extremities."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A surface is that which has length and breadth only."
                    },
                    {
                        "tagName": "li",
                        "innerText": "The extremities of a surface are lines."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A plane surface is that which lies evenly between its extremities."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A plane angle is the inclination of two lines to one another, in a plane, which meet together, but are not in the same direction."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A plane rectilinear angle is the inclination of two straight lines to one another, which meet together, but are not in the same straight line."
                    },
                    {
                        "tagName": "li",
                        "innerText": "When one straight line standing on another straight line makes the adjacent angles equal, each of these angles is called a right angle, and each of these lines is said to be perpendicular to the other."
                    },
                    {
                        "tagName": "li",
                        "innerText": "An obtuse angle is an angle greater than a right angle."
                    },
                    {
                        "tagName": "li",
                        "innerText": "An acute angle is an angle less than a right angle."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A term or boundary is the extremity of anything."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A figure is a surface enclosed on all sides by a line or lines."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A circle is a plane figure, bounded by one continued line, called its circumference or periphery; and having a certain point within it, from which all straight lines drawn to its circumference are equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "This point (from which the equal lines are drawn) is called the centre of the circle."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A diameter of a circle is a straight line drawn through the centre, terminated both ways in the circumference."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A semicircle is the figure contained by the diameter, and the part of the circle cut off by the diameter."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A segment of a circle is a figure contained by a straight line, and the part of the circumference which it cuts off."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A figure contained by straight lines only, is called a rectilinear figure."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A triangle is a rectilinear figure included by three sides."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A quadrilateral figure is one which is bounded by four sides. The straight lines connecting the vertices of the opposite angles of a quadrilateral figure, are called its diagonals."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A polygon is a rectilinear figure bounded by more than four sides."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A triangle whose three sides are equal, is said to be equilateral."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A triangle which has only two sides equal is called an isosceles triangle."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A scalene triangle is one which has no two sides equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A right-angled triangle is that which has a right angle."
                    },
                    {
                        "tagName": "li",
                        "innerText": "An obtuse-angled triangle is that which has an obtuse angle."
                    },
                    {
                        "tagName": "li",
                        "innerText": "An acute-angled triangle is that which has three acute angles."
                    },
                    {
                        "tagName": "li",
                        "innerText": "Of four-sided figures, a square is that which has all its sides equal, and all its angles right angles."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A rhombus is that which has all its sides equal, but its angles are not right angles."
                    },
                    {
                        "tagName": "li",
                        "innerText": "An oblong is that which has all its angles right angles, but has not all its sides equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "A rhomboid is that which has its opposite sides equal to one another, but all its sides are not equal, nor its angles right angles."
                    },
                    {
                        "tagName": "li",
                        "innerText": "All other quadrilateral figures are called trapeziums."
                    },
                    {
                        "tagName": "li",
                        "innerText": "Parallel straight lines are such as are in the same plane, and which being produced continually in both directions, would never meet."
                    }
                ]                
            }
        ]
    }, options)
}

function postulatesPage(options={}) {
    return bookPage({
        items: [
            {
                tagName: 'text1',
                innerText: 'Postulates',
            },
            {
                tagName: 'ol',
                items: [
                    /* Translations by Oliver Byrne, 1847 */
                    {
                        "tagName": "li",
                        "innerText": "Let it be granted that a straight line may be drawn from any one point to any other point."
                    },
                    {
                        "tagName": "li",
                        "innerText": "Let it be granted that a finite straight line may be produced to any length in a straight line."
                    },
                    {
                        "tagName": "li",
                        "innerText": "Let it be granted that a circle may be described with any centre at any distance from that centre."
                    }
                ]                
            }
        ]
    }, options);
}


function axiomsPage(options={}) {
    return bookPage({
        items: [
            {
                tagName: 'text1',
                innerText: 'Axioms',
            },
            {
                tagName: 'ol',
                style: 'height: 70%; overflow-y: scroll;',
                items: [
                    /* Translations by Oliver Byrne, 1847 */
                    {
                        "tagName": "li",
                        "innerText": "Magnitudes which are equal to the same are equal to each other."
                    },
                    {
                        "tagName": "li",
                        "innerText": "If equals be added to equals the sums will be equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "If equals be taken away from equals the remainders will be equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "If equals be added to unequals the sums will be unequal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "If equals be taken away from unequals the remainders will be unequal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "The doubles of the same or equal magnitudes are equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "The halves of the same or equal magnitudes are equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "Magnitudes which coincide with one another, or exactly fill the same space, are equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "The whole is greater than its part."
                    },
                    {
                        "tagName": "li",
                        "innerText": "Two straight lines cannot include a space."
                    },
                    {
                        "tagName": "li",
                        "innerText": "All right angles are equal."
                    },
                    {
                        "tagName": "li",
                        "innerText": "If two straight lines meet a third so as to make the two interior angles on the same side less than two right angles, these two straight lines will meet if they be produced on that side on which the angles are less than two right angles."
                    }
                ]                
            }
        ]
    }, options);
}