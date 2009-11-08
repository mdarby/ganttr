// Default class properties
Box.height           = 12;
Box.offset           = Box.height * 2;
Box.radius           = Box.height / 6;
Box.color            = "#939393";
Box.area_height      = Box.height + Box.offset;

Timeline.size        = 20;
Timeline.area_height = Timeline.size * 2;
Timeline.today_color = "#d1f3ff";

CompletionBox.color  = "#DFDFDF";



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
  var ONE_DAY = 1000 * 60 * 60 * 24;

  // Convert both dates to milliseconds
  var this_ms = this.getTime();
  var end_date_ms = end_date.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = Math.abs(this_ms - end_date_ms);

  // Convert back to days and return
  return Math.round(difference_ms/ONE_DAY);
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

Date.prototype.equals = function(other){
  return this.formattedString() == other.formattedString();
}



// Chart class
function Chart(start_date, end_date){
  this.start_date = start_date;
  this.end_date   = end_date;
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.height     = Timeline.area_height;
  this.width      = this.num_days * Timeline.size;
  this.canvas     = Raphael(0, 0, this.width, this.height);
  this.timeline   = new Timeline(this);
  this.boxes      = new Array();
}

Chart.prototype.appendBox = function(box){
  this.boxes.push(box);
  this.resize();
}

Chart.prototype.numBoxes = function(){
  return this.boxes.length;
}

Chart.prototype.resize = function(){
  this.height += Box.area_height;
  this.canvas.setSize(this.width, this.height);
  this.timeline.drawDayGrid();
}



// Timeline class
function Timeline(chart){
  this.chart      = chart;
  this.start_date = this.chart.start_date;
  this.end_date   = this.chart.end_date;
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.canvas     = this.chart.canvas;
  this.gridlines  = new Array();
  this.draw();
}

Timeline.prototype.draw = function(){
  this.months = this.drawMonths();
  this.days   = this.drawDays();

  this.drawDayGrid();
}

Timeline.prototype.drawMonths = function(){
  var months      = new Array();
  var start_date  = this.chart.start_date;
  var end_date    = this.chart.end_date;
  var num_months  = start_date.monthsUntil(end_date);
  var month_width = this.chart.width / num_months;

  for(i=0; i<num_months; i++){
    var s = start_date.clone();
    var c = s.add(i).months();
    var x = (i * month_width);

    months.push(new Month(x, Timeline.size, month_width, c, this.canvas));
  }

  return months;
}

Timeline.prototype.drawDays = function(){
  var days = new Array();
  var y    = Timeline.size;

  for(i=0; i<this.num_days; i++){
    var x = i * Timeline.size;
    var s = this.start_date.clone();
    var d = s.add(i).days();

    days.push(new Day(x, y, d, this.canvas));
  }

  return days;
}

Timeline.prototype.dayAt = function(date){
  for(i=0; i<this.days.length; i++){
    var curr_day = this.days[i].date;

    if(curr_day.equals(date)){
      return this.days[i];
    }
  }
}

Timeline.prototype.drawDayGrid = function(){
  for(i=0; i<this.num_days; i++){
    var day = this.days[i];
    var x   = day.topLeft().x;
    var y   = this.chart.height - Box.area_height;

    // Highlight the current day
    if(day.date.equals(Date.today())){
      this.today_box = new TodayBox(x, y, this.chart);
    }

    this.gridlines.push(new GridLine(x, y, this.chart));
  }
}



function TodayBox(x, y, chart){
  this.x      = x;
  this.y      = y;
  this.chart  = chart;
  this.canvas = this.chart.canvas;

  this.draw();
}

TodayBox.prototype.draw = function(){
  this.shape = this.canvas.rect(this.x, this.y, Timeline.size, this.chart.height);
  this.shape.attr({fill: Timeline.today_color, stroke: 0, opacity: 0.7}).toBack();
}



