/* Control DOM elements */

document.addEventListener('DOMContentLoaded', setupUI);

const positional_listeners = [];
let book_pages = [];

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
        switch (e.key) {
            case 'Escape':
                hideBook();
                break;
            case 'ArrowLeft':
                turnBookPageLeft();
                break;
            case 'ArrowRight':
                turnBookPageRight();
                break;
        }
    }
}

function openBookToIntro() {
    showBook();
    setBookPages(introBookPages());
}

function openBookStandard() {
    showBook();
    setBookPages(standardBookPages());
}

// configure book page according to options
function bookPage(page, options={}) {
    options = configureDefaults(options, {
        left_pages: [],
        right_pages: [],
    });
    page = configureDefaults(page, {
        left_pages: options.left_pages,
        right_pages: options.right_pages,
        items: [],
    });
    return page;
}

// for setting potentially more than 2 pages
function setBookPages(pages, page_index=0) {
    book_pages = pages;
    for (let i = 0; i < pages.length; i += 2) { // skip every other one - batches of 2
        const left_page = pages[i];
        left_page.left_pages = [];
        if (i-2 >= 0) {
            left_page.left_pages.push(pages[i-2]);
            left_page.left_pages.push(pages[i-1]);
        }
        if (i+1 < pages.length) {
            const right_page = pages[i+1];
            left_page.right_pages = [];
            if (i+1 +1 < pages.length) {
                right_page.right_pages.push(pages[i+1 +1]);
            }
            if (i+1 +2 < pages.length) {
                right_page.right_pages.push(pages[i+1 +2]);
            }
        }
    }
    if (page_index < pages.length) {
        setLeftPage(pages[page_index]);
    } else {
        clearLeftPage();
    }
    if (page_index+1 < pages.length) {
        setRightPage(pages[page_index+1]);
    } else {
        clearRightPage();
    }
}

// for setting no more than 2 pages
function setOpenBookPages(pages) {
    if (!Array.isArray(pages))
        return setOpenBookPages([...arguments]);
    // left
    if (pages.length) {
        setBookPage(pages[0], true);
    } else {
        clearBookPage(true);
    }
    // right
    if (pages.length > 1) {
        setBookPage(pages[1], false);
    } else {
        clearBookPage(false);
    }
}

function setBookPage(page_info, is_left) {
    clearBookPage(is_left);
    if (!page_info)
        return;
    page_info = configureDefaults(page_info, {
        left_pages: [],
        right_pages: [],
    })
    const page = getPageSide(is_left);
    addItems(page_info.items, page);
    if (is_left && page_info.left_pages.length) {
        addNextPageButton(page, page_info.left_pages, is_left)
    } else if (!is_left && page_info.right_pages.length) {
        addNextPageButton(page, page_info.right_pages, is_left)
    }
}

function setLeftPage(page_info) {
    setBookPage(page_info, true);
}

function setRightPage(page_info) {
    setBookPage(page_info, false);
}

function clearLeftPage() {
    clearBookPage(true);
}

function clearRightPage() {
    clearBookPage(false);
}

function clearBookPage(is_left) {
    const page = getPageSide(is_left);
    page.innerHTML = '';
}

function getPageSide(is_left) {
    const page_id = is_left ? 'left-page' : 'right-page';
    return document.getElementById(page_id);
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
            id: '',
            closeBookOnClick: false,
        })
        const el = document.createElement(item.tagName);
        if (item.id)
            el.id = item.id;
        item.attributes.forEach(attr => {
            el.setAttribute(attr.name, attr.value);
        })
        if (item.innerText)
            el.innerText = item.innerText;
        el.classList.add(...item.classList);
        el.style = item.style;
        if (item.items.length)
            addItems(item.items, el);
        if (item.onclick) {
            el.addEventListener('click', item.onclick);
        }
        if (item.closeBookOnClick) {
            el.addEventListener('click', closeViewportContainer);
        }
        parent.append(el);
    })
}

function getCloseButton() {
    const close_button = document.createElement('button');
    close_button.className = 'close no-bg-border';
    
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

function addNextPageButton(page, next_pages, is_left) {
    const next_page_btn = document.createElement('button');
    next_page_btn.className = 'next-page-btn no-bg-border';
    next_page_btn.title = `Turn Page ${is_left ? 'Left' : 'Right'} [${is_left ? '←' : '→'}]`
    
    const img = document.createElement('img');
    img.src = `icons/next-page-${is_left ? 'left' : 'right'}.svg`;
    next_page_btn.append(img);

    next_page_btn.addEventListener('click', () => {
        setOpenBookPages(next_pages);
    })

    page.append(next_page_btn);

    // place next button position now that we can get book's bounding client rect
    const next_page_btn_width = next_page_btn.getBoundingClientRect().width;
    addPositionalListener(() => {
        const pageRect = page.getBoundingClientRect();
        if (is_left) {
            next_page_btn.style.left = `${pageRect.left+pageRect.width*0.11}px`;
        } else {
            next_page_btn.style.left = `${pageRect.right-pageRect.width*0.15-next_page_btn_width}px`;
        }
        next_page_btn.style.top = `${pageRect.bottom-pageRect.width*0.18}px`;
    },
    {
        delete_if: () => {
            return !document.body.contains(page);
        },
        call_now: true,
    });
}

function goToBookPage(page_number) {
    if (page_number % 2 === 1) // odd page
        page_number --;
    const desired_pages = book_pages.slice(page_number, page_number+1+1);
    setOpenBookPages(desired_pages);
}

function turnBookPageLeft() {
    const left_page = document.getElementById('left-page');
    turnPage(left_page);
}

function turnBookPageRight() {
    const right_page = document.getElementById('right-page');
    turnPage(right_page)
}

function turnPage(page) {
    if (!page)
        return;
    const next_page_btns = [...page.getElementsByClassName('next-page-btn')];
    if (next_page_btns.length)
        next_page_btns[0].click();
}


/*----------  Extra Control Buttons Pressed  ----------*/

function toggleStepsVisibilityPressed() {

}

function toggleGuidedModePressed() {

}

function clearCanvasPressed() {
    if (shapes.length) {
        if (!confirm('Are you sure you want to delete all shapes on the canvas?'))
            return;
    }
    resetCanvas();
}

function undoPressed() {
    undo();
}

function redoPressed() {
    redo();
}

function openBookPressed() {
    openBookStandard();
}