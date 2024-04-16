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
        switch (tool.id) {
            case '':
                
        }
    })
}