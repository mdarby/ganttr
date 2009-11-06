var canvas_padding = 20;
var small_offset   = 10;
var box_offset     = 30;
var box_height     = 18;
var corner_radius  = 0;


Raphael.el.x = function(){
  return this.node.x.baseVal.value;
}

Raphael.el.y = function(){
  return this.node.y.baseVal.value;
}

Raphael.el.bottom_left_x = function(){
  return this.x() + small_offset;
}

Raphael.el.bottom_left_y = function(){
  return this.y() + this.getBBox().height;
}

Raphael.el.bottom_left_point = function(){
  return this.bottom_left_x() +","+ this.bottom_left_y();
}

Raphael.el.centered_y = function(){
  return this.y() + (this.getBBox().height / 2);
}

Raphael.el.centered_x = function(){
  return this.x() + (this.getBBox().width / 2);
}

Raphael.el.left_center_point = function(){
  return this.x() +","+ this.centered_y();
}

Raphael.el.points_to = function(arr){
  if(arr.length == undefined){
    arr = new Array(arr);
  }

  for(i=0;i<arr.length;i++){
    var el  = arr[i];
    var str = "";

    str = str.concat("M"+ this.bottom_left_point());
    str = str.concat("L"+ this.paper.arrow_crux_point(this, el));
    str = str.concat("L"+ el.left_center_point());

    this.paper.path(str);
    this.paper.arrow_nib(el.left_center_point());
  }

  return this;
}

Raphael.el.says = function(text){
  var x = this.x() + (this.getBBox().width / 2);
  var y = this.y() + (box_height / 2);
  this.paper.text(x, y, text).attr({fill: "#000"}).toFront();

  return this;
}

Raphael.el.is_this_complete = function(percentage){
  var x = this.x() + 2;
  var y = this.y() + 2;
  var h = box_height - 4;
  var w = this.getBBox().width * percentage;

  this.paper.rect(x, y, w, h).attr({gradient: "0-#DDD-#FFF", "stroke-width": 0}).toFront();

  return this;
}


Raphael.fn.arrow_crux_point = function(el1, el2){
  return el1.bottom_left_x() +","+ el2.centered_y();
}

Raphael.fn.point = function(x, y){
  this.text((x), (y-10), "("+ x +","+ y +")").attr({fill: "red"});
  this.circle(x, y, 3).attr({fill: "red", stroke: "#FFF"});
}

Raphael.fn.arrow_nib = function(point){
  var str         = "";
  var coordinates = point.split(',');
  var x           = parseInt(coordinates[0]);
  var y           = parseInt(coordinates[1]);

  str = str.concat("M"+ point);
  str = str.concat("L"+ (x-3) +","+ (y+3));
  str = str.concat("L"+ (x-3) +","+ (y-3));
  str = str.concat("L"+ point);

  this.path(str).attr({fill: "#000"});
}

Raphael.fn.box = function(x, y, w, h){
  return this.rect(x,y,w,h,corner_radius).attr({fill: "#DDD", stroke: "#999"});
}

Raphael.fn.layout_boxes = function(num){
  var boxes = new Array();

  for(i=0; i<num; i++){
    var x    = canvas_padding + (box_offset * i);
    var y    = canvas_padding + (box_offset * i);
    boxes[i] = this.box(x, y, 200, box_height);
  }

  return boxes;
}


$(document).ready(function(){

  var canvas = Raphael(0, 0, 600, 600);
  var boxes  = canvas.layout_boxes(10);

  boxes[0].points_to(new Array(boxes[1], boxes[7])).is_this_complete(0.5).says("Testing...");
  boxes[1].points_to(boxes[2]).is_this_complete(0.3).says("More arrows!");
  boxes[5].points_to(boxes[9]).is_this_complete(0.9).says("Let's see how this looks");

});



function interrogate(what){
    var output = '';
    for (var i in what)
        output += i + ', ';
    alert(output);
}
