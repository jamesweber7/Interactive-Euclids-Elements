
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
        pass_func: prop1PassInfo,
    }
}

function prop1PassInfo() {
    // should be equilateral triangle on line AB

    // find sets of three lines
    const line_sets = getPropositionShapeSets([SHAPE_TYPES.LINE, SHAPE_TYPES.LINE, SHAPE_TYPES.LINE])

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

        // check to make sure exactly three endpoints between the lines
        let endpoints = [];
        line_set.forEach(line => {
            [line.p1, line.p2].forEach(pt => {
                let new_endpoint = true;
                endpoints.forEach(endpoint => {
                    new_endpoint = new_endpoint && !pointsWithinEpsilon(pt, endpoint);
                })
                if (new_endpoint)
                    endpoints.push(pt);
            })
        })
        if (endpoints.length !== 3) // exactly 3 endpoints
            return;

        triangle_sets.push(line_set);
    })

    // check lengths
    const equilateral_triangle_sets = [];
    triangle_sets.forEach(triangle_set => {
        const side_length_sq = getPointDistSq(triangle_set[0].p1, triangle_set[0].p2);
        for (let i = 1; i < triangle_set.length; i++)
            if (!withinEpsilon(getPointDistSq(triangle_set[i].p1, triangle_set[i].p2), side_length_sq))
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

function getProp2Info() {
    return {
        valid: true,
        "number": 2,
        given_shapes: [
            pointShape(width*0.55-width*0.05, height*0.5+width*0.05, {label: 'A'}), // same offsets from B point for right angle
            lineShape(
                {
                    x: width*0.55,
                    y: height*0.5,
                    label: 'B',
                },
                {
                    x: width*0.55+2**-10, // epsilon so labels will be on right
                    y: height*0.2,
                    label: 'C',
                }
            )
        ],
        objective: "Place as an extremity at a given point A a line equal to the given line BC.",
        steps: [
            "Draw line AB",
            "On AB construct an equilateral triangle ABD [Proposition 1]",
            "Extend line DB",
            "Extend line DA",
            "Draw a circle with origin B and radius BC. Let E be the intersection between this circle and the line extended from DB",
            "Draw a circle with origin D and radius DE",
        ],
        pass_func: prop2PassInfo,
        on_change: prop2OnChange,
    }
}

function prop2OnChange(event) {
    const shape = event.shape;
    
    // check for certain shapes to add labels to
    // D label: equilateral triangle point
    if (shape.equilateral_triangle) {
        if (shape === triangle_points.c) {
            const a = getShapeByLabel('A', proposition_info.given_shapes);
            const b = getShapeByLabel('B', proposition_info.given_shapes);
            if ((pointsWithinEpsilon(triangle_points.a, a) && pointsWithinEpsilon(triangle_points.b, b)) ||
                (pointsWithinEpsilon(triangle_points.a, b) && pointsWithinEpsilon(triangle_points.a, a))) {
                shape.label = 'D';
            }
        }
    }
    // E label: intersection point between DB extension and circle with origin B and radius BC
}

function prop2PassInfo() {

}