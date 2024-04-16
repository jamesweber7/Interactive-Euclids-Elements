const MOUSE_MODES = {
    SELECT: 'SELECT',
    POINT: 'POINT',
    RULER: 'RULER',
    COMPASS: 'COMPASS',
    ERASER: 'ERASER',
}

let mouseMode = MOUSE_MODES.SELECT;

function setMouseMode(mode) {
    mouseMode = mode;
}

function getMouseMode() {
    return mouseMode;
}

function mousePressed() {
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


// Select tool mouse events
function selectMousePressed() {

}

function selectMouseReleased() {

}

function selectMouseDragged() {

}

function selectMouseMoved() {

}

// Point tool mouse events
function pointMousePressed() {

}

function pointMouseReleased() {

}

function pointMouseDragged() {

}

function pointMouseMoved() {

}

// Ruler tool mouse events
function rulerMousePressed() {

}

function rulerMouseReleased() {

}

function rulerMouseDragged() {

}

function rulerMouseMoved() {

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

// Eraser tool mouse events
function eraserMousePressed() {

}

function eraserMouseReleased() {

}

function eraserMouseDragged() {

}

function eraserMouseMoved() {

}
