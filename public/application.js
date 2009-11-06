// Constants
var box_height    = 12;
var box_offset    = box_height * 2;
var small_offset  = box_height;
var box_radius    = box_height / 6;
var timeline_size = 20;
var box_color     = "#939393";
var box_gradient  = "0-"+ box_color +"-#FFF";



// Date class monkeypatch
Date.prototype.toString = function(){
  var months = new Array(12);
  months[0]  = "Jan";
  months[1]  = "Feb";
  months[2]  = "Mar";
  months[3]  = "Apr";
  months[4]  = "May";
  months[5]  = "Jun";
  months[6]  = "Jul";
  months[7]  = "Aug";
  months[8]  = "Sep";
  months[9]  = "Oct";
  months[10] = "Nov";
  months[11] = "Dec";

  return months[this.getMonth()] +" "+ this.getFullYear();
}

Date.prototype.daysUntil = function(end_date){
  // The number of milliseconds in one day
  var ONE_DAY = 1000 * 60 * 60 * 24

  // Convert both dates to milliseconds
  var this_ms = this.getTime()
  var end_date_ms = end_date.getTime()

  // Calculate the difference in milliseconds
  var difference_ms = Math.abs(this_ms - end_date_ms)

  // Convert back to days and return
  return Math.round(difference_ms/ONE_DAY)
}

Date.prototype.monthsUntil = function(end_date){
  var number = 0;

  if (end_date.getFullYear() > this.getFullYear()) {
    number = number + (end_date.getFullYear() - this.getFullYear() - 1) * 12;
  } else {
    return end_date.getMonth() - this.getMonth() + 1;
  }

  if (end_date.getMonth() > this.getMonth()) {
    number = number + 12 + end_date.getMonth() - this.getMonth();
  } else {
    number = number + (12 - this.getMonth()) + end_date.getMonth();
  }

  return number;
}



// Chart class
function Chart(num_boxes, start_date, end_date, canvas){
  this.num_boxes  = num_boxes;
  this.start_date = start_date;
  this.end_date   = end_date;
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.height     = (timeline_size * 3) + (this.num_boxes * (box_height + box_offset));
  this.width      = this.num_days * timeline_size;
  this.canvas     = Raphael(0, 0, this.width, this.height);
  this.timeline   = new Timeline(this.num_days, this);
  this.boxes      = this.draw_boxes();

  return this;
}

Chart.prototype.draw_boxes = function(){
  var boxes = new Array();

  for(i=0; i < this.num_boxes; i++){
    var x    = box_offset * i;
    var y    = (timeline_size * 3) + (box_offset * i);
    boxes[i] = new Box(x, y, 200, box_height, this.canvas);
  }

  return boxes;
}



// Timeline class
function Timeline(num_days, chart){
  this.chart    = chart;
  this.canvas   = this.chart.canvas;
  this.num_days = num_days;

  return this.draw();
}

Timeline.prototype.draw = function(start, end){
  this.draw_months();
  this.draw_days();
  return this;
}

Timeline.prototype.draw_months = function(){
  var start_date  = this.chart.start_date;
  var end_date    = this.chart.end_date;
  var num_months  = start_date.monthsUntil(end_date);
  var month_width = this.chart.width / num_months;

  for(i=0; i<num_months; i++){
    var curr_date = start_date.add(i).months();
    var x = (i * month_width);

    new Month(x, timeline_size, month_width, curr_date, this.canvas);
  }

}

Timeline.prototype.draw_days = function(){
  var days = new Array("S","M","T","W","T","F","S");
  var y = timeline_size;

  for(i=0; i<this.num_days; i+=1){
    var x     = i * timeline_size;
    var label = days[i%7];
    new Day(x, y, label, this.canvas);
  }
}



// Month class
function Month(x, y, w, label, canvas){
  this.x       = x;
  this.y       = y;
  this.w       = w;
  this.label   = label;
  this.label_x = this.x + (this.w / 2)
  this.canvas  = canvas;

  return this.draw();
}

Month.prototype.draw = function(){
  this.canvas.rect(this.x, -1, this.w, timeline_size + 1).attr({fill: "#BD0000", stroke: "#FFF"});
  this.canvas.text(this.label_x, this.y / 2, this.label).attr({fill: "#FFF"});
  return this;
}



// Day class
function Day(x, y, text, canvas){
  this.x      = x;
  this.y      = y;
  this.text   = text;
  this.canvas = canvas;

  return this.draw();
}

