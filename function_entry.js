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
      if (this.subtract[i] === true) {
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
      if (this.divide[i] === true) {
        product = product/this.subobjects[i].f(x);
      } else {
        product = product*this.subobjects[i].f(x);
      }
    }
    return product;
  }
}

function equ_obj_exponent(subobjects_) {
  this.subobjects = subobjects_;
  this.f = function(x) {
    var exponent = this.subobjects[0].f(x);
    for (var i = 1; i < this.subobjects.length; i++) {
      exponent = pow(exponent,this.subobjects[i].f(x));
    }
    return exponent;
  }
}

function equ_obj_trig(subobject_, trig_id) {
  //0 = arcsin; 1 = arccos; 2 = arctan; 3 = sin; 4 = cos; 5 = tan
  this.subobject = subobject_;
  if (trig_id == 1) {
    this.f = function(x) {return acos(this.subobject.f(x));}
  } else if (trig_id == 2) {
    this.f = function(x) {return atan(this.subobject.f(x));}
  } else if (trig_id == 3) {
    this.f = function(x) {return sin(this.subobject.f(x));}
  } else if (trig_id == 4) {
    this.f = function(x) {return cos(this.subobject.f(x));}
  } else if (trig_id == 5) {
    this.f = function(x) {return tan(this.subobject.f(x));}
  } else {
    this.f = function(x) {return asin(this.subobject.f(x));}
  }
}

function equ_obj_parenthesis(subobject_) {
  this.subobject = subobject_;
  this.f = function(x) {
    return this.subobject.f(x);
  }
}


