const MOUSE_MODES = {
    SELECT: 'SELECT',
    POINT: 'POINT',
    RULER: 'RULER',
    COMPASS: 'COMPASS',
    ERASER: 'ERASER',
}

const MOUSE_EVENTS = {
    PRESSED: 'PRESSED',
    RELEASED: 'RELEASED',
    MOVED: 'MOVED',
    DRAGGED: 'DRAGGED'
}

let mouseMode = MOUSE_MODES.SELECT;
let mouse_data = {};
let p_mouse_data = mouse_data;

var cursor_type = 'default';

function keyPressed(e) {
    if (e.ctrlKey)
        return;
    switch (key) {
        case 's':
            return setMouseMode(MOUSE_MODES.SELECT);
        case 'p':
            return setMouseMode(MOUSE_MODES.POINT);
        case 'r':
            return setMouseMode(MOUSE_MODES.RULER);
        case 'c':
            return setMouseMode(MOUSE_MODES.COMPASS);
        case 'e':
            return setMouseMode(MOUSE_MODES.ERASER);
    }
    switch (getMouseMode()) {
        case MOUSE_MODES.SELECT:
            return selectKeyPressed(e);
        case MOUSE_MODES.POINT:
            return pointKeyPressed(e);
        case MOUSE_MODES.RULER:
            return rulerKeyPressed(e);
        case MOUSE_MODES.COMPASS:
            return compassKeyPressed(e);
        case MOUSE_MODES.ERASER:
            return eraserKeyPressed(e);
    }
}

function mousePressed(e) {
    if (e.target !== canvas)
        return;
    updateMouseData({
        down: true,
        event: MOUSE_EVENTS.PRESSED,
    });
    switch (getMouseMode()) {
        case MOUSE_MODES.SELECT:
            return selectMousePressed();
        case MOUSE_MODES.POINT:
            return pointMousePressed();
        case MOUSE_MODES.RULER:
            return rulerMousePressed();
        case MOUSE_MODES.COMPASS:
            return compassMousePressed();
        case MOUSE_MODES.ERASER:
            return eraserMousePressed();
    }
}

function mouseReleased() {
    updateMouseData({
        down: false,
        event: MOUSE_EVENTS.RELEASED,
    });
    switch (getMouseMode()) {
        case MOUSE_MODES.SELECT:
            return selectMouseReleased();
        case MOUSE_MODES.POINT:
            return pointMouseReleased();
        case MOUSE_MODES.RULER:
            return rulerMouseReleased();
        case MOUSE_MODES.COMPASS:
            return compassMouseReleased();
        case MOUSE_MODES.ERASER:
            return eraserMouseReleased();
    }
}

function mouseDragged() {
    updateMouseData({
        down: true,
        event: MOUSE_EVENTS.DRAGGED,
    });
    switch (getMouseMode()) {
        case MOUSE_MODES.SELECT:
            return selectMouseDragged();
        case MOUSE_MODES.POINT:
            return pointMouseDragged();
        case MOUSE_MODES.RULER:
            return rulerMouseDragged();
        case MOUSE_MODES.COMPASS:
            return compassMouseDragged();
        case MOUSE_MODES.ERASER:
            return eraserMouseDragged();
    }
}

function mouseMoved() {
    updateMouseData({
        event: MOUSE_EVENTS.MOVED,
    });
    switch (getMouseMode()) {
        case MOUSE_MODES.SELECT:
            return selectMouseMoved();
        case MOUSE_MODES.POINT:
            return pointMouseMoved();
        case MOUSE_MODES.RULER:
            return rulerMouseMoved();
        case MOUSE_MODES.COMPASS:
            return compassMouseMoved();
        case MOUSE_MODES.ERASER:
            return eraserMouseMoved();
    }
}

function closestPoint(pt, type_restriction=null) {
    let best_pt = {
        valid: false,
        dist_sq: Number.MAX_SAFE_INTEGER
    };
    shapes.forEach(updateBestPointOnShapePoints);
    if (!type_restriction || type_restriction === SHAPE_TYPES.POINT)
        intersection_points.forEach(updateBestPoint);

    if (best_pt.valid)
        best_pt.dist = sqrt(best_pt.dist_sq);
    return best_pt;

    function updateBestPointOnShapePoints(shape) {
        if (type_restriction && shape.type != type_restriction)
            return;
        switch (shape.type) {
            case SHAPE_TYPES.POINT:
                updateBestPoint(shape, SHAPE_TYPES.POINT, shape);
                break;
            case SHAPE_TYPES.LINE:
                updateBestPoint(shape.p1, SHAPE_TYPES.LINE, shape);
                updateBestPoint(shape.p2, SHAPE_TYPES.POINT, shape);
                break;
            case SHAPE_TYPES.ARC:
                updateBestPoint(shape.origin, SHAPE_TYPES.ARC, shape);
                break;
        }
    }
    function updateBestPoint(point, type=null, parent_shape=null) {
        const dist_sq = getPointDistSq(pt, point);
        if (!best_pt || dist_sq < best_pt.dist_sq)
            best_pt = {
                x: point.x,
                y: point.y,
                dist_sq: dist_sq,
                valid: true,
                type: type,
                parent_shape: parent_shape,
            };
    }
}

