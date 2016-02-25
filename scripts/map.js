/**
 * Created by Brandon on 2/24/2016.
 */
function Map(name, path) {
    this.name = name;
    this.path = path;
   /* this.spawnPoints = spawnPoints;
    this.width = width;
    this.height = height;*/
    this.spawnPoints = [];
    this.bossSpawns = [];

    this.assignMapProperties();

}

Map.prototype.assignMapProperties = function() {
    switch(this.name) {

        case 'lab':
            this.width = 2048;
            this.height = 2048;

            this.spawnPoints.push({x: 0, y: 0});
            this.spawnPoints.push({x: 1970, y: 80});
            this.spawnPoints.push({x: 80, y: 1960});
            this.spawnPoints.push({x: 1970, y: 1960});

            this.bossSpawns.push({x: 1020, y: 1530});
            this.bossSpawns.push({x: 1026, y: 510});

            break;
    }

};