const tr = {    // transform
    x: 0,
    y: 0,
    sc: 1
};
let unit;

var shapes = [
    /*
    point: {
        type,
        x,
        y
    },
    line: {
        type,
        p1: pt,
        p2: pt
    },
    arc: {
        type,
        origin: pt,
        r,
        start_theta,
        stop_theta
    }
    */
];

var intersection_points = []; // intersections between shapes
var snap_points = []; // points that mouse can snap to

const EVENTS = {
    ADD_SHAPE: 'ADD_SHAPE',
    DELETE_SHAPE: 'DELETE_SHAPE',
    LINE_EXTENDED: 'LINE_EXTENDED',
}

// call events on draw
const DRAW_STAGES = {
    START: 'START',
    DRAW_SHAPES: 'DRAW_SHAPES',
    END: 'END',
}
var draw_shapes_events = [];
var draw_start_events = [];
var draw_end_events = [];

let current_shape = null;

const SHAPE_TYPES = {
    POINT: 'POINT',
    LINE: 'LINE',
    ARC: 'ARC',
}

const MODES = {
    PROPOSITION: 'PROPOSITION',
    FREEFORM: 'FREEFORM'
}

const INTERACTION_RADIUS = 20;

var HOVER_COLOR = 0;
var HIGHLIGHT_COLOR = 0;

var icons = {};
function preload() {
    icons.select = loadImage('icons/select.svg');
    icons.point = loadImage('icons/point.svg');
    icons.ruler = loadImage('icons/ruler.svg');
    icons.compass = loadImage('icons/compass.svg');
    icons.eraser = loadImage('icons/eraser.svg');
}

function setup() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
    setSizing();
    HOVER_COLOR = color(50, 100, 255);
    HIGHLIGHT_COLOR = color(255, 0, 0);
    setProposition(2);
}

function draw() {
    runDrawStartEvents();

    background(255);

    drawCursor();

    drawShapes();

    runDrawEndEvents();
}

function drawShapes() {
    push();
    translateTransform();

    runDrawShapesEvents();

    shapes.forEach(shape => {
        drawShape(shape);
    })

    intersection_points.forEach(pt => {
        drawPoint(pt);
    });

    drawCurrentShape();

    drawVisualMouseInteractions();

    drawLineExtendBtn();

    pop();
}

function drawShape(shape) {
    switch (shape.type) {
        case SHAPE_TYPES.POINT:
            return drawPoint(shape);
        case SHAPE_TYPES.LINE:
            return drawLine(shape);
        case SHAPE_TYPES.ARC:
            return drawArc(shape);
    }
}

function highlightProximityShape() {
    const proximity_shape = proximityShape(mouse_data.pt);
    if (!proximity_shape.proximity)
        return;
    highlightShape(proximity_shape.shape);
}

function highlightShape(shape) {
    switch (shape.type) {
        case SHAPE_TYPES.POINT:
            return highlightPoint(shape);
        case SHAPE_TYPES.LINE:
            return highlightLine(shape);
        case SHAPE_TYPES.ARC:
            return highlightArc(shape);
    }
}

function drawLineExtendBtn() {
    const info_btns = getExtendLineBtnInfo();

    info_btns.forEach(info => {
        const heading = getDiffVec(info.back_endpoint, info.endpoint).heading();
        if (isExtendLineBtn(mouse_data.pt, info)) {
            strokeWeight(4);
            stroke(0);
            drawLineExtension(info.back_endpoint, info.endpoint);
            cursor(HAND);
        }
        push();
            let x = info.pos.x;
            let y = info.pos.y;

            translate(x, y);
            rotate(heading);

            fill(255);
            strokeWeight(3);
            stroke(0);
            circle(0, 0, 50);

            textAlign(CENTER, CENTER);
            textSize(14);
            fill(0);
            noStroke();

            const EXTEND_MSG = "Extend";

            const flip_y = info.endpoint.x > info.back_endpoint.x ? -1 : 1;

            if (flip_y < 0) {
                push();
                    rotate(PI);
                    text(EXTEND_MSG, 0, 0);
                pop();
            } else {
                text(EXTEND_MSG, 0, 0);
            }

            const ARROW_MAG = 20;
            const ARROW_OFFSET = 10;
            translate(0, ARROW_OFFSET*flip_y);
            scale(ARROW_MAG);
            rotate(PI);

            stroke(0);
            strokeWeight(1/ARROW_MAG);

            line(-0.5, 0, 0.5, 0);
            const HEAD_THETA = PI*0.225;
            const HEAD_DIST = 0.2;
            line(0.5, 0, 0.5-HEAD_DIST*cos(HEAD_THETA), 0-HEAD_DIST*sin(HEAD_THETA));
            line(0.5, 0, 0.5-HEAD_DIST*cos(HEAD_THETA), 0+HEAD_DIST*sin(HEAD_THETA));
        pop();
    });
}

