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
    this.activeSpawns = 2;

}
/**
 * Spawns a zombie at a given location.
 * @param x
 * @param y
 */
Spawner.prototype.spawnZombie = function(x, y) {
    var zombo = new Zombie(this.game);
    zombo.x = x;
    zombo.y = y;

    this.game.addZombie(zombo);
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
 * Spawns a wave of zombies.
 * @param amountToSpawn
 */
Spawner.prototype.spawnWave = function(amountToSpawn) {

    var numSpawned = 0;
    var lastSpawn = Date.now();

    //Zombies left to spawn
    while (numSpawned < amountToSpawn) {
        //Spawn Delay: prevents all zombies from starting out in a dog pile
        // Should create a follow the leader effect.
        var timePassed = Date.now() - lastSpawn / 1000;
        if (timePassed > .8) {
            //Rearrange the order of spawn points
            //Cheat code method for choosing 'activeSpawn' amount of random spawn points without having to
            //keep track of indices
            shuffle(this.currentMap.spawnPoints);

            for (var i = 0; i < this.activeSpawns; i++) {
                var coords = this.currentMap.spawnPoints[i];
                this.spawnZombie(coords.x, coords.y);
                numSpawned++;
            }
            lastSpawn = Date.now();

        }


    }

};