// GridLine class
function GridLine(x, y, chart){
  this.x      = x;
  this.y      = y;
  this.chart  = chart;
  this.canvas = this.chart.canvas;

  this.draw();
}

GridLine.prototype.draw = function(){
  var from  = new Point(this.x, this.y);
  var to    = new Point(this.x, this.y + Box.area_height);

  this.shape = new Line(from, to, this.canvas).shape;
  this.shape.attr({"stroke-dasharray": ". ", "stroke-opacity": 0.3}).toBack();
}



// Month class
function Month(x, y, w, label, canvas){
  this.x       = x;
  this.y       = y;
  this.w       = w;
  this.label   = label;
  this.label_x = this.x + (this.w / 2);
  this.canvas  = canvas;

  this.draw();
}

Month.prototype.draw = function(){
  this.canvas.rect(this.x, -1, this.w, Timeline.size + 1).attr({fill: "#BD0000", stroke: "#FFF"});
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
  var x = this.x + (Timeline.size / 2);
  var y = this.y + (Timeline.size / 2) + 2;

  return new Point(x,y);
}

Day.prototype.draw = function(){
  var p = this.centerPoint();

  this.shape = this.canvas.rect(this.x, this.y, Timeline.size, Timeline.size).attr({fill: "#efefef"});
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

  return this;
}



// Box class
function Box(start_date, end_date, chart){
  this.start_date = start_date;
  this.end_date   = end_date;
  this.chart      = chart;
  this.start_day  = this.chart.timeline.dayAt(start_date);
  this.end_day    = this.chart.timeline.dayAt(end_date);
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.x          = this.start_day.topLeft().x;
  this.y          = (Timeline.size * 3) + (Box.offset * this.chart.numBoxes());
  this.w          = (this.start_date.daysUntil(this.end_date) * Timeline.size) + Timeline.size;
  this.h          = Box.height;
  this.canvas     = this.chart.canvas;
  this.shape      = this.draw();

  new CompletionBox(this);

  this.chart.appendBox(this);
}

Box.prototype.draw = function(){
  var s = this.canvas.rect(this.x, this.y, this.w, this.h, Box.radius);
  s.attr({fill: Box.color, stroke: "#999"});

  return s;
}

