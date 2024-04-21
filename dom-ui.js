/* Control DOM elements */

document.addEventListener('DOMContentLoaded', setupUI);

function setupUI() {
    setupTools();
    preventRightClick();
}

function setupTools() {
    setupToolFunctionalities();
}

function preventRightClick() {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

function setupToolFunctionalities() {
    [...document.getElementsByTagName('tool')].forEach(tool => {
        tool.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
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

function createPropositionCompleteMenu(prop_number, options={}) {
    const id = 'proposition-complete-menu';
    while (document.getElementById(id))
        document.getElementById(id).remove();
    const viewport_container = viewportFlexContainer();

    const menu = document.createElement('div');
    menu.id = id;
    menu.className = 'prop-menu';
    fadeInEl(menu, 0.5);

    const title = document.createElement('div');
    title.innerText = `Proposition ${prop_number} Complete`;
    title.style.marginTop = '20px';
    menu.append(title);

    const center_section = document.createElement('div');
    center_section.className = 'center-section';

    if (options.objective && Array.isArray(options.steps)) {
        const objective = document.createElement('div');
        objective.style.fontSize = "28px";
        objective.style.marginTop = "12px";
        objective.style.marginBottom = "20px";
        objective.innerText = options.objective;
        center_section.append(objective);

        // steps
        const steps_table = document.createElement('table');
        steps_table.className = 'steps-table';

        options.steps.forEach(step => {
            const tr = document.createElement('tr');
            tr.innerText = step;
            steps_table.append(tr);
        })

        center_section.append(steps_table);
    }

    menu.append(center_section);

    const bottom_section = document.createElement('div');
    bottom_section.className = 'bottom-section'
    bottom_section.style.marginTop = 'auto';
    bottom_section.style.paddingBottom = '20px';

    if (!isFinalProposition(prop_number)) {
        const next_prop_button = document.createElement('button');
        next_prop_button.className = 'next-proposition';
        next_prop_button.innerText = `Proposition ${prop_number+1}`;
        next_prop_button.onclick = () => {
            setProposition(prop_number+1);
            closePopup();
        }
        bottom_section.append(next_prop_button);
    }

    const other_btn_row = document.createElement('div');
    other_btn_row.className = 'other-btns';

    const reset_prop_button = document.createElement('button');
    reset_prop_button.className = 'other-btn';
    reset_prop_button.innerText = `Do Proposition ${prop_number} Again`;
    reset_prop_button.onclick = () => {
        resetProposition();
        closePopup();
    }
    other_btn_row.append(reset_prop_button);

    const see_explanation_button = document.createElement('button');
    see_explanation_button.className = 'other-btn';
    see_explanation_button.innerText = 'See Explanation';
    see_explanation_button.onclick = () => {
        showAllShapes();
        showDomPropositionExplanation(options.explanation);
        closePopup();
    }
    other_btn_row.append(see_explanation_button);

    const freeform_mode_button = document.createElement('button');
    freeform_mode_button.className = 'other-btn';
    freeform_mode_button.innerText = `Use Freeform Mode`;
    freeform_mode_button.onclick = () => {
        setFreeformMode();
        closePopup();
    }
    other_btn_row.append(freeform_mode_button);

    bottom_section.append(other_btn_row);

    menu.append(bottom_section);

    viewport_container.append(menu);

    function closePopup() {
        viewport_container.remove();
    }
}

// create container taking up whole viewport, for centering other divs
function viewportFlexContainer() {
    const id = 'viewport-flex-container';
    const viewport_container = document.createElement('div');
    viewport_container.id = id;
    document.body.prepend(viewport_container);
    return viewport_container;
}

function fadeInEl(el, t=1) {
    el.style.opacity = 0;
    el.style.transition = `opacity linear ${t}s`;
    setTimeout(() => {
        el.style.opacity = 1;
    }, 0);
}

function updateDomPropositionInfo(prop_info, options={}) {
    const prop_title = document.getElementById('proposition-title');
    const prop_objective = document.getElementById('proposition-objective');
    const prop_steps = document.getElementById('proposition-steps');
    // reset proposition info
    prop_title.innerText = '';
    prop_objective.innerText = '';
    [...prop_steps.getElementsByTagName('li')].forEach(li => li.remove());
    hideDomPropositionExplanation();

    if (!isValidProposition(prop_info))
        return;

    prop_title.innerText = `Proposition ${prop_info.number}`;
    prop_objective.innerText = prop_info.objective;
    prop_info.steps.forEach(step => {
        const li = document.createElement('li');
        li.innerText = step;
        prop_steps.append(li);
    })
    if (options.show_explanation)
        showDomPropositionExplanation(prop_info.explanation);
}

function showDomPropositionExplanation(explanation) {
    const prop_explanation = document.getElementById('proposition-explanation');
    prop_explanation.innerText = explanation;
}

function hideDomPropositionExplanation() {

}