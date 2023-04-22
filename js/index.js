"use strict"

const example = document.getElementById("example-container")
const sentence = document.getElementById("sentence-display")
const grid = document.getElementById("tiles-grid")

const voices = speechSynthesis.getVoices();

let data;
let user;
let last;

let folderNumber;
let lastWord = 0
let sentenceNumber = 0

let nextWord = 0
let currentWord = 0

let answerString;

let sentenceArray = []

let gridArray = []

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
            home: 0,
            voice: 5,
            columns: 3,
            rows: 3,
            firstWords: [],
        }
        user.name = prompt("what is your name?")
        let userString = JSON.stringify(user)
        localStorage.setItem("user", userString)
    }
    user.firstWords = data[user.home].array
    data[549].text = user.name
    document.getElementById("rows-select").value = user.rows
    document.getElementById("columns-select").value = user.columns
    document.getElementById("userName").innerText = `username : ${user.name}`
    populateVoiceList();
        if (
            typeof speechSynthesis !== "undefined" &&
            speechSynthesis.onvoiceschanged !== undefined
        ) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }
}

function save() {

    console.log(user, user.voice)

    let stringify = JSON.stringify(data);
    let userString = JSON.stringify(user)
    localStorage.setItem("words", stringify);
    localStorage.setItem("user", userString)
    alert("your settings have been saved")
}

function searchKeyUp() {

    let searchResults = [];

    if ((document.getElementById('search-input').value) == "") {

        if (sentenceArray.length == 0) {
            loadGrid(data[0].array, 0)
        } else {
            loadGrid(data[sentenceArray[sentenceArray.length -1]].array, sentenceArray[sentenceArray.length -1]) 
        }
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
        last = folderNumber.sub.questions[sentenceNumber][folderNumber.sub.questions[sentenceNumber].length -1]
        console.log(last)
        sentenceNumber++
    }
    currentWord = 0
    exampleQuestion(folderNumber)
}

function back() {

    if (sentenceArray.length == 0) {
        loadGrid(data[user.home].array, 0)
        exampleQuestion(folderNumber, -1)
        return 
    } 
    console.log("back")
    last = sentenceArray[sentenceArray.length -1]
    if (!data[last].sub) {
        sentence.removeChild(sentence.lastChild)
    } 
    sentenceArray.pop()
    if (sentenceArray.length == 0) {
        loadGrid(data[lastWord].array, 0)
        folderWord(data[lastWord].array, -1)
    } else {
        loadGrid(data[sentenceArray[sentenceArray.length -1]].array, sentenceArray[sentenceArray.length -1])
        folderWord(data[sentenceArray[sentenceArray.length -1]].array, 0)
    }
}

function clearAll() {

    if (sentenceArray.length == 0) {
        sentenceNumber = -1
        exampleQuestion(folderNumber)
        loadGrid(data[0].array, 0)
        return
    }
    lastWord = sentenceArray[sentenceArray.length -1]
    sentence.innerHTML = ""
    sentenceArray = []
}

function voiceChange() {
    
    let voiceSelect = document.getElementById("voiceSelect").value.split(" ")
    user.voice = parseInt(voiceSelect[2])

}

