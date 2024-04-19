
var proposition_info = {};

function checkPass() {
    switch (proposition_info.number) {
        case 1:
            return checkProp1Pass();
    }
}

function setProposition(prop_info) {
    proposition_info = prop_info;
    clearProposition();
    prop_info.shapes.forEach(shape => {
        addShape(shape);
    });
}

function clearProposition() {
    clearCanvas();
}

function getPropositionInfo(prop_number=proposition_info.number) {
    switch (prop_number) {
        case 1:
            return getProp1Info();
    }
}

// function loadPropositions() {
//     fetch("propositions.json")
//         .then(response => response.json())
//         .then(propsLoaded);
// }

// function propsLoaded(props) {
//     props_loaded = true;
//     propositions = props;
// }

function getProp1Info() {
    return {
        "number": 1,
        given_shapes: [
            lineShape(
                {
                    x: 0,
                    y: height/2,
                    label: 'A',
                },
                {
                    x: width,
                    y: height/2,
                    label: 'B',
                }
            )
        ],
    }
}

function checkProp1Pass() {
    // should be equilateral triangle on line AB

    // find sets of three lines
    const line_sets = getShapeSets([SHAPE_TYPES.LINE, SHAPE_TYPES.LINE, SHAPE_TYPES.LINE])

    // check endpoints to all be equal - forming triangles
    const triangle_sets = [];
    line_sets.forEach(line_set => {
        // lines must all share three endpoints
        for (let i = 0; i < line_set.length; i++) {
            const line1 = line_set[i];
            const line2 = line_set[(i+1)%3];

            // can't have all lines just having the same endpoints
            if (pointsWithinEpsilon(line1.p1, line1.p2)) 
                return;
            
            let num_equal = 0;
            // exactly one of line1's points equals exactly one of line2's points
            [line1.p1, line1.p2].forEach(p1 => {
                [line2.p1, line2.p2].forEach(p2 => {
                    console.log(p1, p2, pointsWithinEpsilon(p1, p2))
                    if (pointsWithinEpsilon(p1, p2))
                        num_equal ++;
                });
            
            });
            // exactly one equal
            if (num_equal !== 1) {
                return;
            }
        }
        triangle_sets.push(line_set);
    })

    // check lengths
    const equilateral_triangle_sets = [];
    triangle_sets.forEach(triangle_set => {
        const side_length = getPointDistSq(triangle_set[0].p1, triangle_set[0].p2);
        for (let i = 1; i < triangle_set.length; i++)
            if (getPointDistSq(triangle_set[0].p1, triangle_set[0].p2) != side_length)
                return;
        equilateral_triangle_sets.push(triangle_set);
    })

    if (equilateral_triangle_sets.length) {
        return {
            pass: true,
            passing_shapes: equilateral_triangle_sets[0]
        };
    }
}