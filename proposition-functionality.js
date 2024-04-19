
var proposition_info = {};

function checkPropositionPass() {
    if (proposition_info.passed)    // already passed
        return;
    const pass_info = propositionPassInfo();
    if (!pass_info || !pass_info.pass)
        return;
    // proposition passed
    proposition_info.passed = true;
    displayPassingShapes(pass_info);
}

function propositionPassInfo() {
    switch (proposition_info.number) {
        case 1:
            return prop1PassInfo();
    }
}

function initProposition(prop_number) {
    setProposition(getPropositionInfo(prop_number));
}

function setProposition(prop_info) {
    proposition_info = prop_info;
    clearProposition();
    if (!proposition_info)
        return;
    prop_info.given_shapes.forEach(shape => {
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
                    x: width*0.4,
                    y: height/2,
                    label: 'A',
                },
                {
                    x: width*0.6,
                    y: height/2,
                    label: 'B',
                }
            )
        ],
    }
}

function prop1PassInfo() {
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

function displayPassingShapes(pass_info) {
    const params = {
        opacity: 0,
    }
    const options = {
        when: DRAW_STAGES.END,
    }
    const ev_id = addDrawEvent(displayShapes, options).id;
    setTimeout(() => {
        document.addEventListener('click', () => {
            deleteDrawEvent(ev_id);
        });
    }, 100);

    function displayShapes() {
        background(255, params.opacity);
        pass_info.passing_shapes.forEach(shape => {
            drawShape(shape);
        })
        params.opacity += 2;
    }
}