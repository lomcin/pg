console.log('Main script loaded');

class Point {
    constructor(x,y, parent = null) {
        this._x = x;
        this._y = y;
        this._parent = parent;
    }
    get x() {
        return this._x;
    }
    set x(val) {
        this._x = val;
        this.outdate();
    }
    get y() {
        return this._y;
    }
    set y(val) {
        this._y = val;
        this.outdate();
    }
    get parent() {
        return this._parent;
    }
    set parent(val) {
        this._parent = val;
        if (this._parent != null) this._parent.outdate();
    }  
    outdate() {
        if (this._parent != null) {
            this._parent.outdate();
        }
    }
    distance2Point(p) {
        return this.distance2Coord(p.x,p.y);
    }
    distance2Coord(x, y) {
        var dx = x - this._x;
        var dy = y - this._y;
        return Math.sqrt(dx*dx + dy*dy);
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
        var actualLevel = new Array();
        if (controlPoints != null) {
            var oldLevel = controlPoints.slice(0,controlPoints.length);
            while (oldLevel.length >= 2) {
                actualLevel = [];
                for (var i = 0; i < oldLevel.length-1; ++i) {
                    actualLevel.push(this.interpolate(oldLevel[i], oldLevel[i+1],t));
                }
                oldLevel = actualLevel;
            }
        }
        return actualLevel;
    }
    static calcPoints(controlPoints, tvalues) {
        var points = new Array();
        if (controlPoints != null && controlPoints.length > 1) {
            for (var i = 0; i < tvalues.length; ++i) {
                points.push(DeCasteljau.process(controlPoints, tvalues[i])[0]);
            }
        } else return null;
        return points;
    }
}

