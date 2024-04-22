/* Control DOM elements */

document.addEventListener('DOMContentLoaded', setupUI);

const positional_listeners = [];

function setupUI() {
    setupEventListeners();
    setupTools();
    preventRightClick();
}

function setupEventListeners() {
    document.addEventListener('keydown', domKeyDown);
    window.addEventListener('resize', runPositionalListeners);
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
    while (document.getElementById(id))
        document.getElementById(id).remove();
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

function showBook() {
    const viewport_container = viewportFlexContainer();

    const book = document.createElement('div');
    book.id = 'book';

    // left and right pages
    const left_page = document.createElement('page');
    left_page.id = 'left-page';
    book.append(left_page);

    const right_page = document.createElement('page');
    right_page.id = 'right-page';
    book.append(right_page);

    // close book X button
    const close_button = getCloseButton();
    close_button.id = 'close-book';
    close_button.title = 'Close Book [Esc]';
    close_button.style.position = 'absolute';
    close_button.addEventListener('click', hideBook);
    book.append(close_button);


    viewport_container.append(book);

    // place close button position now that we can get book's bounding client rect
    addPositionalListener(() => {
        const bookRect = book.getBoundingClientRect();
        close_button.style.left = bookRect.right+'px';
        close_button.style.top = bookRect.top+'px';
    },
    {
        delete_if: () => {
            return !document.body.contains(book);
        },
        call_now: true,
    });

    return book;
}

function hideBook() {
    closeViewportContainer();
}

function isBookOpen() {
    const id = 'book';
    return !!document.getElementById(id);
}

function closeViewportContainer() {
    const id = 'viewport-flex-container';
    while (document.getElementById(id))
        document.getElementById(id).remove();
}

function domKeyDown(e) {
    if (isBookOpen()) {
        if (e.key === 'Escape') {
            hideBook();
        }
    }
}

function openBookToIntro() {
    showBook();
    setBookPage({
        items: [
            {
                tagName: 'text1',
                innerText: "Welcome to an Interactive Euclid's Elements Visualization"
            },
            {
                tagName: 'text2',
                innerText: "This program lets you work through the first Propositions from Book 1 of Euclid's Elements",
                classList: ['padded', 'centered']
            },
            {
                tagName: 'text3',
                classList: ['padded', 'centered']
            },
            {
                tagName: 'img',
                attributes: [
                    {
                        name: 'src',
                        value: 'icons/shapes.svg'
                    }
                ],
                classList: ['centered', 'centered-vertical'],
                style: 'width: 50%;'
            }
        ]
    }, 1);
    setBookPage({
        items: [
            {
                tagName: 'text1',
                innerText: 'Euclid (Εὐκλείδης)'
            },
            {
                tagName: 'text1',
                innerText: '300 BC',
                classList: ['centered']
            },
            {
                tagName: 'text3',
                innerText: `Euclid was an ancient Greek mathematician known as the "Father of Geometry" for his treatise, Elements.`
            },
            {
                tagName: 'text3',
                innerText: `Euclid's Elements consists of 13 books, each filled with proofs for geometric 'Propositions'.`
            },
            {
                tagName: 'text3',
                innerText: `This is largely believed to be the first major compilation of proofs, and helps signify a standardization of mathematical knowledge.`
            },
            {
                tagName: 'div',
                items: [
                    {
                        tagName: 'quote',
                        /* Among these was Euclid, the author of the most successful mathematics textbook ever written—the Elements (Stoichia) */
                        innerText: `“...the most successful textbook in the history of mathematics.”`,
                    },
                    {
                        tagName: 'quoteauthor',
                        innerText: `~ Carl Boyer`,
                    },
                ],
                classList: ['centered-vertical', 'padded']
            }
        ]
    }, 2);
}

function setBookPage(page_info, page_number) {
    clearBookPage(page_number);
    const page_id = page_number === 1 ? 'left-page' : 'right-page';
    const page = document.getElementById(page_id);
    addItems(page_info.items, page);
}

function clearBookPage(page_number) {

}

function addItems(items, parent) {
    items.forEach(item => {
        item = configureDefaults(item, {
            tagName: 'div',
            innerText: '',
            classList: [],
            items: [],
            attributes: [],
            style: '',
        })
        const el = document.createElement(item.tagName);
        item.attributes.forEach(attr => {
            el.setAttribute(attr.name, attr.value);
        })
        if (item.innerText)
            el.innerText = item.innerText;
        el.classList.add(...item.classList);
        el.style = item.style;
        if (item.items.length)
            addItems(item.items, el);
        parent.append(el);
    })
}

function getCloseButton() {
    const close_button = document.createElement('button');
    close_button.className = 'close';
    
    const close_img = document.createElement('img');
    close_img.src = 'icons/close-x.svg';
    close_button.append(close_img);

    return close_button;
}

function addPositionalListener(onchange, options={}) {
    positional_listeners.push({
        onchange: onchange,
        options: options
    });
    if (options.call_now)
        onchange();
}

function runPositionalListeners() {
    for (let i = 0; i < positional_listeners.length; i++) {
        const positional_listener = positional_listeners[i];
        if (positional_listener.options.delete_if && positional_listener.options.delete_if()) {
            positional_listeners.splice(i, 1);
            i--;
        } else {
            positional_listener.onchange();
        }
    }
}