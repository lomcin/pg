console.log('Main script loaded');

class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Dimensions {
    constructor(width,height) {
        this.width = width;
        this.height = height;
    }
}

class Rect {
    constructor(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get position() {
        return new Point(this.x,this.y);
    }
    get dimensions() {
        return new Dimensions(this.width,this.height);
    }
}

class BezierCurve {
    constructor() {
        this.controlPoints = new Array();
    }
    append(point) {
        this.controlPoints.push(point);
    }
}

class DeCasteljau {
    static interpolate(pa, pb, t) {
        return new Point(pa.x*(1-t) + pb.x*t,
                        pa.y*(1-t) + pb.y*t);
    }
    static process(controlPoints, t) {
        var oldLevel = controlPoints.slice(0,controlPoints.length);
        var actualLevel = new Array();
        while (oldLevel.length >= 2) {
            actualLevel = [];
            for (var i = 0; i < oldLevel.length-1; ++i) {
                actualLevel.push(this.interpolate(oldLevel[i], oldLevel[i+1],t));
            }
            oldLevel = actualLevel;
        }
        return actualLevel;
    }
}

class BezierApp {
    constructor(doc) {
        this.canvas = doc.getElementById('canvas');
        this.createButton = doc.getElementById('CreateCurve');
        this.deleteButton = doc.getElementById('DeleteCurve');
        this.curveList = doc.getElementById('CurveList');
        this.curves = new Array();
    }
}
var app = new BezierApp(document);
// console.log(app.canvas);
var p = new Point(3,4);
var pa = new Point(1,3);
var pb = new Point(3,5);
var d = new Dimensions(2,2);
var r = new Rect(p.x,p.y,d.width,d.height);

var c = new BezierCurve();
c.append();

var controlPoints = [pa,pb];
var pab = DeCasteljau.interpolate(pa,pb,0.1);
console.log(pab);

var pab2 = DeCasteljau.process(controlPoints,0.1);
console.log(pab2);