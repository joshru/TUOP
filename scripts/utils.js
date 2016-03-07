/**
 * Created by Brandon on 2/24/2016.
 */
function shuffle(array) {

    for (var i = 0; i < array.length; i++) {
        var shuffIndex = randomInt(array.length);

        var temp = array[i];
        array[i] = array[shuffIndex];
        array[shuffIndex] = temp;

    }

}

/**
 * Generates a random number
 * @param n max
 * @returns {number} int: random number
 */
function randomInt(n) {
    return Math.floor(Math.random() * n);
}

//converts coordinates in game world to coordinates where the sprite should be drawn on screen.
function worldToScreen(x, y) {
    return {x: x - (-globals.background.x), y: y - (-globals.background.y)};

}

//converts coordinates on the screen to coordinates in the game world as a whole.
function screenToWorld(x, y) {
    return {x: x + -globals.background.x, y: y + -globals.background.y};
}

/**
 * Determines the distance between 2 entities
 * @param a first entity
 * @param b second entity
 * @shoutout Marriot
 */
function distance(a, b) {
    // console.log("Received parameters: (" + a.x + "," + a.y + ") , (" + b.x + "," + b.y + ")");
    var dx = Math.abs(a.x - b.x);
    var dy = Math.abs(a.y - b.y);
    return Math.sqrt(dx * dx + dy * dy);
}

function screenDistance(a, b) {
    var dx = Math.abs(a.screenX - b.screenX);
    var dy = Math.abs(a.screenY - b.screenY);
    return Math.sqrt(dx * dx + dy * dy);
}

function worldDistance(a, b) {
    var dx = Math.abs(a.worldX - b.worldX);
    var dy = Math.abs(a.worldY - b.worldY);
    return Math.sqrt(dx * dx + dy * dy);
}



function calculateVelocity(sX, sY, eX, eY) {
    var dx = eX - sX;
    var dy = eY - sY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var xVel = dx / dist;
    var yVel = dy / dist;

    return {x: xVel, y: yVel};
}
/**
 * reads a text file into a variable
 * @param fileName
 * @shoutout Majid Laissi @stackoverflow
 */
function readTextFile(fileName) {
    var rawFile = new XMLHttpRequest();
    var allText = "";
    rawFile.open("GET", fileName, false);
    rawFile.onreadystatechange = function() {

        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                allText = rawFile.responseText;
            }
        }

    };
    rawFile.send(null);
    return allText;
}

function jsonToObject(jsonToParse) {
    return JSON.parse(jsonToParse);
}

function jsonFileToObject(fileName) {
    return jsonToObject(readTextFile(fileName));
}

function setCurrentMap(mapName) {
    var map;
    switch (mapName) {
        case 'lab':
            map = new Map(mapName, './img/terrain/LabMap.png');
            globals.currentLevelInfo = jsonFileToObject('./waveInfo/realWave1.json');
            break;
        case 'altLab':
            map = new Map(mapName, './img/terrain/lab2.png');
            globals.currentLevelInfo = jsonFileToObject('./waveInfo/lab2info.json');
            break;

        default:

            break;
    }
    globals.SPAWNER.setCurrentMap(map);
    globals.background.setBGImage(map.path);

}