Day.prototype.center_point = function(){
  var x = this.x + (timeline_size / 2);
  var y = this.y + (timeline_size / 2) + 2;

  return new Point(x,y);
}

Day.prototype.draw = function(){
  var p = this.center_point();

  this.canvas.rect(this.x, this.y, timeline_size, timeline_size).attr({fill: "#efefef"});
  this.canvas.text(p.x, p.y, this.text);

  return this;
}



// Point class
function Point(x,y){
  this.x = parseInt(x);
  this.y = parseInt(y);

  return this;
}

Point.prototype.toString = function(){
  return this.x +","+ this.y;
}

Point.prototype.shift = function(x,y){
  var x = (this.x + x);
  var y = (this.y + y);
  return new Point(x,y);
}

Point.prototype.draw = function(canvas){
  canvas.text(this.x, (this.y - 10), "("+ this +")").attr({fill: "red"});
  canvas.circle(this.x, this.y, 3).attr({fill: "red", stroke: "#FFF"});

  return this;
}


// Box class
function Box(x,y,w,h,canvas){
  this.canvas = canvas;
  this.shape = this.canvas.rect(x,y,w,h,box_radius);
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.shape.attr({fill: box_color, stroke: "#999"});

  return this;
}

Box.prototype.bottom_left_point = function(){
  var x = this.x + small_offset;
  var y = this.y + this.shape.getBBox().height;

  return new Point(x,y);
}

Box.prototype.left_center_point = function(){
  var y = this.y + (this.shape.getBBox().height / 2);

  return new Point(this.x, y);
}

Box.prototype.right_center_point = function(){
  var x = this.x + this.shape.getBBox().width;
  var y = this.left_center_point().y;

  return new Point(x, y);
}

Box.prototype.points_to = function(arr){
  if(arr.length == undefined){
    arr = new Array(arr);
  }

  for(i=0; i < arr.length; i++){
    new Arrow(this, arr[i], this.shape.paper);
  }

  return this;
}

Box.prototype.says = function(text){
  var p      = this.right_center_point();
  var t      = this.shape.paper.text(p.x, p.y, text);
  var offset = (t.getBBox().width / 2) + small_offset;

  t.translate(offset, 0).attr({fill: "#000"}).toFront;

  return this;
}

Box.prototype.is_this_complete = function(percentage){
  var x = this.x + 2;
  var y = this.y + 2;
  var h = box_height - 4;
  var w = this.shape.getBBox().width * percentage;

  this.shape.paper.rect(x, y, w, h, box_radius).attr({gradient: box_gradient, "stroke-width": 0}).toFront();

  return this;
}



// Arrow class
function Arrow(start_box, end_box, canvas){
  this.from   = start_box;
  this.to     = end_box;
  this.canvas = canvas;

  var str = "";

  str = str.concat("M"+ this.from.bottom_left_point());
  str = str.concat("L"+ this.crux_point());
  str = str.concat("L"+ this.to.left_center_point());

  this.canvas.path(str).toBack();
  this.nib();

  return this;
}

Arrow.prototype.crux_point = function(){
  var x = this.from.bottom_left_point().x;
  var y = this.to.left_center_point().y;

  return new Point(x, y);
}

Arrow.prototype.nib = function(){
  var point  = this.to.left_center_point();
  var str    = "";
  var tip    = point.shift(-2, 0);
  var top    = tip.shift(-3, -3);
  var bottom = tip.shift(-3, 3);

  str = str.concat("M"+ tip);
  str = str.concat("L"+ top);
  str = str.concat("L"+ bottom);
  str = str.concat("L"+ tip);

  this.canvas.path(str).attr({fill: "#000"}).toBack();

  return this;
}



// Helper function
function interrogate(obj){
  var output = '';
  for(var m in obj){
    output += m + ', ';
  }
  alert(output);
}



$(document).ready(function(){
  var start_date = new Date("Nov 1, 2009");
  var end_date   = new Date("Dec 31, 2009");
  var chart      = new Chart(10, start_date, end_date);
  var boxes      = chart.boxes;

  boxes[0].points_to(new Array(boxes[1], boxes[7])).is_this_complete(0.5).says("Testing...");
  boxes[1].points_to(boxes[2]).is_this_complete(0.3).says("More arrows!");
  boxes[5].points_to(boxes[9]).is_this_complete(0.9).says("Let's see how this looks");
});

