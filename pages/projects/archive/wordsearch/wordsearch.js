jQuery(document).ready(function() {

});

var wordSearchPuzzle;

function drawWordSearch() {
    let wordList = (document.getElementById('maze-words').value).split(',');

    //Get comma separated values and remove whitespace
    for (let i = 0; i < wordList.length; i++) {
        wordList[i] = wordList[i].toUpperCase();
        wordList[i] = wordList[i].replace(/\s+/g, '');
    }

    let rows = Number(document.getElementById('maze-rows').value);
    let columns = Number(document.getElementById('maze-columns').value);

    wordSearchPuzzle = new WordSearch(wordList, rows, columns);

    //Write word search to document
    $('#wordsearch').empty();
    for (let i = 0; i < rows; i++) {
        $('#wordsearch').append('<tr>')
        for (let k = 0; k < columns; k++) {
            $('#wordsearch').children().last().append(`<th scope="col">${ wordSearchPuzzle.puzzle[i][k] }</th>`);
        }
        $('#wordsearch').append('</tr>')
    }

    //Write wordList to input for better feedback
    $('#maze-words').val(wordSearchPuzzle.wordList);
    $('#wordsearch-sol-btn').attr('onclick', 'showSolution()');

    if ($('#wordsearch-sol-btn').text() === 'Hide Solution')
        $('#wordsearch-sol-btn').text('Show Solution');
}

function showSolution() {
    //If already red, that means that solution is already showing and should be toggled off, and vice versa
    let children =  $('#wordsearch').children();
    for (let r = 0; r < children.length; r++) {
        let elements = $(children[r]).children();
        for (let c = 0; c < elements.length; c++) {
            if (elements[c].style.color === 'red') { 
                elements[c].style.color = 'white';
            } else if (wordSearchPuzzle.solution[r][c] === elements[c].innerText) {
                elements[c].style.color = 'red';
            }
        }
    }

    //Toggle solution button text
    if ($('#wordsearch-sol-btn').text() === 'Show Solution') {
        $('#wordsearch-sol-btn').text('Hide Solution');
    } else {
        $('#wordsearch-sol-btn').text('Show Solution');
    }
}

//Simple class which builds and solves word searches
var WordSearch = class {
    constructor(wordList, rows, columns, filler) {
        //console.log(wordList)
        if (wordList.length === 1 && wordList[0] === '')
            this.wordList = ['COMPUTER', 'PROGRAM', 'PYTHON', 'TEST', 'RECURSION', 'ITERATIVE']; //Words must be uppercase
        else
            this.wordList = wordList;

        this.filler = filler || '';
        this.rows = rows || 20;
        this.columns = columns || 20;
        this.puzzle = [];
        this.solution = [];

        this.directions = [
            [0, -1],  //Up
            [0, 1],   //Down
            [-1, 0],  //Left
            [1, 0],   //Right
            [1, -1],   //Up-Right
            [-1, -1], //Up-Left
            [1, 1],   //Down-Right
            [-1, 1],  //Down-Left
        ];

        this.makeWordSearch();
        this.solveWordSearch();
    }

    /*
        -------------- WORD SEARCH GENERATOR PORTION --------------
    */

    //Places words randomly inside the 2d array then adds random capital letters in between.
    makeWordSearch() {
        //console.log(this.wordList);
        //Create empty 2d array for the word search
        this.puzzle = Array.from({length: this.rows}, e => Array(this.columns).fill(this.filler));
        //Place words inside 2d array
        for (let word of this.wordList)
            this.placeWord(word, this.rows, this.columns, 0);
    
        
        this.fillPuzzle();
        //console.log(this.puzzle);
    }

    //Places the words from wordList inside the puzzle
    placeWord(word, rows, columns, iteration) {
        if (iteration > 30) {
            console.error(`Could not find place for word ${ word } after 30 attempts.`);
            return;
        }

        let x = this.getRandInt(columns);
        let y = this.getRandInt(rows);

        let choice = this.directions[this.getRandInt(this.directions.length)];
        let dx = choice[0]; let dy = choice[1];

        //If direction checks out, add word as capital letters
        if (this.checkDir(x, y, dx, dy, word)) {
            for (let i = 0; i < word.length; i++)
                this.puzzle[y + (i * dy)][x + (i * dx)] = word[i];
        } else {
            this.placeWord(word, rows, columns, iteration + 1);
        }
    }

    //Checks the direction to ensure a placed word won't go out of bounds or overwrite another word
    checkDir(x, y, dx, dy, word) {
        for (let i = 0; i < word.length; i++) {

            //Ensure that the coordinates are within range
            let nextX = x + (i * dx);
            let nextY = y + (i * dy);
            if (nextY >= 0 && nextY < this.rows && nextX >= 0 && nextX < this.columns) {
                let tempValue = this.puzzle[nextY][nextX];
                if (tempValue !== word[i] && tempValue !== this.filler)
                    return false;
            } else {
                return false;
            }
        }

        return true;
    }

    fillPuzzle() {
        for (let i = 0; i < this.rows; i++) {
            for (let k = 0; k < this.columns; k++) {
                if (this.puzzle[i][k] == this.filler)
                    this.puzzle[i][k] = String.fromCharCode(this.getRandInt(26) + 65);
            }
        }
    }

    /*
        -------------- WORD SEARCH SOLVER PORTION --------------
    */

    //For each word, checks every direction of each cell. If it finds it, write it to the solution array
    solveWordSearch() {
        this.solution = Array.from({length: this.rows}, e => Array(this.columns).fill(this.filler));
        let pos = []; //Will store the position of word like so: [x, y, dx, dy]

        for (let word of this.wordList) {
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.columns; x++) {
                    for (let dir of this.directions) {
                        pos = this.findWord(x, y, word, dir);

                        if (pos[0] != -1)
                            this.fillSolution(pos[0], pos[1], pos[2], pos[3], word);
                    }
                }
            }
        }

        //console.log(this.solution);
    }

    findWord(x, y, word, dir) {
        //If the first letter doesn't match, move on
        if (this.puzzle[y][x] !== word[0])
            return [-1];
        
        let dx = dir[0], dy = dir[1];

        for (let i = 1; i < word.length; i++) { //Iterate over every letter except first (since already checked)
            let nextX = x + (i * dx);
            let nextY = y + (i * dy);
            if (nextY >= 0 && nextY < this.rows && nextX >= 0 && nextX < this.columns) {
                let tempValue = this.puzzle[nextY][nextX];
                if (tempValue !== word[i])
                    break;
                else if (i === word.length - 1) //Successfully reached end of word in puzzle, we've found it!
                    return [x, y, dx, dy];
            } else {
                break;
            }
        }

        return [-1];
    }

    fillSolution(x, y, dx, dy, word) {
        for (let i = 0; i < word.length; i++)
            this.solution[y + (i * dy)][x + (i * dx)] = word[i];
    }

    /*
        -------------- UTILITY FUNCTIONS --------------
    */

    //Returns random integer from 0 to max - 1
    getRandInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
}