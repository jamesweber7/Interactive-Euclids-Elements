const MOUSE_MODES = {
    SELECT: 'SELECT',
    POINT: 'POINT',
    RULER: 'RULER',
    COMPASS: 'COMPASS',
    ERASER: 'ERASER',
}

let mouseMode = MOUSE_MODES.SELECT;

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
    addPoint(mouseX, mouseY);
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

function rulerMousePressed() {
    const p = mousePt();
    if (_line_p1) {
        addLine(_line_p1, p);
        setCurrentShape();
        _line_p1 = null;
    } else {
        _line_p1 = p;
        setCurrentShape({
            type: SHAPE_TYPES.LINE,
            p1: _line_p1,
            p2: _line_p1
        });
    }
}

function rulerMouseReleased() {

}

function rulerMouseDragged() {

}

function rulerMouseMoved() {
    if (_line_p1) {
        setCurrentShape({
            type: SHAPE_TYPES.LINE,
            p1: _line_p1,
            p2: mousePt()
        });
    }
}

function addLine(p1, p2) {
    addShape(lineShape(p1, p2));
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
}

function rulerKeyPressed() {
    
}



/*=============================================
=             COMPASS MODE EVENTS             =
=============================================*/


let _compass_params = {};

function compassMousePressed() {
    if (_compass_params.origin) {
        const p = mousePt();
        const diff_vec = getDiffVec(p, _compass_params.origin);
        const r = diff_vec.mag()*2;
        const theta = diff_vec.heading();
        const arc = arcShape(_compass_params.origin, r, theta, theta);
        finishCompassRotation(arc);
        setCurrentShape()
        _compass_params = {};
    } else {
        _compass_params.origin = mousePt();
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
        const p = mousePt();
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

function addArc(origin, r, start_theta, stop_theta) {
    addShape(arcShape(origin, r, start_theta, stop_theta))
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
    addShape(arc_);
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
        let theta;
        if (rotating_forward) {
            arc_.stop_theta = min(arc_.stop_theta + delta, arc_.start_theta+TWO_PI);

            const pencil_pt = trigPointRA(arc_.origin, arc_.r/2, arc_.stop_theta);
            drawCompass(arc_.origin, pencil_pt)
        } else {
            arc_.start_theta = max(arc_.start_theta - delta, arc_.stop_theta-TWO_PI);
            theta = arc_.start_theta;

            const pencil_pt = trigPointRA(arc_.origin, arc_.r/2, arc_.start_theta);
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
