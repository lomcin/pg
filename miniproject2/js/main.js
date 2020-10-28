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
    static calcPoints(controlPoints, tvalues) {
        var points = new Array();
        for (var i = 0; i < tvalues.length; ++i) {
            points += DeCasteljau.process(controlPoints, tvalues[i]);
        }
        return points;
    }
}

class BezierCurve {
    constructor(controlPoints = null, tvalues = 2) {
        this.controlPoints = null;
        this._tvalues = null;
        this._points = null;
        this._updated = false;
    }
    get tvalues() {
        return this._tvalues;
    }
    set tvalues(val) {
        if (val < 1) {
            console.error('Invalid value for tvalues. Must be positive greater than zero.');
            return null;
        }
        this._tvalues = new Array();
        for (var i = 0; i < val; ++i) {
            this._tvalues.push(i/(val+1));
        }
    }
    append(point) {
        if (this.controlPoints == null) this.controlPoints = new Array();
        this.controlPoints.push(point);
        this._updated = false;
    }
    get points() {
        if (this._points == null || this._updated == false) {
            if (this._tvalues != null) {
                this._points = DeCasteljau.calcPoints(this.controlPoints,this._tvalues);
                this._updated = true;
            } else {
                console.warn("tvalues must be defined.");
            }
        }
        return this._points;
    }
    set points(a) {

    }

}

class BezierApp {
    constructor(doc) {
        this.canvas = doc.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.updateButton = doc.getElementById('Update');
        this.createButton = doc.getElementById('CreateCurve');
        this.deleteButton = doc.getElementById('DeleteCurve');
        this.curveList = doc.getElementById('CurveList');
        this.currentCurve = null;
        this.curves = new Array();
        this.state = "nothing";
        doc.body.app = this;
        doc.body.onresize = function (e) {
            this.app.resize();
        };
        doc.body.onload = function (e) {
            this.app.resize();
        };
        this.prepareButtons();
    }
    prepareCreateButton() {
        this.createButton.parent = this;
        this.createButton.onclick = function (e) {
            console.log(this.parent);
            console.log(this);
            if (this.parent.state == 'newCurve') {
                this.parent.state = 'nothing';
                this.classList.remove('active');
                this.parent.curves.push(this.parent.currentCurve);
                this.parent.currentCurve = null;
            } else {
                this.parent.state = 'newCurve';
                this.classList.add('active');
                this.parent.currentCurve = new BezierCurve();
            }
            this.parent.run();
        }
    }
    prepareUpdateButton() {
        this.updateButton.parent = this;
        this.updateButton.onclick = function (e) {
            this.parent.run();
            console.log('run');
        }
    }
    prepareButtons() {
        this.prepareCreateButton();
        this.prepareUpdateButton();
    }
    drawCurve(curve) {
        if (curve == null) return;
        if (curve.points == null) return;

        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(curve.points[0].x,curve.points[0].y);
        for (var i = 1; i < curve.points.length; ++i) {
            this.ctx.lineTo(curve.points[i].x,curve.points[i].y);
        }
        this.ctx.closePath();
    }
    drawCurves() {
        for (var i = 0; i < this.curves.length; ++i) {
            this.drawCurve(this.curves[i]);
        }
        this.drawCurrentCurve();
    }
    drawCurrentCurve() {
        this.drawCurve(this.currentCurve);
    }
    draw() {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(500,500);
        this.ctx.lineTo(600,600);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    run() {
        switch(this.state) {
            case "newCurve":
                document.body.style.cursor = 'cell';
                break;
            case "newControlPoint":
                document.body.style.cursor = 'crosshair';
                break;
            default:
            case "nothing":
                document.body.style.cursor = 'default';
                break;
        }
        this.drawCurves();
        this.draw();
    }
    resize() {
        console.log('resize')
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.run();
    }
}
var app = new BezierApp(document);
// console.log(app.canvas);
var p = new Point(3,4);
var pa = new Point(100,300);
var pb = new Point(300,500);
var d = new Dimensions(2,2);
var r = new Rect(p.x,p.y,d.width,d.height);

var c = new BezierCurve();
c.append(pa);
c.append(pb);
c.tvalues = 10;

var controlPoints = [pa,pb];
var pab = DeCasteljau.interpolate(pa,pb,0.1);
console.log(pab);

var pab2 = DeCasteljau.process(controlPoints,0.1);
console.log(pab2);

app.curves.push(c);

app.run();