function getPointDist(p1, p2) {
    return getDiffVec(p1, p2).mag();
}

function getPointDistSq(p1, p2) {
    return getDiffVec(p1, p2).magSq();
}

// only returns closest point if it is less than min dist
function proximityPoint(pt, min_dist=INTERACTION_RADIUS, type_restriction=null) {
    let closest_pt = closestPoint(pt, type_restriction);
    closest_pt.proximity = (closest_pt.valid && closest_pt.dist < min_dist);
    return closest_pt;
}

function setMouseMode(mode) {
    mouseModeOff(getMouseMode());
    mouseMode = mode;
}

function getMouseMode() {
    return mouseMode;
}

function mouseModeOff(mouseMode) {
    setCurrentShape();
    switch (mouseMode) {
        case MOUSE_MODES.SELECT:
            return selectModeOff();
        case MOUSE_MODES.POINT:
            return pointModeOff();
        case MOUSE_MODES.RULER:
            return rulerModeOff();
        case MOUSE_MODES.COMPASS:
            return compassModeOff();
        case MOUSE_MODES.ERASER:
            return eraserModeOff();
    }
}

function mousePt() {
    return {
        x: mouseX,
        y: mouseY
    }
}

function updateMouseData(options={}) {
    p_mouse_data = mouse_data;
    const pt = {
        x: overwriteDefault(options.x, mousePt().x),
        y: overwriteDefault(options.y, mousePt().y)
    };

    // snap to point
    const closest_pt = proximityPoint(pt);
    if (closest_pt.proximity) {
        pt.x = closest_pt.x;
        pt.y = closest_pt.y;
    }

    mouse_data = {
        pt: pt,
        down: overwriteDefault(options.down, mouseIsPressed),
        event: overwriteDefault(options.event, null),
        button: overwriteDefault(options.button, mouseButton)
    };
}

function overwriteDefault(overwrite_val, default_val) {
    if (overwrite_val === undefined)
        return default_val;
    return overwrite_val;
}

function ptToVec(pt) {
    return createVector(pt.x, pt.y);
}

function vecToPt(vec) {
    return {
        x: vec.x,
        y: vec.y
    };
}


/*=============================================
=              POINT MODE EVENTS              =
=============================================*/


function selectMousePressed() {
    console.log(mouseX, mouseY);
}

function selectMouseReleased() {

}

function selectMouseDragged() {

}

function selectMouseMoved() {

}

function selectModeOff() {

}

function selectKeyPressed() {

}

// Point tool mouse events
function pointMousePressed() {
    addPoint(mouse_data.pt.x, mouse_data.pt.y);
}

function pointMouseReleased() {

}

function pointMouseDragged() {

}

function pointMouseMoved() {

}

function addPoint(x, y) {
    addShape(pointShape(x, y))
}

function pointShape(x, y) {
    return {
        type: SHAPE_TYPES.POINT,
        x: x,
        y: y
    }
}

function pointModeOff() {

}

function pointKeyPressed() {
    
}


/*=============================================
=              RULER MODE EVENTS              =
=============================================*/


let _line_p1 = null; // for line being added
let _extend_btn_info = {};
resetExtendLineBtnInfo();

function rulerMousePressed() {
    const p = mouse_data.pt;
    if (_line_p1) {
        if (isExtendLineBtn(p)) {
            const info = getExtendLineBtnInfo();
            extendLine(info.parent_line, info.forward);
        } else {
            addLine(_line_p1, p);
        }
        setCurrentShape();
        _line_p1 = null;
        resetExtendLineBtnInfo();
    } else {
        _line_p1 = p;
        setCurrentShape({
            type: SHAPE_TYPES.LINE,
            p1: _line_p1,
            p2: _line_p1
        });
        if (isLineEndpoint(p))
            updateExtendLineBtnInfo();
    }
}

function rulerMouseReleased() {

}

function rulerMouseDragged() {

}

