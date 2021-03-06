var globals = {
    player: null,
    background: null,
    mousePosition: {x: 0, y: 0},
    clickPosition: {x: 0, y: 0},
    clickHoldPosition: {x: 0, y: 0},
    fibs: {fib1: 0, fib2: 1, currFib: 1},
    waveNumber: 0,
    killCount: 0,
    powerUpTime: {godlike: 0},
    zombieDeathCount: 0,
    mute: false,
    debug: false,
    SPAWNER: null,
    STATETRACKER: null,
    currentLevelInfo:  jsonFileToObject("./waveInfo/lab2info.json")
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

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy, type) {
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
    if (type !== 'Zombie') var rotation = Math.atan2(-(locY - globals.mousePosition.y), -(locX - globals.mousePosition.x) - 50);

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
  //  this.bg = ASSET_MANAGER.getAsset("./img/terrain/LabMap.png");
 //   this.width = this.bg.width;
   // this.height = this.bg.height;

    //Entity.call(this, game, 0, 400);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
    var stepDist = 5;
    //console.log("bg x: " + this.x + " | bg y: " + this.y);
    if (Key.isDown(Key.RIGHT)) {
        if (this.x >= -this.width + this.game.ctx.canvas.width + stepDist) { //TODO testing
        //if (this.x >= -this.width + globals.background.bg.width + stepDist) {
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
Background.prototype.setBGImage = function(imagePath) {
  this.bg = ASSET_MANAGER.getAsset(imagePath);
    this.width = this.bg.width;
    this.height = this.bg.height;
};

Background.prototype.draw = function (ctx) {
    var canvas = document.getElementById('gameWorld');
    var opacity = 0;

    ctx.drawImage(this.bg, this.x, this.y);

    /* Display Godlike */
    if (globals.player.godlike) {
        ctx.fillStyle = "rgba(255, 255, 58, " + 0.15 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Courier New";
        ctx.fillStyle = "white";
        ctx.fillText("GODLIKE: " + globals.powerUpTime.godlike, 10, 90);
    }

    Entity.prototype.draw.call(this);
};

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

    //TODO consider getting rid of these,
    //went with a different method
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
   // console.log(String.fromCharCode(event.keyCode) + " key pressed");
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



var bgm = document.getElementById('bgm');
var sfx = document.getElementById('soundFX');
var gunSFX = document.getElementById('gunFX');
var nadeSFX = document.getElementById('nadeFX');
var pickupSFX = document.getElementById('pickupFX');
bgm.volume = 0.2;
sfx.volume = 0.2;

var muteButton = document.getElementById('muteToggle');
muteButton.addEventListener('click', function() {
    globals.mute ^= true;
    //var bgm = document.getElementById('bgm');
    sfx.muted = globals.mute;
    gunSFX.muted = globals.mute;
    nadeSFX.muted = globals.mute;
    pickupSFX.muted = globals.mute;
});
var bgmMute = document.getElementById('bgmMuteToggle');
bgmMute.addEventListener('click', function() {
    globals.bgmMute ^= true;
    bgm.muted = globals.bgmMute;
});

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

// splash screen
ASSET_MANAGER.queueDownload("./img/welcome-splash800.png");
ASSET_MANAGER.queueDownload("./img/loading-splash.png");

// terrain
ASSET_MANAGER.queueDownload("./img/terrain/grass.png");
ASSET_MANAGER.queueDownload("./img/terrain/Test lab.png");
ASSET_MANAGER.queueDownload("./img/terrain/2048_grass.png");
ASSET_MANAGER.queueDownload("./img/terrain/LabMap.png");
ASSET_MANAGER.queueDownload("./img/terrain/lab2.png");
ASSET_MANAGER.queueDownload("./img/terrain/bossroom reloaded.png");

// terrain thumbnails
ASSET_MANAGER.queueDownload("./img/terrain/terrain_thumbnails/lab_thumb.png");
ASSET_MANAGER.queueDownload("./img/terrain/terrain_thumbnails/lab2_thumb.png");
ASSET_MANAGER.queueDownload("./img/terrain/terrain_thumbnails/bossroom_thumb.png");

// Enemies
ASSET_MANAGER.queueDownload("./img/Enemies/bosszombie.png");


// animations
ASSET_MANAGER.queueDownload("./img/player/hgun_idle.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_move.png");

ASSET_MANAGER.queueDownload("./img/player/hgun_idle_norm.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_flash_norm.png");
ASSET_MANAGER.queueDownload("./img/player/shgun_idle_norm.png");
ASSET_MANAGER.queueDownload("./img/player/shgun_flash_norm.png");

ASSET_MANAGER.queueDownload("./img/player/hgun_reload.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_shoot.png");
ASSET_MANAGER.queueDownload("./img/player/hgun_flash.png");

ASSET_MANAGER.queueDownload("./img/player/rifle_idle.png");
ASSET_MANAGER.queueDownload("./img/player/rifle_flash.png");

ASSET_MANAGER.queueDownload("./img/player/shgun_idle.png");
ASSET_MANAGER.queueDownload("./img/player/shgun_flash.png");

ASSET_MANAGER.queueDownload("./img/player/shgun_idle.png");
ASSET_MANAGER.queueDownload("./img/player/shgun_flash.png");

ASSET_MANAGER.queueDownload("./img/player/snip_idle.png");
ASSET_MANAGER.queueDownload("./img/player/snip_flash.png");

ASSET_MANAGER.queueDownload("./img/player/moving_feet.png");
ASSET_MANAGER.queueDownload("./img/player/idle_feet.png");
ASSET_MANAGER.queueDownload("./img/player/test_foot.png");
ASSET_MANAGER.queueDownload("./img/player/run_feet_norm.png");
ASSET_MANAGER.queueDownload("./img/player/idle_feet_norm.png");

ASSET_MANAGER.queueDownload("./img/zombie/zombie.png");
ASSET_MANAGER.queueDownload("./img/zombie/zombie_move.png");
ASSET_MANAGER.queueDownload("./img/zombie/zombie_death.png");
ASSET_MANAGER.queueDownload("./img/ammo/proj_25.png");
ASSET_MANAGER.queueDownload("./img/ammo/shell_10.png");
ASSET_MANAGER.queueDownload("./img/ammo/bullet.jpg");
ASSET_MANAGER.queueDownload("./img/ammo/nade.png");

ASSET_MANAGER.queueDownload("./img/effects/explosion.png");

// power ups
ASSET_MANAGER.queueDownload("./img/powerups/hp-heart.png");
ASSET_MANAGER.queueDownload("./img/powerups/godlike.png");

ASSET_MANAGER.queueDownload("./img/powerups/ar_drop.png");
ASSET_MANAGER.queueDownload("./img/powerups/shotgun_drop.png");
ASSET_MANAGER.queueDownload("./img/powerups/sniper_drop.png");

// sounds
//ASSET_MANAGER.queueDownload("./sound/usp.wav");
//ASSET_MANAGER.queueDownload("./sound/godlike.wav");

ASSET_MANAGER.downloadAll(function () {
    startGame();
});

function startGame() {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    /* for splash screen and start */
    var lab_box = {
        x: 50,
        y: canvas.height / 2 - 200,
        w: 200,
        h: 200
    };
    var lab2_box = {
        x: 300,
        y: canvas.height / 2 - 200,
        w: 200,
        h: 200
    };
    var bossroom_box = {
        x: 550,
        y: canvas.height / 2 - 200,
        w: 200,
        h: 200
    };

    canvas.addEventListener("mousedown", fireUpTheEnginesBoys, false);


    ctx.fillStyle = "white";
    ctx.font = "30px Courier New";
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/welcome-splash800.png"), 0, 0);
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/terrain/terrain_thumbnails/lab_thumb.png"), lab_box.x, lab_box.y);
    ctx.fillText("Lab", lab_box.x, lab_box.y + lab_box.h + 30);
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/terrain/terrain_thumbnails/lab2_thumb.png"), lab2_box.x, lab2_box.y);
    ctx.fillText("Toxic", lab2_box.x, lab2_box.y +lab2_box.h + 30);
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/terrain/terrain_thumbnails/bossroom_thumb.png"), bossroom_box.x, bossroom_box.y);
    ctx.fillText("Boss Room", bossroom_box.x, bossroom_box.y + bossroom_box.h + 30);

    function fireUpTheEnginesBoys(event) {
        //console.log("x=" + canvas_x + " y= " + canvas_y + "startext y: " + startText.y);
        var rect = canvas.getBoundingClientRect();
        var canvas_x = Math.round(event.clientX - rect.left);
        var canvas_y = Math.round(event.clientY - rect.top);

        //console.log("canvas_y: " + canvas_y + " lab_box.y + lab_box.h: " + (lab_box.y + lab_box.h));
        //console.log(canvas_y <= lab_box.y - lab_box.h && canvas_y >= lab_box.y);

        if (canvas_x >= lab_box.x && canvas_x <= lab_box.x + lab_box.w &&
            canvas_y >= lab_box.y && canvas_y <= lab_box.y + lab_box.h) {
            startGame('lab');
        }

        if (canvas_x >= lab2_box.x && canvas_x <= lab2_box.x + lab2_box.w &&
            canvas_y >= lab2_box.y && canvas_y <= lab2_box.y + lab2_box.h) {
            startGame('altLab');
        }

        if (canvas_x >= bossroom_box.x && canvas_x <= bossroom_box.x + bossroom_box.w &&
            canvas_y >= bossroom_box.y && canvas_y <= bossroom_box.y + bossroom_box.h) {
            startGame('bossroom');
        }

        function startGame(mapName) {
            var gameEngine = new GameEngine();
            globals.SPAWNER = new Spawner(gameEngine, null);
            globals.player = new Player(gameEngine, 0.5);
            globals.background = new Background(gameEngine);
            gameEngine.gameStates.GAMEOVER = false;

            lab_box = {x: undefined, y: undefined, w: undefined, h: undefined};
            lab2_box = {x: undefined, y: undefined, w: undefined, h: undefined};
            bossroom_box = {x: undefined, y: undefined, w: undefined, h: undefined};

            globals.SPAWNER.setSpawnPointMode();
            globals.SPAWNER.spawnNewWave();

            setCurrentMap(mapName);

            gameEngine.addEntity(globals.background);

            gameEngine.addEntity(globals.player);
            var ST = new StatTrack(gameEngine);
            gameEngine.addHUD(ST);

            gameEngine.init(ctx);
            gameEngine.start();
        }
    }
}

window.addEventListener('mousedown', function(event) {
    if (globals.player) globals.player.game.firing = true;
}, false);

window.addEventListener('mouseup', function(event) {
    if (globals.player) globals.player.game.firing = false;
}, false);