function extendLine(line, forward, options={}) {
    if (forward) {
        line.extends_forward = true;
    } else {
        line.extends_backward = true;
    }
    addLineExtensionIntersectionPoints(line);
    if (!options.no_event_trigger) {
        eventTriggered({
            event: EVENTS.LINE_EXTENDED,
            shape: line,
            line: line,
            forward: forward,
            options: options,
        });
    }
}

// draws line extending forward from p1 past p2
function drawLineExtension(p1, p2, options={}) {
    const forward_point = extendedForwardPoint(p1, p2);
    const draw_line = {
        p1: p2,
        p2: forward_point
    }
    drawLine(draw_line, options);
    if (options.both_ways)
        return drawLineExtension(p2, p1);
}

function drawPoint(pt, options={}) {
    configureDefaults(options, {
        fill: 0,
        r: unit*8,
        label_text_size: 20,
    });
    fill(options.fill);
    noStroke();
    circle(pt.x, pt.y, options.r);
    if (pt.label) {
        textSize(options.label_text_size);
        textAlign(CENTER);
        text(pt.label, pt.x+options.label_text_size*0.6, pt.y+options.label_text_size*0.8);
    }
}

function drawLine(line_, options={}) {
    configureDefaults(options, {
        stroke: 0,
        stroke_weight: 2,
        label_text_size: 20,
    });
    stroke(options.stroke);
    strokeWeight(options.stroke_weight);
    line(line_.p1.x, line_.p1.y, line_.p2.x, line_.p2.y);
    if (line_.p1.label || line_.p2.label) {
        labelLine(line_, options);
    }
    if (line_.extends_forward) {
        drawLineExtension(line_.p1, line_.p2, options);
    }
    if (line_.extends_backward) {
        drawLineExtension(line_.p2, line_.p1, options);
    }
}

function drawArc(arc_, options={}) {
    configureDefaults(options, {
        'stroke': 0,
        'stroke_weight': 2,
        'pt_r': unit*4,
        'pt_fill': 0
    });
    noFill();
    stroke(options.stroke);
    strokeWeight(options.stroke_weight);
    // draw circumference
    arc(arc_.origin.x, arc_.origin.y, arc_.r*2, arc_.r*2, arc_.start_theta, arc_.stop_theta);
    // draw point at origin
    drawPoint(arc_.origin, {r: options.pt_r, fill: options.pt_fill});
}

function drawVisualMouseInteractions() {
    if (!mouse_data.pt)
        return;
    if ([MOUSE_MODES.ERASER].includes(getMouseMode())) {
        highlightProximityShape();
    } else {
        drawProximityPoint();
    }
}

function drawProximityPoint() {
    const pt = proximityPoint(mouse_data.pt);
    if (!pt.proximity)
        return;
    const options = {
        fill: HOVER_COLOR,
        r: unit*10,
    }
    drawPoint(pt, options)
}

function highlightPoint(pt) {
    const options = {
        fill: HIGHLIGHT_COLOR,
        r: unit*24,
    };
    drawPoint(pt, options)
    // redraw point normally over highlight
    drawPoint(pt);
}

