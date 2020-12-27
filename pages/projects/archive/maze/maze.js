var c = document.getElementById('mazeCanvas');
var ctx = c.getContext('2d');

var adj_list = [];
function createMaze(rows, columns) {
    //Make the canvas look nice and sharp
    fixDPI(c);

    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 4;

    let width = Math.floor(c.width/columns);
    let height = Math.floor(c.height/rows);

    //Draw maze as a grid
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            ctx.strokeRect(c * width, r * height, width, height);
            //ctx.fillText(r * columns + c, c * width + width/2, r * height + height/2);
            adj_list.push([]);
        }
    }

    //Tells canvas to make transparent the spaces upon which later strokes overlap on any already drawn stroke
    ctx.globalCompositeOperation = 'destination-out';

    //Clear an entrance and exit
    drawLine(0, 0, 0, height, 'red');
    drawLine(columns * width, (rows - 1) * height, columns * width, rows * height, 'red');

    let set = new DisjointSet(rows * columns);
    while (set.cardinality > 1) {
        let x = Math.floor(Math.random() * (columns - 1) + 1) * width; //Range: 1 to columns - 1
        let y = Math.floor(Math.random() * (rows - 1) + 1) * height; //Range: 1 to rows - 1
        let dir = Math.floor(Math.random() * 4);

        /*
            Gets coordinates of the top right corner of the two cells connected by the chosen wall
            which is then used to set i0 & i1, the indexes of the cell to check the disjoint set.
        */
        let r0, c0, r1, c1, i0, i1;
        if (dir === 0) { //Left
            r0 = y - height; c0 = x - width;
            r1 = y; c1 = x - width;
        } else if (dir === 1) { //Up
            r0 = y - height; c0 = x - width;
            r1 = y - height; c1 = x;
        } else if (dir === 2) { //Right
            r0 = y - height; c0 = x;
            r1 = y; c1 = x;
        } else if (dir === 3) { //Down
            r0 = y; c0 = x - width;
            r1 = y; c1 = x;
        }

        i0 = getIndex(Math.round(c0/width), Math.round(r0/height), columns);
        i1 = getIndex(Math.round(c1/width), Math.round(r1/height), columns);
        
        if (set.find(i0) !== set.find(i1)) {
            //console.log(`x: ${x/width} y: ${y/height}\tdir: ${dir}\ni0: ${i0}\ti1: ${i1}\nFind: ${set.find(i0)} ${set.find(i1)}`);
            //console.log(JSON.parse(JSON.stringify(set.set)));
            set.union(i0, i1);
            adj_list[i0].push(i1); adj_list[i1].push(i0);

            switch (dir) {
                case 0: drawLine(x, y, x - width, y, 'red'); break; //Left
                case 1: drawLine(x, y, x, y - height, 'red'); break; //Up
                case 2: drawLine(x, y, x + width, y, 'red'); break; //Right
                case 3: drawLine(x, y, x, y + height, 'red'); break; //Down
            }
        }
    }

    //Clean up gaps in walls
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#fff';
    for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= columns; c++) {
            ctx.strokeRect(c * width, r * height, ctx.lineWidth/8, ctx.lineWidth/8);
        }
    }
}

function getIndex(c, r, columns) {
    return r * columns + c;
}

var DisjointSet = class {
    constructor(numElements) {
        this.elements = numElements;
        this.set = Array(numElements);
        this.split();
    }

    split() {
        for (let i = 0; i < this.elements; i++)
            this.set[i] = i;
        this.cardinality = this.elements;
    }

    union(a, b) {
        let set1 = this.find(a);
        let set2 = this.find(b);
        //console.log(`a: ${a}\tb: ${b}\nset1: ${set1}\tset2: ${set2}`)
        this.set[set1] = set2;
        this.cardinality--;
    }

    find(i) {
        if (this.set[i] !== i)
            this.set[i] = this.find(this.set[i]);
        return this.set[i];        
    }
}

function drawLine(x0, y0, x1, y1, color) {
    ctx.beginPath();
    ctx.strokeStyle = color || 'white';

    if (color === 'transparent')
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';

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