function loadGrid(fromArray, current) {

    grid.innerHTML = ''
    gridArray = []
    
    for ( let i = 0; i < (user.columns*user.rows); i++ ) {

        if (!fromArray[i]) {
            return
        }
        gridArray.push(fromArray[i])
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
            document.getElementById('search-input').placeholder = "speak-easy"
            document.getElementById('search-input').value = ""
        } else {
            tile.onclick = function tileClick(thing) {
                loadGrid(data[this.id].array, this.id)
                sentenceUpdate(this.id)
                next(data[this.id].array, current, this.id)
                sentenceArray.push(parseInt(this.id))
                let sentenceString = sentenceArray.toString()
                if (sentenceString.includes(answerString)) {
                    exampleQuestion(folderNumber, current)
                    alert("nice")
                    clearAll()
                }
                document.getElementById('search-input').placeholder = "speak-easy"
                document.getElementById('search-input').value = ""
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


    let msg = ''
        for (let j = 0; j < sentenceArray.length; j++) {
        if (!data[sentenceArray[j]].sub) {
            msg += `${data[sentenceArray[j]].text} `
        }
    }

    const voices = window.speechSynthesis.getVoices();
const lastVoice = voices[user.voice];

const utterance = new SpeechSynthesisUtterance(msg);
utterance.voice = lastVoice; // change voice
window.speechSynthesis.speak(utterance);
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
        exampleQuestion(folderID)
    } else {
        console.log("answers")
    }
}

function exampleQuestion(folderID, check) {

    example.innerHTML = ""

    if (check == -1) {
        currentWord = 0
        sentenceNumber = 0
        nextWord = 0
        document.getElementById("move-down").style.visibility = "hidden"
        document.getElementById("move-up").style.visibility = "hidden"
        document.getElementById('search-input').placeholder = "speak-easy"
        return
    }

    document.getElementById("move-down").style.visibility = "visible"
    document.getElementById("move-up").style.visibility = "visible"

    if (!folderID.sub.questions[sentenceNumber]) {
        currentWord = 0
        sentenceNumber = 0
        nextWord = 0
        document.getElementById("move-down").style.visibility = "hidden"
        document.getElementById("move-up").style.visibility = "hidden"
        document.getElementById('search-input').placeholder = "speak-easy"
        return
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
    nextWord = folderNumber.sub.questions[sentenceNumber][currentWord]
}

function accountOpen() {

    if (document.getElementById("account-content").style.display == "") {
        document.getElementById("account-content").style.display = "block"
        document.getElementById("menu-content").style.display = ""
    } else {
        document.getElementById("account-content").style.display = ""
    }

}

function menuOpen() {

    if (document.getElementById("menu-content").style.display == "") {
        document.getElementById("menu-content").style.display = "block"
        document.getElementById("account-content").style.display = ""
    } else {
        document.getElementById("menu-content").style.display = ""
    }
}

function folderWord(fromArray, check) {

    if (nextWord != 0) {  

        console.log(nextWord, last)

        fromArray.length = (user.rows*user.columns)
        
        if (last == folderNumber.sub.questions[sentenceNumber][currentWord -1]) {
            currentWord--
            nextWord = folderNumber.sub.questions[sentenceNumber][currentWord]
            if (fromArray.includes(nextWord)) {
                //
            } else {
                let random = Math.floor(Math.random() * (user.rows*user.columns));
                fromArray.splice(random, 0, nextWord)
                loadGrid(fromArray, sentenceArray[sentenceArray.length -1])
                fromArray.splice(random, 1)
            }
        } else {
            if (check == -1) {
                return
            }
            if (check == -2) {
                console.log('zero')
            }
            if (currentWord == sentenceArray.length -1) {
                nextWord = folderNumber.sub.questions[sentenceNumber][currentWord]
                if (fromArray.includes(nextWord)) {
                    //
                } else {
                    let random = Math.floor(Math.random() * (user.rows*user.columns));
                    fromArray.splice(random, 0, nextWord)
                    loadGrid(fromArray, sentenceArray[sentenceArray.length -1])
                    fromArray.splice(random, 1)
                }
            } 
        }
    } else {
        console.log('not folder')
    }
}

function next(fromArray, current, id) {

    fromArray.length = (user.rows*user.columns)

    if (id == nextWord) {
        currentWord++
        if (typeof folderNumber.sub.questions[sentenceNumber][currentWord] == "undefined") {
            currentWord = 0
            sentenceNumber ++
            console.log("up")
        }
        if (typeof folderNumber.sub.questions[sentenceNumber] == "undefined") {
            currentWord = 0
            sentenceNumber = 0
            return console.log("done")
        } else {
            nextWord = folderNumber.sub.questions[sentenceNumber][currentWord]
        }
        if (fromArray.includes(nextWord)) {
            //
        } else {
            let random = Math.floor(Math.random() * (user.rows*user.columns));
            fromArray.splice(random, 0, nextWord)
            loadGrid(fromArray, current)
            fromArray.splice(random, 1)
        }
    } else {
        changeOrder(current, id)
    }
}