function highlightLine(line) {
    const options = {
        stroke: HIGHLIGHT_COLOR,
        stroke_weight: unit*8
    };

    // possibly just highlight extension
    const pt = mouse_data.pt;
    const closest_pt = getClosestPointOnLine(pt, line);
    if (pointOverLineExtension(closest_pt, line)) {
        let p1, p2;
        if (pointForwardsOnLine(closest_pt, line)) {
            p1 = line.p1;
            p2 = line.p2;
        } else {
            p1 = line.p2;
            p2 = line.p1;
        }
        drawLineExtension(p1, p2, options);
        // redraw line normally over highlight
        drawLineExtension(p1, p2);
    } else {
        drawLine(line, options);
        // redraw line normally over highlight
        drawLine(line);
    }
    
    
}


function highlightArc(arc) {
    const options = {
        stroke: HIGHLIGHT_COLOR,
        stroke_weight: unit*8,
        pt_fill: HIGHLIGHT_COLOR,
        pt_r: unit*16
    };
    drawArc(arc, options);
    // redraw arc normally over highlight
    drawArc(arc);
}

function drawArrow(x, y, heading, mag) {
    const wt = 1/mag;
    push();
    translate(x, y);
    rotate(heading);
    scale(mag);
    strokeWeight(wt);
    stroke(0);
    line(0, 0, 1, 0);
    const HEAD_THETA = PI*0.225;
    const HEAD_DIST = 0.2;
    line(1, 0, 1-HEAD_DIST*cos(HEAD_THETA), 0-HEAD_DIST*sin(HEAD_THETA));
    line(1, 0, 1-HEAD_DIST*cos(HEAD_THETA), 0+HEAD_DIST*sin(HEAD_THETA));
    pop();
}

function addShape(shape, options={}) {
    // set shape id
    shape.id = 1; // I want to start this above 0 so I can !!id for checking validity
    if (shapes.length)
        shape.id = shapes[shapes.length-1].id+1;

    addIntersectionPoints(shape);

    // add shape to shapes
    shapes.push(shape);

    // trigger event *after* shape added to shapes
    if (!options.no_event_trigger) {
        eventTriggered({
            event: EVENTS.ADD_SHAPE,
            shape: shape,
            options: options
        });
    }

    return shape;
}

function deleteShape(shape, options={}) {
    for (let i = 0; i < shapes.length; i++)
        while (i < shapes.length && shapes[i] === shape)
            shapes.splice(i, 1);
    deleteChildIntersectionPoints(shape);
    // trigger event *after* shape removed from shapes
    if (!options.no_event_trigger) {
        eventTriggered({
            event: EVENTS.DELETE_SHAPE,
            shape: shape,
            options: options,
        });
    }
}

function eventTriggered(event) {
    // can probably add to undo/redo queue
    propositionOnChange(event);
}

function setCurrentShape(shape=null) {
    current_shape = shape;
}

function getCurrentShape() {
    return current_shape;
}

function drawCurrentShape() {
    if (!getCurrentShape())
        return;
    const shape = getCurrentShape()
    switch (shape.type) {
        // not really anything to do for point here atm
        case SHAPE_TYPES.LINE:
            return drawCurrentLine(shape);
        case SHAPE_TYPES.ARC:
            return drawCurrentArc(shape);
    }
}

function drawCurrentLine(line_) {
    drawLine(line_);
}

function drawCurrentArc(arc_) {
    drawCompass(arc_.origin, arc_.pencil_pt);
}

