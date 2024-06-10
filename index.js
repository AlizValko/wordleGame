async function fetchWords() {
    const response = await fetch('https://raw.githubusercontent.com/AlizValko/wordleGame/main/words.txt');
    const text = await response.text();
    return text.split('\n').map(word => word.trim());
}
async function fetchGuessWords() {
    const response = await fetch("https://gist.githubusercontent.com/dracos/dd0668f281e685bad51479e5acaadb93/raw/6bfa15d263d6d5b63840a8e5b64e04b382fdb079/valid-wordle-words.txt");
    const text = await response.text();
    return text.split('\n').map(word => word.trim());
}
let dictionary=[];
let guessDictionary=[];
async function startup() {
    const game=document.getElementById("game");
    drawGrid(game);
    registerKeyboardEvents();
    dictionary = await fetchWords();
    guessDictionary= await fetchGuessWords();
    state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
    console.log(`Secret word: ${state.secret}`);
}
const state={
    secret: '',
    grid: Array(6)
        .fill()
        .map(()=>Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
};
function updateGrid(){
    for(let i=0; i<state.grid.length;i++){
        for(let j=0; j<state.grid[i].length;j++){
            const box=document.getElementById(`box${i}${j}`);
            box.textContent=state.grid[i][j];
        }
    }
}
function drawBox(container, row, col, letter=''){
    const box=document.createElement('div');
    box.className='box';
    box.id=`box${row}${col}`;
    box.textContent=letter;
    container.appendChild(box);
    return box;
}
function drawGrid (container){
    const grid=document.createElement('div');
    grid.className="grid";
    for(let i=0;i<6;i++){
        for(let j=0; j<5;j++){
            drawBox(grid,i,j);
        }
    }
    container.appendChild(grid);
}
function registerKeyboardEvents(){
    document.body.onkeydown=(e)=>{
        const key=e.key;
        if(key==='Enter'){
            if(state.currentCol===5){
                const word=getCurrentWord();
                if(isWordValid(word)){
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol=0;
                }else{
                    alert('Not a valid word :(')
                }
            }
        }
        if(key==='Backspace'){
            removeLetter();
        }
        if(isLetter(key)){
            addLetter(key);
            hideInitialText();
        }
        updateGrid();
    };
}
function hideInitialText() {
    const initialText = document.getElementById('initial-text');
    if (initialText) {
        initialText.style.display = 'none';
    }
}

function getCurrentWord(){
    return state.grid[state.currentRow].reduce((prev,curr)=>prev+curr);
}
function isWordValid(word){
    return guessDictionary.includes(word);
}
function revealWord(guess){
    const row=state.currentRow;
    for(let i=0; i<5; i++){
        const box=document.getElementById(`box${row}${i}`);
        const letter=box.textContent;
        if(letter===state.secret[i]){
            box.classList.add('right');
            const solBox=document.getElementById(`solBox${i}`);
            solBox.textContent=letter;
        }else if(state.secret.includes(letter)){
            box.classList.add('wrong');
        }else{
            box.classList.add('empty');
        }
    }
    const isWinner=state.secret===guess;
    const isGameOver=state.currentRow===5;
    if(isWinner){
        showPopup('Congratulations! Do you know what this word means?');
    }
    if(isGameOver){
        showPopup(`Nope, the word was ${state.secret}.`);
    }
}
function search(){
    window.open('http://google.com/search?q='+state.secret+" definition");
}
function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupContent = document.querySelector('.popup-content p');
    popupContent.textContent = message;
    popup.style.display = 'flex';
}

function hidePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}
document.getElementById('search').addEventListener('click', search);
document.getElementById('close-popup').addEventListener('click', hidePopup);
function isLetter(key){
    return key.length===1 && key.match(/[a-z]/i);
}
function addLetter(letter){
    if(state.currentCol===5) return;
    state.grid[state.currentRow][state.currentCol]=letter;
    state.currentCol++;
}
function removeLetter(){
    if(state.currentCol===0) return;
    state.grid[state.currentRow][state.currentCol-1]='';
    state.currentCol--;
}

startup();