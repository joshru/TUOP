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

function calculateVelocity(sX, sY, eX, eY) {
    var dx = eX - sX;
    var dy = eY - sY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var xVel = dx / dist;
    var yVel = dy / dist;

    return {x: xVel, y: yVel};
}