function rulerMouseMoved() {
    if (rulerP1Selected()) {
        setCurrentShape({
            type: SHAPE_TYPES.LINE,
            p1: _line_p1,
            p2: mouse_data.pt
        });
    }
}

function addLine(p1, p2) {
    const line = lineShape(p1, p2);
    addLineIntersectionPoints(line);
    addShape(line);
}

function lineShape(p1, p2) {
    return {
        type: SHAPE_TYPES.LINE,
        p1: p1,
        p2: p2
    }
}

function rulerModeOff() {
    _line_p1 = null;
    resetExtendLineBtnInfo();
}

function rulerP1Selected() {
    return !!_line_p1;
}

function rulerKeyPressed() {
    
}

function getCurrentLineP1() {
    return _line_p1;
}

function getExtendLineBtnInfo() {
    return _extend_btn_info;
}

function updateExtendLineBtnInfo() {
    if (![MOUSE_MODES.SELECT, MOUSE_MODES.RULER].includes(getMouseMode()))
        return resetExtendLineBtnInfo();
    if (!rulerP1Selected())
        return resetExtendLineBtnInfo();
    const connected_pt = getCurrentLineP1();
    let parent_line;
    let endpoint, back_endpoint;
    let forward;
    const epsilon = 2**-10;
    getLines().forEach(line => {
        if (getPointDistSq(connected_pt, line.p1) < epsilon) {
            parent_line = line;
            endpoint = line.p1;
            back_endpoint = line.p2;
            forward = false;
        }
        if (getPointDistSq(connected_pt, line.p2) < epsilon) {
            parent_line = line;
            endpoint = line.p2;
            back_endpoint = line.p1;
            forward = true;
        }
    })
    if (!parent_line) 
        return resetExtendLineBtnInfo();

    const pos = _extendLineBtnPos(parent_line, forward);
    intersection_points.push({
        x: pos.x,
        y: pos.y,
        extend_line_btn: true
    });
    const interact_radius = 20;
    _extend_btn_info = {
        endpoint: endpoint,
        back_endpoint: back_endpoint,
        forward: forward,
        parent_line: parent_line,
        pos: pos,
        interact_radius: interact_radius,
        valid: true,
    }
}

function _extendLineBtnPos(line, forward) {
    const amt_forward = 100;
    if (forward) {
        const diff_vec = getDiffVec(line.p2, line.p1);
        return trigPointRA(line.p2, amt_forward, diff_vec.heading());
    } else {
        const diff_vec = getDiffVec(line.p1, line.p2);
        return trigPointRA(line.p1, amt_forward, diff_vec.heading());
    }
}

function resetExtendLineBtnInfo() {
    if (!_extend_btn_info)
        _extend_btn_info = {};
    if (!_extend_btn_info.valid)
        return;
    intersection_points.forEach((pt, index) => {
        if (pt.extend_line_btn)
            intersection_points.splice(index, 1);
    })
    _extend_btn_info = {valid: false};
}

function isExtendLineBtn(pt) {
    if (!getExtendLineBtnInfo().valid)
        return;
    const epsilon = 2**-10;
    return getPointDistSq(pt, getExtendLineBtnInfo().pos) < epsilon;
}

function addLineIntersectionPoints(line_) {
    shapes.forEach(shape => {
        if (line_.id && shape.id && line_.id === shape.id)
            return;
        switch (shape.type) {
            case SHAPE_TYPES.LINE:
                return addLineLineIntersectionPoints(line_, shape);
            case SHAPE_TYPES.ARC:
                return addArcLineIntersectionPoints(shape, line_);
        }
    })
}

function addLineLineIntersectionPoints(line1, line2) {
    const pts = findLineLineIntersectionPoints(line1, line2);
    intersection_points.push(...pts);
}

function findLineLineIntersectionPoints(line1, line2) {
    // Ax+By+C=0

    const A1 = line1.p2.y - line1.p1.y;
    const B1 = line1.p1.x - line1.p2.x;
    const C1 = A1*line1.p1.x + B1*line1.p1.y;

    const A2 = line2.p2.y - line2.p1.y;
    const B2 = line2.p1.x - line2.p2.x;
    const C2 = A2*line2.p1.x + B2*line2.p1.y;

    // determinant
    const determinant = A1*B2 - A2*B1;

    if (withinEpsilon(determinant, 0)) // parallel or coincident; 0 or inf many points
        return [];

    // lines intersect at exactly one point
    return [
        {
            x: (B2*C1-B1*C2)/determinant,
            y: (A1*C2-A2*C1)/determinant,
        }
    ]
}

