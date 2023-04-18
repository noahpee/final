const search = document.getElementById('search-input')
const sentence = document.getElementById("sentence-display")
const grid = document.getElementById("tiles-grid")

let data;
let user;
let current;
let previous;

let sentenceArray = []

function bugCheck(one, two) {

    let bottomText = document.getElementById("bottom-text")
    bottomText.innerHTML = `the current is ${data[current].text}-${current}, the first variable is ${data[one].text}-${one}, the second is ${data[two].text}-${two}, the previous is ${data[previous].text}-${previous}`
}

function loadSettings() {
    
    let wordStorage = localStorage.getItem("words")
    if (wordStorage) {
        data = JSON.parse(wordStorage);
    }
    let userStorage = localStorage.getItem("user")
    if (userStorage) {
        user = JSON.parse(userStorage);
    } else {
        user = {
            name: "",
            columns: 4,
            rows: 4,
            home: 0,
            firstWords: [224,728,673,274,485,504,445,66,101,289,187,48,521,302,491,21],
        }
        let stringify = JSON.stringify(user)
        localStorage.setItem("user", stringify)
    }
    current = user.home
}

loadSettings()
loadGrid(current)

function searchKeyUp() {

    let searchResults = [];
    for (let p = 0; p < data.length; p++) {
        if (data[p].text.toLowerCase().includes(search.value)) {
            searchResults.push(p)
        }
    }
    data[0].array = searchResults
    loadGrid(0)
}

function back() {
    
    search.value = ""

    if (sentenceArray.length == 0) {
        data[0].array = user.firstWords
        loadGrid(user.home)
        return 
    }
    if (!data[sentenceArray[sentenceArray.length -1]].sub || data[sentenceArray[sentenceArray.length -1]].folder == false) {
        sentence.removeChild(document.getElementById(sentenceArray[sentenceArray.length -1]))
    }
    sentenceArray.pop()
    if (sentenceArray.length == 0) {
        data[0].array = user.firstWords
        loadGrid(user.home)
    } else {
        loadGrid(sentenceArray[sentenceArray.length -1])
        current = sentenceArray[sentenceArray.length -1]

    }
}

function clearAll() {

    if (sentenceArray.length == 0) {
        loadGrid(user.home)
        return
    }
    sentence.innerHTML = ""
    sentenceArray = []
}

function home() {

    data[0].array = user.firstWords
    loadGrid(0)
    previous = 0
}

function loadGrid(idNumber) {

    grid.innerHTML = ''
    for ( let i = 0; i < (user.columns*user.rows); i++ ) {
        const tile = document.createElement("div")
        const tileImage = document.createElement("img")
        const tileText = document.createElement("p")
        tile.className = "tile"
        tileImage.className = "tile-image"
        tileText.className = "tile-text"
        tile.id = data[idNumber].array[i]
        tileText.textContent = data[data[idNumber].array[i]].text
        if (typeof data[data[idNumber].array[i]].image != "undefined") {
            tileImage.src = data[data[idNumber].array[i]].image
            tileImage.alt = data[data[idNumber].array[i]].text
            tile.appendChild(tileImage)
        }
        if (data[data[idNumber].array[i]].sub || data[data[idNumber].array[i]].folder == true) {
            tile.style.backgroundColor = "rgb(253, 238, 217)"
            tile.onclick = function tileClick() {
                previous = current
                loadGrid(this.id)
                changeOrder(idNumber, this.id)
                current = this.id
                bugCheck(idNumber, this.id)
            }
        } else {
            tile.onclick = function tileClick() {
                previous = current
                loadGrid(this.id)
                sentenceUpdate(this.id)
                changeOrder(idNumber, this.id)
                current = this.id
                bugCheck(idNumber, this.id)

            }
        }
        grid.appendChild(tile)
        tile.appendChild(tileText)
    }
}

function sentenceUpdate(idNumber) {

    sentenceArray.push(data[idNumber].id)
    const tile = document.createElement("div")
    const tileImage = document.createElement("img")
    const tileText = document.createElement("p")
    tile.className = "sentence-tile"
    tileImage.className = "tile-image"
    tileText.className = "tile-text"
    tile.id = data[idNumber].id
    tileText.textContent = data[idNumber].text
    if (typeof data[idNumber].image != "undefined") {
        tileImage.src = data[idNumber].image
        tileImage.alt = data[idNumber].text
        tile.appendChild(tileImage)
    }
    sentence.appendChild(tile)
    tile.appendChild(tileText)
    sentence.scrollLeft = sentence.scrollWidth;
}

function speak() {

    let msg = new SpeechSynthesisUtterance()
    for (let j = 0; j < sentenceArray.length; j++) {
        if (!data[sentenceArray[j]].sub || data[sentenceArray[j]].folder == false) {
            msg.text += `${data[sentenceArray[j]].text} `
            console.log(data[sentenceArray[j]].folder)
        } 
    }
    window.speechSynthesis.speak(msg)
}



function changeOrder(one, two) {

    let index = data[previous].array.indexOf(parseInt(two))

    if (index == -1) {
        data[previous].array.unshift(parseInt(two))
    } else if (parseInt(one) === 0){
        console.log('home')
    } else {
        data[previous].array.splice(index, 1)
        data[previous].array.unshift(parseInt(two))
    }
}