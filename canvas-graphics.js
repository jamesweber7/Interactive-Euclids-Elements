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

// call events on draw
var draw_events = [];

let current_shape = null;

const SHAPE_TYPES = {
    POINT: 'POINT',
    LINE: 'LINE',
    ARC: 'ARC',
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
}

function draw() {
    background(255);

    drawCursor();

    drawShapes();
}

function drawShapes() {
    push();
    translate(tr.x, tr.y);
    scale(tr.sc);

    draw_events.forEach((ev, i) => {
        const params = ev.options.params ? ev.options.params : [];
        if (ev.options.stop && ev.options.stop(...params)) {
            if (ev.options.onstop)
                ev.options.onstop(...params);
            draw_events.splice(i, 1);
            return;
        }
        ev.event(...params);
    });

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

function extendLine(line, forward) {
    if (forward) {
        line.extends_forward = true;
    } else {
        line.extends_backward = true;
    }
    addLineExtensionIntersectionPoints(line);
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
        r: unit*8
    });
    fill(options.fill);
    noStroke();
    circle(pt.x, pt.y, options.r);
}

function drawLine(line_, options={}) {
    configureDefaults(options, {
        'stroke': 0,
        'stroke_weight': 2
    });
    stroke(options.stroke);
    strokeWeight(options.stroke_weight);
    line(line_.p1.x, line_.p1.y, line_.p2.x, line_.p2.y);
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
    drawLine(line, options);
    // redraw line normally over highlight
    drawLine(line);
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

function addShape(shape) {
    shape.id = 1; // I want to start this above 0 so I can !!id for checking validity
    if (shapes.length)
        shape.id = shapes[shapes.length-1].id+1;
    shapes.push(shape);
    return shape;
}

function deleteShape(shape) {
    for (let i = 0; i < shapes.length; i++)
        while (i < shapes.length && shapes[i] === shape)
            shapes.splice(i, 1);
    deleteChildIntersectionPoints(shape);
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
    draw_events.push({
        event: event,
        options: options
    });
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

function getShapesOfType(type) {
    const typed_shapes = [];
    shapes.forEach(shape => {
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

function isBetweenBitonic(num, a, b) {
    return min(a,b) <= num && num <= max(a,b);
}

function addSnapPoint(pt) {
    snap_points.push(pt);
}

function addIntersectionPoints(pts, parents) {
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