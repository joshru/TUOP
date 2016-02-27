var globals = {
    player: null,
    background: null,
    mousePosition: {x: 0, y: 0},
    clickPosition: {x: 0, y: 0},
    clickHoldPosition: {x: 0, y: 0},
    fibs: {fib1: 0, fib2: 1, currFib: 1},
    wave: 0,
    killCount: 0,
    powerUpTime: {godlike: 0},
    zombieDeathCount: 0,
    mute: true,
    debug: false
};

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}
/**
 * Determines the distance between 2 entities
 * @param a first entity
 * @param b second entity
 * @shoutout Marriot
 */
function distance(a, b) {
    // console.log("Received parameters: (" + a.x + "," + a.y + ") , (" + b.x + "," + b.y + ")");
    var dx = Math.abs(a.x - b.x);
    var dy = Math.abs(a.y - b.y);
    return Math.sqrt(dx * dx + dy * dy);
}


Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    //console.log("Mouse X: " + globals.mousePosition.x + " | Mouse Y: " + globals.mousePosition.y);

    //ROTATION HANDLED HERE
    //Negating these arguments makes him face the mouse instead of the opposite direction.
    var rotation = Math.atan2(-(locY - globals.mousePosition.y), -(locX - globals.mousePosition.x) - 50);

    ctx.save();
    ctx.translate((locX + ((this.frameWidth * scaleBy) / 2)), (locY + ((this.frameHeight * scaleBy) / 2)));
    ctx.rotate(rotation);
//    globals.player.hitbox.x = locX + ((this.frameWidth * scaleBy) / 2);
  //  globals.player.hitbox.y = locY + ((this.frameHeight * scaleBy) / 2);
    ctx.translate(-(locX + (this.frameWidth * scaleBy) / 2), -(locY + (this.frameHeight * scaleBy) / 2));

    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);

    ctx.restore();
};

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
};

function Background(game) {
    this.name = "Background";
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.scrolling = false;
    this.radius = 0;
    this.bg = ASSET_MANAGER.getAsset("./img/terrain/2048_grass.png");
    this.width = this.bg.width;
    this.height = this.bg.height;

    //Entity.call(this, game, 0, 400);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    var stepDist = 5;
    //console.log("bg x: " + this.x + " | bg y: " + this.y);
    if (Key.isDown(Key.RIGHT)) {
        if (this.x >= -this.width + this.game.ctx.canvas.width + stepDist) {
            //this.scrolling = true;
            this.x -= stepDist;
        } else {
            //this.scrolling = false;
        }
    }
    if (Key.isDown(Key.LEFT)) {
        if (this.x <= -stepDist) {
            //this.scrolling = true;
            this.x += stepDist;
        } else {
            //this.scrolling = false;
        }
    }
    if (Key.isDown(Key.UP)) {
        if (this.y <= -stepDist) {
            //this.scrolling = true;
            this.y += stepDist;
        } else {
            //this.scrolling = false;
        }
    }
    if (Key.isDown(Key.DOWN)) {
        if (this.y >= -this.height + this.game.ctx.canvas.height + stepDist) {
            //this.scrolling = true;
            this.y -= stepDist;
        } else {
            //this.scrolling = false;
        }
    }
    //console.log("bg x: " + this.x + " | bg y: " + this.y);
};

