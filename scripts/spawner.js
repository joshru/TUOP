/**
 * Created by Brandon on 2/24/2016.
 */
const SMALL = 5;
const MED = 15;
const LARGE = 20;


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

}

Spawner.prototype.spawnZombie = function(x, y) {
    var zombo = new Zombie(this.game);
    zombo.x = x;
    zombo.y = y;

    this.game.addEntity(zombo);
};

Spawner.prototype.setCurrentMap = function(map) {
    this.currentMap = map;
};


Spawner.prototype.spawnWave = function(size) {

    var numSpawned = 0;
    var lastSpawn = Date.now();


    while (numSpawned < size) {

        var timePassed = Date.now() - lastSpawn / 1000;
        if (timePassed > .8) {

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