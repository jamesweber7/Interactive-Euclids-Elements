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

function setup() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
    setSizing();
}

function draw() {
    background(255);

    drawShapes();

    drawCursor();
}

function drawShapes() {
    push();
    translate(tr.x, tr.y);
    scale(tr.sc);
    noFill();

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

    drawCurrentShape();

    drawProximityPoint();

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

function drawPoint(pt) {
    const r = unit*2;
    circle(pt.x, pt.y, r);
}

function drawProximityPoint() {
    const pt = proximityPoint(mousePt());
    if (!pt.proximity)
        return;
    const r = unit*5;
    circle(pt.x, pt.y, r);
}

function drawLine(line_) {
    stroke(0);
    strokeWeight(2);
    line(line_.p1.x, line_.p1.y, line_.p2.x, line_.p2.y);
}

function drawArc(arc_) {
    arc(arc_.origin.x, arc_.origin.y, arc_.r, arc_.r, arc_.start_theta, arc_.stop_theta);
    const pt_r = unit*2;
    circle(arc_.origin.x, arc_.origin.y, pt_r);
}

function addShape(shape) {
    if (shapes.length)
        shape.id = shapes[shapes.length-1].id+1;
    shape.id = 0;
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
}

function windowResized() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
    setSizing();
}

function setSizing() {
    unit = width / 1500;
}