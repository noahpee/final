"use strict"

const example = document.getElementById("example-container")
const sentence = document.getElementById("sentence-display")
const grid = document.getElementById("tiles-grid")

let data;
let user;

let folderNumber;
let sentenceNumber;

let answerString;

let sentenceArray = []

let accountFlick = true

loadSettings()
changeDisplay()
loadGrid(user.firstWords, 0)

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
            firstWords: [],
        }
        user.name = prompt("what is your name?")
    }
    user.firstWords = data[0].array
    data[549].text = user.name
    document.getElementById("rows-select").value = user.rows
    document.getElementById("columns-select").value = user.columns
}

function save() {

    let stringify = JSON.stringify(data);
    let userString = JSON.stringify(user)
    localStorage.setItem("words", stringify);
    localStorage.setItem("user", userString)
    alert("your settings have been saved")
}

function searchKeyUp() {

    let searchResults = [];

    if ((document.getElementById('search-input').value) == "") {
        return
    }
    for (let p = 0; p < data.length; p++) {
        if (data[p].text.toLowerCase().includes(document.getElementById('search-input').value)) {
            searchResults.push(p)
        }
    }
    loadGrid(searchResults, -1)
}

function move() {

    if (event.target.id == "move-down") {
        sentenceNumber--
    } else {
        sentenceNumber++
    }
    exampleQuestion(folderNumber)
}

function back() {
    
    if (sentenceArray.length == 0) {
        return loadGrid(data[0].array, 0)
    } 
    let last = sentenceArray[sentenceArray.length -1]
    if (!data[last].sub) {
        sentence.removeChild(sentence.lastChild)
    } 
    sentenceArray.pop()
    if (sentenceArray.length == 0) {
        loadGrid(data[0].array, 0)
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
        if (data[fromArray[i]].sub) {
            tile.style.backgroundColor = "rgb(253, 238, 217)"
            tile.onclick = function tileClick() {
                loadGrid(data[this.id].array, this.id)
                changeOrder(current, this.id)
                sentenceArray.push(parseInt(this.id))
                folderCheck(data[this.id])
            }
        } else {
            tile.onclick = function tileClick() {
                loadGrid(data[this.id].array, this.id)
                changeOrder(current, this.id)
                sentenceUpdate(this.id)
                sentenceArray.push(parseInt(this.id))
                let sentenceString = sentenceArray.toString()
                if (sentenceString.includes(answerString)) {
                    sentenceNumber++
                    exampleQuestion(folderNumber, current)
                    alert("nice")
                    clearAll()
                }
            }
        }
        grid.appendChild(tile)
        tile.appendChild(tileText)
    }
}

function changeDisplay() {

    user.rows = document.getElementById("rows-select").value
    user.columns = document.getElementById("columns-select").value

    grid.style.gridTemplateRows = `repeat(${user.rows}, ${Math.round(1/user.rows*100)}%)`
    grid.style.gridTemplateColumns = `repeat(${user.columns}, ${Math.round(1/user.columns*100) -3}%)`

    if (typeof sentenceArray[sentenceArray.length -1] == "undefined") {
        loadGrid(data[0].array, 0)
    } else {
        loadGrid(data[sentenceArray[sentenceArray.length -1]].array, sentenceArray[sentenceArray.length -1])
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
        if (!data[sentenceArray[j]].sub) {
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

function folderCheck(folderID) {

    if (!folderID.sub.questions) {
        console.log("folder")
    } else if (!folderID.sub.answers[0]) {
        sentenceNumber = 0
        folderNumber = folderID
        document.getElementById('search-input').placeholder = folderID.text
        exampleQuestion(folderID, 0)
    } else {
        console.log("answers")
    }
}

function exampleQuestion(folderID) {

    example.innerHTML = ""

    document.getElementById("move-down").style.visibility = "visible"
    document.getElementById("move-up").style.visibility = "visible"

    if (!folderID.sub.questions[sentenceNumber]) {
        sentenceNumber = 0
        document.getElementById("move-down").style.visibility = "hidden"
        document.getElementById("move-up").style.visibility = "hidden"
        document.getElementById('search-input').placeholder = "speak-easy"
        return alert("finished")
    }

    answerString = folderID.sub.questions[sentenceNumber].toString()

    for (let f = 0; f < folderID.sub.questions[sentenceNumber].length; f++ ) {

        const tile = document.createElement("div")
        const tileImage = document.createElement("img")
        const tileText = document.createElement("p")
        tile.className = "example-tile"
        tileImage.className = "tile-image"
        tileText.className = "tile-text"
        tile.id = data[folderID.sub.questions[sentenceNumber][f]].id
        tileText.textContent = data[folderID.sub.questions[sentenceNumber][f]].text
        if (typeof data[folderID.sub.questions[sentenceNumber][f]].image != "undefined") {
            tileImage.src = data[folderID.sub.questions[sentenceNumber][f]].image
            tileImage.alt = data[folderID.sub.questions[sentenceNumber][f]].text
            tile.appendChild(tileImage)
        }
        example.appendChild(tile)
        tile.appendChild(tileText)
    }
}

function accountOpen() {

    if (accountFlick == true) {
        document.getElementById("account-content").style.display = "block"
        accountFlick = false
    } else {
        document.getElementById("account-content").style.display = "none"
        accountFlick = true
    }
}

function menuOpen() {

    if (accountFlick == true) {
        document.getElementById("menu-content").style.display = "block"
        accountFlick = false
    } else {
        document.getElementById("menu-content").style.display = "none"
        accountFlick = true
    }
}