function drawCompass(needle_pt, pencil_pt) {
    drawPoint(needle_pt);
    drawPoint(pencil_pt);

    const diff_vec = getDiffVec(needle_pt, pencil_pt);
    const diff_theta = diff_vec.heading();
    const diff_r = diff_vec.mag();

    const joint_angle = PI;
    const joint_pt_theta = diff_theta+PI/2;

    const midpoint = getMidpoint(needle_pt, pencil_pt);

    const compass_r = diff_r / (2 * sin(joint_angle / 2));
    const compass_joint = trigPointRA(midpoint, compass_r, joint_pt_theta);

    const needle_joint_vec = getDiffVec(needle_pt, compass_joint);
    const pencil_joint_vec = getDiffVec(pencil_pt, compass_joint);

    const unit = compass_r/100;
    stroke(0);
    strokeWeight(2*unit);

    noFill();

    line(needle_pt.x, needle_pt.y, compass_joint.x, compass_joint.y);
    line(compass_joint.x, compass_joint.y, pencil_pt.x, pencil_pt.y);

    // larger line after needle
    const needle_off = 20*unit;
    const needle_off_pt = trigPointRA(needle_pt, needle_off, PI+needle_joint_vec.heading());

    strokeWeight(8*unit);
    line(needle_off_pt.x, needle_off_pt.y, compass_joint.x, compass_joint.y);

    // pencil
    // triangle ends near compass point
    const pencil_height = 15*unit;
    const pencil_width = 7*unit;
    const pencil_off1 = createVector(pencil_width/2, pencil_height);
    const pencil_off2 = createVector(-pencil_width/2, pencil_height);
    const pencil_off_heading1 = pencil_off1.heading();
    const pencil_off_heading2 = pencil_off2.heading();
    const pencil_off_mag = pencil_off1.mag();
    const pencil_off_pt1 = trigPointRA(pencil_pt, pencil_off_mag, PI/2+pencil_joint_vec.heading()+pencil_off_heading1);
    const pencil_off_pt2 = trigPointRA(pencil_pt, pencil_off_mag, PI/2+pencil_joint_vec.heading()+pencil_off_heading2);
    noStroke();
    fill(0);
    triangle(
        pencil_pt.x, pencil_pt.y, 
        pencil_off_pt1.x, pencil_off_pt1.y, 
        pencil_off_pt2.x, pencil_off_pt2.y
    );

    // pencil body
    const pencil_rect_end_off1 = createVector(pencil_width/2, 0);
    const pencil_rect_end_off2 = createVector(-pencil_width/2, 0);
    const pencil_rect_off_heading1 = pencil_rect_end_off1.heading();
    const pencil_rect_off_heading2 = pencil_rect_end_off2.heading();
    const pencil_rect_off_mag = pencil_rect_end_off1.mag();
    const pencil_rect_end1 = trigPointRA(compass_joint, pencil_rect_off_mag, PI/2+pencil_joint_vec.heading()+pencil_rect_off_heading1);
    const pencil_rect_end2 = trigPointRA(compass_joint, pencil_rect_off_mag, PI/2+pencil_joint_vec.heading()+pencil_rect_off_heading2);
    quad(
        pencil_off_pt1.x, pencil_off_pt1.y, 
        pencil_off_pt2.x, pencil_off_pt2.y,
        pencil_rect_end2.x, pencil_rect_end2.y,
        pencil_rect_end1.x, pencil_rect_end1.y,
    );

    stroke(0);
    strokeWeight(4*unit);

    // knob bar thing at end of joint
    const bar_off = unit*30;
    const bar_end = trigPointRA(compass_joint, bar_off, joint_pt_theta);


    line(bar_end.x, bar_end.y, compass_joint.x, compass_joint.y)

    // circle at joint
    fill(255);
    strokeWeight(2*unit);
    circle(compass_joint.x, compass_joint.y, 30*unit);
}

function addDrawEvent(event, options={}) {
    const default_func = () => {return false};
    options = configureDefaults(options, {
        when: DRAW_STAGES.DRAW_SHAPES,
        stop: default_func,
        onstop: default_func,
    })
    let events = [];
    switch (options.when) {
        case DRAW_STAGES.START:
            events = draw_start_events;
            break;
        case DRAW_STAGES.DRAW_SHAPES:
            events = draw_shapes_events;
            break;
        case DRAW_STAGES.END:
            events = draw_end_events;
            break;
    }
    const event_obj = {
        id: getNewDrawEventId(events, options.when),
        event: event,
        options: options,
    };
    events.push(event_obj);
    return event_obj;
}

function getNewDrawEventId(events, when) {
    let id_num;
    if (!events.length) {
        id_num = 1;
    } else {
        id_num = events[events.length - 1].id.match(/\d+$/);
    }
    return when+id_num;
}

function runDrawStartEvents() {
    return runDrawEvents(draw_start_events);
}

function runDrawShapesEvents() {
    return runDrawEvents(draw_shapes_events);
}

function runDrawEndEvents() {
    return runDrawEvents(draw_end_events);
}

