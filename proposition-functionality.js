
var proposition_info = {};

function checkPropositionPass() {
    if (proposition_info.passed)    // already passed
        return;
    const pass_info = propositionPassInfo();
    if (!pass_info || !pass_info.pass)
        return;
    // proposition passed
    proposition_info.passed = true;
    displayPropositionCompleteAnimation(pass_info);
}

function propositionPassInfo() {
    if (!proposition_info || !proposition_info.pass_func)
        return;
    return proposition_info.pass_func();
}

function propositionOnChange() {
    if (!proposition_info)
        return;
    if (proposition_info.on_change)
        proposition_info.on_change();
    checkPropositionPass();
}

function setProposition(prop_number) {
    setPropositionInfo(getPropositionInfo(prop_number));
}

function setPropositionInfo(prop_info) {
    proposition_info = prop_info;
    clearPropositionShapes();
    updateDomPropositionInfo(prop_info);
    if (!proposition_info || !proposition_info.valid)
        return;
    prop_info.given_shapes.forEach(shape => {
        shape.not_erasable = true;
        addShape(shape);
    });
}

function resetProposition() {
    setProposition(proposition_info.number);
}

function clearPropositionShapes() {
    clearCanvas();
}

function setNoProposition() {
    setPropositionInfo({});
}

function getPropositionInfo(prop_number=proposition_info.number) {
    switch (prop_number) {
        case 1:
            return getProp1Info();
        case 2:
            return getProp2Info();
    }
    return {valid: false};
}

function displayPropositionCompleteAnimation(pass_info) {
    const options = {
        when: DRAW_STAGES.END,
    }
    const ev_id = addDrawEvent(propositionCompleteAnimation, options).id;

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

        // hide background
        background(255, ease_amt*255);
        push();
            translateTransform();
            pass_info.passing_shapes.forEach(shape => {
                drawShape(shape);
            })
        pop();

        // lerp to reset transform
        tr.x = lerp(original_tr.x, 0, ease_amt);
        tr.y = lerp(original_tr.y, 0, ease_amt);
        tr.sc = lerp(original_tr.sc, 1, ease_amt);

        if (time_elapsed > anim_time+linger_time) {
            deleteAllShapesExceptPassing(pass_info.passing_shapes);
            deleteDrawEvent(ev_id);
            displayPropositionCompleteMenu();
        }
    }
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

function isValidProposition(prop_info) {
    return prop_info && prop_info.valid;
}

function isFinalProposition(prop_number) {
    return !isValidProposition(getPropositionInfo(prop_number+1));
}
