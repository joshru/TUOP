/**
 * Created by Josh on 2/29/2016.
 */
function StatTrack(game) {
    this.name = "Stat Tracker";
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.radius = 0;

}
StatTrack.prototype = new Entity();
StatTrack.prototype.constructor = StatTrack;

StatTrack.prototype.update = function() {
};

StatTrack.prototype.draw = function(ctx) {
    var canvas = document.getElementById('gameWorld');
    var opacity = 0;


    /* Screen get's bloodier */
    opacity += 0.3 - (globals.player.health / 100);
    ctx.fillStyle = "rgba(195, 0, 0, " + opacity + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Courier New";
    ctx.fillStyle = "white";
    ctx.fillText("Player Health: " + globals.player.health, 10, 30);

    /* Death Scene */
    if (globals.player.health <= 0) {
        //ctx.fillStyle = "rgba(195, 0, 0, " + 0.5 + ")";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "50px Courier New";
        ctx.fillText("YOU DEAD HOMIE rip", 120, canvas.height / 2 - 50);
        // line below stops updating the game (we can keep this or lose this).
        this.game.gameStates.GAMEOVER = true;

        /* for replaying */
        var startOrReplay = {
            x: 320,
            y: canvas.height / 2,
            w: 150,
            h: 30
        };

        canvas.addEventListener("mousedown", restartGame, false);

        ctx.fillText("REPLAY", startOrReplay.x, startOrReplay.y);
    }

    if (globals.waveNumber === globals.currentLevelInfo.waves.length) {
        //console.log("Final wave reached, game over");
        this.game.gameStates.GAMEOVER = true;

        /* for replaying */
        var startOrReplay = {
            x: 320,
            y: canvas.height / 2,
            w: 150,
            h: 30
        };

        canvas.addEventListener("mousedown", restartGame, false);

        ctx.fillStyle = "rgba(0, 195, 0, " + 0.5 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "50px Courier New";
        ctx.fillText("REPLAY", startOrReplay.x, startOrReplay.y);
        ctx.fillText("YOU WIN!", startOrReplay.x - 25, startOrReplay.y - 50);
    }

    /* Display Wave and Kills */
    ctx.font = "30px Courier New";
    ctx.fillStyle = "white";
    ctx.fillText("Wave: " + (globals.waveNumber + 1) + "/" + (globals.currentLevelInfo.totalWaves ), 200, 60);
    ctx.fillText("Kills: " + globals.killCount, 10, 60);

    function restartGame(event) {
        console.log("testing");
        var rect = canvas.getBoundingClientRect();
        var canvas_x = Math.round(event.clientX - rect.left);
        var canvas_y = Math.round(event.clientY - rect.top);

        if (canvas_x >= startOrReplay.x && canvas_x <= startOrReplay.x + startOrReplay.w &&
            canvas_y >= startOrReplay.y - startOrReplay.h && canvas_y <= startOrReplay.y) {
            startOrReplay = {x: undefined, y: undefined, w: undefined, h: undefined};
            // reloads page - restart all states and canvas is much more complicated
            location.reload();
            this.game.gameStates.GAMEOVER = false;
        }
    }
};