/*=============================================
=             COMPASS MODE EVENTS             =
=============================================*/


let _compass_params = {};

function compassMousePressed() {
    if (_compass_params.origin) {
        const p = mouse_data.pt;
        const diff_vec = getDiffVec(p, _compass_params.origin);
        const r = diff_vec.mag();
        const theta = diff_vec.heading();
        const arc = arcShape(_compass_params.origin, r, theta, theta);
        finishCompassRotation(arc);
        setCurrentShape()
        _compass_params = {};
    } else {
        _compass_params.origin = mouse_data.pt;
        setCurrentShape({
            type: SHAPE_TYPES.ARC,
            origin: _compass_params.origin,
            pencil_pt: _compass_params.origin
        });    
    }
}

function compassMouseReleased() {

}

function compassMouseDragged() {

}

function compassMouseMoved() {
    if (_compass_params.origin) {
        const p = mouse_data.pt;
        setCurrentShape({
            type: SHAPE_TYPES.ARC,
            origin: _compass_params.origin,
            pencil_pt: p
        });
    }
    // if (_compass_params.origin) {
    //     if (_compass_params.r && _compass_params.start_theta) {
    //         const p = mousePt();
    //         const diff_vec = p5.Vector.sub(
    //             ptToVec(p),
    //             ptToVec(_compass_params.origin)
    //         );
    //         const mouse_theta = diff_vec.heading();
    //         const diff_theta = mouse_theta - _compass_params.click_theta;
    //         const pos_click =  _compass_params.click_theta + PI;
    //         if (mouse_theta > _compass_params.click_theta) {
    //             start_theta = _compass_params.click_theta;
    //             stop_theta = mouse_theta;
    //         } else {
    //             start_theta = mouse_theta;
    //             stop_theta = _compass_params.click_theta;
    //         }
    //         setCurrentShape(arcShape(_compass_params.origin, _compass_params.r, start_theta, stop_theta));
    //     }
    // }
}

function addArc(arc_) {
    addArcIntersectionPoints(arc_);
    addShape(arc_);
}

function arcShape(origin, r, start_theta, stop_theta) {
    return {
        type: SHAPE_TYPES.ARC,
        origin: origin,
        r: r,
        start_theta: start_theta,
        stop_theta: stop_theta
    }
}

function positiveTheta(theta) {
    if (theta > 0)
        return theta;
    const n = ceil(-theta / PI);
    return theta + n*PI;
}

function positiveHeading(vec) {
    return vec.heading()+PI;
}

function compassModeOff() {
    _compass_params = {};
}

function compassKeyPressed(e) {
    
}

function finishCompassRotation(arc_=getCurrentShape()) {
    if (!arc_ || arc_.type !== SHAPE_TYPES.ARC)
        return;
    _compass_params = {};
    addArc(arc_);
    setCurrentShape();
    const epsilon = 2**-10;
    const delta = PI*0.1;
    const rotating_forward = true;
    addDrawEvent(rotate_arc, {
        stop: () => {
            return arc_.stop_theta >= arc_.start_theta+TWO_PI-delta || arc_.stop_theta <= arc_.start_theta-TWO_PI+delta;
        },
        onstop: () => {
            if (rotating_forward) {
                arc_.stop_theta = arc_.start_theta-epsilon;
            } else {
                arc_.start_theta = arc_.stop_theta+epsilon;
            }
        }
    })
    function rotate_arc() {
        if (rotating_forward) {
            arc_.stop_theta = min(arc_.stop_theta + delta, arc_.start_theta+TWO_PI);

            const pencil_pt = trigPointRA(arc_.origin, arc_.r, arc_.stop_theta);
            drawCompass(arc_.origin, pencil_pt)
        } else {
            arc_.start_theta = max(arc_.start_theta - delta, arc_.stop_theta-TWO_PI);
            theta = arc_.start_theta;

            const pencil_pt = trigPointRA(arc_.origin, arc_.r, arc_.start_theta);
            drawCompass(arc_.origin, pencil_pt)
        }
        
    }
}

function getDiffVec(p1, p2) {
    return p5.Vector.sub(
        ptToVec(p1),
        ptToVec(p2)
    );
}

// get difference vector w/ heading theta and magnitude r
function trigVecRA(r, theta) {
    const vec = createVector(0, 1);
    vec.setHeading(theta);
    vec.setMag(r);
    return vec;
}

// get a point projected from pt w/ heading theta and magnitude r
function trigPointRA(pt, r, theta) {
    return vecToPt(
        ptToVec(pt).add(trigVecRA(r, theta))
    )
}

