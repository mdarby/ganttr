/*

  Replace all *.length based for loops with while loops. Much faster!

*/



// Default class properties
Box.height                 = 12;
Box.color                  = "#939393";
Box.radius                 = Box.height / 6;
Box.area_height            = Box.height * 2;

Chart.top_space            = 150;
Chart.url                  = "/json"

Timeline.size              = 20;
Timeline.area_height       = (Timeline.size * 3) + (Box.height);
Timeline.today_color       = "#D1F3FF";

TimelineKey.task_width     = 360;
TimelineKey.resource_width = 60;
TimelineKey.dates_width    = 70;
TimelineKey.area_width     = 560;
TimelineKey.header_color   = "#BD0000";

CompletionBox.color        = "#DFDFDF";





Raphael.el.centerPoint = function(){
  var x = this.node.x.baseVal.value + (this.getBBox().width / 2);
  var y = this.node.y.baseVal.value + (this.getBBox().height / 2);
  return new Point(x,y);
}





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

  // Convert back to days and return (+1 for including the end Day)
  return Math.round(difference_ms/ONE_DAY) + 1;
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

Date.prototype.isWeekend = function(){
  return this.is().saturday() || this.is().sunday()
}





Array.prototype.last = function(){
  return this[this.length - 1];
}





function Arrow(start_box, end_box, canvas){
  this.from   = start_box;
  this.to     = end_box;
  this.canvas = canvas;

  if(this.from.start_date < this.to.start_date){
    new Line(this.from.bottomLeftPoint(), this.cruxPoint(), this.canvas).shape.toBack();
    new Line(this.cruxPoint(), this.to.leftCenterPoint(), this.canvas).shape.toBack();
    this.drawNib("East");

  } else if(this.from.start_date.equals(this.to.start_date)){
    new Line(this.from.bottomLeftPoint(), this.to.topLeftPoint(), this.canvas).shape.toBack();
    this.drawNib("South");
  }
}

Arrow.prototype.cruxPoint = function(){
  var x = this.from.bottomLeftPoint().x;
  var y = this.to.leftCenterPoint().y;

  return new Point(x, y);
}

Arrow.prototype.drawNib = function(direction){
  if(direction == "East"){
    var point = this.to.leftCenterPoint();
    var tip   = point.shift(-1, 0);
  } else if(direction == "South"){
    var point = this.to.topLeftPoint();
    var tip   = point.shift(0, -1);
  }

  var nib = new Triangle(tip, 3, direction, this.canvas);
  nib.shape.attr({fill: "#000"}).toBack();
}





function Box(options, chart){
  this.start_date     = Date.parse(options.start_date);
  this.end_date       = Date.parse(options.end_date);
  this.chart          = chart;
  this.label          = options.label;
  this.resource       = options.resource;
  this.start_day      = this.chart.timeline.dayAt(this.start_date);
  this.end_day        = this.chart.timeline.dayAt(this.end_date);
  this.num_days       = this.start_date.daysUntil(this.end_date);
  this.x              = this.start_day.topLeft().x;
  this.y              = Timeline.area_height + (Box.area_height * this.chart.numBoxes());
  this.w              = (this.start_date.daysUntil(this.end_date) * Timeline.size);
  this.h              = Box.height;
  this.canvas         = this.chart.canvas;
  this.shape          = this.draw();
  this.completion_box = new CompletionBox(this);

  this.says(this.label);
}

Box.prototype.draw = function(){
  var s = this.canvas.rect(this.x, this.y, this.w, this.h, Box.radius);
  s.attr({fill: Box.color, stroke: "#999"});

  return s;
}

Box.prototype.topLeftPoint = function(){
  var x = this.x + (Timeline.size / 2);
  var y = this.y;

  return new Point(x,y);
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
    new Arrow(this, this.chart.boxes[arr], this.canvas);
  } else {
    // This Arrow points to multiple Boxes
    var i = arr.length;

    while(i--){
      new Arrow(this, this.chart.boxes[arr[i]], this.canvas);
    }
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

  var i = this.num_days;

  while(i--){
    var s = this.start_date.clone();
    var d = s.add(i).days();

    if(d.equals(curr_date)){
      return i + 1;
    }
  }

}





function Chart(data, start_date, end_date){
  this.box_array  = data.boxes;
  this.arrow_array = data.arrows;

  this.start_date = Date.parse(start_date);
  this.end_date   = Date.parse(end_date);
  this.num_days   = this.start_date.daysUntil(this.end_date);
  this.height     = Timeline.area_height;
  this.width      = this.num_days * Timeline.size;
  this.canvas     = Raphael(TimelineKey.area_width, Chart.top_space, this.width, this.height);
  this.key        = new TimelineKey(this);
  this.timeline   = new Timeline(this);
  this.boxes      = new Array();

  this.draw();
}

