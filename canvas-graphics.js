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
        p1: point,
        p2: p
    },
    arc: {
        type,
        x,
        y,
        r,
        start_theta,
        end_theta
    }
    */
];

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

    shapes.forEach(shape => {
        drawShape(shape);
    })
    drawCurrentShape();

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

function drawLine(line_) {
    stroke(0);
    strokeWeight(2);
    line(line_.p1.x, line_.p1.y, line_.p2.x, line_.p2.y);
}

function drawArc(arc_) {
    arc(arc_.x, arc_.y, arc_.r, arc_.r, arc_.start_theta, arc_.end_theta);
}

function addShape(shape) {
    shapes.push(shape);
}

function setCurrentShape(shape=null) {
    current_shape = shape;
}

function drawCurrentShape() {
    if (current_shape)
        drawShape(current_shape);
}

function drawCursor() {
    text(getMouseMode()[0], mouseX+5, mouseY)
}

function windowResized() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
    setSizing();
}

function setSizing() {
    unit = width / 1500;
}