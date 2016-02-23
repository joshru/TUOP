var globals = {
    player: null,
    mousePosition: {x: 0, y: 0},
    clickPosition: {x: 0, y: 0},
    clickHoldPosition: {x: 0, y: 0},
    fibs: {fib1: 0, fib2: 1, currFib: 1},
    wave: 0,
    killCount: 0,
    zombieDeathCount: 0,
    mute: false,
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
    globals.player.hitbox.x = locX + ((this.frameWidth * scaleBy) / 2);
    globals.player.hitbox.y = locY + ((this.frameHeight * scaleBy) / 2);
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
    Entity.call(this, game, 0, 400);
    this.radius = 0;
    this.bg = ASSET_MANAGER.getAsset("./img/terrain/grass.png");
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
};

Background.prototype.draw = function (ctx) {
    //ctx.fillStyle = "SaddleBrown";
    //ctx.fillRect(0,500,800,300);
    //ctx.font
    var canvas = document.getElementById('gameWorld');
    var opacity = 0;

    ctx.drawImage(this.bg, 0, 0);

    // for wave counter

    ctx.font = "30px Courier New";
    ctx.fillStyle = "white";

    ctx.fillText("Wave: " + globals.wave, 200, 60);
    ctx.fillText("Kills: " + globals.killCount, 10, 60);
    //ctx.fillText("Mute me", 10, 80).ondblclick.apply(document.getElementById("soundFX").muted = true);

    if (globals.player.health >= 0) {
        ctx.fillText("Player Health: " + globals.player.health, 10, 30);
        /* for blood - we don't need this if you guys don't like it
         * decrease the first hardcoded number to lower threshold */
        opacity += 0.3 - (globals.player.health / 100);
        // for testing numbers:
        // this.game.ctx.fillText(opacity, 10, 100);
        ctx.fillStyle = "rgba(195, 0, 0, " + opacity + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    /*Display player health*/
    if (globals.player.health === 0) {
        ctx.fillStyle = "rgba(195, 0, 0, " + 0.5 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "50px Courier New";
        ctx.fillText("YOU DEAD HOMIE rip", 235, canvas.height / 2);
    }

    Entity.prototype.draw.call(this);
};

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

    UP: 87, //w
    RIGHT: 68, //d
    DOWN: 83, //s
    LEFT: 65, //a
    R: 82, //R
    H: 72, //H
    P: 80,

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

}, false);
//window.addEventListener('mouseover', function(event) { mousePosition = getMousePos(document.getElementById('gameWorld'), event);}, false);
//window.addEventListener('mousemove', function(event) { mousePosition = getMousePos(document.getElementById('gameWorld'), event); }, false);
window.addEventListener('click', function (event) {
    globals.clickPosition = click(document.getElementById('gameWorld'), event);
}, false);
window.addEventListener('mousemove', function (event) {
    globals.mousePosition = getMousePos(document.getElementById('gameWorld'), event);
}, false);

var muteButton = document.getElementById('muteToggle');
muteButton.addEventListener('click', function() { globals.mute ^= true });

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

//terrain
ASSET_MANAGER.queueDownload("./img/terrain/grass.png");
ASSET_MANAGER.queueDownload("./img/terrain/Test lab.png");

//animations
ASSET_MANAGER.queueDownload("./img/hgun_idle.png");
ASSET_MANAGER.queueDownload("./img/hgun_move.png");
ASSET_MANAGER.queueDownload("./img/hgun_reload.png");
ASSET_MANAGER.queueDownload("./img/hgun_shoot.png");
ASSET_MANAGER.queueDownload("./img/bullet.jpg");
ASSET_MANAGER.queueDownload("./img/zombie.png");
ASSET_MANAGER.queueDownload("./img/death_animation/zombie_death.png");
ASSET_MANAGER.queueDownload("./img/hp-heart.png");

//sounds
ASSET_MANAGER.queueDownload("./sound/usp.wav");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');

    var ctx = canvas.getContext('2d');
    ctx.font = "48px serif";

    var gameEngine = new GameEngine();
    globals.player = new Player(gameEngine, 0.5);
    var bg = new Background(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(new Zombie(gameEngine));
    gameEngine.addEntity(globals.player);

    gameEngine.init(ctx);
    gameEngine.start();
});