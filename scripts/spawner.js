/**
 * Created by Brandon on 2/24/2016.
 */

const SMALL = 5;
const MED = 15;
const LARGE = 20;

/**
 * Constructor for spawner object.
 * Will be used to materialize zombies and bosses.
 * @param game
 * @param map
 * @constructor
 */
function Spawner(game, map) {
    this.currentMap = map;

    this.waves = {
        small: 5,
        med: 15,
        large: 20
    };

    this.game = game;
    this.spawnPoints = [];
    this.activeSpawns = 1;
    this.totalSpawns = 4;

    this.waveStartTime;

}
/**
 * Spawns a zombie at a given location.
 * @param x
 * @param y
 */
Spawner.prototype.spawnZombie = function(x, y) {
    var zombo = new Zombie(this.game);


    zombo.setCoordinates(x, y);

    this.game.addZombie(zombo);
};


Spawner.prototype.spawnZombieRandomPos = function() {
    this.game.addZombie(this.game);
};

/**
 * Reassigns the map this spawner should use.
 * Allows the spawner to utilize map specific spawn points.
 * @param map
 */
Spawner.prototype.setCurrentMap = function(map) {
    this.currentMap = map;
};



/** FLAGSHIP SPAWNING FUNCTION
 * Spawns zombies at the currently active spawn points
 * Uses a custom loop function to make sure zombies aren't all
 * spawned at once.
 *
 *
 * @shoutout Scott Ogrin for the timeout loop
 * @from scottiestech.info
 * */
Spawner.prototype.spawnNewWave = function(random) {
    if (globals.waveNumber < globals.currentLevelInfo.waves.length ) {
        var i = globals.currentLevelInfo.waves[globals.waveNumber].zombies;
        var j = 0;
        var that = this;
        //timeout based "for" loop of sorts
        (function theLoop(i) {
            setTimeout(function () {

                var numSpawns = globals.currentLevelInfo.waves[globals.waveNumber].spawns.length;
                var spawnOptions = globals.currentLevelInfo.waves[globals.waveNumber].spawns;
                var spawnCoords = globals.SPAWNER.currentMap.spawnPoints[spawnOptions[j++ % numSpawns] - 1];

                //console.log("spawn coordinates chosen : (" + spawnCoords.x + "," + spawnCoords.y + ")");

                var randomCoords = {x: randomInt(globals.background.bg.width), y: randomInt(globals.background.bg.height)};

                if (random) that.spawnZombie(randomCoords.x, randomCoords.y);
                else that.spawnZombie(spawnCoords.x, spawnCoords.y);

                if (--i) {                  // If i > 0, keep going
                    theLoop(i);  // Call the loop again
                }
            }, 300); //ms delay
        })(i);

        globals.zombieDeathCount = 0;
        this.waveStartTime = Date.now();
    }
};

Spawner.prototype.update = function() {


    if (globals.zombieDeathCount === globals.currentLevelInfo.waves[globals.waveNumber].zombies
        || (Date.now() - this.waveStartTime) / 1000 > globals.currentLevelInfo.waves[globals.waveNumber].time) {

        globals.waveNumber++;
        this.spawnNewWave(true);

    }
};

