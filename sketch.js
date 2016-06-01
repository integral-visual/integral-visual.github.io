var mode = 0; // 0 = left, 1 = right, 2 = mid, 3 = trap
var buttonText = ["L", "R", "M", "T", "n =", "f(x) =", "dy/dx"];
var buttons = [];
var bWidth = 50;
var bHeight = 20;
var bYpos = 20;
var values = [];
var n = 0;
var derivMode = false;
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
var equ_subobj;
var equ_string;
var mouse_pressed = false;
var mouseOverSlider = false;

function setup() {
  //frameRate(5);
  var cSize = prompt("Window size:", 500)
  //var cSize = 500;
  createCanvas(cSize, cSize);
  equ_string = prompt("Enter f(x)", "0.002x^2");
  equ_subobj = parse_PEMDAS(equ_string,0);
  for (var i = 0; i < width * 2; i++) {
    //values[i] = f(i) ---> point = (i, values[i]) 
    values[i] = myFunction(i);
  }

  // do this everytime that n OR function is changed
  integral = calculateIntegral();
  dx = width / n;
}

function myFunction(input) {
  return equ_subobj.f(input);
  //return .000014 * Math.pow(input, 3) - Math.pow(input, 3) * .00001;
}

function draw() {
  background(60);
  if (derivMode) {
    calcDeriv(mouseX);
    drawButton(99, 50, bYpos, bWidth, bHeight, "∫ f(x)");
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
  } else if (!derivMode) {
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
    slider(75, 50);
    textSize(14);
    fill(255);
    stroke(0);
    text("Calculated Integral = " + integral, 52, 105);
    text("Estimated Value = " + displayArea, 52, 120);
    n = sliderVal;
    for (var i = 0; i < 4; i++) {
      drawButton(i, 50 + i * (51), bYpos, bWidth, bHeight, buttonText[i]);
    }
    for (var g = 4; g < 7; g++) {
      drawButton(g, 100 + g * (51), bYpos, bWidth, bHeight, buttonText[g]);
    }
  }
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
  } else if (mode === 3) { // trap
    for (var g = 0; g < n; g++) {
      stroke(0, 127, 127);
      fill(255, 0, 0, 120);
      quad((g + 1) * dx, height, g * dx, height, g * dx, height - myFunction((g) * dx), (g + 1) * dx, height - myFunction((g + 1) * dx)); //get f(x) here instead of height
      segmentHeight = height - myFunction(dx * g);
      if (segmentHeight < 0) { //because processing is upside-down
        segmentHeight *= (-1);
        segmentHeight += height;
      }
      if (calculating) { // prevents area from being accounted for more than once
        segmentArea = (myFunction(dx * g) + myFunction(dx * (g + 1))) * dx / 2;

        console.log("dx: " + dx + " f(" + g + ") = " + myFunction(dx * g) + " Area: " + segmentArea);
        estimatedArea += segmentArea;
        //console.log("TOTAL AREA: " + estimatedArea);
      }
    }
  } else if (mode === 2) { // midpoint
    for (var g = 0; g < n; g++) {
      stroke(0, 127, 127);
      fill(255, 0, 0, 120);
      rect((g * dx), height - myFunction((dx * g) + (dx / 2)), dx, myFunction((dx * g) + (dx / 2)));
      segmentHeight = height - myFunction((dx * g) + (dx / 2));
      if (segmentHeight < 0) { //because processing is upside-down
        segmentHeight *= (-1);
        segmentHeight += height;
      }
      if (calculating) { // prevents area from being accounted for more than once
        segmentArea = (myFunction((dx * g) + (dx / 2))) * dx;

        console.log("dx: " + dx + " f(" + g + ") = " + myFunction((dx * g) + dx / 2) + " Area: " + segmentArea);
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

function calculateIntegral() {
  var val = 0;
  for (var v = width; v >= 0; v--) {
    val += values[v];
  }
  console.log("calculateIntegral returns "+val);
  return val;
}

function calcDeriv(x) {
  var slope = 0;
  if (x < values.length) {
    slope = values[x + 1] - values[x];
    console.log("calcDeriv returns "+slope);
  }
  strokeWeight(3);
  line(x, height - values[x], width, height - (values[x] + slope * (width - x)));
  line(x, height - values[x], 0, height - (values[x] - slope * (x)));
  strokeWeight(1);
  fill(255);
  stroke(255);
  text("x = " + x, 100, 100);
  text("dy/dx = " + slope, 100, 120);
  fill(255, 0, 21);
  line(x , 0, x, height);
}

function drawButton(id, x, y, w, h, bText) {
  stroke(0);
  fill(0, 127);
  rect(x, y, w, h);
  fill(255);
  textSize(11);
  stroke(0);
  text(bText, x + w / 2.4, y + h / 1.5);
  if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    noFill();
    stroke(127);
    rect(x, y, w, h);
  }
  if (mode == id) {
    noFill();
    stroke(255);
    rect(x, y, w, h);
  }
}

function slider(xpos, ypos) {
  sliderOffset = xpos;
  // slider pos = HOW MANY PIXELS FROM THE START OF SLIDER
  fill(0);
  noStroke();
  if (n === 0) {
    stroke(255);
  } else {
    stroke(127);
  }
  rect(xpos, ypos, width / 3, width / 60);
  fill(255);

  rect(sliderOffset + sliderPos, ypos - width / 80, width / 60, (width / 80) * 4);
  stroke(127);
  text("0", xpos - 20, ypos + (width / 60));
  text(width, xpos + 15 + width / 3, ypos + (width / 60));
  text("Subdivisions: " + n, xpos + (width / 12), ypos + 30);
  if (mouse_pressed === false) {
    if (mouseX > xpos + sliderPos && mouseX < (xpos + sliderPos + width / 60) && mouseY > ypos - width / 80 && mouseY < ypos + 3 * (width / 80)) {
      mouseOverSlider = true;
    } else {
      mouseOverSlider = false;
    }
  }
  if (sliderPos < 0) {
    sliderPos = 0;
  } else if (sliderPos > width / 3) {
    sliderPos = (width / 3);
  }
  sliderVal = Math.floor(width * (sliderPos / (width / 3)));
  print(sliderVal);
}

function mouseDragged() {
  if (mouseOverSlider/* && sliderPos >= 0 && sliderPos <= width / 3*/) {
    sliderPos = sliderPos - (pmouseX - mouseX);
    displayArea = "";
    if (sliderPos < 0) {
      sliderPos = 0;
    } else if (sliderPos > width / 3) {
      sliderPos = (width / 3);
    }
  }
}

function mousePressed() {
  mouse_pressed = true;
  if (!derivMode) {
    for (var i = 0; i < 4; i++) {
      if (mouseX > bWidth + i * (bWidth + 1) && mouseX < bWidth + (i + 1) * (bWidth + 1) && mouseY > bYpos && mouseY < bYpos + bHeight) {
        //console.log("duh");
        mode = i;
        estimateArea();
      }
    }
    for (var j = 4; j < 7; j++) {
      if (mouseX > 2 * bWidth + j * (bWidth + 1) && mouseX < 2 * bWidth + (j + 1) * (bWidth + 1) && mouseY > bYpos && mouseY < bYpos + bHeight) {
        if (j == 4) {
          n = prompt("Enter # of subdivisions: ", n);
          sliderPos = (n / width) * (width / 3);
          estimateArea();
        } else if (j == 5) {
          equ_string = prompt("Enter f(x)",equ_string);
          equ_subobj = parse_PEMDAS(equ_string,0);
          estimateArea();
          for (var i = 0; i < width * 2; i++) {
            //values[i] = f(i) ---> point = (i, values[i]) 
            values[i] = myFunction(i);
          }
        integral = calculateIntegral();
        } else if (j == 6) {
          derivMode = true;
        }
      }
    }
  } else if (derivMode) { 
   for (var i = 0; i < 1; i++) { //hahahahahaa
      if (mouseX > bWidth + i * (bWidth + 1) && mouseX < bWidth + (i + 1) * (bWidth + 1) && mouseY > bYpos && mouseY < bYpos + bHeight) {
        derivMode = false;
      }
    }
  }
}

function mouseReleased() {
  if (mouseOverSlider && !derivMode) {
    estimateArea();
  }
  mouse_pressed = false;
}

function estimateArea() {
  calculating = true;
  estimatedArea = 0;
}