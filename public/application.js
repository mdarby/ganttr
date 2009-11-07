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

Date.prototype.fullString = function(){
  return this.getMonth() +"/"+ this.getDate() +"/"+ this.getFullYear();
}

Date.prototype.peek = function(label){
  alert(label +": "+ this.fullString());
}



// Chart class
function Chart(start_date, end_date){
  this.start_date = start_date;
  this.end_date   = end_date;
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.height     = (timeline_size * 3) + (this.num_boxes * (box_height + box_offset));
  this.width      = this.num_days * timeline_size;
  this.canvas     = Raphael(0, 0, this.width, this.height);
  this.timeline   = new Timeline(this);
  this.boxes      = new Array();
}

Chart.prototype.append_box = function(box){
  this.boxes[this.boxes.length] = box;
}

Chart.prototype.num_boxes = function(){
  return this.boxes.length
}



// Timeline class
function Timeline(chart){
  this.chart      = chart;
  this.start_date = this.chart.start_date;
  this.end_date   = this.chart.end_date;
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.canvas     = this.chart.canvas;
  this.months     = this.draw_months();
  this.days       = this.draw_days();
}

Timeline.prototype.draw_months = function(){
  var months      = new Array();
  var start_date  = this.chart.start_date;
  var end_date    = this.chart.end_date;
  var num_months  = start_date.monthsUntil(end_date);
  var month_width = this.chart.width / num_months;

  for(i=0; i<num_months; i++){
    var curr_date = start_date.add(i).months();
    var x = (i * month_width);

    months[i] = new Month(x, timeline_size, month_width, curr_date, this.canvas);
  }

  return months;
}

Timeline.prototype.draw_days = function(){
  var days = new Array();
  var y    = timeline_size;

  for(i=0; i<this.num_days; i++){
    var x = i * timeline_size;
    var s = this.start_date.clone();
    var d = s.add(i).days();

    days[i] = new Day(x, y, d, this.canvas);
  }

  return days;
}

Timeline.prototype.day_at = function(date){
  for(i=0; i<this.days.length; i++){
    var curr_day = this.days[i].date;

    if(curr_day.fullString() == date.fullString()){
      return this.days[i];
    }
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

  this.draw();
}

Month.prototype.draw = function(){
  this.canvas.rect(this.x, -1, this.w, timeline_size + 1).attr({fill: "#BD0000", stroke: "#FFF"});
  this.canvas.text(this.label_x, this.y / 2, this.label).attr({fill: "#FFF"});
}



// Day class
function Day(x, y, date, canvas){
  this.x        = x;
  this.y        = y;
  this.date     = date;
  this.canvas   = canvas;
  this.day_abbr = new Array("S","M","T","W","T","F","S");
  this.label    = this.day_abbr[i%7];
  this.shape    = null;

  this.draw();
}

Day.prototype.center_point = function(){
  var x = this.x + (timeline_size / 2);
  var y = this.y + (timeline_size / 2) + 2;

  return new Point(x,y);
}

Day.prototype.draw = function(){
  var p = this.center_point();

  this.shape = this.canvas.rect(this.x, this.y, timeline_size, timeline_size).attr({fill: "#efefef"});
  this.canvas.text(p.x, p.y, this.label);


}

Day.prototype.top_left = function(){
  return new Point(this.x, this.y);
}



// Point class
function Point(x,y){
  this.x = parseInt(x);
  this.y = parseInt(y);
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


}



// Box class
function Box(start_date, end_date, chart){
  this.start_date = start_date;
  this.end_date   = end_date;
  this.chart      = chart;
  this.start_day  = chart.timeline.day_at(start_date);
  this.end_day    = chart.timeline.day_at(end_date);
  this.x          = this.start_day.top_left().x;
  this.y          = (timeline_size * 3) + (box_offset * this.chart.num_boxes());
  this.w          = (start_date.daysUntil(end_date) * timeline_size) + timeline_size;
  this.h          = box_height;
  this.canvas     = chart.canvas;
  this.shape      = this.canvas.rect(this.x, this.y, this.w, this.h, box_radius);

  this.shape.attr({fill: box_color, stroke: "#999"});

  this.chart.append_box(this);
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
  var box1       = new Array(Date.parse("Nov 3, 2009"), Date.parse("Nov 12, 2009"));
  var box2       = new Array(Date.parse("Nov 10, 2009"), Date.parse("Nov 17, 2009"));
  var box3       = new Array(Date.parse("Nov 15, 2009"), Date.parse("Nov 23, 2009"));

  var start_date = Date.parse("Nov 1, 2009");
  var end_date   = Date.parse("Nov 30, 2009");
  var chart      = new Chart(start_date, end_date);

  var b1 = new Box(box1[0], box1[1], chart);
  b1.is_this_complete(0.9).says("ASDF");

  var b2 = new Box(box2[0], box2[1], chart);
  b2.is_this_complete(0.4).says("Working?");

  var b3 = new Box(box3[0], box3[1], chart);
  b3.is_this_complete(0.8).says("Whoa...");

  b1.points_to(b2);
  b2.points_to(b3);
});