function runDrawEvents(draw_events) {
    const infos = [];
    for (let i = 0; i < draw_events.length; i++) {
        const ev = draw_events[i];
        const params = overwriteDefault(ev.options.params, []);
        const info = [];

        if (ev.options.stop(...params)) {
            ev.options.onstop(...params);
            draw_events.splice(i, 1);
            i--;
        } else {
            info.push(...runDrawEvent(ev));
            infos.push(...info);
        }
    }
    return infos;
}

function runDrawEvent(ev) {
    const params = overwriteDefault(ev.options.params, []);
    let info = [];
    ev.event(...params);
    return info;
}

function deleteDrawEvent(id) {
    deleteDrawEventFromEvents(id, draw_start_events);
    deleteDrawEventFromEvents(id, draw_shapes_events);
    deleteDrawEventFromEvents(id, draw_end_events);
}

function deleteDrawEventFromEvents(id, events) {
    for (let i = 0; i < events.length; i++)
        while (i < events.length && events[i].id === id)
            events.splice(i, 1);
}

function drawCursor() {
    let cursor_type = mouse_data.cursor;
    if (!cursor_type) {
        if (spaceIsPressed()) { // dragging canvas
            cursor_type = HAND;
        } else {
            cursor_type = ARROW; // default
        }
    }
    cursor(cursor_type);
    const mode_cursor_icon = getModeCursorIcon();
    if (mode_cursor_icon.valid) { // default
        push();
        translate(mouseX, mouseY);
        if (mode_cursor_icon.offset_x)
            translate(mode_cursor_icon.offset_x, 0);
        if (mode_cursor_icon.offset_y)
            translate(0, mode_cursor_icon.offset_y);

        scale(0.25);
        if (mode_cursor_icon.scale)
            scale(mode_cursor_icon.scale);
        image(mode_cursor_icon.icon, 0, 0);
        pop();
    }
}

function windowResized() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
    setSizing();
}

function setSizing() {
    unit = width / 1500;
}

function getShapesOfType(type, shapes_=shapes) {
    const typed_shapes = [];
    shapes_.forEach(shape => {
        if (shape.type === type)
            typed_shapes.push(shape);
    })
    return typed_shapes;
}

function getLines() {
    return getShapesOfType(SHAPE_TYPES.LINE);
}

// ONLY points within shapes that have explicit type POINT. If you want more, perhaps use allPoints
function getPoints() {
    return getShapesOfType(SHAPE_TYPES.POINT);
}

function isLineEndpoint(pt) {
    const epsilon = 2**-10;
    for (const line of getLines()) {
        for (const pt2 of [line.p1, line.p2])
            if (getPointDistSq(pt2, pt) < epsilon)
                return true;
    }
    return false;
}

function transformPt(pt) {
    const transformed = ptToVec(pt);
    transformed.sub(createVector(tr.x, tr.y));
    transformed.mult(1/tr.sc);
    return {
        x: transformed.x,
        y: transformed.y
    };
}

function untransformPt(pt) {
    const untransformed = ptToVec(pt);
    untransformed.mult(tr.sc);
    untransformed.add(createVector(tr.x, tr.y));
    return {
        x: untransformed.x,
        y: untransformed.y
    };
}

function transformX(x) {
    x -= tr.x;
    x /= tr.sc;
    return x;
}

function untransformX(x) {
    x += tr.x;
    x *= tr.sc;
    return x;
}

function transformY(y) {
    y -= tr.y;
    y /= tr.sc;
    return y;
}

function untransformY(y) {
    y += tr.y;
    y *= tr.sc;
    return y;
}

function isBetweenBitonic(num, a, b, cushion=0) {
    return min(a,b)-cushion <= num && num <= max(a,b)+cushion;
}

function addSnapPoint(pt) {
    snap_points.push(pt);
}

function setIntersectionPoints(pts, parents) {
    if (arguments.length > 2)
        throw 'bad';
    if (!Array.isArray(pts))
        pts = [pts];
    if (!Array.isArray(parents))
        parents = [parents];
    for (let i = 0; i < pts.length; i++) {
        const pt1 = pts[i];
        let removed = false;
        // check to see if point is already an existing intersection point
        for (let j = 0; j < intersection_points && !removed; j++) {
            const pt2 = intersection_points[j];
            // point already within intersection points; remove it
            if (pt2.parent_shapes && withinEpsilon(0, getPointDistSq(pt1, pt2))) {
                pts.splice(i, 1);
                removed = true;
                for (let i = 0; i < parents.length; i++) {
                    let found = false;
                    for (let j = 0; j < pt2.parent_shapes.length && !found; j++) {
                        if (pt2.parent_shapes[j] === parents[i])
                            found = true;
                    }
                    if (!found)
                        pt2.parent_shapes.push(parents[i]);
                }
            }
        }
        if (removed) {
            i--;
        } else {
            pt1.parent_shapes = parents;
        }
    }
    intersection_points.push(...pts);
}

