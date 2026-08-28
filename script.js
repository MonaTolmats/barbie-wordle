const LANGUAGES = {
  et: {
    label: "EE",
    words: [
      "beibe", "crocs", "disko", "tsikk", "mimmu", "kõbla", "kiisu", "vegan",
      "bimbo", "ingel", "roosa", "kevad", "bratz", "jooga", "mehed", "limps",
      "bemar", "tsill", "konts", "kleit", "reede", "kutsu", "lokid", "tants",
      "ainus", "stiil", "armas", "burks", "beibe", "besti", "pruta", "džinn",
      "džips", "nummi", "nunnu", "tartu", "pärnu", "trepp", "dubai", "miami",
      "kalla", "lamuu", "tibid", "party"
    ],
    keyboard: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Ü", "Õ"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä", "Ž"],
      ["Z", "X", "C", "V", "B", "N", "M", "ENTER", "DELETE", "Š"]
    ],
    win: "Slaaaaayyyy, sinu voit!",
    lose: "Sorry beib, kaotasid!"
  },

  en: {
    label: "EN",
    words: [
      "crocs", "disco", "vegan", "bimbo", "angel", "pinky", "heels", "dolls",
      "gloss", "glitz", "queen", "slays", "babes", "bratz", "party", "miami",
      "dubai", "blush", "charm", "dream", "shine", "sassy", "tulle", "satin",
      "pearl", "braid", "curls", "skirt", "dress", "purse", "nails", "kitty",
      "puppy", "beach", "sunny", "bloom", "fairy", "crown", "tiara", "boots",
      "denim", "vogue", "style", "candy", "roses"
    ],
    keyboard: [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M", "ENTER", "DELETE"]
    ],
    win: "Slaaaaayyyy, you win!",
    lose: "Sorry babe, you lost!"
  }
};

const ROWS = 6;
const WORD_LENGTH = 5;

let language = "et";
let targetWord = "";
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let tiles = [];
let keys = new Map();

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const overlay = document.getElementById("overlay");
const endButton = document.getElementById("endButton");
const langToggle = document.getElementById("langToggle");

function pickWord() {
  const words = LANGUAGES[language].words;
  return words[Math.floor(Math.random() * words.length)];
}

function buildBoard() {
  board.innerHTML = "";
  tiles = [];
  for (let row = 0; row < ROWS; row++) {
    const rowTiles = [];
    for (let column = 0; column < WORD_LENGTH; column++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      board.appendChild(tile);
      rowTiles.push(tile);
    }
    tiles.push(rowTiles);
  }
}

function buildKeyboard() {
  keyboard.innerHTML = "";
  keys = new Map();

  LANGUAGES[language].keyboard.forEach((row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "keyboard-row";

    row.forEach((label) => {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "key";
      key.textContent = label;
      if (label === "ENTER" || label === "DELETE") {
        key.classList.add("wide");
      } else {
        keys.set(label.toLowerCase(), key);
      }
      key.addEventListener("click", () => handleKeyPress(label));
      rowElement.appendChild(key);
    });

    keyboard.appendChild(rowElement);
  });
}

function buildLanguageToggle() {
  langToggle.innerHTML = "";

  Object.keys(LANGUAGES).forEach((code) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lang" + (code === language ? " active" : "");
    button.textContent = LANGUAGES[code].label;
    button.setAttribute("aria-pressed", String(code === language));
    button.addEventListener("click", () => {
      if (code === language) return;
      language = code;
      newGame();
    });
    langToggle.appendChild(button);
  });
}

function colourKeyboard(guess) {
  const guessed = [...guess];
  const target = [...targetWord];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const letter = guessed[i];
    const key = keys.get(letter);
    if (!key) continue;

    if (letter === target[i]) {
      key.classList.remove("present", "absent");
      key.classList.add("correct");
    } else if (target.includes(letter)) {
      if (!key.classList.contains("correct")) {
        key.classList.remove("absent");
        key.classList.add("present");
      }
    } else {
      if (!key.classList.contains("correct") && !key.classList.contains("present")) {
        key.classList.add("absent");
      }
    }
  }
}

function colourTiles(guess) {
  for (let i = 0; i < WORD_LENGTH; i++) {
    const letter = guess[i];
    const tile = tiles[currentRow][i];

    if (letter === targetWord[i]) {
      tile.classList.add("correct");
    } else if (targetWord.includes(letter)) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
    }
  }
}

function submitGuess() {
  if (currentTile !== WORD_LENGTH || gameOver) return;

  let guess = "";
  for (let i = 0; i < WORD_LENGTH; i++) {
    guess += tiles[currentRow][i].textContent;
  }
  guess = guess.toLowerCase();

  const won = guess === targetWord;

  colourTiles(guess);
  colourKeyboard(guess);

  if (won) {
    showResult(LANGUAGES[language].win);
  } else if (currentRow === ROWS - 1) {
    showResult(LANGUAGES[language].lose);
  }

  currentTile = 0;
  currentRow++;
}

function handleKeyPress(label) {
  if (gameOver) return;

  if (label === "DELETE") {
    if (currentTile > 0) {
      tiles[currentRow][currentTile - 1].textContent = "";
      currentTile--;
    }
  } else if (label === "ENTER") {
    submitGuess();
  } else if (currentTile < WORD_LENGTH) {
    tiles[currentRow][currentTile].textContent = label;
    currentTile++;
  }
}

function showResult(message) {
  gameOver = true;
  endButton.textContent = message;
  overlay.hidden = false;
  endButton.focus();
}

function newGame() {
  targetWord = pickWord();
  currentRow = 0;
  currentTile = 0;
  gameOver = false;
  overlay.hidden = true;
  buildBoard();
  buildKeyboard();
  buildLanguageToggle();
}

document.addEventListener("keydown", (event) => {
  if (gameOver) return;

  if (event.key === "Enter") {
    event.preventDefault();
    submitGuess();
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    handleKeyPress("DELETE");
  } else if (event.key.length === 1 && /\p{Letter}/u.test(event.key)) {
    handleKeyPress(event.key.toUpperCase());
  }
});

endButton.addEventListener("click", newGame);

newGame();
