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
/**
 * Adds information about the map to this object.
 * Manually sets spawn points for the map.
 *
 */
Map.prototype.assignMapProperties = function() {
    switch(this.name) {

        case 'lab':

            console.log("Lab map successfully recognized and created");
            this.width = 2048;
            this.height = 2048;

            this.spawnPoints.push({x: 0, y: 0});
            this.spawnPoints.push({x: 1970, y: 80});
            this.spawnPoints.push({x: 80, y: 1960});
            this.spawnPoints.push({x: 1970, y: 1960});

            this.bossSpawns.push({x: 1020, y: 1530});
            this.bossSpawns.push({x: 1026, y: 510});

            break;
        default:
            break;
    }

};