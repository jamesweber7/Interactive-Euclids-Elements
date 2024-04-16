const tr = {    // transform
    x: 0,
    y: 0,
    sc: 0
};

function setup() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
}

function windowResized() {
    createCanvas(windowWidth*0.999, windowHeight*0.999);
}

function draw() {
    background(255);
    circle(mouseX, mouseY, 10)
}