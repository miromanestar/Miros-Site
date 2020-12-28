var c = document.getElementById('mazeCanvas');
var ctx = c.getContext('2d');

var adj_list = [];
var sol = [];

function createMaze(rows, columns) {
    adj_list = [];
    sol = [];
    $('#maze-sol-btn').text('Show Solution');

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
    drawLine(0, 0, 0, height, 'red', ctx);
    drawLine(columns * width, (rows - 1) * height, columns * width, rows * height, 'red', ctx);

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
                case 0: drawLine(x, y, x - width, y, 'red', ctx); break; //Left
                case 1: drawLine(x, y, x, y - height, 'red', ctx); break; //Up
                case 2: drawLine(x, y, x + width, y, 'red', ctx); break; //Right
                case 3: drawLine(x, y, x, y + height, 'red', ctx); break; //Down
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

    sol = findSolution();
    $('#maze-sol-btn').attr('onclick', `drawSolution(${ rows }, ${ columns })`);
}

function drawSolution(rows, columns) {
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.lineWidth = 4;

    if ($('#maze-sol-btn').text() === 'Show Solution') {
        $('#maze-sol-btn').text('Hide Solution');
        $('#maze-sol-btn').attr('onclick', `drawSolution(${ rows }, ${ columns })`);
        ctx.globalCompositeOperation = 'source-over';
    } else {
        $('#maze-sol-btn').text('Show Solution');
        $('#maze-sol-btn').attr('onclick', `drawSolution(${ rows }, ${ columns })`);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 10;
    }

    let width = Math.floor(c.width/columns);
    let height = Math.floor(c.height/rows);

    for (let i = 1; i < sol.length; i++) {
        let x0 = getColumn(sol[i], columns) * width + width/2;
        let y0 = getRow(sol[i], columns) * height + height/2;
        let x1 = getColumn(sol[i - 1], columns) * width + width/2;
        let y1 = getRow(sol[i - 1], columns) * height + height/2;

        drawLine(x0, y0, x1, y1, 'red', ctx);
        ctx.strokeRect(x1, y1, ctx.lineWidth/8, ctx.lineWidth/8);
        ctx.strokeRect(x0, y0, ctx.lineWidth/8, ctx.lineWidth/8);
    }
}

//Uses an array as a queue which is super slow, but since the queue is relatively small anyway it shouldn't matter TOO much... I hope
//Assumes that the source node is '0' and end node is whatever rows * columns is (AKA the length of adj_list)
function findSolution() {
    //Array of nodes to process
    let queue = [];

    //Array of nodes which have been visited
    let visited = [];

    //Array of distances from source node to each node
    let dist = [];

    //Array which stores predecessor vertices
    let pred = [];

    //Fill the three arrays with starting data
    for (let elem of adj_list) {
        visited.push(false);
        dist.push(Number.MAX_SAFE_INTEGER);
        pred.push(-1);
    }

    //Set source node values
    visited[0] = true;
    dist[0] = 0;
    queue.push(0);

    //Begin BFS search
    while (queue.length > 0) {
        let v = queue.shift();
        for (let i = 0; i < adj_list[v].length; i++) {
            let adj = adj_list[v][i];
            if (visited[adj] === false) {
                visited[adj] = true;
                dist[adj] = dist[v] + 1;
                pred[adj] = v;
                queue.push(adj);

                //If we found our destination, stop. The adj_list length is equal to the index of the destination because its equivalent to rows * columns
                if (adj === adj_list.length - 1) {
                    let j = adj_list.length - 1;
                    let sol = [];
                    while (j !== 0) { //Push the final path to an array to be drawn later as the solution
                        sol.push(j);
                        j = pred[j];
                    }
                    sol.push(0);
                    return sol;
                }
            }
        }
    }

    return false;
}

function getIndex(c, r, columns) {
    return r * columns + c;
}

function getRow(index, columns) {
    return Math.floor(index/columns);
}

function getColumn(index, columns) {
    return Math.floor(index % columns);
}

function resetMaze() {
    createMaze(Number(document.getElementById('maze-rows').value), Number(document.getElementById('maze-columns').value));
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

function drawLine(x0, y0, x1, y1, color, ctx) {
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
function fixDPI(c) {
    let styleHeight = +getComputedStyle(c).getPropertyValue('height').slice(0, -2);
    let styleWidth = +getComputedStyle(c).getPropertyValue('width').slice(0, -2);

    let dpi = window.devicePixelRatio;
    c.setAttribute('height', styleHeight * dpi);
    c.setAttribute('width', styleWidth * dpi);
}