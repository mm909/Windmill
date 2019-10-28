// Mikian Musser
// https://p5js.org/reference/

let dots = []
let lines = []
let windmill;
let numDots = 25;
let width = 500;
let height = 500;
let tolerance = 5
let speed = 0.01

function Dot(_x, _y) {
  this.count = 0;
  this.x = _x;
  this.y = _y;
  this.on = false;
  this.turnoff = true;
  this.show = function() {
    noStroke()
    if (this.on) {
      fill(100, 255, 100, 255 - this.count)
    } else {
      fill(255, 255, 255, 255 - this.count)
    }
    ellipse(this.x, this.y, 20)
  }

  this.checkoff = function(smallLine) {
    let x1 = floor(smallLine.x1);
    let y1 = floor(smallLine.y1);
    let x2 = floor(smallLine.x2);
    let y2 = floor(smallLine.y2);
    var m = (y1 - y2) / (x1 - x2)
    var n = y1 - m * x1
    if (this.turnoff) {
      if (!findCircleLineIntersections(tolerance + 2, this.x, this.y, m, n)) {
        this.on = false;
        this.turnoff = false;
      }
    }
  }

  this.update = function(smallLine) {
    if (!this.on && !this.removed) {
      let x1 = floor(smallLine.x1);
      let y1 = floor(smallLine.y1);
      let x2 = floor(smallLine.x2);
      let y2 = floor(smallLine.y2);
      let x3 = floor(this.x);
      let y3 = floor(this.y);
      var m = (y1 - y2) / (x1 - x2)
      var n = y1 - m * x1
      if (findCircleLineIntersections(tolerance, x3, y3, m, n)) {
        for (var i = 0; i < dots.length; i++) {
          if (dots[i].on) {
            dots[i].turnoff = true;
          }
        }
        this.found = true
        this.on = true;
        windmill.cx = this.x
        windmill.cy = this.y
        this.count = this.count + 15
        if (this.count > 250) {
          this.removed = true
        }
        // speed = speed * -1
        lines.push({
          x: windmill.cx,
          y: windmill.cy,
          r: windmill.r
        })
        windmill.update();
        return true
      }
    }
    return false;
  }
}

function Windmill(_x, _y) {
  this.cx = _x;
  this.cy = _y;
  this.x1 = _x;
  this.y1 = _y;
  this.x2 = _x;
  this.y2 = _y;
  this.l = floor(sqrt(width * width + height * height));
  this.r = 0;
  this.turn = speed
  this.show = function() {
    strokeWeight(5);
    stroke(200, 0, 100, 200);
    line(this.x1, this.y1, this.x2, this.y2);
  }
  this.update = function() {
    // (x1 + l * cos(ang), y1 + l * sin(ang))
    this.x1 = this.cx - this.l * cos(this.r)
    this.y1 = this.cy - this.l * sin(this.r)
    this.x2 = this.cx + this.l * cos(this.r)
    this.y2 = this.cy + this.l * sin(this.r)
  }
  this.rotate = function() {
    this.turn = speed
    this.r = this.r + this.turn;
    this.update();
  }
  this.smallLine = function() {
    let xy = {
      x1: this.cx - 200 * cos(this.r),
      y1: this.cy - 200 * sin(this.r),
      x2: this.cx + 200 * cos(this.r),
      y2: this.cy + 200 * sin(this.r)
    }
    return xy;
  }
  this.smallLinenow = function(line) {
    let xy = {
      x1: line.x - 200 * cos(line.r),
      y1: line.y - 200 * sin(line.r),
      x2: line.x + 200 * cos(line.r),
      y2: line.y + 200 * sin(line.r)
    }
    return xy;
  }
}

function setup() {
  width = windowWidth;
  height = windowHeight - 5;
  createCanvas(width, height);
  for (var i = 0; i < numDots; i++) {
    var rx = random(0, width)
    var ry = random(0, height)
    dots[i] = new Dot(rx, ry)
  }

  let picked = 0;
  let pickedDist = dist(dots[0].x, dots[0].y, width / 2, height / 2);
  if (i >= 1) {
    for (var i = 1; i < dots.length; i++) {
      if (dist(dots[i].x, dots[i].y, width / 2, height / 2) < pickedDist) {
        pickedDist = dist(dots[i].x, dots[i].y, width / 2, height / 2);
        picked = i
      }
    }
  }
  dots[picked].found = true;
  dots[picked].on = true;
  dots[picked].count = 1;
  windmill = new Windmill(dots[picked].x, dots[picked].y);
}

function draw() {
  background(0);
  windmill.rotate();
  for (var i = 0; i < dots.length; i++) {
    if (dots[i].update(windmill.smallLine())) {
      break;
    }
  }
  for (var i = 0; i < dots.length; i++) {
    dots[i].checkoff(windmill.smallLine());
    // if (dots[i].found) {
    dots[i].show();
    // }
  }
  windmill.show();
  for (var i = 0; i < lines.length; i++) {
    let xy = windmill.smallLinenow(lines[i])
    stroke(200, 100, 100, 75);
    line(xy.x1, xy.y1, xy.x2, xy.y2);
  }
}

// Scraped from somewhere
function findCircleLineIntersections(r, h, k, m, n) {
  // circle: (x - h)^2 + (y - k)^2 = r^2
  // line: y = m * x + n
  // r: circle radius
  // h: x value of circle centre
  // k: y value of circle centre
  // m: slope
  // n: y-intercept

  // get a, b, c values
  var a = 1 + sq(m);
  var b = -h * 2 + (m * (n - k)) * 2;
  var c = sq(h) + sq(n - k) - sq(r);

  // get discriminant
  var d = sq(b) - 4 * a * c;
  if (d >= 0) {
    // insert into quadratic formula
    var intersections = [
      (-b + sqrt(sq(b) - 4 * a * c)) / (2 * a),
      (-b - sqrt(sq(b) - 4 * a * c)) / (2 * a)
    ];
    if (d == 0) {
      // only 1 intersection
      return [intersections[0]];
    }
    return intersections;
  }
  // no intersection
  return false;
}