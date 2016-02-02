// test showing github integration

var globals = {
    mousePosition: {x:0, y:0}
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

  //  console.log("Mouse X: " + globals.mousePosition.x + " | Mouse Y: " + globals.mousePosition.y);

    //ROTATION HANDLED HERE

    //Negating these arguments makes him face the mouse instead of the opposite direction.
    var rotation = Math.atan2(-(locY - globals.mousePosition.y), -(locX - globals.mousePosition.x));
    ctx.save();

    ctx.translate((locX + (this.frameWidth / 2)), (locY + (this.frameHeight / 2)));



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



function Zombie(game) {
    this.game = game;
    this.name = "Zombie";
    this.states = {};
    this.health = 100;

    this.radius = 30;
    this.ground = 500;
    this.x = 500; //hardcoded for prototype zombie
    this.y = 300; //TODO come up with a zombie spawning system using timers or something

    this.states = {
        IDLE:0,
        MOVING:1
    };


    this.animations = {};
    this.animations.idle = new Animation(ASSET_MANAGER.getAsset("./img/Enemies/citizenzombieFlip4.png"),0,0,71,71,.15, 1, true, false);
    this.currAnim = this.animations.idle;

    Entity.call(this, game, this.x, this.y);
}

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.update = function() {
    //handle movement and stuff

    //check if getting shot the F up
    for (var i = 0; i < this.game.bullets.length; i++) {
        var bullet = this.game.bullets[i];
        //console.log("Distance From Bullet: " + distance(this, bullet));
        //TODO make it so bullets can only do damage once
        if (!bullet.spent && this.isCollidingWith(bullet)) {
            this.health -= bullet.damage;
            bullet.spent = true;
            bullet.removeFromWorld = true;
            console.log("You shot me!");
        }
    }


    //TODO create dying animation and stuff
    if (this.health <= 0) this.removeFromWorld = true;


};

Zombie.prototype.draw = function(ctx) {
    this.currAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y,1);
    //console.log("Zombie position (" + this.x + "," + this.y + ")");

};

Zombie.prototype.isCollidingWith = function(bullet) {
    return distance(this, bullet) < this.radius + bullet.radius;
};



function Bullet(x, y, xVelocity, yVelocity, src, game) {
    this.x = x; // probably doesn't need to be here
    this.y = y;
    this.name = "Bullet";
    //this.dir = dir;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.src = src;
    this.game = game;
    this.speed = 0;
    this.animation = null;
    this.damage = 0;
    this.spent = false;
    //TODO make bullets colorful circles instead
    //Determine which bullet to use based on the gun that fired it
    switch(this.src) {
        case 'pistol':
            this.speed = 10;
            this.damage = 15;
            this.radius = 10;
            this.animation = new Animation(ASSET_MANAGER.getAsset("./img/bullet.jpg"), 0, 0, 114, 114, .15, 1, true, false);
            break;
        default:
            break;

    }
    //this.radius = 70;

    Entity.call(this, game, this.x, this.y);
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function() {
    var canvas = document.getElementById('gameWorld');
    var that = this;
    //Remove bullet if offscreen
    if (this.x < 0 || this.y < 0 || this.x > canvas.width || this.y > canvas.height) {
        that.removeFromWorld = true;
    } else {
        //Change its position otherwise
        this.x += that.xVelocity * this.speed;
        this.y += that.yVelocity * this.speed;

        //console.log("Bullet position (" + this.x + "," + this.y + ")");

    }

};

Bullet.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "Yellow";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    //this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);

};


function Player(game) {
    this.game = game;
    this.name = "Player";
    this.stepDistance = 5;

    this.states = {
        IDLE:0,
        MOVING:1,
        SHOOTING:2,
        CURRENT_GUN:'pistol'
    };

    this.state = this.states.IDLE;
    this.animations = {};

    this.animations.idle = new Animation(ASSET_MANAGER.getAsset("./img/hgun_idle.png"), 0, 0, 258, 220, 0.2, 1, true, false);
    this.animations.run = new Animation(ASSET_MANAGER.getAsset("./img/hgun_move.png"), 0, 0, 260 , 230, .15, 16, true, false);
    this.animations.shootPistol = new Animation(ASSET_MANAGER.getAsset("./img/hgun_shoot.png"), 17, 25, 271, 184, true, false);

    //this.animation = this.animations.hgunIdle;

    this.radius = 100;
    this.ground = 500;
    Entity.call(this, game, 0, this.ground);
}




Player.prototype = new Entity();
Player.prototype.constructor = Player;


/**
 * creates a bullet and adds it to the game's bullet data structure
 */
Player.prototype.shoot = function(endX, endY) {
    var bulletX = this.x + this.animations.idle.frameWidth / 2;
    var bulletY = this.y + this.animations.idle.frameWidth / 2;


    var dx = (endX - bulletX);
    var dy = (endY - bulletY);

    var mag = Math.sqrt(dx * dx + dy * dy);




    var xVelocity = (dx / mag); // * 5;
    var yVelocity = (dy / mag); //* 5;



    this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity, yVelocity, this.states.CURRENT_GUN, this.game));
};
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
        this.move(this.stepDistance, 0);
    }
    if (Key.isDown(Key.LEFT)) {
        this.state = this.states.MOVING;
        this.move(-this.stepDistance, 0);
    }
    if (Key.isDown(Key.UP)) {
        this.state = this.states.MOVING;
        this.move(0, -this.stepDistance);
    }
    if (Key.isDown(Key.DOWN)) {
        this.state = this.states.MOVING;
        this.move(0, this.stepDistance);
    }
};