Background.prototype.draw = function (ctx) {
    var canvas = document.getElementById('gameWorld');
    var opacity = 0;

    ctx.drawImage(this.bg, this.x, this.y);

    //ctx.fillText("Mute me", 10, 80).ondblclick.apply(document.getElementById("soundFX").muted = true);

    /* Screen get's bloodier */
    if (globals.player.health >= 0) {
        opacity += 0.3 - (globals.player.health / 100);
        ctx.fillStyle = "rgba(195, 0, 0, " + opacity + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Courier New";
        ctx.fillStyle = "white";
        ctx.fillText("Player Health: " + globals.player.health, 10, 30);
    }
    /*Display player health*/
    if (globals.player.health <= 0) {
        ctx.fillStyle = "rgba(195, 0, 0, " + 0.5 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "50px Courier New";
        ctx.fillText("YOU DEAD HOMIE rip", 120, canvas.height / 2);
        // line below stops updating the game (we can keep this or lose this).
        this.game.gameStates.GAMEOVER = true;
        ///* for splash screen and start */
        //var startOrReplay = {
        //    x: 420,
        //    y: canvas.height / 2 - 50,
        //    w: 150,
        //    h: 30
        //};
        //
        //canvas.addEventListener("mousedown", startGame, false);
        //ctx.fillText("REPLAY", startOrReplay.x, startOrReplay.y);
    }

    /* Display Godlike */
    if (globals.player.godlike) {
        ctx.fillStyle = "rgba(255, 255, 58, " + 0.15 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Courier New";
        ctx.fillStyle = "white";
        ctx.fillText("GODLIKE: " + globals.powerUpTime.godlike, 10, 90);
    }

    /* Display Wave and Kills */
    ctx.font = "30px Courier New";
    ctx.fillStyle = "white";
    ctx.fillText("Wave: " + globals.wave, 200, 60);
    ctx.fillText("Kills: " + globals.killCount, 10, 60);

    Entity.prototype.draw.call(this);
};

//converts coordinates in game world to coordinates where the sprite should be drawn on screen.
function worldToScreen(x, y) {
    return {x: x - (-globals.background.x), y: y - (-globals.background.y)};

}

//converts coordinates on the screen to coordinates in the game world as a whole.
function screenToWorld(x, y) {
    return {x: x + -globals.background.x, y: y + -globals.background.y};
}

/**
 * Generates a random number
 * @param n max
 * @returns {number} int: random number
 */
function randomInt(n) {
    return Math.floor(Math.random() * n);
}

/**
 * Global Key object
 * Processed keyboard input
 */
var Key = {
    _pressed: {},
    _tap: {},

    UP: 87, //w
    RIGHT: 68, //d
    DOWN: 83, //s
    LEFT: 65, //a
    R: 82, //R
    H: 72, //H
    P: 80,
    G: 71,
    CLICK: 1,
    TWO: 50,
    ONE: 49,
    THREE: 51,
    FOUR: 52,

    isDown: function (keyCode) {
        return this._pressed[keyCode];
    },
    onKeyDown: function (event) {

        this._pressed[event.keyCode] = true;
    },
    onKeyUp: function (event) {
        this._pressed[event.keyCode] = false;
    },
    keyPressed: function () {
        return this._pressed.length === 0;

    },

    keyTapped: function(keyCode) {
        return this._tap[keyCode];
    },

    onKeyTap: function(event) {
        this._tap[event.keyCode] = true;
    },

    resolveTap: function(keyCode) {
        this._tap[keyCode] = false;
    }




};

/**
 * Global function to return the mouse position on the canvas
 * @param canvas
 * @param event
 * @returns {{x: number, y: number}}
 */
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {x: Math.round(event.clientX - rect.left), y: Math.round(event.clientY - rect.top)};
}

/**
 * Creates an object representing the coordinates of the click
 * @param canvas
 * @param event
 * @returns {{x: number, y: number}}
 */
function click(canvas, event) {
    return {x: Math.round(event.clientX - canvas.offsetLeft), y: Math.round(event.clientY - canvas.offsetTop)};
}

//Assign listeners to keys
window.addEventListener('keyup', function (event) {
    Key.onKeyUp(event);


    if (event.which === 71) { //g
        globals.player.throwingGrenade = true;
    }

    //HARDCODE FOR GRENADES //TODO fix this isht

}, false);
window.addEventListener('keydown', function (event) {
    Key.onKeyDown(event);

    if (event.which === 82) {
        globals.player.game.RELOAD = true;
    }
    //P key
    if (event.keyCode === Key.P) globals.player.game.gameStates.PAUSED ^= true;

    if (event.which === Key.H) {
        globals.debug ^= true;
    }
//
}, false);

window.addEventListener('keypress', function (event) {
    console.log(String.fromCharCode(event.keyCode) + " key pressed");
    Key.onKeyTap(event);
}, false);


