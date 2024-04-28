
var proposition_info = {};

let completed_propositions = [];

const no_prop_info_func = () => {return {valid: false}};

function checkPropositionPass() {
    if (proposition_info.passed)    // already passed
        return;
    const pass_info = propositionPassInfo();
    if (!pass_info || !pass_info.pass)
        return;

    // proposition passed
    propositionPassed(pass_info);
}

function propositionPassed(pass_info) {
    completed_propositions.push(proposition_info.number);
    proposition_info.passed = true;
    resetMouseInteraction();
    displayPropositionCompleteAnimation(pass_info);
}

function propositionPassInfo() {
    if (!proposition_info || !proposition_info.pass_func)
        return;
    return proposition_info.pass_func();
}

function propositionOnChange(event) {
    if (!proposition_info)
        return;
    if (proposition_info.on_change)
        proposition_info.on_change(event);
    checkPropositionPass();
}

function setProposition(prop_number) {
    setPropositionInfo(getPropositionInfo(prop_number));
}

function setPropositionInfo(prop_info) {
    // Before updating proposition info
    deletePropositionDrawEvents();
    clearPropositionShapes();

    // Update proposition info
    proposition_info = prop_info;
    
    // After updating proposition info
    updateDomPropositionInfo(prop_info);
    if (!proposition_info || !proposition_info.valid)
        return;
    prop_info.given_shapes.forEach(shape => {
        shape.not_erasable = true;
        addShape(shape, {no_event_trigger: true});
    });
}

function resetProposition() {
    if (!proposition_info || !proposition_info.number) {
        setNoProposition();
    } else {
        setProposition(proposition_info.number);
    }
}

function firstPropositionNumber() {
    return 1;
}

function setFirstProposition() {
    setProposition(firstPropositionNumber());
}

function nextPropositionNumber() {
    if (completed_propositions.length) {
        const last = completed_propositions[completed_propositions.length-1];
        if (isPropositionNumber(last+1)) {
            return last+1;
        }
    }
    // none completed or last proposition
    return firstPropositionNumber();
}

function isPropositionNumber(prop_number) {
    const prop = getPropositionInfo(prop_number);
    return prop && prop.valid;
}

function addPropositionDrawEvent(event, options={}) {
    if (!isValidProposition())
        return -1;
    const ev_id = addDrawEvent(event, options).id;
    proposition_info.draw_events.push(ev_id);
    return ev_id;
}

function deletePropositionDrawEvent(id) {
    if (id === -1)
        return;
    const i = proposition_info.draw_events.indexOf(id);
    if (i !== -1)
        proposition_info.draw_events.splice(i);
    deleteDrawEvent(id);
}

function deletePropositionDrawEvents() {
    if (!proposition_info || !Array.isArray(proposition_info.draw_events))
        return;
    proposition_info.draw_events.forEach(ev_id => {
        deletePropositionDrawEvent(ev_id);
    })
}

function clearPropositionShapes() {
    clearCanvas();
}

function setNoProposition() {
    setPropositionInfo({});
}

function getPropositionInfoFunction(prop_number=proposition_info.number) {
    switch (prop_number) {
        case 1:
            return getProp1Info;
        case 2:
            return getProp2Info;
    }
    return no_prop_info_func;
}

function getPropositionInfo(prop_number=proposition_info.number) {
    const prop_info_func = getPropositionInfoFunction(prop_number);
    if (prop_info_func === no_prop_info_func)
        return {valid: false};
    return prop_info_func();
}

function numberOfPropositions() {
    let num_propositions = 0;
    let prop_info_func = getPropositionInfoFunction(1);
    while (prop_info_func != no_prop_info_func) {
        num_propositions ++;
        prop_info_func = getPropositionInfoFunction(num_propositions+1);
    }
    return num_propositions;
}

function displayPropositionCompleteAnimation(pass_info) {
    const options = {
        when: DRAW_STAGES.END,
    }
    const ev_id = addPropositionDrawEvent(propositionCompleteAnimation, options);

    const anim_time = 2000;
    const start_time = millis();
    const original_tr = {
        x: tr.x,
        y: tr.y,
        sc: tr.sc
    };
    const linger_time = 1000;
    function propositionCompleteAnimation() {
        const time_elapsed = millis()-start_time;
        const linear_amt = min(time_elapsed / anim_time, 1);
        const ease_amt = easeInOut(linear_amt);

        hideNonPassingShapesFromInfo(pass_info.passing_shapes, ease_amt, original_tr);

        if (time_elapsed > anim_time+linger_time) {
            deletePropositionDrawEvent(ev_id);
            hideNonPassingShapes(pass_info.passing_shapes);
            resetMouseInteraction();
            displayPropositionCompleteMenu();
        }
    }
}

function hideNonPassingShapesFromInfo(passing_shapes, amt=1, original_tr=null) {
    // hide background
    background(255, amt*255);
    push();
        translateTransform();
        passing_shapes.forEach(shape => {
            drawShape(shape);
        })
    pop();

    if (original_tr) {
        // lerp to reset transform
        tr.x = lerp(original_tr.x, 0, amt);
        tr.y = lerp(original_tr.y, 0, amt);
        tr.sc = lerp(original_tr.sc, 1, amt);
    }
}

// set it so non passing shapes are hidden
function hideNonPassingShapes(passing_shapes) {
    if (proposition_info.hide_shapes_event) // something went wrong, probably good idea to just delete all draw events to help reset things
        deletePropositionDrawEvents();
    const options = {
        when: DRAW_STAGES.END,
    }
    const ev_id = addPropositionDrawEvent(_hideShapes, options);
    proposition_info.hide_shapes_event = ev_id;

    function _hideShapes() {
        hideNonPassingShapesFromInfo(passing_shapes);
    }
}

function showAllShapes() {
    deletePropositionDrawEvent(proposition_info.hide_shapes_event)
}

function displayPropositionCompleteMenu() {
    createPropositionCompleteMenu(proposition_info.number, proposition_info);
}

function easeInOut(amt, deg=3) {
    if (amt < 0.5) {
        return (2*amt)**deg / 2;
    } else {
        return (2-(-2*amt+2)**deg) / 2;
    }
}


function deleteAllShapesExceptPassing(except) {
    for (let i = 0; i < shapes.length; i++)
        while (i < shapes.length && !except.includes(shapes[i]))
            deleteShape(shapes[i]);
    intersection_points.splice(0);
}

function isValidProposition(prop_info=proposition_info) {
    return prop_info && prop_info.valid;
}

function isFinalProposition(prop_number) {
    return !isValidProposition(getPropositionInfo(prop_number+1));
}