Chart.prototype.draw = function(){
  for(var i=0; i<this.box_array.length; i++){
    this.appendBox(new Box(this.box_array[i], this));
  }

  this.drawArrows();
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
  this.key.resize();
}

Chart.prototype.drawArrows = function(){
  var i = this.arrow_array.length;

  while(i--){
    var curr_arrow = this.arrow_array[i];
    var from_box   = this.boxes[curr_arrow.from];

    from_box.pointsTo(curr_arrow.to);
  }

  // Loop through all TodayBoxes and resend them backwards
  // This keeps the visual order of Box > Arrow > TodayBox
  var i = this.timeline.today_boxes.length;

  while(i--){
    this.timeline.today_boxes[i].shape.toBack();
  }
}





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





function Day(x, y, label, date, canvas){
  this.x      = x;
  this.y      = y;
  this.canvas = canvas;
  this.date   = date;
  this.label  = label;
  this.shape  = null;

  this.draw();
}

Day.prototype.centerPoint = function(){
  var x = this.x + (Timeline.size / 2);
  var y = this.y + (Timeline.size / 2) + 2;

  return new Point(x,y);
}

Day.prototype.draw = function(){
  var p = this.centerPoint();

  // Draw the shape
  this.shape = this.canvas.rect(this.x, this.y, Timeline.size, Timeline.size);

  // Colorize it based on weekend status
  this.colorize();

  // Add the label
  this.canvas.text(p.x, p.y, this.label);
}

Day.prototype.colorize = function(){
  if(this.date.isWeekend()){
    this.shape.attr({fill: "#CCC"})
  } else {
    this.shape.attr({fill: "#EFEFEF"});
  }
}

Day.prototype.topLeft = function(){
  return new Point(this.x, this.y);
}





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
  this.shape.attr({"stroke-opacity": 0.06}).toBack();
}





function KeyCell(x, y, w, label, canvas){
  this.x      = x;
  this.y      = y;
  this.h      = Box.area_height;
  this.w      = w;
  this.l      = label;
  this.canvas = canvas;

  this.draw();
}

KeyCell.prototype.draw = function(){
  this.box = this.canvas.rect(this.x, this.y, this.w, this.h).attr("stroke", "#CCC");

  // Draw the label
  this.label = this.canvas.text(0, 0, this.l);

  var x = this.x + (this.label.getBBox().width / 2) + 4;
  var y = this.box.centerPoint().y + 1;

  // Move the label to the correct location
  this.label.translate(x, y);
}





function KeyHeader(x, y, w, label, canvas){
  this.x      = x;
  this.y      = y;
  this.h      = Timeline.size;
  this.w      = w;
  this.l      = label;
  this.canvas = canvas;

  this.draw();
}

KeyHeader.prototype.draw = function(){
  this.box = this.canvas.rect(this.x, this.y, this.w, this.h).attr("fill", TimelineKey.header_color);

  var p = this.box.centerPoint();

  this.label = this.canvas.text(p.x, p.y, this.l).attr("fill", "#FFF");
}





function KeyRow(box, key){
  this.box    = box;
  this.key    = key;
  this.canvas = this.key.canvas;

  this.draw();
}

KeyRow.prototype.draw = function(){
  var y = (this.key.chart.numBoxes() * Box.area_height) + (Timeline.size * 2);

  this.task_cell       = new KeyCell(0, y, TimelineKey.task_width, this.box.label, this.canvas);
  this.resource_cell   = new KeyCell(this.key.resource_x, y, TimelineKey.resource_width, this.box.resource, this.canvas);
  this.start_date_cell = new KeyCell(this.key.start_date_x, y, TimelineKey.dates_width, this.box.start_date.formattedString(), this.canvas);
  this.end_date_cell   = new KeyCell(this.key.end_date_x, y, TimelineKey.dates_width, this.box.end_date.formattedString(), this.canvas);
}





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





function Month(x, w, label, canvas){
  this.x       = x * Timeline.size;
  this.w       = w * Timeline.size;
  this.label   = label;
  this.label_x = this.x + (this.w / 2);
  this.canvas  = canvas;

  this.draw();
}

Month.prototype.draw = function(){
  this.canvas.rect(this.x, -1, this.w, Timeline.size + 1).attr({fill: "#BD0000", stroke: "#000"});
  this.canvas.text(this.label_x, (Timeline.size / 2) + 1, this.label).attr({fill: "#FFF"});
}





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





