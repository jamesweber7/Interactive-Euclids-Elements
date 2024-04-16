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

// Select tool mouse events
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
    addShape({
        type: SHAPE_TYPES.POINT,
        x: x,
        y: y
    })
}

function pointModeOff() {

}

// Ruler tool mouse events

let _line_p1 = null; // for line being added

function rulerMousePressed() {
    const p = {x: mouseX, y: mouseY};
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
            p2: {
                x: mouseX,
                y: mouseY
            }
        });
    }
}

function addLine(p1, p2) {
    addShape({
        type: SHAPE_TYPES.LINE,
        p1: p1,
        p2: p2
    })
}

function rulerModeOff() {
    _line_p1 = null;
}

// Compass tool mouse events

function compassMousePressed() {

}

function compassMouseReleased() {

}

function compassMouseDragged() {

}

function compassMouseMoved() {

}

function compassModeOff() {

}

// Eraser tool mouse events

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
