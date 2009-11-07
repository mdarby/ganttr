// Default class properties
Box.height      = 12;
Box.offset      = Box.height * 2;
Box.radius      = Box.height / 6;
Box.color       = "#939393";
Box.gradient    = "0-"+ Box.color +"-#FFF";
Timeline.height = 20;



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

Date.prototype.formattedString = function(){
  return this.getMonth() +"/"+ this.getDate() +"/"+ this.getFullYear();
}

Date.prototype.peek = function(label){
  alert(label +": "+ this.formattedString());
}



// Chart class
function Chart(start_date, end_date){
  this.start_date = start_date;
  this.end_date   = end_date;
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.height     = (Timeline.height * 3) + (this.numBoxes * (Box.height + Box.offset));
  this.width      = this.num_days * Timeline.height;
  this.canvas     = Raphael(0, 0, this.width, this.height);
  this.timeline   = new Timeline(this);
  this.boxes      = new Array();
}

Chart.prototype.appendBox = function(box){
  this.boxes[this.boxes.length] = box;
}

Chart.prototype.numBoxes = function(){
  return this.boxes.length
}



// Timeline class
function Timeline(chart){
  this.chart      = chart;
  this.start_date = this.chart.start_date;
  this.end_date   = this.chart.end_date;
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.canvas     = this.chart.canvas;
  this.months     = this.drawMonths();
  this.days       = this.drawDays();
}

Timeline.prototype.drawMonths = function(){
  var months      = new Array();
  var start_date  = this.chart.start_date;
  var end_date    = this.chart.end_date;
  var num_months  = start_date.monthsUntil(end_date);
  var month_width = this.chart.width / num_months;

  for(i=0; i<num_months; i++){
    var curr_date = start_date.add(i).months();
    var x = (i * month_width);

    months[i] = new Month(x, Timeline.height, month_width, curr_date, this.canvas);
  }

  return months;
}

Timeline.prototype.drawDays = function(){
  var days = new Array();
  var y    = Timeline.height;

  for(i=0; i<this.num_days; i++){
    var x = i * Timeline.height;
    var s = this.start_date.clone();
    var d = s.add(i).days();

    days[i] = new Day(x, y, d, this.canvas);
  }

  return days;
}

Timeline.prototype.dayAt = function(date){
  for(i=0; i<this.days.length; i++){
    var curr_day = this.days[i].date;

    if(curr_day.formattedString() == date.formattedString()){
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
  this.canvas.rect(this.x, -1, this.w, Timeline.height + 1).attr({fill: "#BD0000", stroke: "#FFF"});
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

Day.prototype.centerPoint = function(){
  var x = this.x + (Timeline.height / 2);
  var y = this.y + (Timeline.height / 2) + 2;

  return new Point(x,y);
}

Day.prototype.draw = function(){
  var p = this.centerPoint();

  this.shape = this.canvas.rect(this.x, this.y, Timeline.height, Timeline.height).attr({fill: "#efefef"});
  this.canvas.text(p.x, p.y, this.label);


}

Day.prototype.topLeft = function(){
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
  this.start_day  = chart.timeline.dayAt(start_date);
  this.end_day    = chart.timeline.dayAt(end_date);
  this.x          = this.start_day.topLeft().x;
  this.y          = (Timeline.height * 3) + (Box.offset * this.chart.numBoxes());
  this.w          = (start_date.daysUntil(end_date) * Timeline.height) + Timeline.height;
  this.h          = Box.height;
  this.canvas     = chart.canvas;
  this.shape      = this.canvas.rect(this.x, this.y, this.w, this.h, Box.radius);

  this.shape.attr({fill: Box.color, stroke: "#999"});

  this.chart.appendBox(this);
}

Box.prototype.bottomLeftPoint = function(){
  var x = this.x + Box.height;
  var y = this.y + this.shape.getBBox().height;

  return new Point(x,y);
}

Box.prototype.leftCenterPoint = function(){
  var y = this.y + (this.shape.getBBox().height / 2);

  return new Point(this.x, y);
}

Box.prototype.rightCenterPoint = function(){
  var x = this.x + this.shape.getBBox().width;
  var y = this.leftCenterPoint().y;

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
  var p      = this.rightCenterPoint();
  var t      = this.shape.paper.text(p.x, p.y, text);
  var offset = (t.getBBox().width / 2) + Box.height;

  t.translate(offset, 0).attr({fill: "#000"}).toFront;

  return this;
}

Box.prototype.isThisComplete = function(percentage){
  var x = this.x + 2;
  var y = this.y + 2;
  var h = Box.height - 4;
  var w = this.shape.getBBox().width * percentage;

  this.shape.paper.rect(x, y, w, h, Box.radius).attr({gradient: Box.gradient, "stroke-width": 0}).toFront();

  return this;
}



// Arrow class
function Arrow(start_box, end_box, canvas){
  this.from   = start_box;
  this.to     = end_box;
  this.canvas = canvas;

  var str = "";

  str = str.concat("M"+ this.from.bottomLeftPoint());
  str = str.concat("L"+ this.crux_point());
  str = str.concat("L"+ this.to.leftCenterPoint());

  this.canvas.path(str).toBack();
  this.nib();
}

Arrow.prototype.crux_point = function(){
  var x = this.from.bottomLeftPoint().x;
  var y = this.to.leftCenterPoint().y;

  return new Point(x, y);
}

Arrow.prototype.nib = function(){
  var point  = this.to.leftCenterPoint();
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
  b1.isThisComplete(0.9).says("ASDF");

  var b2 = new Box(box2[0], box2[1], chart);
  b2.isThisComplete(0.4).says("Working?");

  var b3 = new Box(box3[0], box3[1], chart);
  b3.isThisComplete(0.8).says("Whoa...");

  b1.points_to(b2);
  b2.points_to(b3);
});