function Timeline(chart){
  this.chart       = chart;
  this.start_date  = this.chart.start_date;
  this.end_date    = this.chart.end_date;
  this.num_days    = this.start_date.daysUntil(this.end_date);
  this.canvas      = this.chart.canvas;

  // We have to deal with multiple GridLines and TodayBoxes
  // as Raphael's scale function sucks. It's far easier to
  // insert a new line/rect than to lengthen an existing one.
  this.gridlines   = new Array();
  this.today_boxes = new Array();

  this.draw();
}

Timeline.prototype.draw = function(){
  this.months = this.drawMonths();
  this.days   = this.drawDays();

  this.drawDateBoxes();
  this.drawDayGrid();
}

Timeline.prototype.drawMonths = function(){
  var months     = new Array();
  var start_date = this.chart.start_date;
  var end_date   = this.chart.end_date;
  var num_months = start_date.monthsUntil(end_date);
  var offset     = 0;

  for(var i=0; i<num_months; i++){
    var curr_month = start_date.clone().add(i).months();
    var eom        = curr_month.clone().moveToLastDayOfMonth();
    var num_days   = curr_month.daysUntil(eom);

    months.push(new Month(offset, num_days, curr_month, this.canvas));

    offset += num_days;
  }

  return months;
}

Timeline.prototype.drawDays = function(){
  var days     = new Array();
  var day_abbr = new Array("S","M","T","W","T","F","S");
  var y        = Timeline.size;

  for(var i=0; i<this.num_days; i++){
    var x = i * Timeline.size;
    var s = this.start_date.clone();
    var d = s.add(i).days();

    days.push(new Day(x, y, day_abbr[i%7], d, this.canvas));
  }

  return days;
}

Timeline.prototype.dayAt = function(date){
  var i = this.days.length;

  while(i--){
    var curr_day = this.days[i].date;

    if(curr_day.equals(date)){
      return this.days[i];
    }
  }
}

Timeline.prototype.drawDayGrid = function(){
  for(var i=0; i<this.num_days; i++){
    var day = this.days[i];
    var x   = day.topLeft().x;
    var y   = this.chart.height - Box.area_height;

    // Highlight the current day
    if(day.date.equals(Date.today())){
      this.today_boxes.push(new TodayBox(x, y, this.chart));
    }

    this.gridlines.push(new GridLine(x, y, this.chart));
  }
}

Timeline.prototype.drawDateBoxes = function(){
  var y = (Timeline.size * 2);

  for(var i=0; i<this.num_days; i++){
    var x = i * Timeline.size;
    var s = this.start_date.clone();
    var d = s.add(i).days();

    new Day(x, y, d.getDate(), d, this.canvas);
  }
}





function TimelineKey(chart){
  this.chart  = chart;
  this.height = this.chart.height;
  this.width  = TimelineKey.area_width;
  this.canvas = new Raphael(0, Chart.top_space, this.width, this.height);
  this.rows   = new Array();

  this.resource_x   = TimelineKey.task_width;
  this.start_date_x = (this.resource_x + TimelineKey.dates_width - 10); // Why the 10px space??
  this.end_date_x   = (this.start_date_x + TimelineKey.dates_width);

  this.draw();
}

TimelineKey.prototype.draw = function(){
  this.drawTheAbyss();
  this.drawHeaders();
}

TimelineKey.prototype.drawTheAbyss = function(){
  this.abyss = this.canvas.rect(0, 0, TimelineKey.area_width, (Timeline.size * 2)).attr({fill: "#DDD", stroke: "#DDD"});
}

TimelineKey.prototype.drawHeaders = function(){
  var y = Timeline.size * 2;

  this.task_call       = new KeyHeader(0, y, TimelineKey.task_width, "Task", this.canvas);
  this.resource_cell   = new KeyHeader(this.resource_x, y, TimelineKey.resource_width, "Resource", this.canvas);
  this.start_date_cell = new KeyHeader(this.start_date_x, y, TimelineKey.dates_width, "Start Date", this.canvas);
  this.end_date_cell   = new KeyHeader(this.end_date_x, y, TimelineKey.dates_width, "End Date", this.canvas);
}

TimelineKey.prototype.drawRow = function(){
  var box = this.chart.boxes.last();
  this.rows.push(new KeyRow(box, this));
}

TimelineKey.prototype.resize = function(){
  this.height = this.chart.height;
  this.canvas.setSize(this.width, this.height);
  this.drawRow();
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
  this.shape.attr({fill: Timeline.today_color, stroke: 0}).toBack();
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





function interrogate(obj){
  var output = '';
  for(var m in obj){
    output += m + ', ';
  }
  alert(output);
}





function loadChart(){
  $("svg").remove();

  $.getJSON(Chart.url,
    function(data){
      new Chart(data, "Nov 1, 2009", "Dec 31, 2009");
    }
  );

}





$(document).ready(function(){
});
