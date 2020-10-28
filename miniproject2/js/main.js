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
            points.push(DeCasteljau.process(controlPoints, tvalues[i])[0]);
        }
        return points;
    }
}

class BezierCurve {
    constructor(controlPoints = null) {
        this.controlPoints = controlPoints;
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
            this._tvalues.push(i/(val-1));
        }
        this._updated = false;
    }
    append(point) {
        if (this.controlPoints == null) this.controlPoints = new Array();
        this.controlPoints.push(point);
        this._updated = false;
    }
    get points() {
        if (this._points == null || this._updated == false) {
            if (this.tvalues != null) {
                this._points = DeCasteljau.calcPoints(this.controlPoints,this.tvalues);
                this._updated = true;
            } else {
                console.warn("tvalues must be defined.");
                return null;
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

        this.curveCheckbox = doc.getElementById('CurveCheckbox');
        this.poligonalsCheckbox = doc.getElementById('PoligonalsCheckbox');
        this.controlPointsCheckbox = doc.getElementById('ControlPointsCheckbox');

        this.currentCurve = null;
        this.draw_controlPoints = true;
        this.draw_poligonalControlPoints = true;
        this.draw_curve = true;
        this.curves = new Array();
        this.mouse = new Point(-1,-1);
        this.state = "nothing";
        this.TWOPI = 2 * Math.PI;
        this.controlPointRadius = 4;
        doc.body.app = this;
        doc.body.onresize = function (e) {
        };
        doc.body.onload = function (e) {
            this.app.resize();
            this.app.state = "updateAll";
            this.app.run();
        };
        doc.body.onmousemove = function (e) {
            this.app.mouse.x = e.clientX;
            this.app.mouse.y = e.clientY;
        };
        this.prepareButtons();
        this.prepareCheckboxes();
    }
    prepareCreateButton() {
        this.createButton.parent = this;
        this.createButton.onclick = function (e) {
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
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    prepareButtons() {
        this.prepareCreateButton();
        this.prepareUpdateButton();
    }
    prepareCurveCheckbox() {
        this.curveCheckbox.parent = this;
        this.curveCheckbox.onchange = function (e) {
            this.parent.draw_curve = this.checked;
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    preparePoligonalsCheckbox() {
        this.poligonalsCheckbox.parent = this;
        this.poligonalsCheckbox.onchange = function (e) {
            this.parent.draw_poligonalControlPoints = this.checked;
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    prepareControlPointsCheckbox() {
        this.controlPointsCheckbox.parent = this;
        this.controlPointsCheckbox.onchange = function (e) {
            this.parent.draw_controlPoints = this.checked;
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    prepareCheckboxes() {
        this.prepareCurveCheckbox();
        this.preparePoligonalsCheckbox();
        this.prepareControlPointsCheckbox();
        this.draw_curve = this.curveCheckbox.checked;
        this.draw_controlPoints = this.controlPointsCheckbox.checked;
        this.draw_poligonalControlPoints = this.poligonalsCheckbox.checked;
    }
    drawCurve(curve) {
        if (curve == null) return;
        if (curve.points == null) return;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(curve.points[0].x,curve.points[0].y);
        for (var i = 1; i < curve.points.length; ++i) {
            this.ctx.lineTo(curve.points[i].x,curve.points[i].y);
        }
        this.ctx.stroke();
    }
    drawCurves() {
        for (var i = 0; i < this.curves.length; ++i) {
            this.drawCurve(this.curves[i]);
        }
        this.drawCurrentCurve();
    }
    drawPoligonalControlPoints(curve) {
        if (curve == null) return;
        if (curve.controlPoints == null) return;
        this.ctx.strokeStyle = '#0C0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(curve.controlPoints[0].x,curve.controlPoints[0].y);
        for (var i = 1; i < curve.controlPoints.length; ++i) {
            this.ctx.lineTo(curve.controlPoints[i].x,curve.controlPoints[i].y);
        }
        this.ctx.stroke();
    }
    drawControlPointsForCurve(curve) {
        if (curve == null) return;
        if (curve.controlPoints == null) return;
        this.ctx.strokeStyle = '#0C0';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#0C0';
        for (var i = 0; i < curve.controlPoints.length; ++i) {
            this.ctx.beginPath();
            this.ctx.arc(curve.controlPoints[i].x,curve.controlPoints[i].y, this.controlPointRadius, 0, this.TWOPI);
            this.ctx.stroke();
            this.ctx.fill();
        }
    }
    drawPoligonals(curve) {
        for (var i = 0; i < this.curves.length; ++i) {
            this.drawPoligonalControlPoints(this.curves[i]);
        }
    }
    drawControlPoints(curve) {
        for (var i = 0; i < this.curves.length; ++i) {
            this.drawControlPointsForCurve(this.curves[i]);
        }
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
        this.ctx.stroke();
    }
    clear() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    run() {
        var stop = false;
        console.log('run: ' + this.state);
        switch(this.state) {
            case "newCurve":
                document.body.style.cursor = 'cell';
                stop = true;
                break;
            case "newControlPoint":
                document.body.style.cursor = 'crosshair';
                stop = true;
                break;
            case "updateAll":
                this.clear();
                if (this.draw_curve) this.drawCurves();
                if (this.draw_controlPoints) this.drawControlPoints();
                if (this.draw_poligonalControlPoints) this.drawPoligonals();
                this.draw();
                this.state = "nothing";
                break;
            default:
            case "nothing":
                document.body.style.cursor = 'default';
                stop = true;
                break;
        }
        if (!stop) {
            setTimeout(()=>{this.run();},1);
        }
    }
    resize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }
}
var app = new BezierApp(document);
// console.log(app.canvas);
var p = new Point(3,4);
var pa = new Point(100,300);
var pb = new Point(300,500);
var d = new Dimensions(2,2);
var r = new Rect(p.x,p.y,d.width,d.height);

var controlPoints = [pa,pb];
var pab = DeCasteljau.interpolate(pa,pb,0.1);
console.log(pab);

var pab2 = DeCasteljau.process(controlPoints,0.1);
console.log(pab2);


var c = new BezierCurve(controlPoints);
c.tvalues = 7;
c.append(new Point(400,200));
var pab3 = DeCasteljau.calcPoints(c.controlPoints,c.tvalues);
console.log('pab3');
console.log(pab3);
app.curves.push(c);

app.run();