function addIntersectionPoints(shape) {
    switch (shape.type) {
        case SHAPE_TYPES.LINE:
            return addLineIntersectionPoints(shape);
        case SHAPE_TYPES.ARC:
            return addArcIntersectionPoints(shape);
    }
}

function deleteChildIntersectionPoints(parent) {
    const matches = [];
    for (let i = 0; i < intersection_points.length; i++) {
        const pt = intersection_points[i];
        let pt_deleted = false;
        let is_match = false;
        // delete all instances of parent being in pt's parent shapes
        while (pt.parent_shapes && pt.parent_shapes.includes(parent) && !pt_deleted) {
            is_match = true;

            // delete parent from pt's parent shapes
            const parents_index = pt.parent_shapes.indexOf(parent);
            pt.parent_shapes.splice(parents_index, 1);

            // if less than two shapes, not an intersection
            pt_deleted = pt.parent_shapes.length < 2; 
        }
        if (is_match) {
            matches.push({
                pt: pt,
                deleted: pt_deleted
            });
            if (pt_deleted) {
                intersection_points.splice(i, 1);
                i--;
            }
        }
    }
    return matches;
}

function getChildIntersectionPoints(parents) {
    if (!Array.isArray(parents))
        return getChildIntersectionPoints([...arguments]);
    const pts = [];
    intersection_points.forEach(pt => {
        for (const parent of parents) {
            if (!pt.parent_shapes || !pt.parent_shapes.includes(parent))
                return;
        }
        pts.push(pt);
    })
    return pts;
}

function allPoints() {
    const all_points = [];
    all_points.push(...getShapePoints());
    all_points.push(...intersection_points);
    all_points.push(...snap_points);
    return all_points;
}

function getShapePoints() {
    const shape_points = [];
    shapes.forEach(shape => {
        switch (shape.type) {
            case SHAPE_TYPES.POINT:
                addShapePoint(shape);
                break;
            case SHAPE_TYPES.LINE:
                addShapePoint(shape.p1);
                addShapePoint(shape.p2);
                break;
            case SHAPE_TYPES.ARC:
                addShapePoint(shape.origin);
                break;
        }
        function addShapePoint(pt) {
            pt.parent_shape = shape;
            shape_points.push(pt);
        }
    });
    return shape_points;
}

function getBounds() {
    const n = (0);
    const e = (width);
    const s = (height);
    const w = (0);
    const ne = {
        x: e,
        y: n
    };
    const se = {
        x: e,
        y: s
    };
    const sw = {
        x: w,
        y: s
    };
    const nw = {
        x: w,
        y: n
    };
    const top_bound = {
        p1: nw,
        p2: ne
    };
    const right_bound = {
        p1: ne,
        p2: se
    };
    const bottom_bound = {
        p1: sw,
        p2: se
    };
    const left_bound = {
        p1: nw,
        p2: sw
    };
    return {
        n: n,
        e: e,
        s: s,
        w: w,
        ne: ne,
        nw: nw,
        se: se,
        sw: sw,
        top_bound: top_bound,
        right_bound: right_bound,
        bottom_bound: bottom_bound,
        left_bound: left_bound
    };
}

function avg(a, b) {
    return (b-a)/2+a;
}

