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

var intersection_points = [];

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

function setup() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
    setSizing();
    HOVER_COLOR = color(50, 100, 255);
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

    drawProximityPoint();

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

function drawPoint(pt, r=unit*4) {
    fill(0);
    noStroke();
    circle(pt.x, pt.y, r);
}

function drawProximityPoint() {
    const pt = proximityPoint(mouse_data.pt);
    if (!pt.proximity)
        return;
    noStroke();
    fill(HOVER_COLOR);
    const r = unit*10;
    circle(pt.x, pt.y, r);
}

function drawLineExtendBtn() {
    const info = getExtendLineBtnInfo();
    if (!info.valid)
        return;

    const heading = getDiffVec(info.back_endpoint, info.endpoint).heading();
    if (isExtendLineBtn(mouse_data.pt)) {
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
        circle(0, 0, 50); // cover intersection point

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
}

function extendLine(line, forward) {
    if (forward) {
        line.extends_forward = true;
    } else {
        line.extends_backward = true;
    }
}

// draws line extending forward from p1 past p2
function drawLineExtension(p1, p2, both_ways=false) {
    const diff_vec = getDiffVec(p2, p1);
    const forward_point = trigPointRA(p2, max(width, height)*2, diff_vec.heading());
    const draw_line = {
        p1: p2,
        p2: forward_point
    }
    drawLine(draw_line, forward_point.x, forward_point.y);
    if (both_ways)
        return drawLineExtension(p2, p1);
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

function drawLine(line_) {
    stroke(0);
    strokeWeight(2);
    line(line_.p1.x, line_.p1.y, line_.p2.x, line_.p2.y);
    if (line_.extends_forward) {
        drawLineExtension(line_.p1, line_.p2);
    }
    if (line_.extends_backward) {
        drawLineExtension(line_.p2, line_.p1);
    }
}

function drawArc(arc_) {
    noFill();
    stroke(0);
    strokeWeight(2);
    // draw circumference
    arc(arc_.origin.x, arc_.origin.y, arc_.r*2, arc_.r*2, arc_.start_theta, arc_.stop_theta);
    // draw point at origin
    const pt_r = unit*4;
    drawPoint(arc_.origin, pt_r);
}

function addShape(shape) {
    if (shapes.length)
        shape.id = shapes[shapes.length-1].id+1;
    shape.id = 1; // I want to start this above 0 so I can !!id for checking validity
    shapes.push(shape);
    return shape;
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

function drawCompass(origin, pencil_pt) {
    drawPoint(origin)
    drawPoint(pencil_pt);

    const diff_vec = getDiffVec(origin, pencil_pt);
    const diff_theta = diff_vec.heading();
    const diff_r = diff_vec.mag();

    const joint_angle = PI;
    const joint_pt_theta = diff_theta+PI/2;

    const midpoint = getMidpoint(origin, pencil_pt);

    const compass_r = diff_r / (2 * sin(joint_angle / 2));
    const compass_joint = trigPointRA(midpoint, compass_r, joint_pt_theta);

    noFill();
    stroke(0);
    strokeWeight(2);

    line(origin.x, origin.y, compass_joint.x, compass_joint.y);
    line(compass_joint.x, compass_joint.y, pencil_pt.x, pencil_pt.y);
}

function addDrawEvent(event, options={}) {
    draw_events.push({
        event: event,
        options: options
    });
}

function drawCursor() {
    fill(0);
    text(getMouseMode()[0], mouseX+5, mouseY)
    let cursor_type = mouse_data.cursor;
    if (!cursor_type)
        cursor_type = ARROW;
    cursor(cursor_type);
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