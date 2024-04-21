
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
    const equilateral_triangle_sets = getEquilateralTriangles();

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

    let unupdated = false;

    // check endpoints to all be equal - forming triangles
    const triangle_sets = [];
    line_sets.forEach(line_set => {
        // check if lines already know they are triangles
        if (line_set[0].triangles) {
            if (line_set[0].triangles.includes(line_set[1]) &&
                line_set[0].triangles.includes(line_set[2])) {
                    triangle_sets.push(line_set);
                    return;
            }
        }

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
        // not all triangle sets have up to date info
        unupdated = true;
    })
    
    if (unupdated) // update triangle sets for future reference
        updateTriangles(triangle_sets);
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

    // update equilateral triangle sets for future reference
    updateEquilateralTriangles(equilateral_triangle_sets);

    return equilateral_triangle_sets;
}

function updateTriangles(triangles=getTriangles(), triangles_tag='triangles') {
    triangles.forEach(triangle => {
        console.log(triangle);
        console.log(triangle[0]);
        console.log(triangle[0][triangles_tag]);
        console.log(Array.isArray(triangle[0][triangles_tag]))
        if (Array.isArray(triangle[0][triangles_tag])) {
            for (let i = 0; i < triangle[0][triangles_tag].length; i++) {
                const triangle2 = triangle[0][triangles_tag][i];
                if (triangle2.includes(triangle[0]) &&
                    triangle2.includes(triangle[1]) && 
                    triangle2.includes(triangle[2])) {
                    // info already saved
                    return;
                }
            }
            // not already in triangles
            triangle.forEach(line => {
                line[triangles_tag].push(triangle);
            })
        } else {
            // triangle does not have triangles element yet
            triangle.forEach(line => {
                line[triangles_tag] = [triangle];
            })
        }
        console.log(triangle);
        console.log(triangle[0]);
        console.log(triangle[0][triangles_tag]);
    })
    console.log(triangles);
}

// add equilateral triangle info to all lines that are part of an equilateral triangle
function updateEquilateralTriangles(equilateral_triangles=getEquilateralTriangles()) {
    updateTriangles(equilateral_triangles, 'equilateral_triangles');
}

// get information about equilateral triangle on line
function getEquilateralTriangleInfo(line, updated=false) {
    console.log(line);
    // line has equilateral triangle information
    if (line.equilateral_triangles && line.equilateral_triangles.length) {
        return {
            is_equilateral_triangle: true,
            equilateral_triangles: line.equilateral_triangles
        }
    }
    if (updated) {
        return {is_equilateral_triangle: false};
    }
    // line doesn't have equilateral triangle information
    // update equilateral triangle info for all lines
    getEquilateralTriangles(); // getting currently updates triangles, idk this definitely isn't the best set up but I'm tired and slow brain rn
    return getEquilateralTriangleInfo(line, true);
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

    console.log(event);
    console.log(shape);
    // shape has to be line for equilateral triangle to be created
    if (shape.type === SHAPE_TYPES.LINE && !getShapeByLabel('D')) {
        console.log('hi');
        const equilateral_triangle_info = getEquilateralTriangleInfo(shape);
        console.log(equilateral_triangle_info);
        if (equilateral_triangle_info.is_equilateral_triangle) {
            const a = getPointByLabel('A');
            const b = getPointByLabel('B');
            console.log(a, b);
            // TODO not currently checking if A and C are in equilateral triangle
            if (a && b) {
                let d;
                // there is an equilateral triangle consisting of A and B
                if (!pointsWithinEpsilon(shape.p1, a) && !pointsWithinEpsilon(shape.p1, b)) {
                    d = shape.p1;
                } else {
                    d = shape.p2;
                }

                // check that d goes in correct direction
                // angle between DBC should be acute
                const db_theta = getDiffVec(d, b).heading();
                const bc_theta = getDiffVec(b, c).heading();
                const dbc = db_theta - bc_theta;
                console.log(dbc < PI);
                if (dbc < PI) {
                    // correct point
                    d.label = 'D';
                }
            }
        }
    }

    // E label: intersection point between DB extension and circle with origin B and radius BC
    if (!getPointByLabel('E')) {
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
            db_circ_intersections.forEach(pt => {
                if (pointForwardsOnLine(pt, db_directional)) {
                    // forwards on line - at correct intersection
                    // pt = E
                    pt.label = 'E';
                }
            })
            if (db_circ_intersections.intersection)
                db_circ_intersections.label = 'E';
        }
    }
}

function prop2PassInfo() {
    const a = getShapeByLabel('A', proposition_info.given_shapes);
    const bc = getLineByLabels('B', 'C', proposition_info.given_shapes);

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