
var proposition_info = {};

function checkPropositionPass() {
    if (proposition_info.passed)    // already passed
        return;
    const pass_info = propositionPassInfo();
    if (!pass_info || !pass_info.pass)
        return;
    // proposition passed
    proposition_info.passed = true;
    displayPropositionCompleteAnimation(pass_info);
}

function propositionPassInfo() {
    switch (proposition_info.number) {
        case 1:
            return prop1PassInfo();
    }
}

function setProposition(prop_number) {
    setPropositionInfo(getPropositionInfo(prop_number));
}

function setPropositionInfo(prop_info) {
    proposition_info = prop_info;
    clearPropositionShapes();
    if (!proposition_info || !proposition_info.valid)
        return;
    prop_info.given_shapes.forEach(shape => {
        addShape(shape);
    });
}

function resetProposition() {
    setProposition(proposition_info.number);
}

function clearPropositionShapes() {
    clearCanvas();
}

function noProposition() {
    setPropositionInfo({});
}

function getPropositionInfo(prop_number=proposition_info.number) {
    switch (prop_number) {
        case 1:
            return getProp1Info();
    }
    return {valid: false};
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
        valid: true,
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
        objective: "Construct an equilateral triangle on the given line AB.",
        steps: [
            "Draw a circle with origin A and radius AB",
            "Draw a circle with origin B and radius BA",
            "Draw a line from A to the intersection between the circles",
            "Draw a line from B to the intersection between the circles",
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

function displayPropositionCompleteAnimation(pass_info) {
    const options = {
        when: DRAW_STAGES.END,
    }
    const ev_id = addDrawEvent(propositionCompleteAnimation, options).id;

    const anim_time = 2000;
    const start_time = millis();
    const original_tr = {
        x: tr.x,
        y: tr.y,
        sc: tr.sc
    };
    function propositionCompleteAnimation() {
        const time_elapsed = millis()-start_time;
        const linear_amt = min(time_elapsed / anim_time, 1);
        const ease_amt = easeInOut(linear_amt);

        // hide background
        background(255, ease_amt*255);
        push();
            translateTransform();
            pass_info.passing_shapes.forEach(shape => {
                drawShape(shape);
            })
        pop();

        // lerp to reset transform
        tr.x = lerp(original_tr.x, 0, ease_amt);
        tr.y = lerp(original_tr.y, 0, ease_amt);
        tr.sc = lerp(original_tr.sc, 1, ease_amt);

        if (linear_amt >= 1) {
            deleteAllShapesExceptPassing(pass_info.passing_shapes);
            deleteDrawEvent(ev_id);
            displayPropositionCompleteMenu();
        }
    }
}

function displayPropositionCompleteMenu() {
    createPropositionCompleteMenu(proposition_info.number, proposition_info);
}

function easeInOut(amt, deg=3) {
    if (amt < 0.5) {
        return (2*amt)**deg / 2;
    } else {
        return (2-(-2*amt+2)**deg) / 2;
    }
}


function deleteAllShapesExceptPassing(except) {
    for (let i = 0; i < shapes.length; i++)
        while (i < shapes.length && !except.includes(shapes[i]))
            deleteShape(shapes[i]);
    intersection_points.splice(0);
}