Box.prototype.bottomLeftPoint = function(){
  var x = this.x + (Timeline.size / 2);
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

Box.prototype.pointsTo = function(arr){
  if(arr.length == undefined){
    arr = new Array(arr);
  }

  for(i=0; i < arr.length; i++){
    new Arrow(this, arr[i], this.canvas);
  }

  return this;
}

Box.prototype.says = function(text){
  var p      = this.rightCenterPoint();
  var t      = this.canvas.text(p.x, p.y, text);
  var offset = (t.getBBox().width / 2) + (Box.height / 2);

  t.translate(offset, 0).attr({fill: "#000"}).toFront();

  return this;
}

Box.prototype.daysCompleted = function(){
  var curr_date = Date.today();

  if(curr_date < this.start_date){
    return 0;
  }

  if(curr_date > this.end_date){
    return this.num_days;
  }

  for(i=0; i<this.num_days; i++){
    var s = this.start_date.clone();
    var d = s.add(i).days();

    if(d.equals(curr_date)){
      return i+1;
    }
  }

}



// CompletionBox class
function CompletionBox(box){
  this.box    = box;
  this.canvas = this.box.canvas;

  this.draw();
}

CompletionBox.prototype.draw = function(){
  var num_days = this.box.daysCompleted();

  if(num_days > 0){
    var x = this.box.x + 1;
    var y = this.box.y + 1;
    var h = Box.height - 2;
    var w = (num_days * Timeline.size) - 2;

    this.shape = this.canvas.rect(x, y, w, h, Box.radius)
    this.shape.attr({fill: CompletionBox.color, "stroke-width": 0}).toFront();
  }

  return this;
}



// Arrow class
function Arrow(start_box, end_box, canvas){
  this.from   = start_box;
  this.to     = end_box;
  this.canvas = canvas;

  new Line(this.from.bottomLeftPoint(), this.cruxPoint(), this.canvas);
  new Line(this.cruxPoint(), this.to.leftCenterPoint(), this.canvas);

  this.drawNib();
}

Arrow.prototype.cruxPoint = function(){
  var x = this.from.bottomLeftPoint().x;
  var y = this.to.leftCenterPoint().y;

  return new Point(x, y);
}

Arrow.prototype.drawNib = function(){
  var point  = this.to.leftCenterPoint();
  var tip    = point.shift(-2, 0);

  var nib = new Triangle(tip, 3, "East", this.canvas);
  nib.shape.attr({fill: "#000"}).toBack();
}



function Triangle(tip, side, direction, canvas){
  this.tip       = tip;
  this.side      = side;
  this.direction = direction;
  this.canvas    = canvas;

  this.draw();
}

Triangle.prototype.triangulate = function(){
  if(this.direction == "North"){
    this.point2 = this.tip.shift((this.side * -1), this.side);
    this.point3 = this.tip.shift(this.side, this.side);

  } else if(this.direction == "East"){
    this.point2 = this.tip.shift((this.side * -1), (this.side * -1));
    this.point3 = this.tip.shift((this.side * -1), this.side);

  } else if(this.direction == "South"){
    this.point2 = this.tip.shift((this.side * -1), (this.side * -1));
    this.point3 = this.tip.shift(this.side, (this.side * -1));

  } else if(this.direction == "West"){
    this.point2 = this.tip.shift(this.side, (this.side * -1));
    this.point3 = this.tip.shift(this.side, this.side);

  }
}

Triangle.prototype.draw = function(){
  this.triangulate();

  var str = "";
  str     = str.concat("M"+ this.tip);
  str     = str.concat("L"+ this.point2);
  str     = str.concat("L"+ this.point3);
  str     = str.concat("L"+ this.tip);

  this.shape = this.canvas.path(str);
}



// Line class
function Line(from, to, canvas){
  this.from   = from;
  this.to     = to;
  this.canvas = canvas;

  this.draw();
}

Line.prototype.draw = function(){
  var str = "";
  str     = str.concat("M"+ this.from);
  str     = str.concat("L"+ this.to);

  this.shape = this.canvas.path(str);
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
  var box2       = new Array(Date.parse("Nov 5, 2009"), Date.parse("Nov 17, 2009"));
  var box3       = new Array(Date.parse("Nov 15, 2009"), Date.parse("Nov 23, 2009"));
  var box4       = new Array(Date.parse("Nov 17, 2009"), Date.parse("Nov 25, 2009"));
  var box5       = new Array(Date.parse("Nov 17, 2009"), Date.parse("Dec 5, 2009"));
  var box6       = new Array(Date.parse("Dec 1, 2009"), Date.parse("Dec 14, 2009"));
  var box7       = new Array(Date.parse("Dec 3, 2009"), Date.parse("Dec 9, 2009"));

  var start_date = Date.parse("Nov 1, 2009");
  var end_date   = Date.parse("Dec 31, 2009");
  var chart      = new Chart(start_date, end_date);

  var b1 = new Box(box1[0], box1[1], chart).says("ASDF");
  var b2 = new Box(box2[0], box2[1], chart).says("Working?");
  var b3 = new Box(box3[0], box3[1], chart).says("Whoa...");
  var b4 = new Box(box4[0], box4[1], chart).says("Hrm");
  var b5 = new Box(box5[0], box5[1], chart).says("Long!");
  var b6 = new Box(box6[0], box6[1], chart).says("Oh yes!");
  var b7 = new Box(box7[0], box7[1], chart).says("Something");

  b1.pointsTo(b2);
  b2.pointsTo(b3);
  b3.pointsTo(b4);
  b3.pointsTo(b5);
  b5.pointsTo(b6);
  b6.pointsTo(b7);
});