function getModeCursorIcon() {
    if (mouse_data.cursor != ARROW)
        return {valid: false}; // something happening with cursor
    const info = {};
    switch (mouseMode) {
        case MOUSE_MODES.SELECT:
            info.valid = false; // no cursor icon for select
            break;
        case MOUSE_MODES.POINT:
            info.valid = true;
            info.icon = icons.point;
            info.scale = 1.25;
            info.offset_x = 14;
            info.offset_y = 4;
            break;
        case MOUSE_MODES.RULER:
            info.valid = true;
            info.icon = icons.ruler;
            info.offset_x = 14;
            info.offset_y = 8;
            break;
        case MOUSE_MODES.COMPASS:
            info.valid = true;
            info.icon = icons.compass;
            info.scale = 1.25;
            info.offset_x = 10;
            break;
        case MOUSE_MODES.ERASER:
            info.valid = true;
            info.icon = icons.eraser;
            info.scale = 1.5;
            info.offset_x = 7;
            break;
    }
    return info;
}

function clearCanvas() {
    while (shapes.length)
        deleteShape(shapes[0]);
    // intersection points should already be empty, but check anyways
    intersection_points.splice(0);
}

// returns array of each possible set of shapes, as an array, where each shape in a set is unique and corresponds with one respective type in shape_types, reduces lines to segments
function getPropositionShapeSets(shape_types) {
    if (!Array.isArray(shape_types))
        return getPropositionShapeSets([...arguments]);
    const all_shape_sets = getShapeSets(shape_types);
    // reduce lines to segments
    const proposition_shape_sets = [];
    all_shape_sets.forEach(general_shape_set => {
        const line_sets = [];
        const other_shapes = [];
        general_shape_set.forEach(shape => {
            if (shape.type === SHAPE_TYPES.LINE) {
                line_sets.push(splitIntoSegments(shape));
            } else {
                other_shapes.push(shape);
            }
        })

        const line_combinations = getCombinations(line_sets);
        line_combinations.forEach(line_comb => {
            proposition_shape_sets.push([...line_comb].concat(...other_shapes));
        });
    })
    return proposition_shape_sets;
}

// returns array of each possible set of shapes, as an array, where each shape in a set is unique and corresponds with one respective type in shape_types
function getShapeSets(shape_types) {
    if (!Array.isArray(shape_types))
        return getShapeSets([...arguments]);

    // prune current_shapes - make sure they only contain shape_types
    const remaining_shapes = [];
    for (const shape of shapes)
        if (shape_types.includes(shape.type))
            remaining_shapes.push(shape);
    
    // all combinations, including duplicates
    const shape_combinations = getShapeCombinations(shape_types, remaining_shapes);

    // check for duplicates by casting to sets
    const shape_sets = [];
    shape_combinations.forEach(combination => {
        const comb_set = new Set(combination);
        for (const existing_set of shape_sets) {
            if (equalSets(existing_set, comb_set))
                return;
        }
        shape_sets.push(comb_set);
    });

    // convert sets back to arrays
    const shape_arrs = Array(shape_sets.length);
    for (let i = 0; i < shape_arrs.length; i++) {
        shape_arrs[i] = [...shape_sets[i]];
    }
    return shape_arrs;
}

// recursively get combinations, including duplicates, of shapes w/ types matching to shape_types
function getShapeCombinations(shape_types, current_shapes) {
    const shape_type = shape_types[0];
    const remaining_types = shape_types.slice(1);
    if (!shape_types.length)
        return [[]];

    const shape_combs = [];
    for (let i = 0; i < current_shapes.length; i++) {
        const current_shape = current_shapes[i];
        if (current_shape.type === shape_type) {
            const remaining_shapes = current_shapes.slice(0,i).concat(current_shapes.slice(i+1));
            const combinations = getShapeCombinations(remaining_types, remaining_shapes);
            combinations.forEach(combination => {
                combination.push(current_shape);
                shape_combs.push(combination);
            })
        }
    }
    return shape_combs;
}

// given array of arrays, returns each possible combination where combination[0] = element from first array, combination[1] = element from second array, ...
function getCombinations(sets) {
    if (!sets.length)
        return [];
    const current = sets[0];
    if (!current.length)
        return [];
    const remaining = sets.slice(1);
    const remaining_combinations = getCombinations(remaining);
    if (!remaining_combinations.length)
        return current.map(el => [el]);

    const arr = Array(current.length*remaining_combinations.length);
    for (let i = 0; i < current.length; i++) {
        for (let j = 0; j < remaining_combinations.length; j++) {
            arr[i+j*remaining_combinations.length] = [current[i]].concat(remaining_combinations[j]);
        }
    }
    // clear empty slots. you can fix this method so it doesn't get empty slots in the first place if you want
    for (let i = 0; i < arr.length; i++)
        while (i < arr.length && !arr[i])
            arr.splice(i, 1);
    return arr;
}

