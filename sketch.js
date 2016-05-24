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
var parent_equ_subobj = null;

function myFunction(input) {
  return parent_equ_subobj.f(input);
  //return .000014 * Math.pow(input, 3) - Math.pow(input, 3)*.00001;
  //return 200 * Math.pow(Math.pow(sin(input), 2), .5);
  //return input + 20;
  //return 250;
}

function setup() {
  createCanvas(500, 500);
  parent_equ_subobj = parse_PEMDAS(prompt("Set the function:"),0);
  //-.01x^2+4x
  
  //parent_equ_subobj = new equ_obj_axpowb(1,5);
  for (var i = 0; i < width * 2; i++) {
    //values[i] = f(i) ---> point = (i, values[i]) 
    values[i] = myFunction(i);
  }
  integral = calculateIntegral();
  dx = width / n;
}



//These functions represent a subsection of an equation.
function equ_obj_const(a_) {
  this.a = a_;
  this.f = function(x) {
    return this.a;
  }
}

function equ_obj_axpowb(a_,b_) {
  this.a = a_;
  this.b = b_;
  this.f = function(x) {
    return this.a*pow(x,this.b);
  }
}

function equ_obj_addition(subobjects_) {
  this.subobjects = subobjects_;
  this.subtract = [];
  for (var i=0;i<this.subobjects.length;i++) {
    this.subtract[i] = false;
  }
  this.f = function(x) {
    var sum = 0;
    for (var i = 0; i < this.subobjects.length; i++) {
      if (this.subtract[i] == true) {
        sum = sum-this.subobjects[i].f(x);
      } else {
        sum = sum+this.subobjects[i].f(x);
      }
    }
    return sum;
  }
}

function equ_obj_multiplication(subobjects_) {
  this.subobjects = subobjects_;
  this.divide = [];
  for (var i=0;i<this.subobjects.length;i++) {
    this.divide[i] = false;
  }
  this.f = function(x) {
    var product = 1;
    for (var i = 0; i < this.subobjects.length; i++) {
      if (this.divide[i] == true) {
        product = product/this.subobjects[i].f(x);
      } else {
        product = product*this.subobjects[i].f(x);
      }
    }
    return product;
  }
}

function equ_obj_parenthesis(subobject_) {
  this.subobject = subobject_;
  this.f = function(x) {
    return subobject.f(x);
  }
}


