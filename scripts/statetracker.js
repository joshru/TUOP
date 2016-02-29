/**
 * Created by Brandon on 2/26/2016. CURRENTLY UNUSED
 */
function StateTracker(game) {
    this.game = game;
    this.totalWaves = 9;
    this.currentWave = 0;
    this.zombiesPerWave = 3;
    this.waveTime = 15;
    this.zombiesKilled = 0;
    this.zombiesSpawned = 0;
    this.waveStartTime = null;
    Entity.call(this, game, 0, 0);
}


StateTracker.prototype = new Entity();
StateTracker.prototype.constructor = StateTracker;



StateTracker.prototype.update = function() {

    var waveFinished = this.checkWaveFinished();

    if (waveFinished) {
        console.log("Waved finished, spawning new waveNumber");
        this.zombiesKilled = 0;
        this.spawnNewWave();
    }

    if (this.checkGameOver()) {
        // DO stuff IDK
    }

    if (this.currentWave % 3 == 0 && globals.SPAWNER.activeSpawns < globals.SPAWNER.totalSpawns) {
        globals.SPAWNER.activeSpawns++;
    }



    Entity.prototype.update.call(this);
};

StateTracker.prototype.draw = function() {


};

StateTracker.prototype.checkGameOver = function() {
    return this.currentWave > this.totalWaves;
};

StateTracker.prototype.checkWaveFinished = function() {
    return this.zombiesKilled === this.zombiesPerWave;
};

StateTracker.prototype.spawnNewWave = function() {
    this.currentWave++;
    if (this.currentWave <= this.totalWaves) globals.SPAWNER.spawnWave(this.zombiesPerWave);
    this.zombiesSpawned += this.zombiesPerWave;
    this.zombiesPerWave += 3;

    this.waveStartTime = Date.now();
};