window.addEventListener('click', function (event) {
    globals.clickPosition = click(document.getElementById('gameWorld'), event);
}, false);
window.addEventListener('mousemove', function (event) {
    globals.mousePosition = getMousePos(document.getElementById('gameWorld'), event);
}, false);
window.addEventListener('mousedown', function (event){
    globals.clickHoldPosition = click(document.getElementById('gameWorld'), event);
}, false);


window.addEventListener('mousedown', function(event) {
    globals.player.game.firing = true;
}, false);

window.addEventListener('mouseup', function(event) {
    globals.player.game.firing = false;
}, false);


var muteButton = document.getElementById('muteToggle');
muteButton.addEventListener('click', function() { globals.mute ^= true });

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

// terrain
ASSET_MANAGER.queueDownload("./img/terrain/grass.png");
ASSET_MANAGER.queueDownload("./img/terrain/Test lab.png");
ASSET_MANAGER.queueDownload("./img/terrain/2048_grass.png");

// animations
ASSET_MANAGER.queueDownload("./img/player/hgun_idle.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_move.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_reload.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_shoot.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_flash.png");
ASSET_MANAGER.queueDownload("./img/player/moving_feet.png");
ASSET_MANAGER.queueDownload("./img/player/idle_feet.png");
ASSET_MANAGER.queueDownload("./img/bullet.jpg");
ASSET_MANAGER.queueDownload("./img/zombie/zombie.png");
ASSET_MANAGER.queueDownload("./img/zombie/zombie_death.png");
ASSET_MANAGER.queueDownload("./img/ammo/proj_25.png");
ASSET_MANAGER.queueDownload("./img/ammo/shell_10.png");

// splash screen
ASSET_MANAGER.queueDownload("./img/welcome-splash800.png");

// power ups
ASSET_MANAGER.queueDownload("./img/powerups/hp-heart.png");
ASSET_MANAGER.queueDownload("./img/powerups/godlike.png");

// sounds
ASSET_MANAGER.queueDownload("./sound/usp.wav");
ASSET_MANAGER.queueDownload("./sound/godlike.wav");

ASSET_MANAGER.downloadAll(function () {
    startGame();
});

function startGame() {
    var canvas = document.getElementById('gameWorld');

    var ctx = canvas.getContext('2d');

    /* for splash screen and start */
    var startOrReplay = {
        x: 320,
        y: canvas.height / 2 - 50,
        w: 150,
        h: 30
    };

    canvas.addEventListener("mousedown", fireUpTheEnginesBoys, false);

    ctx.drawImage(ASSET_MANAGER.getAsset("./img/welcome-splash800.png"), 0, 0);
    ctx.fillStyle = "white";
    ctx.font = "50px Courier New";
    ctx.fillText("START", startOrReplay.x, startOrReplay.y);

    function fireUpTheEnginesBoys(event) {
        var rect = canvas.getBoundingClientRect();
        var canvas_x = Math.round(event.clientX - rect.left);
        var canvas_y = Math.round(event.clientY - rect.top);

        //console.log("x=" + canvas_x + " y= " + canvas_y + "startext y: " + startText.y);
        if (canvas_x >= startOrReplay.x && canvas_x <= startOrReplay.x + startOrReplay.w &&
            canvas_y >= startOrReplay.y - startOrReplay.h && canvas_y <= startOrReplay.y) {
            startOrReplay = {x: undefined, y: undefined, w: undefined, h: undefined};
            var gameEngine = new GameEngine();
            globals.player = new Player(gameEngine, 0.5);
            globals.background = new Background(gameEngine);

            //gameEngine.addEntity(globals.background);
            //gameEngine.addZombie(new Zombie(gameEngine));
            gameEngine.addEntity(globals.background);
            gameEngine.addEntity(new Zombie(gameEngine));
            //gameEngine.addEntity(new PowerUp(gameEngine, {x: 900, y: 900}, "hp")); //for testing on scrolling map
            gameEngine.addEntity(globals.player);

            gameEngine.init(ctx);
            gameEngine.start();
        }
    }
}

