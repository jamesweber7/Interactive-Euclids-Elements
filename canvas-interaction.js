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
        case 'Escape':
            return escapeAction();
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

function spaceIsPressed() {
    const SPACE_KEYCODE = 32;
    return keyIsDown(SPACE_KEYCODE)
}

function mousePressed(e) {
    if (e.target !== canvas)
        return;
    updateMouseData({
        down: true,
        event: MOUSE_EVENTS.PRESSED,
    });
    if (spaceIsPressed())
        return; // dragging canvas - don't do anything
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

function mouseDragged(e) {
    updateMouseData({
        down: true,
        event: MOUSE_EVENTS.DRAGGED,
    });
    if (spaceIsPressed())
        return translateDrag(e);
    switch (getMouseMode()) {
        case MOUSE_MODES.SELECT:
            return selectMouseDragged(e);
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

function mouseWheel(e) {
    tr.sc -= e.delta / 1000;
    tr.sc = max(tr.sc, 0.1);
}

function closestPoint(pt, type_restriction=null) {
    let best_pt = {
        valid: false,
        dist_sq: Number.MAX_SAFE_INTEGER
    };
    allPoints().forEach(updateBestPoint);
    intersection_points.forEach(updateBestPoint);

    if (best_pt.valid)
        best_pt.dist = sqrt(best_pt.dist_sq);
    return best_pt;

    function updateBestPoint(point) {
        if (type_restriction && (point.parent_shape && type_restriction === point.parent_shape.type))
            return;
        const dist_sq = getPointDistSq(pt, point);
        if (!best_pt || dist_sq < best_pt.dist_sq)
            best_pt = {
                x: point.x,
                y: point.y,
                dist_sq: dist_sq,
                valid: true,
                parent_shape: point.parent_shape,
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

function transformedMousePt() {
    return transformPt(mousePt());
}

function updateMouseData(options={}) {
    p_mouse_data = mouse_data;
    const pt = {
        x: overwriteDefault(options.x, transformedMousePt().x),
        y: overwriteDefault(options.y, transformedMousePt().y)
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
        button: overwriteDefault(options.button, mouseButton),
        cursor: overwriteDefault(options.cursor, ARROW),
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

function escapeAction() {
    const mode = getMouseMode();
    mouseModeOff(mode);
    setMouseMode(mode);
}


/*=============================================
=              POINT MODE EVENTS              =
=============================================*/


function selectMousePressed() {
    console.log(mouseX, mouseY);
}

function selectMouseReleased() {

}

function selectMouseDragged(e) {
    translateDrag(e);
}

function translateDrag(e) {
    if (!p_mouse_data.down)
        return;
    tr.x += e.movementX;
    tr.y += e.movementY;
    mouse_data.cursor = HAND;
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
let _extend_btns_info = [];
resetExtendLineBtnInfo();

function rulerMousePressed() {
    const p = mouse_data.pt;
    if (_line_p1) {
        if (isExtendLineBtn(p)) {
            const info = getClosestExtendLineBtnInfo(p);
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
    return _extend_btns_info;
}

function getClosestExtendLineBtnInfo(pt) {
    let closest = {valid: false};
    let dist_sq = Number.MAX_SAFE_INTEGER;
    for (const btn of getExtendLineBtnInfo()) {
        const btn_dist_sq = getPointDistSq(pt, btn.pos);
        if (btn_dist_sq < dist_sq) {
            dist_sq = btn_dist_sq;
            closest = btn;
        }
    }
    return closest;
}

function updateExtendLineBtnInfo() {
    resetExtendLineBtnInfo();
    if (![MOUSE_MODES.SELECT, MOUSE_MODES.RULER].includes(getMouseMode()))
        return;
    if (!rulerP1Selected())
        return;
    const connected_pt = getCurrentLineP1();
    const epsilon = 2**-10;
    
    getLines().forEach(parent_line => {
        if (getPointDistSq(connected_pt, parent_line.p1) < epsilon) {
            const forward = false;
            if (!parent_line.extends_backward)
                addBtn(parent_line, forward);
        }
        if (getPointDistSq(connected_pt, parent_line.p2) < epsilon) {
            const forward = true;
            if (!parent_line.extends_forward)
                addBtn(parent_line, forward);
        }
    })

    function btnInfo(parent_line, forward) {
        const pos = _extendLineBtnPos(parent_line, forward);
        addSnapPoint({
            x: pos.x,
            y: pos.y,
            extend_line_btn: true
        });
        return {
            parent_line: parent_line,
            endpoint: forward ? parent_line.p2 : parent_line.p1,
            back_endpoint: forward ? parent_line.p1 : parent_line.p2,
            forward: forward,
            pos: pos,
            valid: true
        };
    }

    function addBtn(parent_line, forward) {
        _extend_btns_info.push(btnInfo(parent_line, forward));
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
    _extend_btns_info = [];
    for (let i = 0; i < snap_points.length; i++) {
        while (i < snap_points.length && snap_points[i].extend_line_btn)
            snap_points.splice(i, 1);
    }
}

function isExtendLineBtn(pt, which=null) {
    const epsilon = 2**-10;
    for (const btn of getExtendLineBtnInfo()) {
        if (!which || which === btn)
            if (getPointDistSq(pt, btn.pos) < epsilon)
                return true;
    }
    return false;
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

// I know this will only be one or zero, I'm just setting it up this way for consistency with intersection schemas involving arcs
function addLineLineIntersectionPoints(line1, line2) {
    const pts = findLineLineIntersectionPoints(line1, line2);
    addIntersectionPoints(pts, [line1, line2]);
}

function findLineLineIntersectionPoints(line1, line2) {
    const pts = findInfLineLineIntersectionPoints(line1, line2);
    // I know this will only be one or zero, I'm just setting it up this way for consistency with intersection schemas involving arcs
    for (let i = 0; i < pts.length; i++) { 
        while (i < pts.length && (!linePointInBounds(pts[i], line1) || !linePointInBounds(pts[i], line2)))
            pts.splice(i, 1);
    }
    return pts;
}

function findInfLineLineIntersectionPoints(line1, line2) {
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

function onLine(pt, line) {
    return onInfLine(pt, line) && linePointInBounds(pt, line);
}

function onInfLine(pt, line) {
    // Δ
    const Delta = {
        x: line.p2.x - line.p1.x,
        y: line.p2.y - line.p2.y
    }

    // Ax+By+C=0
    const A = Delta.y;
    const B = -Delta.x;
    const C = Delta.x*line.p1.y - Delta.y*line.p1.x;

    const pt_val = A*pt.x+B*pt.y+C;
    return withinEpsilon(pt_val, 0);
}

// ASSUMES POINT IS SOMEWHERE ON LINE
function linePointInBounds(pt, line) {
    if (line.extends_forward && line.extends_backward)
        return true;
    if (isBetweenBitonic(pt.x, line.p1.x, line.p2.x) && isBetweenBitonic(pt.y, line.p1.y, line.p2.y))
        return true;
    if (line.extends_forward) {
        if (pt.x > line.p2.x && line.p2.x > line.p1.x)
            return true;
        if (pt.x < line.p2.x && line.p2.x < line.p1.x)
            return true;
        if (pt.y > line.p2.y && line.p2.y > line.p1.y)
            return true;
        if (pt.y < line.p2.y && line.p2.y < line.p1.y)
            return true;
    }
    if (line.extends_backward) {
        if (pt.x > line.p1.x && line.p1.x > line.p2.x)
            return true;
        if (pt.x < line.p1.x && line.p1.x < line.p2.x)
            return true;
        if (pt.y > line.p1.y && line.p1.y > line.p2.y)
            return true;
        if (pt.y < line.p1.y && line.p1.y < line.p2.y)
            return true;
    }
    return false;
}

function addLineExtensionIntersectionPoints(line) {
    deleteChildIntersectionPoints(line);
    addLineIntersectionPoints(line);
}

function intersection(line1, line2) {
    const pts = findInfLineLineIntersectionPoints(line1, line2);
    if (pts.length)
        return pts[0];
}

function extendedForwardPoint(p1, p2) {
    const bounds = getBounds();
    const dx_w = abs(p2.x-bounds.w);
    const dx_e = abs(p2.x-bounds.e);
    const dy_n = abs(p2.y-bounds.n);
    const dy_s = abs(p2.y-bounds.s);
    const big_dist = 1.1*((dx_w+dx_e)**2+(dy_n+dy_s)**2);
    const diff_vec = getDiffVec(p2, p1);
    return trigPointRA(p2, big_dist, diff_vec.heading());
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
    addIntersectionPoints(pts, [arc, line]);
}

function findArcLineIntersectionPoints(arc, line) {
    const pts = findCircleLineIntersectionPoints(arc, line);
    return pts;
}

function findCircleLineIntersectionPoints(arc, line) {
    const pts = findCircleInfLineIntersectionPoints(arc.origin, arc.r, line.p1, line.p2);
    // all points definitely on circle; just need to make sure they're in line bounds
    for (let i = 0; i < pts.length; i++) {
        while (i < pts.length && !linePointInBounds(pts[i], line))
            pts.splice(i, 1);
    }
    return pts;
}

function findCircleInfLineIntersectionPoints(origin, r, p1, p2) {
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
    addIntersectionPoints(pts, [arc1, arc2]);
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

    // (x-p1.x)²+(y-p1.y)²=r1²
    // (x-p2.x)²+(y-p2.y)²=r2²
    
    const a = (r1**2-r2**2+d**2) / (2*d);
    // midpoint on line passing through both points
    const P = {
        x: p1.x + (a / d)*(p2.x-p1.x),
        y: p1.y + (a / d)*(p2.y-p1.y),
    }

    if (withinEpsilon(d, r1+r2, epsilon))   // one intersection
        return [P];

    const h = sqrt(r1**2-a**2);
    const addSubTerms = {
        x: h/d * (p2.y-p1.y),
        y: h/d * (p2.x-p1.x),
    };
    // two intersections
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
