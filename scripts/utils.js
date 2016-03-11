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

/**
 * Function to determine if a circle is colliding with a rectangle. Useful for detecting collisions between the
 * player and any bounding rectangles designed to keep the player from noclipping through everything.
 *
 * @param circle
 * @param rect
 * @returns {boolean} collission detected or not
 * @shoutout markE @from stackoverflow
 */
function circleRectCollision(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.w / 2);
    var distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + circle.radius)) return false;
    if (distY > (rect.h / 2 + circle.radius)) return false;

    if (distX <= (rect.w / 2)) return true;
    if (distY <= (rect.h / 2)) return true;

    var dx = distX - rect.w / 2;
    var dy = distY - rect.h / 2;

    /** testing*/
    var collision = {
        left: dx <= 0,
        right: dx > 0,
        up: dy <= 0,
        down: dy > 0
    };
    var result =
    {
        dir: collision,
        collide: (dx * dx + dy * dy <= (circle.radius * circle.radius))
    };

    return result;
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
        case 'bossroom':
            map = new Map(mapName, './img/terrain/bossroom reloaded.png');
            globals.currentLevelInfo = jsonFileToObject('./waveInfo/realWave1.json'); //TODO create level info for this map
            break;
        default:

            break;
    }
    globals.SPAWNER.setCurrentMap(map);
    globals.background.setBGImage(map.path);

}