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
  //  this.protoZombie = new Zombie(game);
    this.spawnPoints = [];
    this.activeSpawns = 1;
    this.totalSpawns = 4;

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
    //this.game.addEntity(zombo);
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

/**
 * Spawns a waveNumber of zombies.
 * @param amountToSpawn
 */
Spawner.prototype.spawnWave = function(amountToSpawn) {

    var numSpawned = 0;
    var lastSpawn = 0;

    shuffle(this.currentMap.spawnPoints);//TODO play around with where to put this

    //Zombies left to spawn
   /* while (numSpawned < amountToSpawn) {
        //Spawn Delay: prevents all zombies from starting out in a dog pile
        // Should create a follow the leader effect.
       // var timePassed = (Date.now() - lastSpawn) / 1000;
        //if (timePassed > .8) {
            //Rearrange the order of spawn points
            //Cheat code method for choosing 'activeSpawn' amount of random spawn points without having to
            //keep track of indices

            for (var i = 0; i < this.activeSpawns; i++) {
                this.spawnZombie(coords.x, coords.y);

                console.log("Spawner spawned zombie at " + coords.x + " , " + coords.y);

                numSpawned++;
             //   lastSpawn = Date.now();

                if (numSpawned >= amountToSpawn) break;
            }

        //}


    }*/

    for (var i = 0; i < amountToSpawn; i++) {
        console.log("Number spawned: " + (i + 1) + " , amount needed" + amountToSpawn);

        var randoIndex = randomInt(globals.SPAWNER.activeSpawns);

        var coords = this.currentMap.spawnPoints[randoIndex];

        this.spawnZombie(coords.x, coords.y);

    }


};


Spawner.prototype.spawnNewWave = function() {
    if (globals.waveNumber < globals.currentLevelInfo.waves.length ) {
        var i = globals.currentLevelInfo.waves[globals.waveNumber].zombies;
        var j = 0;
        var that = this;
        //timeout based "for" loop of sorts
        (function theLoop(i) {
            setTimeout(function () {

                var numSpawns = globals.currentLevelInfo.waves[globals.waveNumber].spawns.length;
                var spawnOptions = globals.currentLevelInfo.waves[globals.waveNumber].spawns;
                var spawnCoords = globals.SPAWNER.currentMap.spawnPoints[spawnOptions[j % numSpawns]];

                //Move spawn point slightly so zombies aren't all spawning in the same position
                //TODO subtract these values from spawn points on right side of map to prevent zombies from spawning
                //out of bounds
               // spawnCoords.x += randomInt(10);
                //spawnCoords.y += randomInt(10);

                //console.log("spawn coordinates chosen : (" + spawnCoords.x + "," + spawnCoords.y + ")");
                that.spawnZombie(spawnCoords.x, spawnCoords.y);


                if (--i) {                  // If i > 0, keep going
                    theLoop(i);  // Call the loop again
                }
            }, 300); //ms delay
        })(i);

        globals.zombieDeathCount = 0;

    }
};

Spawner.prototype.update = function() {
    if (globals.zombieDeathCount === globals.currentLevelInfo.waves[globals.waveNumber].zombies) {

        globals.waveNumber++;
        this.spawnNewWave();

    }
};