function getMidpoint(p1, p2) {
    const diff = getDiffVec(p2, p1);
    diff.div(2); // divide by two
    return vecToPt(
        ptToVec(p1).add(diff)
    );
}

function addArcIntersectionPoints(arc_) {
    shapes.forEach(shape => {
        switch (shape.type) {
            case SHAPE_TYPES.LINE:
                return addArcLineIntersectionPoints(arc_, shape);
            case SHAPE_TYPES.ARC:
                return addArcArcIntersectionPoints(arc_, shape);
        }
    })
}

function addArcLineIntersectionPoints(arc, line) {
    const pts = findArcLineIntersectionPoints(arc, line);
    intersection_points.push(...pts);
}

function findArcLineIntersectionPoints(arc, line) {
    const pts = findCircleLineIntersectionPoints(arc.origin, arc.r, line.p1, line.p2);
    return pts;
}

function findCircleLineIntersectionPoints(origin, r, p1, p2) {
    // Δ
    const Delta = {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    }

    // Ax+By+C=0
    const A = Delta.y;
    const B = -Delta.x;
    const C = Delta.x*p1.y - Delta.y*p1.x;

    // distance from origin to line
    const dist = abs(A*origin.x+B*origin.y+C)/sqrt(A**2+B**2);

    if (dist > r) // no intersection
        return [];
    
    // closest point on line to origin center
    const closest_pt = {
        x: origin.x - A * (A * origin.x + B * origin.y + C) / (A**2 + B**2),
        y: origin.y - B * (A * origin.x + B * origin.y + C) / (A**2 + B**2),
    }

    // offset distance from closest point to intersection points
    const offset_dist = sqrt(r**2-dist**2);

    if (withinEpsilon(dist, offset_dist)) // exactly one intersection point (closest point)
        return [closest_pt];

    // two intersection points

    const intersection_offsets = {
        x: offset_dist * -B / sqrt(A**2 + B**2),
        y: offset_dist * A / sqrt(A**2 + B**2),
    }

    return [
        {
            x: closest_pt.x + intersection_offsets.x,
            y: closest_pt.y + intersection_offsets.y,
        },
        {
            x: closest_pt.x - intersection_offsets.x,
            y: closest_pt.y - intersection_offsets.y,
        }
    ]
}

function addArcArcIntersectionPoints(arc1, arc2) {
    const pts = findArcArcIntersectionPoints(arc1, arc2);
    intersection_points.push(...pts);
}

function findArcArcIntersectionPoints(arc1, arc2) {
    return findCircleCircleIntersectionPoints(arc1.origin, arc1.r, arc2.origin, arc2.r);
}

function findCircleCircleIntersectionPoints(p1, r1, p2, r2) {
    const epsilon = 2**-10;
    const d = sqrt((p2.x-p1.x)**2+(p2.y-p1.y)**2);

    if (d === 0 && r1 === r2)    // infinitely many intersections (circles coincide)
        return [];
    if (d < abs(r1-r2))    // no intersections (one circle within other and they don't intersect)
        return [];
    if (d > r1+r2)  // no intersections (too far away)
        return [];
    if (withinEpsilon(d, r1+r2, epsilon))   // one intersection
        return [
            vecToPt(
                ptToVec(p1).add(diff_vec.setMag(r1))
            )
        ];

    // two intersections

    // (x-p1.x)²+(y-p1.y)²=r1²
    // (x-p2.x)²+(y-p2.y)²=r2²
    
    const a = (r1**2-r2**2+d**2) / (2*d);
    const P = {
        x: p1.x + (a / d)*(p2.x-p1.x),
        y: p1.y + (a / d)*(p2.y-p1.y),
    }
    const h = sqrt(r1**2-a**2);
    const addSubTerms = {
        x: h/d * (p2.y-p1.y),
        y: h/d * (p2.x-p1.x),
    };
    return [
        {
            x: P.x+addSubTerms.x,
            y: P.y-addSubTerms.y,
        },
        {
            x: P.x-addSubTerms.x,
            y: P.y+addSubTerms.y,
        }
    ]    
}

function withinEpsilon(a, b, epsilon=2**-10) {
    return a >= b-epsilon && a <= b+epsilon;
}
  
  

/*=============================================
=              ERASER MODE EVENTS             =
=============================================*/


function eraserMousePressed() {

}

function eraserMouseReleased() {

}

function eraserMouseDragged() {

}

function eraserMouseMoved() {

}

function eraserModeOff() {

}

function eraserKeyPressed() {
    
}
