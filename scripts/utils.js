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