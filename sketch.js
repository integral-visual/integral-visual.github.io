var values = [];
var n = 0;
var mode = 0; // 0 = left, 1 = right, 2 = trap
var dx;
var estimatedArea = 0;
var segmentArea = 0;
var segmentHeight = 0;
var calculating = false; //true
var sliderVal = 0; // calulated value for the slider
var sliderOffset = 0; //distance from window border to slider
var sliderPos = 0; //x position from start of slider
var integral = 0;
var displayArea = "";

function myFunction(input) {
  //return (.002 * Math.pow(input, 2));
  //return .000014 * Math.pow(input, 3) - Math.pow(input, 3)*.00001;
  return 200 * Math.pow(Math.pow(sin(input), 2), .5);
  //return input + 20;
  //return 250;
}

function setup() {
  createCanvas(500, 500);
  for (var i = 0; i < width * 2; i++) {
    //values[i] = f(i) ---> point = (i, values[i]) 
    values[i] = myFunction(i);
  }
  integral = calculateIntegral();
  dx = width / n;
}

function draw() {
  background(60);
  dx = width / n;
  for (var i = 0; i < width; i++) {
    strokeWeight(2);
    stroke(255);
    if (i <= width) {
      line(i, width - values[i], i + 1, height - values[i + 1]);
    }
    stroke(0, 120, 240);
    strokeWeight(1);
    point(i, height - values[i]);
  }
  riemann();
  slider(50, 50);
  toggle(50, 20, width / 3);
  textSize(14);
  fill(255);
  stroke(0);
  text("Calculated Integral = " + integral, 52, 105);
  text("Estimated Value = " + displayArea, 52, 120);
  n = sliderVal;
}

function calculateIntegral() {
  var val = 0;
  for (var v = width; v >= 0; v--) {
    val += values[v];
  }
  console.log(val);
  return val;
}

function riemann() {
  if (mode === 0) { // left hand sum
    for (var g = n; g >= 0; g--) {
      stroke(0, 127, 127);
      fill(255, 0, 0, 120);
      rect(g * dx, height - myFunction(dx * g), dx, myFunction(g * dx)); //get f(x) here instead of height
      segmentHeight = height - myFunction(dx * g);
      if (segmentHeight < 0) { //because processing is upside-down
        segmentHeight *= (-1);
        segmentHeight += height;
      }
      if (calculating) { // prevents area from being accounted for more than once
        segmentArea = (dx * myFunction(dx * (g - 1)));
        console.log("dx: " + dx + " f(" + (g - 1) + ") = " + myFunction(dx * (g + 1)) + " Area: " + segmentArea);
        estimatedArea += segmentArea;
      }
    }
  } else if (mode === 1) {
    for (var g = n; g >= 1; g--) {
      //console.log(g);
      stroke(0, 127, 127);
      fill(255, 0, 0, 120);
      rect((g - 1) * dx, height - myFunction(dx * (g)), dx, myFunction((g) * dx)); //get f(x) here instead of height
      segmentHeight = height - myFunction(dx * (g - 1));
      if (segmentHeight < 0) { //because processing is upside-down
        segmentHeight *= (-1);
        segmentHeight += height;
      }
      if (calculating) { // prevents area from being accounted for more than once
        segmentArea = (dx * myFunction(dx * g));
        console.log("dx: " + dx + " f(" + g + ") = " + myFunction(dx * g) + " Area: " + segmentArea);
        estimatedArea += segmentArea;

      }
    }
  } else if (mode === 2) { // trap
    for (var g = 0; g < n; n++) {
      stroke(0, 127, 127);
      fill(255, 0, 0, 120);
      rect(g * dx, height - myFunction(dx * g), dx, myFunction((g + 1) * dx)); //get f(x) here instead of height
      segmentHeight = height - myFunction(dx * g);
      if (segmentHeight < 0) { //because processing is upside-down
        segmentHeight *= (-1);
        segmentHeight += height;
      }
      if (calculating) { // prevents area from being accounted for more than once
        segmentArea = (dx * myFunction(dx * g));
        console.log("dx: " + dx + " f(" + g + ") = " + myFunction(dx * g) + " Area: " + segmentArea);
        estimatedArea += segmentArea;
        //console.log("TOTAL AREA: " + estimatedArea);
      }
    }
  }
  if (calculating) {
    console.log("estimated area: " + estimatedArea);
    displayArea = estimatedArea;
  }
  calculating = false; // happens after for loop is complete
}

function toggle(xpos, ypos, length) {
  fill(0, 127);
  stroke(0, 127, 127);
  rect(xpos, ypos, length / 3, height / 40);
  rect(xpos + length / 3, ypos, length / 3, height / 40);
  rect(xpos + (2 / 3) * length, ypos, length / 3, height / 40);

  if (mode === 0) {
    noFill();
    stroke(255);
    rect(xpos, ypos, length / 3, height / 40);
    fill(255);
    textSize(10);
    text("L", xpos + length / 6, ypos + 10);
  } else if (mode === 1) {
    noFill();
    stroke(255);
    rect(xpos + length / 3, ypos, length / 3, height / 40);
    fill(255);
    textSize(10);
    text("R", xpos - 4 + length / 6 + length / 3, ypos + 10);
  } else {
    noFill();
    stroke(255);
    rect(xpos + (2 / 3) * length, ypos, length / 3, height / 40);
    fill(255);
    textSize(10);
    text("T", xpos - 4 + length / 6 + 2 * length / 3, ypos + 10);
  }
}

function slider(xpos, ypos) {
  sliderOffset = xpos;
  // slider pos = HOW MANY PIXELS FROM THE START OF SLIDER
  fill(0);
  if (n === 0) {
    stroke(0, 120, 240);
  } else {
    stroke(0, 127, 127);
  }
  rect(xpos, ypos, width / 3, width / 60);
  fill(255);

  rect(sliderOffset + sliderPos, ypos - width / 80, width / 60, (width / 80) * 4);
  text("0", xpos - 20, ypos + (width / 60));
  text("500", xpos + 15 + width / 3, ypos + (width / 60));
  text("Subdivisions: " + n, xpos + (width / 12), ypos + 30);
  if (mouseX > xpos + sliderPos && mouseX < (xpos + sliderPos + width / 60) && mouseY > ypos - width / 80 && mouseY < ypos + 3 * (width / 80)) {
    mouseOverSlider = true;
  } else {
    mouseOverSlider = false;
  }
  if (sliderPos < 0) {
    sliderPos = 0;
  } else if (sliderPos > width / 3) {
    sliderPos = (width / 3);
  }
  sliderVal = Math.floor(500 * (sliderPos / (width / 3)));
  //print(sliderVal);
}

function mouseDragged() {
  if (mouseOverSlider && sliderPos >= 0 && sliderPos <= width / 3) {
    sliderPos = sliderPos - (pmouseX - mouseX);
    displayArea = "";
  }
}

function keyPressed() {
  if (key === '1') {
    mode = 0;
  } else if (key === '2') {
    mode = 1;
  } else if (key === '3') {
    mode = 2;
  } else if (key == ' ') {
    calculating = true;
    estimatedArea = 0;
  }
}