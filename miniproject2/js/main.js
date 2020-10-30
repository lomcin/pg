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

        // Poligonals
        this.PoligonalsCanvas = doc.getElementById('PoligonalsCanvas');
        this.PoligonalsContext2d = this.PoligonalsCanvas.getContext('2d');
        this.PoligonalsCanvasBuffer = doc.getElementById('PoligonalsCanvasBuffer');
        this.PoligonalsContext2dBuffer = this.PoligonalsCanvasBuffer.getContext('2d');
        
        // Curves
        this.CurveCanvas = doc.getElementById('CurveCanvas');
        this.CurveContext2d = this.CurveCanvas.getContext('2d');
        this.CurveCanvasBuffer = doc.getElementById('CurveCanvasBuffer');
        this.CurveContext2dBuffer = this.CurveCanvasBuffer.getContext('2d');

        // Control
        this.ControlCanvas = doc.getElementById('ControlCanvas');
        this.ControlContext2d = this.ControlCanvas.getContext('2d');
        this.ControlCanvasBuffer = doc.getElementById('ControlCanvasBuffer');
        this.ControlContext2dBuffer = this.ControlCanvasBuffer.getContext('2d');

        // All Canvas
        this.allCanvas = [  this.PoligonalsCanvas, this.PoligonalsCanvasBuffer,
                            this.CurveCanvas, this.CurveCanvasBuffer,
                            this.ControlCanvas, this.ControlCanvasBuffer];

        // Buttons
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
            this.parent.CurveCanvas.style.visibility = this.checked ? '' : 'hidden';
            this.parent.CurveCanvasBuffer.style.visibility = this.checked ? '' : 'hidden';
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    preparePoligonalsCheckbox() {
        this.poligonalsCheckbox.parent = this;
        this.poligonalsCheckbox.onchange = function (e) {
            this.parent.draw_poligonalControlPoints = this.checked;
            this.parent.PoligonalsCanvas.style.visibility = this.checked ? '' : 'hidden';
            this.parent.PoligonalsCanvasBuffer.style.visibility = this.checked ? '' : 'hidden';
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    prepareControlPointsCheckbox() {
        this.controlPointsCheckbox.parent = this;
        this.controlPointsCheckbox.onchange = function (e) {
            this.parent.draw_controlPoints = this.checked;
            this.parent.ControlCanvas.style.visibility = this.checked ? '' : 'hidden';
            this.parent.ControlCanvasBuffer.style.visibility = this.checked ? '' : 'hidden';
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    prepareCheckboxes() {
        this.prepareCurveCheckbox();
        this.preparePoligonalsCheckbox();
        this.prepareControlPointsCheckbox();
        this.curveCheckbox.checked = this.draw_curve;
        this.controlPointsCheckbox.checked = this.draw_controlPoints;
        this.poligonalsCheckbox.checked = this.draw_poligonalControlPoints;
    }
    drawCurve(ctx,curve) {
        if (curve == null) return;
        if (curve.points == null) return;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(curve.points[0].x,curve.points[0].y);
        for (var i = 1; i < curve.points.length; ++i) {
            ctx.lineTo(curve.points[i].x,curve.points[i].y);
        }
        ctx.stroke();
    }
    drawCurves(ctx) {
        for (var i = 0; i < this.curves.length; ++i) {
            this.drawCurve(ctx,this.curves[i]);
        }
    }
    drawPoligonalControlPoints(ctx,curve) {
        if (curve == null) return;
        if (curve.controlPoints == null) return;
        ctx.strokeStyle = '#0C0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(curve.controlPoints[0].x,curve.controlPoints[0].y);
        for (var i = 1; i < curve.controlPoints.length; ++i) {
            ctx.lineTo(curve.controlPoints[i].x,curve.controlPoints[i].y);
        }
        ctx.stroke();
    }
    drawControlPointsForCurve(ctx,curve) {
        if (curve == null) return;
        if (curve.controlPoints == null) return;
        ctx.strokeStyle = '#0C0';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#0C0';
        for (var i = 0; i < curve.controlPoints.length; ++i) {
            ctx.beginPath();
            ctx.arc(curve.controlPoints[i].x,curve.controlPoints[i].y, this.controlPointRadius, 0, this.TWOPI);
            ctx.stroke();
            ctx.fill();
        }
    }
    drawPoligonals(ctx) {
        for (var i = 0; i < this.curves.length; ++i) {
            this.drawPoligonalControlPoints(ctx,this.curves[i]);
        }
    }
    drawControlPoints(ctx) {
        for (var i = 0; i < this.curves.length; ++i) {
            this.drawControlPointsForCurve(ctx,this.curves[i]);
        }
    }
    drawCurrentCurve(ctx) {
        this.drawCurve(ctx,this.currentCurve);
    }
    draw(ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(500,500);
        ctx.lineTo(600,600);
        ctx.stroke();
    }
    clear(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
                if (this.draw_curve) {
                    this.clear(this.CurveContext2dBuffer);
                    this.drawCurves(this.CurveContext2dBuffer);
                }
                if (this.draw_controlPoints) {
                    this.clear(this.ControlContext2dBuffer);
                    this.drawControlPoints(this.ControlContext2dBuffer);
                }
                if (this.draw_poligonalControlPoints) {
                    this.clear(this.PoligonalsContext2dBuffer);
                    this.drawPoligonals(this.PoligonalsContext2dBuffer);
                }
                this.state = "nothing";
                break;
            case "updateCurrent":
                if (this.draw_curve) {
                    this.clear(this.CurveContext2d);
                    this.drawCurves(this.CurveContext2d);
                }
                if (this.draw_controlPoints) {
                    this.clear(this.ControlContext2d);
                    this.drawControlPoints(this.ControlContext2d);
                }
                if (this.draw_poligonalControlPoints) {
                    this.clear(this.PoligonalsContext2d);
                    this.drawPoligonals(this.PoligonalsContext2d);
                }
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
        this.allCanvas.forEach((c) => {
            console.log(c);
            c.width = document.body.clientWidth;
            c.height = document.body.clientHeight;
        });
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