function equalSets(set1, set2) {
    if (set1.size != set2.size)
        return false;
    for (const el of set1)
        if (!set2.has(el))
            return false;
    return true;
}

function translateTransform() {
    translate(tr.x, tr.y);
    scale(tr.sc);
}

// as opposed to using proposition
function setFreeformMode() {
    setNoProposition();
}

function isPropositionMode() {
    return proposition_info && proposition_info.valid;
}

function isFreeformMode() {
    return !isPropositionMode();
}

function mode() {
    if (isPropositionMode())
        return MODES.PROPOSITION;
    return MODES.FREEFORM;
}

function splitIntoSegments(line) {
    const intersection_points = getChildIntersectionPoints(line);
    const points = [line.p1, line.p2].concat(intersection_points);
    // prune equal endpoints
    for (let i = 0; i < points.length-1; i++) {
        for (let j = i+1; j < points.length; j++) {
            while (j < points.length && pointsWithinEpsilon(points[i], points[j])) {
                points.splice(j, 1);
            }
        }
    }
    const segments = [];
    for (let i = 0; i < points.length-1; i++) {
        for (let j = i+1; j < points.length; j++) {
            segments.push({
                type: SHAPE_TYPES.LINE,
                segmented: true,
                p1: points[i],
                p2: points[j],
                parent_line: line
            });
        }
    }
    return segments;
}

function labelLine(line, options) {
    noStroke();
    fill(options.stroke);
    textSize(options.label_text_size);
    textAlign(CENTER, CENTER);
    if (line.p1.label)
        labelLinePoint(line.p1, line.p1.label, line, options);
    if (line.p2.label)
        labelLinePoint(line.p2, line.p2.label, line, options);
}

function labelLinePoint(pt, label, line, options) {
    const r = options.label_text_size;
    const diff_vec = getLineDiffVec(line);
    let orthog = diff_vec.heading()+PI/2;
    if (getPositiveTheta(orthog) > PI)
        orthog -= PI;
    text(label, pt.x+r*cos(orthog), pt.y+r*sin(orthog));
}

function getShapeByLabel(label, shapes_=shapes) {
    for (const shape of shapes_)
        if (shape.label === label)
            return shape;
}

function getLineByLabels(pt1_label, pt2_label, shapes_=shapes) {
    for (const line of getShapesOfType(SHAPE_TYPES.LINE, shapes_)) {
        const pts1 = getPointsAt(line.p1);
        const pts2 = getPointsAt(line.p2);
        const labels1 = [];
        const labels2 = [];
        pts1.forEach(pt => {
            if (pt.label)
                labels1.push(pt.label);
        })
        pts2.forEach(pt => {
            if (pt.label)
                labels2.push(pt.label);
        })
        for (const label1 of labels1) {
            for (const label2 of labels2) {
                if ((label1 === pt1_label && label2 === pt2_label) || 
                    (label2 === pt1_label && label1 === pt2_label)) {
                    return line;
                }
            }
        }
    }
}

function getCirclesByOriginLabel(label, shapes_=shapes) {
    const circles = [];
    for (const circle of getShapesOfType(SHAPE_TYPES.ARC, shapes_))
        for (const pt of getPointsAt(circle.origin))
            if (pt.label === label)
                circles.push(circle);        
    return circles;
}

function getCircleByOriginLabelAndRadius(label, r, shapes_=shapes) {
    const circles_at_origin = getCirclesByOriginLabel(label, shapes_);
    for (const circle of circles_at_origin)
        if (withinEpsilon(circle.r, r))
            return circle;
}

function getPointsAt(pt, epsilon=2**-10) {
    const pts = [];
    allPoints().forEach(pt2 => {
        if (pointsWithinEpsilon(pt, pt2, epsilon))
            pts.push(pt2);
    })
    return pts;
}

function getPointByLabel(label) {
    for (const pt of allPoints())
        if (pt.label === label)
            return pt;
}