function parse_PEMDAS(string_var, start_at) {
  //start_at: 2=addition, 3=multiplication, 4=trigs, 5=exponents
  
  var sub_strings;
  //Step 1: See if the function is a basic one:
  var sub_strings = parse_basic(string_var);
  if (sub_strings != null) {
    return sub_strings;
  } else {
    sub_strings = [];
  }
  print("Not a basic function");
  //Prepare for more advanced ingrediants.
  var prev_pos = 0;
  var current_sub_string_id = 0;
  var sub_parenthesis = 0;
  
  //Step 2: If not, we search for additions, if they are not in parenthesis
  if (start_at <= 2) {
    if (string_var.indexOf("+") != -1 || string_var.indexOf("-") != -1) {
      print("Starting addition:");
      var subtract = [false];
      for (var i=1; i<string_var.length; i++) {
        if (string_var.charAt(i) == "+" || string_var.charAt(i) == "-") {
          if (sub_parenthesis == 0) {
            //This algorithm creates sub-strings split between the additions.
            sub_strings[current_sub_string_id] = string_var.substring(prev_pos,i);
            prev_pos = i+1;
            print("Addition Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
            if (string_var.charAt(i) == "-") {
              subtract[current_sub_string_id+1] = true;
            } else {
              subtract[current_sub_string_id+1] = false;
            }
            current_sub_string_id += 1;
          }
        } else if (string_var.charAt(i) == "(") {
          sub_parenthesis += 1;
        } else if (string_var.charAt(i) == ")") {
          sub_parenthesis -= 1;
        }
      }
      sub_strings[current_sub_string_id] = string_var.substring(prev_pos,string_var.length);
      print("Addition Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
      var subojbects = []
      for (var i=0; i<sub_strings.length; i++) {
        subojbects[i] = parse_PEMDAS(sub_strings[i],3);
      }
      var addition = new equ_obj_addition(subojbects);
      addition.subtract = subtract;
      return addition;
    }
  }
  
  //Step 3: We search for multiplication and division, if they are not in parenthesis
  if (start_at <= 3) {
    if (string_var.indexOf("*") != -1 || string_var.indexOf("/") != -1) {
      print("Starting multiplication:");
      var divide = [false];
      for (var i=1; i<string_var.length; i++) {
        if (string_var.charAt(i) == "*" || string_var.charAt(i) == "/") {
          if (sub_parenthesis == 0) {
            //This algorithm creates sub-strings split between the additions.
            sub_strings[current_sub_string_id] = string_var.substring(prev_pos,i);
            prev_pos = i+1;
            print("Multiplication Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
            if (string_var.charAt(i) == "/") {
              divide[current_sub_string_id+1] = true;
            } else {
              divide[current_sub_string_id+1] = false;
            }
            current_sub_string_id += 1;
          }
        } else if (string_var.charAt(i) == "(") {
          sub_parenthesis += 1;
        } else if (string_var.charAt(i) == ")") {
          sub_parenthesis -= 1;
        }
      }
      sub_strings[current_sub_string_id] = string_var.substring(prev_pos,string_var.length);
      print("Multiplication Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
      var subojbects = []
      for (var i=0; i<sub_strings.length; i++) {
        subojbects[i] = parse_PEMDAS(sub_strings[i],4);
      }
      var multiply = new equ_obj_multiplication(subojbects);
      multiply.divide = divide;
      return multiply;
    }
  }
  
  //Step 4: We look for trig functions
}

function parse_basic(string_thing) {
    print("Basic Parse: "+string_thing);
  a_b_array =  string_thing.split("x");
  if (a_b_array.length == 2) {
    a_b_array[1] = trim(a_b_array[1]);
    print("Basic 2var Parse of :"+a_b_array[0]+":x:"+a_b_array[1]);
    if (a_b_array[0].includes("+") || a_b_array[0].indexOf("-") > 1 || a_b_array[0].includes("*") || a_b_array[0].includes("/")) {
      print("Basic Parse failed due to addition or multiplication in 1st term");
      return null;
    }
    if (a_b_array[1].includes("+") || a_b_array[1].indexOf("-") > 1 || a_b_array[1].includes("*") || a_b_array[1].includes("/")) {
      print("Basic Parse failed due to addition or multiplication in 2nd term");
      return null;
    }
    if (a_b_array[1].charAt(0) != "^" && a_b_array[1] != "") {
      print("Basic Parse failed due to no ^");
      return null;
    }
    a_b_array[1] = a_b_array[1].replace("^","");
    var a;
    if (a_b_array[0] == "") {
      a = 1;
    } else {
      a = parseFloat(a_b_array[0]);
    }
    var b;
    if (a_b_array[1] == "") {
      b = 1;
    } else {
      b = parseFloat(a_b_array[1]);
    }
    if (a != NaN && b != NaN) {
      print("Basic 2var Parse success");
      return new equ_obj_axpowb(a,b);
    } else {
      print("Basic 2var Parse failed due to number parse error");
      return null;
    }
  } else if (a_b_array.length == 1) {
    print("Basic 1var Parse of :"+a_b_array[0]);
    var a = parseFloat(a_b_array[0]);
    if (a != NaN) {
      print("Basic 1var Parse success");
      return new equ_obj_const(a);
    } else {
      print("Basic 2var Parse failed due to number parse error");
      return null;
    }
  }
}

function look_for_math_symbols(string_var, array_of_symbols) {
  var sub_strings = [];
  var sub_parenthesis = 0;
  var current_sub_string_id = 0;
  var which_symbol_it_matches = [];
  for (var i=1; i<string_var.length; i++) {
    var matches_a_symbol = -1;
    for (var j=0; j<array_of_symbols.length; j++) {
      if (string_var.charAt(i) == array_of_symbols[j]) {
        matches_a_symbol = j; break;
      }
    }
    if (matches_a_symbol >= 0) {
      if (sub_parenthesis == 0) {
        //This algorithm creates sub-strings split between the additions.
        sub_strings[current_sub_string_id] = string_var.substring(prev_pos,i);
        which_symbol_it_matches[current_sub_string_id] = matches_a_symbol;
        prev_pos = i+1;
        print(current_sub_string_id);
        print(current_sub_string_id+": "+sub_strings[current_sub_string_id]);
        current_sub_string_id += 1;
      }
    } else if (string_var.charAt(i) == "(") {
      sub_parenthesis += 1;
    } else if (string_var.charAt(i) == ")") {
      sub_parenthesis -= 1;
    }
  }
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
  /*stroke(0,0,255);//This is a demo of what the derivitive function might look like.
  line(100,height - values[100],500,height - values[100]-800);
  line(100,height - values[100],0,height - values[100]+200);
  strokeWeight(5);
  point(100,height - values[100]);*/
  stroke(0);
  //text("Derivitive = 2", 52, 105);
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
    for (var g = 0; g < n; g++) {
      stroke(0, 127, 127);
      fill(255, 0, 0, 120);
      quad((g+1)*dx, height, g * dx, height, g*dx, height-myFunction((g) * dx), (g+1)*dx, height-myFunction((g + 1) * dx)); //get f(x) here instead of height
      segmentHeight = height - myFunction(dx * g);
      if (segmentHeight < 0) { //because processing is upside-down
        segmentHeight *= (-1);
        segmentHeight += height;
      }
      if (calculating) { // prevents area from being accounted for more than once
        segmentArea = (myFunction(dx * g) + myFunction(dx * (g+1)))*dx/2;

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