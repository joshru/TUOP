

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
    //ctx.translate(locX, locY);
    //ctx.rotate(angle * (Math.PI / 180));
    //ctx.rotate(0.17);
    console.log("Mouse X: " + mousePosition.x + " | Mouse Y: " + mousePosition.y);

    //ROTATION HANDLED HERE

    //Negating these arguments makes him face the mouse instead of the opposite direction.
    var rotation = Math.atan2(-(locY - mousePosition.y), -(locX - mousePosition.x));
    ctx.save();

    ctx.translate((locX + (this.frameWidth / 2)), (locY + (this.frameHeight / 2)));

    //ctx.beginPath();
    //ctx.arc(locX + (this.frameWidth / 2), locY + (this.frameHeight / 2), 50, 0, 2*Math.PI, false);
    //ctx.fillStyle = "red";
    //ctx.closePath();
    //ctx.stroke();

    ctx.rotate(rotation);
    ctx.translate(-(locX + (this.frameWidth * scaleBy) / 2)  , -(locY + (this.frameHeight * scaleBy) / 2));
    //ctx.translate(0, 0);
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);

    ctx.restore();
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

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
    this.bg = ASSET_MANAGER.getAsset("./img/terrain/grass.png");
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
};

Background.prototype.draw = function (ctx) {
    //ctx.fillStyle = "SaddleBrown";
    //ctx.fillRect(0,500,800,300);
    ctx.drawImage(this.bg, 0, 0);
    Entity.prototype.draw.call(this);
};

function Player(game) {
    this.game = game;
    this.stepDistance = 5;
    this.states = {
        IDLE:0,
        MOVING:1,
        SHOOTING:2
    };
    this.state = this.states.IDLE;
    this.animations = {};

    this.animations.idle = new Animation(ASSET_MANAGER.getAsset("./img/hgun_idle.png"), 0, 0, 258, 220, 0.2, 1, true, false);
    this.animations.run = new Animation(ASSET_MANAGER.getAsset("./img/hgun_move.png"), 0, 0, 260 , 230, .15, 16, true, false);


    //this.animation = this.animations.hgunIdle;

    this.radius = 100;
    this.ground = 500;
    Entity.call(this, game, 0, this.ground);
}




Player.prototype = new Entity();
Player.prototype.constructor = Player;

/*
   * Moves the player.
   * @param xTrans distance to move left or right
   * @param yTrans distance to move up or down
 */
Player.prototype.move = function(xTrans, yTrans) {
    this.x += xTrans;
    this.y += yTrans;
};

Player.prototype.handleMovementInput = function() {
    if (Key.isDown(Key.RIGHT)) {
        this.state = this.states.MOVING;
        this.move(5, 0);
    }
    if (Key.isDown(Key.LEFT)) {
        this.state = this.states.MOVING;
        this.move(-5, 0);
    }
    if (Key.isDown(Key.UP)) {
        this.state = this.states.MOVING;
        this.move(0, -5);
    }
    if (Key.isDown(Key.DOWN)) {
        this.state = this.states.MOVING;
        this.move(0, 5);
    }
}


Player.prototype.update = function() {
    //console.log("updating player");
    this.handleMovementInput();

    //} else this.state = this.states.idle;
    if (!Key.keyPressed()) this.state = this.states.IDLE;



    Entity.prototype.update.call(this);
};

Player.prototype.draw = function(ctx) {
    //console.log("drawing player");
    //this.rotateAndCache(this.animation.spriteSheet, 45);
    if (this.state === this.states.IDLE) {
        this.animations.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);
    }



    if (this.state === this.states.MOVING) {
        this.animations.run.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);
    }

    Entity.prototype.draw.call(this);
};

var Key = {
    _pressed: {},

    //keyPressed: false,

    UP: 87,
    RIGHT: 68,
    DOWN: 83,
    LEFT: 65,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },
    onKeyDown: function(event) {

        this._pressed[event.keyCode] = true;
    },
    onKeyUp: function(event) {
       this._pressed[event.keyCode] = false;
        // delete this._pressed[event.keyCode];
       // var index = this._pressed.indexOf(event.keyCode);
       // this._pressed.splice(index, 1);
    },
    keyPressed: function() {
        for (var i = 0; i < this._pressed.length; i++) {
            if (this._pressed[i] === true) return true;
        }
        return false;

    }


};

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return { x: Math.round(event.clientX - rect.left), y: Math.round(event.clientY - rect.top) };
}

var mousePosition;

window.addEventListener('keyup', function(event) { Key.onKeyUp(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeyDown(event); }, false);
//window.addEventListener('mouseover', function(event) { mousePosition = getMousePos(document.getElementById('gameWorld'), event);}, false);
window.addEventListener('mousemove', function(event) { mousePosition = getMousePos(document.getElementById('gameWorld'), event);}, false);


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/terrain/grass.png");

ASSET_MANAGER.queueDownload("./img/hgun_idle.png");
ASSET_MANAGER.queueDownload("./img/hgun_move.png");
ASSET_MANAGER.queueDownload("./img/hgun_reload.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var player = new Player(gameEngine);
    var bg = new Background(gameEngine);
    //var unicorn = new Unicorn(gameEngine);

    gameEngine.addEntity(bg);
    //gameEngine.addEntity(unicorn);
    gameEngine.addEntity(player);

    gameEngine.init(ctx);
    gameEngine.start();
});
