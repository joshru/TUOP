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
    this.boundingBoxes = [];

    this.assignMapProperties();

}
/**
 * Adds information about the map to this object.
 * Manually sets spawn points for the map.
 *
 */
Map.prototype.assignMapProperties = function() {
    this.assignSpawns();
    this.assignBoundingBoxes();

};

Map.prototype.assignSpawns = function() {
    switch(this.name) {

        case 'lab':

            console.log("Lab map successfully recognized and created");
            this.width = 2048;
            this.height = 2048;

            this.spawnPoints.push({x: 0, y: 0});
            this.spawnPoints.push({x: 1970, y: 80});
            this.spawnPoints.push({x: 80, y: 1960});
            this.spawnPoints.push({x: 1970, y: 1960});
            this.spawnPoints.push({x: this.width / 2, y: this.height / 2});


            this.bossSpawns.push({x: 1020, y: 1530});
            this.bossSpawns.push({x: 1026, y: 510});

            break;


        case "altLab":
            console.log("Secondary lab map successfully recognized and created.");
            this.width = 2048;
            this.height = 2048;

            this.spawnPoints.push({x: 928, y: 961});
            this.spawnPoints.push({x: 991, y: 956});
            this.spawnPoints.push({x: 1055, y: 955});
            this.spawnPoints.push({x: 1060, y: 1024});
            this.spawnPoints.push({x: 1057, y: 1087});
            this.spawnPoints.push({x: 990, y: 1090});
            this.spawnPoints.push({x: 934, y: 1085});
            this.spawnPoints.push({x: 927, y: 1028});

            this.bossSpawns.push({x: 991, y: 1024});




            break;
        case 'bossroom':
            console.log("bossroom map selected");

            this.width = 2400;
            this.height = 2400;

            break;

        default:
            break;
    }
};

Map.prototype.assignBoundingBoxes = function() {
    switch(this.name) {

        case 'lab':
            this.boundingBoxes.push({x: 0,y:0, w:2048,h:32});
            this.boundingBoxes.push({x: 0,y:0, w:32,h:2048});
            this.boundingBoxes.push({x: 0,y:2016, w:2048,h:32});
            this.boundingBoxes.push({x: 2016,y:0, w:32,h:2048});





            break;


        case "altLab":





            break;
        case 'bossroom':


            break;

        default:
            break;
    }
}