class BezierCurve {
    constructor(controlPoints = null) {
        this.controlPoints = controlPoints;
        this._tvalues = null;
        this._points = null;
        this._updated = false;
        this._updateControlPoints();
    }
    _updateControlPoints() {
        if (this.controlPoints) {
            var counter = 0;
            this.controlPoints.forEach((p) => {
                p.parent = this;
                p.id = counter++;
            });
        }
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
        point.parent = this;
        point.id = this.controlPoints.length;
        this.controlPoints.push(point);
        this.outdate();
    }
    remove(point) {
        this.controlPoints.splice(point.id,1);
        this.outdate();
    }
    outdate() {
        this._updated = false;
    }
    get points() {
        if (this._points == null || this._updated == false) {
            if (this.tvalues != null) {
                this._updateControlPoints();
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

        // Curve samples
        this.Number = doc.getElementById('Number');
        this.Points = doc.getElementById('Points');
        
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
        this.canvas = doc.getElementsByClassName('canvas')[0];
        this.menu = doc.getElementsByClassName('menu')[0];
        this.menu.onselect = (e) => {
            e.preventDefault();
        };
        // this.canvas = this.ControlCanvasBuffer;
        
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

        this.ControlPointsDisabledColor = '#090';
        this.ControlPointsEnabledColor = '#0C0';

        this.currentCurve = null;
        this.draw_controlPoints = true;
        this.draw_poligonalControlPoints = true;
        this.draw_curve = true;
        this.curves = new Array();
        this.mouse = new Point(-1,-1);
        this.state = "nothing";
        this.TWOPI = 2 * Math.PI;
        this.controlPointRadius = 5;
        this.isHoveringCanvas = false;
        doc.body.app = this;
        doc.body.onresize = function (e) {
        };
        doc.body.onload = function (e) {
            this.app.resize();
            this.app.state = "updateAll";
            this.app.run();
        };
        doc.body.onmousemove = function (e) {
            // e.preventDefault();
            this.app.mouseMove(e);
        };
        this.canvas.onmouseover = function (e) {
            this.app.isHoveringCanvas = true;
        };
        this.canvas.onmouseout = function (e) {
            this.app.isHoveringCanvas = false;
        };
        doc.body.onmousedown = function (e) {
            this.app.canvas.onselect = (e) => {
                e.preventDefault();
            };
            // if (this.app.isHoveringCanvas) {
                // e.preventDefault();
                this.app.mouseDown(e);
            // } else {

            // }
        };
        doc.body.onmouseup = doc.body.onmouseup = function (e) {
            // e.preventDefault();
            this.app.canvas.onselect = null;
            this.app.mouseUp(e);
        };
        this.Points.app = this;
        this.Number.app = this;
        this.Points.onchange = function (e) {
            if (this.app.currentCurve != null) {
                this.app.currentCurve.tvalues = e.target.value;
                this.app.run('updateAll',stop=true);
            }
        };
        this.prepareButtons();
        this.prepareCheckboxes();
    }
    createCurveToggle(e=this) {
        if (e.state == 'newCurve') {
            e.state = 'nothing';
            // e.currentCurve = null;
        } else {
            e.state = 'newCurve';
            e.currentCurve = new BezierCurve();
            e.currentCurve.tvalues = e.Points.value;
            e.appendCurve(e.currentCurve);
        }
        e.run();
    }
    prepareCreateButton() {
        this.createButton.parent = this;
        this.createButton.onclick = (e) => {
            e.target.parent.createCurveToggle(e.target.parent)
        };
    }
    prepareUpdateButton() {
        this.updateButton.parent = this;
        this.updateButton.onclick = function (e) {
            this.parent.state = "updateAll";
            this.parent.run();
        }
    }
    appendCurve(curve) {
        curve.id = this.curves.length;
        this.curves.push(curve);
    }
    removeCurve(curve) {
        if (curve != null) {
            console.log('remove: ' , curve.id);
            this.curves.splice(curve.id,1);
            for (var i = 0; i < this.curves.length; ++i) {
                this.curves[i].id = i;
            }
        }
    }
    removeCurrentCurve() {
        this.removeCurve(this.currentCurve);
        this.currentCurve = null;
    }
    prepareDeleteButton() {
        this.deleteButton.parent = this;
        this.deleteButton.onclick = function (e) {
            this.parent.removeCurrentCurve();
            this.parent.state = "updateAll";
            this.parent.run();
        }

    }
    prepareButtons() {
        this.prepareCreateButton();
        this.prepareDeleteButton();
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
        if (curve.points.length == 0) return;
        ctx.strokeStyle = (curve === this.currentCurve ? '#000' : '#000');
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
            if (this.curves[i] === this.currentCurve) continue;
            this.drawCurve(ctx,this.curves[i]);
        }
    }
    drawPoligonalControlPoints(ctx,curve) {
        if (curve == null) return;
        if (curve.controlPoints == null) return;
        if (curve.controlPoints.length == 0) return;
        ctx.strokeStyle = (curve === this.currentCurve ? this.ControlPointsEnabledColor : this.ControlPointsDisabledColor);
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
        if (curve.controlPoints.length == 0) return;
        ctx.strokeStyle = (curve === this.currentCurve ? this.ControlPointsEnabledColor : this.ControlPointsDisabledColor);
        ctx.lineWidth = 1;
        ctx.fillStyle = (curve === this.currentCurve ? this.ControlPointsEnabledColor : this.ControlPointsDisabledColor);
        for (var i = 0; i < curve.controlPoints.length; ++i) {
            ctx.beginPath();
            ctx.arc(curve.controlPoints[i].x,curve.controlPoints[i].y, this.controlPointRadius, 0, this.TWOPI);
            ctx.stroke();
            ctx.fill();
        }
    }
    drawPoligonals(ctx) {
        for (var i = 0; i < this.curves.length; ++i) {
            if (this.curves[i] === this.currentCurve) continue;
            this.drawPoligonalControlPoints(ctx,this.curves[i]);
        }
    }
    drawControlPoints(ctx) {
        for (var i = 0; i < this.curves.length; ++i) {
            if (this.curves[i] === this.currentCurve) continue;
            this.drawControlPointsForCurve(ctx,this.curves[i]);
        }
    }
    drawCurrentCurve(ctx) {
        this.drawCurve(ctx, this.currentCurve);
    }
    drawCurrentPoligonals(ctx) {
        this.drawPoligonalControlPoints(ctx, this.currentCurve);
    }
    drawCurrentControlPoints(ctx) {
        this.drawControlPointsForCurve(ctx, this.currentCurve);
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
    updateAll() {
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
    }
    updateCurrent() {
        if (this.draw_curve) {
            this.clear(this.CurveContext2d);
            this.drawCurrentCurve(this.CurveContext2d);
        }
        if (this.draw_controlPoints) {
            this.clear(this.ControlContext2d);
            this.drawCurrentControlPoints(this.ControlContext2d);
        }
        if (this.draw_poligonalControlPoints) {
            this.clear(this.PoligonalsContext2d);
            this.drawCurrentPoligonals(this.PoligonalsContext2d);
        }
    }
    run(state=null,stop=false) {
        if (state != null) this.state = state;
        // console.log('run: ' + this.state);
        switch(this.state) {
            case "newCurve":
                this.Cursor('cell');
                this.createButton.classList.add('active');
                stop = true;
                break;
            case "newControlPoint":
                this.Cursor('crosshair');
                stop = true;
                break;
            case "updateAll":
                this.updateAll();
                this.updateCurrent();
                this.state = "nothing";
                break;
            case "updateCurrent":
                this.updateCurrent();
                this.state = "nothing";
                break;
            default:
            case "nothing":
                // this.Cursor();
                this.createButton.classList.remove('active');
                stop = true;
                break;
        }
        if (!stop) {
            setTimeout(()=>{this.run();},1);
        }
    }
    checkCollision(x, y, type='controlPoint') {
        // Checking "collision"
        var rp = null;
        this.curves.forEach((c) => {
            if (c.controlPoints) {
                if (type == 'controlPoint') {
                    c.controlPoints.forEach((p) => {
                        if (this.controlPointRadius >= p.distance2Coord(x,y)) {
                            rp = p;
                        }
                    })
                } else if (type == 'curvePoint') {
                    c.points.forEach((p) => {
                        if (this.controlPointRadius >= p.distance2Coord(x,y)) {
                            rp = p;
                        }
                    })
                }
            }
        })
        return rp;
    }
    checkInsideCanvas(p) {
        if (p.x >= 0 && p.y >=0 && p.x < this.canvas.clientWidth && p.y < this.canvas.clientHeight) return true;
        else return false;
    }
    mouseMove(e) {
        this.mouse.x = e.clientX - document.body.app.menu.clientWidth;
        this.mouse.y = e.clientY;
        if (this.state == "nothing") {
            // #TODO avoiding reseting cursor when creating curve mode
            if (this.dragging != null) {
                this.dragging.x = this.mouse.x;
                this.dragging.y = this.mouse.y;
                this.run('updateCurrent',stop=true);
                this.Cursor('grabbing');
            } else {
                this.collidingPoint = this.checkCollision(this.mouse.x,this.mouse.y);
                if (this.collidingPoint != null) {
                    this.Cursor('grab');
                } else this.Cursor();
            }
        }
    }
    mouseDown(e) {
        if (e.which == 1) { // Left click
            if (this.dragging == null && this.collidingPoint != null) {
                this.dragging = this.collidingPoint;
                this.currentCurve = this.dragging.parent;
                this.Points.value = this.currentCurve.tvalues.length;
                this.run('updateAll',stop=true);
            } else if (this.currentCurve != null) {
                var p = new Point(this.mouse.x, this.mouse.y);
                if (this.checkInsideCanvas(p)) {
                    this.currentCurve.append(p);
                    this.dragging = this.collidingPoint = p;
                    this.run('updateAll',stop=true);
                }
            }
        }
    }
    mouseUp(e) {
        console.log('which', e.which);
        var ret = true;
        if (this.dragging != null) {
            if (this.currentCurve != null) {
                if ((this.dragging.x < 0 || this.dragging.y < 0)) {
                    this.currentCurve.remove(this.dragging);
                }
            }
            this.dragging = null;
            this.run('nothing');
            this.run('updateAll',stop=true);
        }
        if (e.which == 1) { // Left click
            this.collidingPoint = this.checkCollision(this.mouse.x,this.mouse.y);
            if (this.collidingPoint != null) {
                this.Cursor('grab');
            } else this.Cursor();
        } else if (e.which == 3) { //Right click
            this.collidingPoint = this.checkCollision(this.mouse.x,this.mouse.y);
            if (this.collidingPoint != null) {
                var updatedCurrent = (this.currentCurve === this.collidingPoint.parent);
                this.currentCurve = this.collidingPoint.parent;
                this.currentCurve.remove(this.collidingPoint);
                e.preventDefault();
                if (updatedCurrent) this.run('updateCurrent');
                else this.run('updateAll');
                ret = false;
            }
        } else this.Cursor();
        return ret;
    }
    resize() {
        this.allCanvas.forEach((c) => {
            c.width = window.screen.availWidth;
            c.height = window.screen.availHeight;
            c.style.left = document.body.app.menu.clientWidth;
        });
    }
    Cursor(type = 'default') {
        document.body.style.cursor = type;
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
// console.log(pab);

var pab2 = DeCasteljau.process(controlPoints,0.1);
// console.log(pab2);


var c = new BezierCurve(controlPoints);
c.tvalues = 7;
c.append(new Point(400,200));
c.append(new Point(420,200));
c.append(new Point(450,200));
var pab3 = DeCasteljau.calcPoints(c.controlPoints,c.tvalues);
// console.log('pab3');
// console.log(pab3);
app.appendCurve(c);

app.run();

window.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
};