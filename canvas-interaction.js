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