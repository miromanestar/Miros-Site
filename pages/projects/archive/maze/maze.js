jQuery(document).ready(function() {
	createMaze(4, 4);
});

var c = document.getElementById('mazeCanvas');
var ctx = c.getContext('2d');

function createMaze(rows, columns) {
    //Make the canvas look nice and sharp
    fixDPI(c);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;

    let width = c.width/columns;
    let height = c.height/rows;

    //Draw maze as a grid
    ctx.strokeRect(0, 0, width, height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            ctx.strokeRect(c * width, r * height, width, height);
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(r * columns + c, c * width + width/2, r * height + height/2);
        }
    }

    ctx.strokeStyle = '#FF0000';    
    ctx.strokeRect(0, ctx.lineWidth, ctx.lineWidth, height - ctx.lineWidth * 2);
    ctx.strokeRect(columns * width, height * (rows - 1), ctx.lineWidth, height - ctx.lineWidth * 2);
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
                case 0: ctx.strokeRect(x , y, x + width, ctx.lineWidth); break; 
                case 1: ctx.strokeRect(x, y, ctx.lineWidth, y - height); break;
                //case 2: ctx.strokeRect(x , y, x - width, ctx.lineWidth); break;
                case 3: ctx.strokeRect(x, y, ctx.lineWidth, y + height); break;
            }
        }
    }

    console.log(set)

}

function getIndex(c, r) {
    return r * 4 + c; //20 is columns
}

//Clear a wall vertically, but don't remove the last parts of the wall that are part of other walls
function clearWall(x0, y0, x1, y1) {
    if (x0 === x1)
        ctx.strokeRect(x0 + ctx.lineWidth, y0, x1 - ctx.lineWidth, ctx.lineWidth);
    else if (y0 === y1)
        ctx.strokeRect(x1, y1, ctx.lineWidth, y1);
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

let DisjointSet = class {
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