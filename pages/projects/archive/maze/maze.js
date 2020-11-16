jQuery(document).ready(function() {
	createMaze(4, 4);
});

var c = document.getElementById('mazeCanvas');
var ctx = c.getContext('2d');

function createMaze(rows, columns) {
    //Make the canvas look nice and sharp
    fixDPI(c);

    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 10;

    let width = c.width/columns;
    let height = c.height/rows;

    //Draw maze as a grid
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            ctx.strokeRect(c * width, r * height, width, height);
        }
    }
    ctx.strokeStyle = '#FF0000';
    drawLine(0, 0, 1, height); 
    drawLine(columns * width, (rows - 1) * height, columns * width, rows * height);
    //ctx.strokeRect()

    let set = new DisjointSet(rows * columns);
    for (let i = 0; i < 10; i++) {
        let x = Math.floor(Math.random() * (columns - 2) + 1) * height;
        let y = Math.floor(Math.random() * (rows - 2) + 1) * width;
        let dir = Math.floor(Math.random() * 4);
        //console.log (`X: ${x} Y: ${y} D: ${dir}`)
        
        let r0, c0, r1, c1, i0, i1;

        if (dir === 0) {
            r0 = y - height; c0 = x - width;
            r1 = y; c1 = x - width;
        } else if (dir === 1) {
            r0 = y; c0 = x - width;
            r1 = y; c1 = x;
        } else if (dir === 2) {
            r0 = y - height; c0 = x;
            r1 = y; c1 = x;
        } else if (dir === 3) {
            r0 = y - height; c0 = x - width;
            r1 = y - height; c1 = x;
        }

        i0 = getIndex(Math.round(c0/width), Math.round(r0/height));
        i1 = getIndex(Math.round(c1/width), Math.round(r1/height));
        if (set.find(i0) !== set.find(i1)) {
            set.union(i0, i1);
            
            switch (dir) {
                case 0: 
                case 1:
                case 2:
                case 3:
            }
        }
    }

    console.log(set)

}

function getIndex(c, r) {
    return r * 4 + c; //20 is columns
}

function drawLine(x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

//Ensures that the resolution for the canvas is kept high even when scaling is done... credit linked here
//https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
function fixDPI() {
    let styleHeight = +getComputedStyle(c).getPropertyValue('height').slice(0, -2);
    let styleWidth = +getComputedStyle(c).getPropertyValue('width').slice(0, -2);

    let dpi = window.devicePixelRatio;
    c.setAttribute('height', styleHeight * dpi);
    c.setAttribute('width', styleWidth * dpi);
}

class DisjointSet {
    constructor(numElements) {
        this.numElements = numElements;
        this.set = Array(numElements);
        this.split();
        this.cardinality = numElements;
    }

    split() {
        for (let i = 0; i < this.numElements; i++)
            this.set[i] = i;
    }

    find(i) {
        if (this.set[i] !== i )
            this.set[i] = find(this.set[i]);
        return this.set[i]
    }

    union(a, b) {
        let set1 = find(a);
        let set2 = find(b);
        this.set[set1] = set2;
        this.cardinality--;
    }
}