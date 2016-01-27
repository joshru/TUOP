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

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy, angle) {
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
    ctx.save();
    ctx.translate(locX, locY);
    ctx.rotate(angle * (Math.PI / 180));
    //ctx.rotate(0.17);

    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
    //ctx.rotate((Math.PI / 2.0) - angle);
    ////ctx.translate(-(locX * this.frameWidth), -(locY * this.frameHeight));
    //ctx.restore();
};

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
};

//function Background(game) {
//    Entity.call(this, game, 0, 400);
//    this.radius = 200;
//}
//
//Background.prototype = new Entity();
//Background.prototype.constructor = Background;
//
//Background.prototype.update = function () {
//};
//
//Background.prototype.draw = function (ctx) {
//    ctx.fillStyle = "SaddleBrown";
//    ctx.fillRect(0,500,800,300);
//    Entity.prototype.draw.call(this);
//};

function Player(game, player) {
    this.game = game;
    this.player = player;

    this.animations = {};

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/hgun_idle.png"), 0, 0, 258, 220, 0.2, 1, true, false);



    //this.animation = this.animations.hgunIdle;

    this.radius = 100;
    this.ground = 500;
    Entity.call(this, game, 0, this.ground);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    //console.log("updating player");
    Entity.prototype.update.call(this);
};

Player.prototype.draw = function(ctx) {
    //console.log("drawing player");
    //this.rotateAndCache(this.animation.spriteSheet, 45);
    this.animation.drawFrame(this.game.clockTick, ctx, 400, 400, 0.5, 90);
    //this.rotateAndCache(this.animation.spriteSheet, 45);
    //ctx.save();
    //ctx.translate(this.x, this.y);
    //ctx.rotate(180);
    //ctx.drawImage(this.animation.spriteSheet, 100, 100);
    //ctx.restore();

    Entity.prototype.draw.call(this);
};

var Key = {
    _pressed: {},

    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFT: 37,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },
    onKeyDown: function(event) {
        this._pressed[event.keyCode] = true;
    },
    onKeyUp: function(event) {
        delete this._pressed[event.keyCode];
    }

};

window.addEventListener('keyup', function(event) { Key.onKeyUp(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeyDown(event); }, false);

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/hgun_idle.png");
ASSET_MANAGER.queueDownload("./img/hgun_move.png");
ASSET_MANAGER.queueDownload("./img/hgun_reload.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var player = new Player(gameEngine);
    var player2 = new Player(gameEngine);
    //var bg = new Background(gameEngine);
    //var unicorn = new Unicorn(gameEngine);

    //gameEngine.addEntity(bg);
    //gameEngine.addEntity(unicorn);
    gameEngine.addEntity(player, 1);
    gameEngine.addEntity(player2, 2);

    gameEngine.init(ctx);
    gameEngine.start();
});