function parse_PEMDAS(string_var, start_at) {
  //start_at: 2=addition, 3=multiplication, 4=trigs, 5=exponents
  if (start_at === 0) {
    string_var = string_var.replace(" ","");//Remove all spaces
  }
  
  var sub_strings;
  //Step 1: See if the function is a basic one:
  sub_strings = parse_basic(string_var);
  if (sub_strings !== null) {
    return sub_strings;
  } else {
    sub_strings = [];
  }
  print("Not a basic function");
  //Prepare for more advanced ingrediants.
  var prev_pos = 0;
  var current_sub_string_id = 0;
  var sub_parenthesis = 0;
  var i;
  var j;
  var char_temp;
  
  //Step 2: If not, we search for additions, if they are not in parenthesis
  if (start_at <= 2) {
    if (string_var.indexOf("+") != -1 || string_var.indexOf("-") != -1) {
      print("Starting addition:");
      var subtract = [false];
      for (i=0; i<string_var.length; i++) {
        if (string_var.charAt(i) == "+" || string_var.charAt(i) == "-") {
          if (sub_parenthesis === 0) {
            if (i === 0) {//If it is a negative sign at the start...
              if (string_var.charAt(i) == "-") {
                subtract[0] = true;
                prev_pos = 1;
              }
            } else {
              char_temp = string_var.charAt(i-1);//Prevents errors with *-1
              if (char_temp != "*" && char_temp != "/") {
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
            }
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
      for (i=0; i<sub_strings.length; i++) {
        subojbects[i] = parse_PEMDAS(sub_strings[i],3);
      }
      var addition = new equ_obj_addition(subojbects);
      addition.subtract = subtract;
      return addition;
    }
  }
  
  //Step 3: We search for multiplication and division, if they are not in parenthesis
  if (start_at <= 3) {
    if (string_var.indexOf("*") != -1 || string_var.indexOf("/") != -1 || string_var.indexOf("(") != -1) {
      print("Starting multiplication:");
      var divide = [false];
      for (i=0; i<string_var.length; i++) {
        if (string_var.charAt(i) == "*" || string_var.charAt(i) == "/") {
          if (sub_parenthesis === 0) {
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
          if (sub_parenthesis === 0) {
            if (prev_pos < i-1) {//Prevents errors with x*(x)
              char_temp = string_var.charAt(i-1);
              if (char_temp != "c" && char_temp != "s" && char_temp != "n") {//Prevents errors with trig functions
                //This algorithm creates sub-strings split between the additions.
                
                sub_strings[current_sub_string_id] = string_var.substring(prev_pos,i);
                prev_pos = i;//It starts at (
                print("Multiplication Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
                current_sub_string_id += 1;
              }
            }
          }
          sub_parenthesis += 1;
        } else if (string_var.charAt(i) == ")") {
          sub_parenthesis -= 1;
          if (sub_parenthesis === 0) {
            char_temp = string_var.charAt(i+1);
            if (char_temp !== "(" && char_temp !== "*" && char_temp !== "/" && char_temp !== "") {//Prevents errors with (x)(x), (x)*x, (x)/x
              //This algorithm creates sub-strings split between the additions.
              
              sub_strings[current_sub_string_id] = string_var.substring(prev_pos,i);
              prev_pos = i;//It starts at (
              print("Multiplication Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
              current_sub_string_id += 1;
            }
          }
        }
      }
      sub_strings[current_sub_string_id] = string_var.substring(prev_pos,string_var.length);
      print("Multiplication Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
      subojbects = [];
      for (i=0; i<sub_strings.length; i++) {
        subojbects[i] = parse_PEMDAS(sub_strings[i],4);
      }
      var multiply = new equ_obj_multiplication(subojbects);
      multiply.divide = divide;
      return multiply;
    }
  }
  
  //Step 4: We look for trig functions
  if (start_at <= 4) {
    print("Starting trig:");
    var array_of_trigz = ["arcsin","arccos","arctan","sin","cos","tan"];
    var trig_func_id = -1;
    for (i=0; i<array_of_trigz.length;i++) {
      if (string_var.startsWith(array_of_trigz[i])) {
        trig_func_id = i;
      }
    }
    if (trig_func_id === -1) {
      print("No trig functions.");
    } else {
      sub_strings[0] = string_var.substring(array_of_trigz[trig_func_id].length);
      print("Trig function "+array_of_trigz[trig_func_id]+" found. The subobj is "+sub_strings[0]);
      var trig_obj = new equ_obj_trig(parse_PEMDAS(sub_strings[0],5), trig_func_id);
      return trig_obj;
    }
  }
  
  //Step 5: We look for exponents
  if (start_at <= 5) {
    if (string_var.indexOf("^") != -1) {
      print("Starting exponents:");
      for (var i=0; i<string_var.length; i++) {
        if (string_var.charAt(i) == "^") {
          if (sub_parenthesis == 0) {
            //This algorithm creates sub-strings split between the additions.
            sub_strings[current_sub_string_id] = string_var.substring(prev_pos,i);
            prev_pos = i+1;
            print("Exponent Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
            current_sub_string_id += 1;
          }
        } else if (string_var.charAt(i) == "(") {
          sub_parenthesis += 1;
        } else if (string_var.charAt(i) == ")") {
          sub_parenthesis -= 1;
        }
      }
      sub_strings[current_sub_string_id] = string_var.substring(prev_pos,string_var.length);
      print("Exponent Part ["+current_sub_string_id+"] = "+sub_strings[current_sub_string_id]);
      var subojbects = []
      for (var i=0; i<sub_strings.length; i++) {
        subojbects[i] = parse_PEMDAS(sub_strings[i],6);
      }
      var exponent = new equ_obj_exponent(subojbects);
      return exponent;
    }
  }
  
  //Step 6: We see if it is a figure in parenthesis
  if (start_at <= 6) {
    if (string_var.charAt(0) == "(" || string_var.charAt(string_var.length-1) == ")") {
      print("Starting parenthesis check:");
      var parenthesis_pairs = 0;
      for (var i=0; i<string_var.length; i++) {
        if (string_var.charAt(i) == "(") {
          sub_parenthesis += 1;
        } else if (string_var.charAt(i) == ")") {
          sub_parenthesis -= 1;
          if (sub_parenthesis == 0) {
            parenthesis_pairs++;//For each (), this increments, ignoring sub parenthesis like (x+(2)+1)
          }
        }
      }
      if (parenthesis_pairs == 1) {//There should be one pair of ()
        sub_strings[0] = string_var.substring(1,string_var.length-1);//Prune the parenthesis
        print("Sub-parenthesis part: "+sub_strings[0]);
        var subojbect = parse_PEMDAS(sub_strings[0],0);
        var parenthesis_obj = new equ_obj_parenthesis(subojbect);
        return parenthesis_obj;
      } else {
        return null;
      }
    }
  }
}

function parse_basic(string_thing) {
  print("Basic Parse: "+string_thing);
  a_b_array =  string_thing.split("x");
  if (a_b_array.length == 2) {
    a_b_array[1] = trim(a_b_array[1]);
    print("Basic 2var Parse of :"+a_b_array[0]+":x:"+a_b_array[1]);
    if (a_b_array[0].includes("+") || a_b_array[0].indexOf("-") > 0 || a_b_array[0].includes("*") || a_b_array[0].includes("/") || a_b_array[0].includes("(") || a_b_array[0].includes(")")) {
      print("Basic Parse failed due to addition or multiplication in 1st term");
      return null;
    }
    if (a_b_array[1].includes("+") || a_b_array[1].indexOf("-") > 1 || a_b_array[1].includes("*") || a_b_array[1].includes("/") || a_b_array[1].includes("(") || a_b_array[1].includes(")")) {
      print("Basic Parse failed due to addition or multiplication in 2nd term");
      return null;
    }
    if (a_b_array[0].includes("c") || a_b_array[0].includes("s") || a_b_array[0].includes("n")) {
      print("Basic Parse failed due to trig functions in 1st term");
      return null;
    }
    if (a_b_array[1].includes("c") || a_b_array[1].includes("s") || a_b_array[1].includes("n")) {
      print("Basic Parse failed due to trig functions in 2nd term");
      return null;
    }
    if (a_b_array[0].includes("^")) {
      print("Basic Parse failed due to exponents in 1st term");
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
    } else if (a_b_array[0] == "-") {
      a = -1;
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