Player.prototype.update = function() {
    //console.log("updating player");
    this.handleMovementInput();


    if (this.game.leftClick) {
        this.shoot(globals.mousePosition.x, globals.mousePosition.y);
        this.game.leftClick = false;
    }

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

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function Zombie(game) {
    this.player = 1;
    this.radius = 10;
    this.visualRadius = 500;
    this.name = "Zombie";
    this.color = "Red";
    this.friction = 1;
    var minSpeed = 5;
    var maxSpeed = 100;
    this.maxSpeed = minSpeed + (maxSpeed - minSpeed) * Math.random();

    //if (!clone) {
        Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    //}
//else {
//        if (clone.x < 0) clone.x = 0;
//        if (clone.y < 0) clone.y = 0;
//        if (clone.x > 800) clone.x = 800;
//        if (clone.y > 800) clone.y = 800;
//        if (clone.x > 0 && clone.y > 0 && clone.x < 800 && clone.y < 800) {
//            Entity.call(this, game, clone.x, clone.y);
//        } else {
//            Entity.call(this, game, 400, 400);
//        }
    //}
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};


Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Zombie.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Zombie.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Zombie.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Zombie.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Zombie.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * this.friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * this.friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    var chasing = false;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        console.log("current entity: " + ent.name);
        if (ent !== this && this.collide(ent)) {
            if (ent.name === "Zombie") {
                var temp = { x: this.velocity.x, y: this.velocity.y };

                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * this.friction;
                this.velocity.y = ent.velocity.y * this.friction;
                ent.velocity.x = temp.x * this.friction;
                ent.velocity.y = temp.y * this.friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name !== "Zombie" && ent.name !== "Bullet" && !ent.removeFromWorld) {
                ent.removeFromWorld = true;
                console.log(ent.name + " kills: " + ent.kills);
                var newZombie = new Zombie(this.game, ent);
                this.game.addEntity(newZombie);
            }
            if (ent.name === "Bullet"/* && ent.thrown*/) {
                this.removeFromWorld = true;
                ent.thrown = false;
                ent.velocity.x = 0;
                ent.velocity.y = 0;
                ent.thrower.kills++;
            }
        }
        var acceleration = 1000000;

        if (ent.name !== "Zombie" && ent.name !== "Bullet" && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
              if (dist > this.radius + ent.radius + 2) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
            }
            chasing = true;
        }


    }

    //if (!chasing) {
    //    ent = this.game.zombies[randomInt(this.game.zombies.length)];
    //    var dist = distance(this, ent);
    //    if (dist > this.radius + ent.radius + 2) {
    //        var difX = (ent.x - this.x) / dist;
    //        var difY = (ent.y - this.y) / dist;
    //        this.velocity.x += difX * acceleration / (dist * dist);
    //        this.velocity.y += difY * acceleration / (dist * dist);
    //    }
    //
    //}

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - this.friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - this.friction) * this.game.clockTick * this.velocity.y;
};

Zombie.prototype.draw = function (ctx) {
    //ctx.beginPath();
    //ctx.fillStyle = this.color;
    //ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    //ctx.fill();
    //ctx.closePath();
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/zombie.png"), this.x, this.y);

};

var Key = {
    _pressed: {},

    //keyPressed: false,

    UP: 87, //w
    RIGHT: 68, //d
    DOWN: 83, //s
    LEFT: 65, //a

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
        /*for (var i = 0; i < this._pressed.length; i++) {
            if (this._pressed[i]) return true;
        }
        return false;*/
        return this._pressed.length === 0;

    }


};

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return { x: Math.round(event.clientX - rect.left), y: Math.round(event.clientY - rect.top) };
}

function click(canvas, event) {

}

var mousePosition;
var clickPosition;


window.addEventListener('keyup', function(event) { Key.onKeyUp(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeyDown(event); }, false);
//window.addEventListener('mouseover', function(event) { mousePosition = getMousePos(document.getElementById('gameWorld'), event);}, false);
window.addEventListener('mousemove', function(event) { mousePosition = getMousePos(document.getElementById('gameWorld'), event); }, false);
window.addEventListener('mouseclick', function (event) { clickPosition = click(document.getElementById('gameworld'), event); }, false);
window.addEventListener('mousemove', function(event) { globals.mousePosition = getMousePos(document.getElementById('gameWorld'), event);}, false);


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/terrain/grass.png");
ASSET_MANAGER.queueDownload("./img/terrain/Test lab.png");



ASSET_MANAGER.queueDownload("./img/hgun_idle.png");
ASSET_MANAGER.queueDownload("./img/hgun_move.png");
ASSET_MANAGER.queueDownload("./img/hgun_reload.png");
ASSET_MANAGER.queueDownload("./img/bullet.jpg");
ASSET_MANAGER.queueDownload("./img/Enemies/citizenzombieFlip4.png");



ASSET_MANAGER.queueDownload("./img/zombie.png");

var player;

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    player = new Player(gameEngine);
    var bg = new Background(gameEngine);

    //var zombie;
    //for (var i = 0; i < 10; i++) {
    //    zombie = new Zombie(gameEngine);
    //    gameEngine.addEntity(zombie);
    //}
    var zombie1 = new Zombie(gameEngine);
    var zombie2 = new Zombie(gameEngine);
    //var unicorn = new Unicorn(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(zombie1);
    gameEngine.addEntity(zombie2);
    //gameEngine.addEntity(unicorn);
    gameEngine.addEntity(player);

    gameEngine.init(ctx);
    gameEngine.start();
});
