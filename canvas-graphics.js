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

var HOVER_COLOR = 0;
function setup() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
    setSizing();
    HOVER_COLOR = color(50, 100, 255);
}

function draw() {
    cursor_type = 'default';
    background(255);

    drawShapes();

    drawCursor();
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

    drawRulerExtendOption();

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
    const pt = proximityPoint(mousePt());
    if (!pt.proximity)
        return;
    noStroke();
    fill(HOVER_COLOR);
    const r = unit*10;
    circle(pt.x, pt.y, r);
}

function drawRulerExtendOption() {
    const info = getExtendLineBtnInfo();
    if (!info.valid)
        return;

    const heading = getDiffVec(info.back_endpoint, info.endpoint).heading();
    push();
        let x = info.pos.x;
        let y = info.pos.y;

        translate(x, y);
        rotate(heading);

        textAlign(CENTER, CENTER);
        fill(0);
        noStroke();

        const EXTEND_MSG = "Extend";

        if (info.endpoint.x > info.back_endpoint.x) {
            push();
                rotate(PI);
                text(EXTEND_MSG, 0, 0);
            pop();
        } else {
            text(EXTEND_MSG, 0, 0);
        }

        const ARROW_MAG = 20;
        const ARROW_OFFSET = 10;
        translate(0, ARROW_OFFSET);
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
    if (line_.extends_forward || line_.extends_backward) {
        if (line_.extends_forward) {
            const diff_vec = getDiffVec(line_.p2, line_.p1);
            const forward_point = trigPointRA(line_.p2, max(width, height)*2, diff_vec.heading());
            line(line_.p2.x, line_.p2.y, forward_point.x, forward_point.y);
        }
        if (line_.extends_backward) {
            const diff_vec = getDiffVec(line_.p1, line_.p2);
            const backward_point = trigPointRA(line_.p1, max(width, height)*2, diff_vec.heading());
            line(line_.p1.x, line_.p1.y, backward_point.x, backward_point.y);
        }
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