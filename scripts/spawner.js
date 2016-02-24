/**
 * Created by Brandon on 2/24/2016.
 */
function Spawner(game) {
    this.game = game;
    this.protoZombie = new Zombie(game);
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


Spawner.prototype.spawnWave = function() {

};