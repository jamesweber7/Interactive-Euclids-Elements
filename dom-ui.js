/* Control DOM elements */

document.addEventListener('DOMContentLoaded', setupUI);

function setupUI() {
    setupTools();
}

function setupTools() {
    setupToolFunctionalities();
}

function setupToolFunctionalities() {
    [...document.getElementsByTagName('tool')].forEach(tool => {
        tool.addEventListener('click', () => {
            switch (tool.id) {
                case 'select-tool':
                    return setMouseMode(MOUSE_MODES.SELECT);
                case 'point-tool':
                    return setMouseMode(MOUSE_MODES.POINT);
                case 'ruler-tool':
                    return setMouseMode(MOUSE_MODES.RULER);
                case 'compass-tool':
                    return setMouseMode(MOUSE_MODES.COMPASS);
                case 'eraser-tool':
                    return setMouseMode(MOUSE_MODES.ERASER);
    
            }
        })
    })
}