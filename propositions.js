
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
    const ab = getLineByLabels('A', 'B');
    // should be equilateral triangle on line AB
    const equilateral_triangle_sets = getEquilateralTrianglesOnLine(ab);

    if (equilateral_triangle_sets.length) {
        return {
            pass: true,
            passing_shapes: equilateral_triangle_sets[0]
        };
    }
}

function getTriangles() {
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
    
    return triangle_sets;
}

function getEquilateralTriangles() {
    const triangle_sets = getTriangles();

    // check lengths
    const equilateral_triangle_sets = [];
    triangle_sets.forEach(triangle_set => {
        const side_length_sq = getPointDistSq(triangle_set[0].p1, triangle_set[0].p2);
        for (let i = 1; i < triangle_set.length; i++)
            if (!withinEpsilon(getPointDistSq(triangle_set[i].p1, triangle_set[i].p2), side_length_sq))
                return;
        equilateral_triangle_sets.push(triangle_set);
    })

    return equilateral_triangle_sets;
}

// add equilateral triangle info to all lines that are part of an equilateral triangle
function updateEquilateralTriangles(equilateral_triangles=getEquilateralTriangles()) {
    updateTriangles(equilateral_triangles, 'equilateral_triangles');
}

// get information about equilateral triangle on line
function getEquilateralTrianglesOnLine(line) {
    const equilateral_triangles = getEquilateralTriangles();
    const matches = [];
    equilateral_triangles.forEach(equilateral_triangle => {
        for (const line2 of equilateral_triangle) {
            if (bitonicLinesWithinEpsilon(line, line2)) {
                matches.push(equilateral_triangle);
                return;
            }
        }
    })
    return matches;
}

function getTrianglePoints(triangle) {
    const points = [triangle[0].p1];
    for (const line of triangle) {
        for (const pt of [line.p1, line.p2]) {
            let found = false;
            for (const pt2 of points) {
                if (withinEpsilon(pt, pt2))
                    found = true;
            }
            if (!found)
                points.push(pt);
            if (points.length > 2)
                return points;
        }
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
        explanation: "",
        pass_func: prop2PassInfo,
        on_change: prop2OnChange,
    }
}

function prop2OnChange(event) {
    const shape = event.shape;

    // check for certain shapes to add labels to

    // D label: equilateral triangle point

    // shape has to be line for equilateral triangle to be created
    if (shape.type === SHAPE_TYPES.LINE && !getPointByLabel('D')) {
        const equilateral_triangles = getEquilateralTrianglesOnLine(shape);
        if (equilateral_triangles.length) {
            const a = getPointByLabel('A');
            const b = getPointByLabel('B');
            const ab_triangles = [];
            for (const equilateral_triangle of equilateral_triangles) {
                for (const line of equilateral_triangle) {
                    if (lineHasLabels(line, 'A', 'B')) {
                        ab_triangles.push(equilateral_triangle);
                    }
                }
            }
            let d_added = false;
            for (let i = 0; !d_added && i < ab_triangles.length; i++) {
                const triangle = ab_triangles[i];
                const triangle_points = getTrianglePoints(triangle);
                let d_i = 0;
                for (let i = 0; d_i === i && i < triangle_points.length; i++) {
                    if (withinEpsilon(triangle_points[i], a) ||
                        withinEpsilon(triangle_points[i], b)) {
                        d_i ++;
                    }
                }
                const d = triangle_points[d_i];

                // check that d goes in correct direction
                // angle DBC should be acute
                const db_theta = getDiffVec(d, b).heading();
                const bc = getLineByLabels('B', 'C');
                const bc_theta = getLineDiffVec(bc).heading();
                const dbc = getPositiveTheta(db_theta - bc_theta);
                if (dbc < PI) {
                    // correct point
                    addShape(pointShape(d.x, d.y, {
                        not_erasable: true,
                        label: 'D'
                    }), {
                        no_event_trigger: true,
                    })
                    d_added = true;
                }
            }
        }
    }

    // E label: intersection point between DB extension and circle with origin B and radius BC
    if (!getPointByLabel('E') && getPointByLabel('D')) {
        const bc = getLineByLabels('B', 'C', proposition_info.given_shapes);
        const r = getLineDiffVec(bc).mag();
        const circle = getCircleByOriginLabelAndRadius('B', r);

        const db = getLineByLabels('D', 'B');
        if (db) {
            const db_circ_intersections = getChildIntersectionPoints(db, circle);
            const db_directional = {
                p1: getPointByLabel('D'),
                p2: getPointByLabel('B'),
            };
            let added = false;
            for (let i = 0; i < db_circ_intersections.length && !added; i++) {
                const pt = db_circ_intersections[i];
                if (pointForwardsOnLine(pt, db_directional)) {
                    // forwards on line - at correct intersection
                    const e = pt;
                    addShape(pointShape(e.x, e.y, {
                        not_erasable: true,
                        label: 'E'
                    }), {
                        no_event_trigger: true,
                    })
                    added = true;
                }
            };
        }
    }
}

function prop2PassInfo() {
    const a = getShapeByLabel('A', proposition_info.given_shapes);
    const bc = getLineByLabels('B', 'C', proposition_info.given_shapes);
    if (!a || !bc)
        return;

    const dist_sq = getLineDiffVec(bc).magSq();

    const lines = getShapesOfType(SHAPE_TYPES.LINE);
    for (const line of lines) {
        if (onLine(a, line)) {
            const segments = splitIntoSegments(line);
            for (const seg of segments) {
                if (withinEpsilon(dist_sq, getLineDiffVec(seg).magSq())) {
                    return {
                        pass: true,
                        passing_shapes: [
                            bc,
                            a,
                            seg
                        ]
                    };
                }
            }
        }
    }

    return {
        pass: false,
    };
}