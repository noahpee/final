'use strict'

const search = document.getElementById('search-input')
const sentence = document.getElementById("sentence-display")
const grid = document.getElementById("tiles-grid")

let data;
let user;
let current;

let sentenceArray = []

function loadSettings() {
    
    let wordStorage = localStorage.getItem("words")
    if (wordStorage) {
        data = JSON.parse(wordStorage); 
    } else {
        loadData()
        return loadSettings()
    }
    let userStorage = localStorage.getItem("user")
    if (userStorage) {
        user = JSON.parse(userStorage);
    } else {
        user = {
            name: "",
            columns: 4,
            rows: 4,
            firstWords: [224,728,673,274,485,504,445,66,101,289,187,48,521,302,491,21],
        }
        user.name = prompt("what is your name?")
    }
    data[0].array = user.firstWords
    data[549].text = user.name
    document.getElementById("rows-select").value = user.rows
    document.getElementById("columns-select").value = user.columns
}

loadSettings()
changeDisplay()
loadGrid(data[0].array, 0)

function save() {
    let stringify = JSON.stringify(data);
    localStorage.setItem("words", stringify);
    let userString = JSON.stringify(user)
    localStorage.setItem("user", userString)
    alert("your settings have been saved")
}

function searchKeyUp() {

    let searchResults = [];
    for (let p = 0; p < data.length; p++) {
        if (data[p].text.toLowerCase().includes(search.value)) {
            searchResults.push(p)
        }
    }
    loadGrid(searchResults, -1)
}

function back() {
    
    search.value = ""
    
    let last = sentenceArray[sentenceArray.length -1]

    if (sentenceArray.length == 0) {
        return
    } 

    if (data[last].folder == true || data[last].sub) {
        //
    } else {
        sentence.removeChild(sentence.lastChild)
    }

    sentenceArray.pop()

    if (sentenceArray.length == 0) {
        loadGrid(user.firstWords, 0)
    } else {
        loadGrid(data[sentenceArray[sentenceArray.length -1]].array, sentenceArray[sentenceArray.length -1]) 
    }
}

function clearAll() {

    if (sentenceArray.length == 0) {
        loadGrid(data[0].array, 0)
        return
    }
    sentence.innerHTML = ""
    sentenceArray = []
}

function home() {

    loadGrid(data[0].array, 0)
    previous = 0
}

function loadGrid(fromArray, current) {

    grid.innerHTML = ''
    
    for ( let i = 0; i < (user.columns*user.rows); i++ ) {

        if (!fromArray[i]) {
            return
        }
        const tile = document.createElement("div")
        const tileImage = document.createElement("img")
        const tileText = document.createElement("p")
        tile.className = "tile"
        tileImage.className = "tile-image"
        tileText.className = "tile-text"
        tile.id = fromArray[i]
        tileText.textContent = data[fromArray[i]].text
        if (typeof data[fromArray[i]].image != "undefined") {
            tileImage.src = data[fromArray[i]].image
            tileImage.alt = data[fromArray[i]].text
            tile.appendChild(tileImage)
        }
        if (data[fromArray[i]].sub || data[fromArray[i]].folder == true) {
            tile.style.backgroundColor = "rgb(253, 238, 217)"
            tile.onclick = function tileClick() {
                loadGrid(data[this.id].array, this.id)
                changeOrder(current, this.id)
                sentenceArray.push(parseInt(this.id))
            }
        } else {
            tile.onclick = function tileClick() {
                loadGrid(data[this.id].array, this.id)
                changeOrder(current, this.id)
                sentenceUpdate(this.id)
                sentenceArray.push(parseInt(this.id))
            }
        }
        grid.appendChild(tile)
        tile.appendChild(tileText)
    }
}

function sentenceUpdate(idNumber) {

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
        if (data[sentenceArray[j]].folder == true || data[sentenceArray[j]].sub) {
            //
        } else {
            msg.text += `${data[sentenceArray[j]].text} `
        }
    }
    window.speechSynthesis.speak(msg)
}

function changeOrder(current, id) {

    if (current == -1) {

        let last = sentenceArray[sentenceArray.length -1]

        if (typeof last == "undefined") {

            let index = data[0].array.indexOf(parseInt(id))
            if (index == -1) {
                data[0].array.unshift(parseInt(id)) 
            } else {
                data[0].array.splice(index, 1)
                data[0].array.unshift(parseInt(id))  
            }

        } else {
            let index = data[last].array.indexOf(parseInt(id))
            if (index == -1) {
                data[last].array.unshift(parseInt(id)) 
            } else {
                data[last].array.splice(index, 1)
                data[last].array.unshift(parseInt(id))  
            }
        }

    } else {
        let index = data[current].array.indexOf(parseInt(id))
        data[current].array.splice(index, 1)
        data[current].array.unshift(parseInt(id))  
    }
}

function changeDisplay() {

    user.rows = document.getElementById("rows-select").value
    user.columns = document.getElementById("columns-select").value

    grid.style.gridTemplateRows = `repeat(${user.rows}, ${Math.round(1/user.rows*100)}%)`
    grid.style.gridTemplateColumns = `repeat(${user.columns}, ${Math.round(1/user.columns*100)}%)`

    if (typeof sentenceArray[sentenceArray.length -1] == "undefined") {
        loadGrid(data[0].array, 0)
    } else {
        loadGrid(data[sentenceArray[sentenceArray.length -1]].array, sentenceArray[sentenceArray.length -1])
    }
}