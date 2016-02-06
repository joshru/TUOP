var globals = {
    player: null,
    mousePosition: {x: 0, y: 0},
    clickPosition: {x: 0, y: 0},
    clickHoldPosition: {x: 0, y: 0},
    fibs: {fib1: 0, fib2: 1, currFib: 1},
    wave: 0,
    zombieDeathCount: 0,
    debug: true
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
 *
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

    ctx.fillText("Wave: " + globals.wave, 10, 55);
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
    if (globals.player.health === 0) {
        ctx.fillStyle = "rgba(195, 0, 0, " + 0.5 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"
        ctx.font = "50px Courier New";
        ctx.fillText("YOU DEAD HOMIE rip", 125, canvas.height / 2);
    }

    Entity.prototype.draw.call(this);
};

function Hitbox(x, y, radius, game) {
    this.name = "Hitbox";
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.game = game;

    //Entity.call(this, game, this.x, this.y);
}

Hitbox.prototype = new Entity();
Hitbox.prototype.constructor = Hitbox;

Hitbox.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Hitbox.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Hitbox.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Hitbox.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Hitbox.prototype.update = function () {
    console.log("hb update");
    Entity.prototype.update.call(this);
};

Hitbox.prototype.updateXY = function (x, y) {
    this.x = x;
    this.y = y;
};

Hitbox.prototype.draw = function (ctx) {
    //console.log("hb x: " + this.x + " | hb y: " + this.y);
    ctx.beginPath();
    ctx.strokeStyle = "Red";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "Green";
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.radius, this.y + this.radius);
    ctx.stroke();
    ctx.closePath();

    //Entity.prototype.draw.call(ctx);
};
/**
 * Determines whether or not this hitbox is colliding with the other hit box
 * and which directio the collision is in.
 *  Note: can collide with multiple directions
 * @param other hitbox to collide with
 * @returns {{hit: boolean, dirs: {top: boolean, right: boolean, down: boolean, left: boolean}}}
 *
 */
Hitbox.prototype.getCollisionDirection = function(other) {

    var collisions = { top:   this.y < other.hitbox.y,
        right: this.x > other.hitbox.x,
        down:  this.y > other.hitbox.y,
        left:  this.x < other.hitbox.x };


    return {hit: distance(this, other.hitbox) < this.radius + other.hitbox.radius, dirs: collisions};
};

function PowerUp(game, other, type) {
    this.game = game;
    this.name = "PowerUp";
    this.radius = 25;
    this.type = type;
    this.x = other.x;
    this.y = other.y;
    this.sprite = null;
    this.audio = document.getElementById('soundFX');

    this.animations = {};
    switch(type) {
        case "hp":
            this.sprite = ASSET_MANAGER.getAsset("./img/hp-heart.png");
            break;
    }

    var hbX = this.x;
    var hbY = this.y;

    this.hitbox = new Hitbox(hbX, hbY, this.radius, game);

    Entity.call(this, game, this.x, this.y);
}

PowerUp.prototype.update = function() {
    // drops HP accordingly
    this.hitbox.updateXY(this.x + this.sprite.width / 2,  this.y + this.sprite.height / 2);

    // Player picks up HP
    if (this.isCollidingWith(globals.player)) {
        switch(this.type) {
            case "hp":
                globals.player.health += 10;
                this.audio.src = "./sound/hpup.wav";
                break;
        }
        this.audio.play();
        this.removeFromWorld = true;
    }
};

PowerUp.prototype.draw = function (ctx) {
    if (globals.debug) this.hitbox.draw(ctx);

    ctx.drawImage(this.sprite, this.x, this.y);

    Entity.prototype.draw.call(this)
};

PowerUp.prototype.isCollidingWith = function (entity) {
    return distance(this.hitbox, entity.hitbox) < this.hitbox.radius + entity.hitbox.radius;
};

function Zombie(game) {
    this.game = game;
    this.name = "Zombie";
    this.states = {};
    this.health = 100;

    this.speed = 5;


    this.radius = 20;
    this.ground = 500;
    this.x = randomInt(750); //hardcoded for prototype zombie
    this.y = randomInt(750); //TODO come up with a zombie spawning system using timers or something


    //TODO create speedScale variable so zombies of different types can have different speeds
    //EX: speedScale = 100 for slow zombies, 200 for slightly faster, etc.

    this.speedScale = 100;

    this.velocity = {x: Math.random() * this.speedScale, y: Math.random() * this.speedScale};


    this.states = {
        IDLE: 0,
        MOVING: 1
    };

    this.animations = {};
    this.animations.idle = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 71, 71, .15, 1, true, false);
    //this.currAnim = this.animations.idle;

    var hbX = this.x + (this.animations.idle.frameWidth / 2);
    var hbY = this.y + (this.animations.idle.frameHeight / 2);

    this.hitbox = new Hitbox(hbX, hbY, this.radius, game);

    Entity.call(this, game, this.x, this.y);
}

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.update = function () {
    var friction = 1;
    var maxSpeed = 100;
    var minSpeed = 5;

    //handle movement and stuff
    //TODO iron this out

    this.collideOtherZombies();


    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    this.hitbox.updateXY(this.x + (this.animations.idle.frameWidth / 2),
        this.y + (this.animations.idle.frameHeight / 2));

    // follow player
    if (globals.player.health > 0) { //player is alive
        var dx = globals.player.x - this.x;
        var dy = globals.player.y - this.y;
        var pointDistance = Math.sqrt(dx * dx + dy * dy);

        this.velocity.x = (dx / pointDistance) * friction * this.speedScale;
        this.velocity.y = (dy / pointDistance) * friction * this.speedScale;

        //Not sure how often to do this
        this.hitbox.updateXY(this.x + (this.animations.idle.frameWidth / 2),
            this.y + (this.animations.idle.frameHeight / 2));



    }
    //player dead, bounce off walls
    else if (this.hitbox.collideLeft() || this.hitbox.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;

        this.hitbox.updateXY(this.x + (this.animations.idle.frameWidth / 2),
            this.y + (this.animations.idle.frameHeight / 2));
    }
    else if (this.hitbox.collideTop() || this.hitbox.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;

        this.hitbox.updateXY(this.x + (this.animations.idle.frameWidth / 2),
            this.y + (this.animations.idle.frameHeight / 2));
    }

    var i;
    //check if getting shot the F up
    for (i = 0; i < this.game.bullets.length; i++) {
        var bullet = this.game.bullets[i];
        //console.log("Distance From Bullet: " + distance(this, bullet));

        if (!bullet.spent && this.isCollidingWith(bullet)) {
            this.health -= bullet.damage;
            bullet.spent = true;
            bullet.removeFromWorld = true;
            console.log("You shot me!");
        }
    }


    var acceleration = 1000;//TODO add comments explaining this?


    //Handle collision with the player
    var playerX = globals.player.x;
    var playerY = globals.player.y;
    var dist = distance(this, globals.player);
    if (dist > this.radius + globals.player.radius + 2) {
        var difX = (playerX - this.x) / dist;
        var difY = (playerY - this.y) / dist;
        this.velocity.x += difX * acceleration / (dist * dist);
        this.velocity.y += difY * acceleration / (dist * dist);
    }

    //TODO create dying animation and stuff
    //Do this by setting dying=true; then have a conditional that checks for dying and changes the animation
    //accordingly
    if (this.health <= 0) this.die();
};

Zombie.prototype.draw = function (ctx) {

    var rotation = Math.atan2(-(this.y - globals.player.hitbox.y), -(this.x - globals.player.hitbox.x));

    ctx.save();
    ctx.translate((this.x + (71 / 2)), this.y + (71 / 2));
    ctx.rotate(rotation);
    ctx.translate(-(this.x + (71 / 2)), -(this.y + (71 / 2)));
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/zombie.png"), this.x, this.y);
    ctx.restore();
    //this.currAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    //console.log("Zombie position (" + this.x + "," + this.y + ")");

    if (globals.debug) this.hitbox.draw(ctx);

    Entity.prototype.draw.call(this);

};

Zombie.prototype.isCollidingWith = function (bullet) {
    return distance(this.hitbox, bullet) < this.hitbox.radius + bullet.radius;
};

Zombie.prototype.die = function () {
    //TODO switch to death animation
    this.removeFromWorld = true;
    ++globals.zombieDeathCount;

    // TODO random chance HP drops when zombie dies
    var chance = randomInt(10) + 1;
    if (chance < 7) {
        // TODO this will turn into a switch at some point to change types
        this.game.addEntity(new PowerUp(this.game, this, "hp"));
    }

    // var currentFib = globals.fib1 + globals.fib2;
    console.log("Current Fib: " + globals.fibs.currFib + ", Death Count: " + globals.zombieDeathCount);
    if (globals.zombieDeathCount === globals.fibs.currFib) {
        // see in Background.prototype.draw for wave counter
        globals.wave++;

        console.log("killed goal reached, spawning " + globals.fibs.currFib + " zombies.");
        //update previous and current fibonacci numbers
        globals.fibs.fib1 = globals.fibs.fib2;
        globals.fibs.fib2 = globals.fibs.currFib;
        globals.fibs.currFib = globals.fibs.fib1 + globals.fibs.fib2;
        //Spawn current fib amount of zombies
        for (var i = 0; i < globals.fibs.currFib; i++) {
            this.game.addEntity(new Zombie(this.game));
        }
        globals.zombieDeathCount = 0;

    }
    //if (globals.zombieDeathCount % 3 == 0) globals.zombieSpawnScale *= 1.5;
    //

};
/**
 * Handles collision between zombies. At the moment tries to teleport zombies over 60 pixels
 */
Zombie.prototype.collideOtherZombies = function() {
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent.name === 'Zombie') {

            var collisionInfo = this.hitbox.getCollisionDirection(ent);
            //TODO make this work a little better
            // it roughly works for now and prevents zombies from overlapping,
            // but looks wonky because the zombies just teleport
            if (ent !== this && collisionInfo.hit) {
                var bounceDist = 60;
                // check combinations of directions
                if (collisionInfo.dirs.top && collisionInfo.dirs.left) {
                    this.y += bounceDist;
                    this.x += bounceDist;

                } else if (collisionInfo.dirs.top && collisionInfo.dirs.right) {
                    this.y += bounceDist;
                    this.x -= bounceDist;
                } else if (collisionInfo.dirs.top) {
                    this.y += bounceDist;
                }
                if (collisionInfo.dirs.bottom && collisionInfo.dirs.left) {
                    this.y +=bounceDist;
                    this.x +=bounceDist;
                } else if (collisionInfo.dirs.bottom && collisionInfo.dirs.right) {
                    this.y +=bounceDist;
                    this.x -= bounceDist;
                } else if (collisionInfo.dirs.bottom) {
                    this.y += bounceDist;
                }
                else if (collisionInfo.dirs.left) this.x += bounceDist;
                else if (collisionInfo.dirs.right) this.x -= bounceDist;

                this.hitbox.updateXY(this.x + (this.animations.idle.frameWidth / 2),
                    this.y + (this.animations.idle.frameHeight / 2));


            }



        }
    }


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
    //Determine which bullet to use based on the gun that fired it
    switch (this.src) {
        case 'pistol':
            this.speed = 10;
            this.damage = 34;
            this.radius = 5;
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

Bullet.prototype.update = function () {
    var canvas = document.getElementById('gameWorld');
    var that = this;
    //Remove bullet if offscreen
    if (this.x < 0 || this.y < 0 || this.x > canvas.width || this.y > canvas.height) {
        that.removeFromWorld = true;
    } else {
        //Change its position otherwise
        this.x += that.xVelocity * this.speed;
        this.y += that.yVelocity * this.speed;
    }
};

Bullet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "#E3612F";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    if (globals.debug) {
        ctx.strokeStyle = "Pink";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(globals.clickPosition.x, globals.clickPosition.y);
        ctx.stroke();
    }

    ctx.closePath();
    //console.log("click x: " + globals.clickPosition.x + " | click y: " + globals.clickPosition.y);
    //this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);

};


function Player(game, scale) {
    this.game = game;
    this.name = "Player";
    this.scale = scale || 1;
    this.stepDistance = 5;
    this.health = 100;

    this.audio = document.getElementById('soundFX');


    this.states = {
        IDLE: 0,
        MOVING: 1,
        SHOOTING: 2,
        RELOADING: 3,
        CURRENT_GUN: 'pistol'
    };

    this.state = this.states.IDLE;
    this.animations = {};

    this.animations.idle = new Animation(ASSET_MANAGER.getAsset("./img/hgun_idle.png"), 0, 0, 258, 220, 0.2, 1, true, false);
    this.animations.run = new Animation(ASSET_MANAGER.getAsset("./img/hgun_move.png"), 0, 0, 260, 230, .15, 16, true, false);
    this.animations.shootPistol = new Animation(ASSET_MANAGER.getAsset("./img/hgun_shoot.png"), 0, 0, 300, 238, 0.2, 6, true, false);
    this.animations.reloadPistol = new Animation(ASSET_MANAGER.getAsset("./img/hgun_reload.png"), 0, 0, 269, 241,.13, 15, false, false);
    //this.animation = this.animations.hgunIdle;

    this.radius = 200 * this.scale;

    this.hitbox = new Hitbox(this.x, this.y, this.radius * this.scale, game);

    this.ground = 400;
    Entity.call(this, game, 0, this.ground);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

/**
 * creates a bullet and adds it to the game's bullet data structure
 */
Player.prototype.shoot = function (endX, endY) {
    var bulletX = this.x + (this.animations.idle.frameWidth * this.scale);
    var bulletY = this.y + (this.animations.idle.frameWidth * this.scale) / 2;

    var dx = (endX - bulletX);
    var dy = (endY - bulletY);

    var mag = Math.sqrt(dx * dx + dy * dy);

    var xVelocity = (dx / mag); // * 5;
    var yVelocity = (dy / mag); //* 5;

    this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity, yVelocity, this.states.CURRENT_GUN, this.game));
};

/**
 * Moves the player.
 * @param xTrans distance to move left or right
 * @param yTrans distance to move up or down
 */
Player.prototype.move = function (xTrans, yTrans) {
    this.x += xTrans;
    this.y += yTrans;
};

Player.prototype.handleMovementInput = function () {
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

Player.prototype.update = function () {
    //console.log("updating player");
    this.handleMovementInput();

    if (!Key.keyPressed()) this.state = this.states.IDLE;


    if (this.game.RELOAD) {
        this.state = this.states.RELOADING;
        console.log("Starting reload");
    }

    if (this.game.leftClick) {
        if (globals.debug) console.log("shooting");

        this.state = this.states.SHOOTING;
        this.shoot(globals.mousePosition.x, globals.mousePosition.y);
        this.audio.src = "./sound/usp.wav";
        this.audio.play();
        this.game.leftClick = false;
    }

    //} else this.state = this.states.idle;

    if (this.animations.reloadPistol.isDone()) {
        this.game.RELOAD = false;
        this.animations.reloadPistol.elapsedTime = 0;
        this.state = this.states.IDLE;

    }


    Entity.prototype.update.call(this);
};

Player.prototype.draw = function (ctx) {
    //console.log("drawing player");
    //this.rotateAndCache(this.animation.spriteSheet, 45);
    if (this.state === this.states.IDLE) {
        this.animations.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    if (this.state === this.states.SHOOTING) {
        this.animations.shootPistol.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    if (this.state === this.states.MOVING) {
        this.animations.run.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    if (this.state === this.states.RELOADING) {
        this.animations.reloadPistol.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }





    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent.name === "Zombie") {
            var currentZombie = this.isCollidingWith(ent);
            if (currentZombie.hit) {
                if (globals.debug) console.log("Bit by a zombie!");


                //console.log("hit top: " + current.dirs.top);
                //console.log("hit right: " + current.dirs.right);
                //console.log("hit down: " + current.dirs.down);
                //console.log("hit left: " + current.dirs.left);

                var knockback = 20;

                if (currentZombie.dirs.top) {
                    this.y -= knockback;
                }
                if (currentZombie.dirs.right) {
                    this.x += knockback;
                }
                if (currentZombie.dirs.down) {
                    this.y += knockback;
                }
                if (currentZombie.dirs.left) {
                    this.x -= knockback;
                }

                if (this.audio.src !== "./sound/pain.wav") this.audio.src = "./sound/pain.wav";
                this.audio.play();
                this.health -= 5;


                if (this.health <= 0) {
                    this.audio.src = "./sound/death.wav";
                    this.audio.play();
                    this.removeFromWorld = true;
                }
            }
        }
    }

    if (globals.debug) this.hitbox.draw(ctx);

    Entity.prototype.draw.call(this);
};

Player.prototype.isCollidingWith = function (entity) {
    var collisions = {
        top: this.hitbox.y < entity.hitbox.y,
        right: this.hitbox.x > entity.hitbox.x,
        down: this.hitbox.y > entity.hitbox.y,
        left: this.hitbox.x < entity.hitbox.x
    };


    return {hit: distance(this.hitbox, entity.hitbox) < this.hitbox.radius + entity.hitbox.radius, dirs: collisions};
};


function randomInt(n) {
    return Math.floor(Math.random() * n);
}

//zombie stuff swiped from AI last quarter. Commented out because I think brandon's implementation is better

//function Zombie(game) {
//    this.player = 1;
//    this.radius = 10;
//    this.visualRadius = 500;
//    this.name = "Zombie";
//    this.color = "Red";
//    this.friction = 1;
//    var minSpeed = 5;
//    var maxSpeed = 100;
//    this.maxSpeed = minSpeed + (maxSpeed - minSpeed) * Math.random();
//
//    //if (!clone) {
//        Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
//    //}
////else {
////        if (clone.x < 0) clone.x = 0;
////        if (clone.y < 0) clone.y = 0;
////        if (clone.x > 800) clone.x = 800;
////        if (clone.y > 800) clone.y = 800;
////        if (clone.x > 0 && clone.y > 0 && clone.x < 800 && clone.y < 800) {
////            Entity.call(this, game, clone.x, clone.y);
////        } else {
////            Entity.call(this, game, 400, 400);
////        }
//    //}
//    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
//    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
//    if (speed > this.maxSpeed) {
//        var ratio = this.maxSpeed / speed;
//        this.velocity.x *= ratio;
//        this.velocity.y *= ratio;
//    }
//};
//
//
//Zombie.prototype = new Entity();
//Zombie.prototype.constructor = Zombie;
//
//Zombie.prototype.collide = function (other) {
//    return distance(this, other) < this.radius + other.radius;
//};
//
//Zombie.prototype.collideLeft = function () {
//    return (this.x - this.radius) < 0;
//};
//
//Zombie.prototype.collideRight = function () {
//    return (this.x + this.radius) > 800;
//};
//
//Zombie.prototype.collideTop = function () {
//    return (this.y - this.radius) < 0;
//};
//
//Zombie.prototype.collideBottom = function () {
//    return (this.y + this.radius) > 800;
//};
//
//Zombie.prototype.update = function () {
//    Entity.prototype.update.call(this);
//    //  console.log(this.velocity);
//
//    this.x += this.velocity.x * this.game.clockTick;
//    this.y += this.velocity.y * this.game.clockTick;
//
//    if (this.collideLeft() || this.collideRight()) {
//        this.velocity.x = -this.velocity.x * this.friction;
//        if (this.collideLeft()) this.x = this.radius;
//        if (this.collideRight()) this.x = 800 - this.radius;
//        this.x += this.velocity.x * this.game.clockTick;
//        this.y += this.velocity.y * this.game.clockTick;
//    }
//
//    if (this.collideTop() || this.collideBottom()) {
//        this.velocity.y = -this.velocity.y * this.friction;
//        if (this.collideTop()) this.y = this.radius;
//        if (this.collideBottom()) this.y = 800 - this.radius;
//        this.x += this.velocity.x * this.game.clockTick;
//        this.y += this.velocity.y * this.game.clockTick;
//    }
//
//    var chasing = false;
//    for (var i = 0; i < this.game.entities.length; i++) {
//        var ent = this.game.entities[i];
//        console.log("current entity: " + ent.name);
//        if (ent !== this && this.collide(ent)) {
//            if (ent.name === "Zombie") {
//                var temp = { x: this.velocity.x, y: this.velocity.y };
//
//                var dist = distance(this, ent);
//                var delta = this.radius + ent.radius - dist;
//                var difX = (this.x - ent.x) / dist;
//                var difY = (this.y - ent.y) / dist;
//
//                this.x += difX * delta / 2;
//                this.y += difY * delta / 2;
//                ent.x -= difX * delta / 2;
//                ent.y -= difY * delta / 2;
//
//                this.velocity.x = ent.velocity.x * this.friction;
//                this.velocity.y = ent.velocity.y * this.friction;
//                ent.velocity.x = temp.x * this.friction;
//                ent.velocity.y = temp.y * this.friction;
//                this.x += this.velocity.x * this.game.clockTick;
//                this.y += this.velocity.y * this.game.clockTick;
//                ent.x += ent.velocity.x * this.game.clockTick;
//                ent.y += ent.velocity.y * this.game.clockTick;
//            }
//            if (ent.name !== "Zombie" && ent.name !== "Bullet" && !ent.removeFromWorld) {
//                ent.removeFromWorld = true;
//                console.log(ent.name + " kills: " + ent.kills);
//                var newZombie = new Zombie(this.game, ent);
//                this.game.addEntity(newZombie);
//            }
//            if (ent.name === "Bullet"/* && ent.thrown*/) {
//                this.removeFromWorld = true;
//                ent.thrown = false;
//                ent.velocity.x = 0;
//                ent.velocity.y = 0;
//                ent.thrower.kills++;
//            }
//        }
//        var acceleration = 1000000;
//
//        if (ent.name !== "Zombie" && ent.name !== "Bullet" && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
//            var dist = distance(this, ent);
//              if (dist > this.radius + ent.radius + 2) {
//                var difX = (ent.x - this.x)/dist;
//                var difY = (ent.y - this.y)/dist;
//                this.velocity.x += difX * acceleration / (dist * dist);
//                this.velocity.y += difY * acceleration / (dist * dist);
//            }
//            chasing = true;
//        }
//
//
//    }
//
//    //if (!chasing) {
//    //    ent = this.game.zombies[randomInt(this.game.zombies.length)];
//    //    var dist = distance(this, ent);
//    //    if (dist > this.radius + ent.radius + 2) {
//    //        var difX = (ent.x - this.x) / dist;
//    //        var difY = (ent.y - this.y) / dist;
//    //        this.velocity.x += difX * acceleration / (dist * dist);
//    //        this.velocity.y += difY * acceleration / (dist * dist);
//    //    }
//    //
//    //}
//
//    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
//    if (speed > this.maxSpeed) {
//        var ratio = this.maxSpeed / speed;
//        this.velocity.x *= ratio;
//        this.velocity.y *= ratio;
//    }
//
//    this.velocity.x -= (1 - this.friction) * this.game.clockTick * this.velocity.x;
//    this.velocity.y -= (1 - this.friction) * this.game.clockTick * this.velocity.y;
//};
//

//Zombie.prototype.draw = function (ctx) {
//    //ctx.beginPath();
//    //ctx.fillStyle = this.color;
//    //ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//    //ctx.fill();
//    //ctx.closePath();
//    ctx.drawImage(ASSET_MANAGER.getAsset("./img/zombie.png"), this.x, this.y);
//
//};

var Key = {
    _pressed: {},

    //keyPressed: false,

    UP: 87, //w
    RIGHT: 68, //d
    DOWN: 83, //s
    LEFT: 65, //a
    R:    82, // R

    isDown: function (keyCode) {
        return this._pressed[keyCode];
    },
    onKeyDown: function (event) {

        this._pressed[event.keyCode] = true;
    },
    onKeyUp: function (event) {
        this._pressed[event.keyCode] = false;
        // delete this._pressed[event.keyCode];
        // var index = this._pressed.indexOf(event.keyCode);
        // this._pressed.splice(index, 1);
    },
    keyPressed: function () {
        /*for (var i = 0; i < this._pressed.length; i++) {
         if (this._pressed[i]) return true;
         }
         return false;*/
        return this._pressed.length === 0;

    }


};

function getMousePos(canvas, event) {
    //console.log("mouse moved");
    var rect = canvas.getBoundingClientRect();
    return {x: Math.round(event.clientX - rect.left), y: Math.round(event.clientY - rect.top)};
}

function click(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var ctx = canvas.getContext('2d');
    //globals.clickPosition.x = Math.round(event.offsetX - rect.left);
    //globals.clickPosition.y = Math.round(event.offsetY - rect.top);

    //return { x: Math.round(event.clientX - rect.left), y: Math.round(event.clientY - rect.top) };
    //ctx.beginPath();
    //ctx.fillStyle = "Red";
    //ctx.arc(Math.round(event.clientX - canvas.offsetLeft), Math.round(event.clientY - canvas.offsetTop), 10, 0, Math.PI * 2, false);
    //ctx.fill();
    //ctx.closePath();
    return {x: Math.round(event.clientX - canvas.offsetLeft), y: Math.round(event.clientY - canvas.offsetTop)};
}


window.addEventListener('keyup', function (event) {
    Key.onKeyUp(event);
}, false);
window.addEventListener('keydown', function (event) {
    Key.onKeyDown(event);

    if (event.which === 82) {
        globals.player.game.RELOAD = true;
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


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/terrain/grass.png");
ASSET_MANAGER.queueDownload("./img/terrain/Test lab.png");

ASSET_MANAGER.queueDownload("./img/hgun_idle.png");
ASSET_MANAGER.queueDownload("./img/hgun_move.png");
ASSET_MANAGER.queueDownload("./img/hgun_reload.png");
ASSET_MANAGER.queueDownload("./img/hgun_shoot.png");
ASSET_MANAGER.queueDownload("./img/bullet.jpg");
ASSET_MANAGER.queueDownload("./img/Enemies/citizenzombieFlip4.png");

ASSET_MANAGER.queueDownload("./sound/usp.wav");

ASSET_MANAGER.queueDownload("./img/zombie.png");

ASSET_MANAGER.queueDownload("./img/hp-heart.png");

//var player;

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');

    var ctx = canvas.getContext('2d');
    ctx.font = "48px serif";

    var gameEngine = new GameEngine();
    globals.player = new Player(gameEngine, 0.5);
    var bg = new Background(gameEngine);

    //var zombie;
    //for (var i = 0; i < 10; i++) {
    //    var zombie = new Zombie(gameEngine);
    //    gameEngine.addEntity(zombie);
    //}
    //var zombie1 = new Zombie(gameEngine);
    //var zombie2 = new Zombie(gameEngine);
    //var zombie3 = new Zombie(gameEngine);
    //var zombie4 = new Zombie(gameEngine);
    //var zombie5 = new Zombie(gameEngine);
    //var unicorn = new Unicorn(gameEngine);

    gameEngine.addEntity(bg);
    //gameEngine.addEntity(zombie1);
    //gameEngine.addEntity(zombie2);
    //gameEngine.addEntity(zombie3);
    //gameEngine.addEntity(zombie4);
    //gameEngine.addEntity(zombie5);
    //gameEngine.addEntity(unicorn);
    // var zombie;
    //for (var i = 0; i < 10; i++) {
    //    var zombie = new Zombie(gameEngine);
    //     gameEngine.addEntity(zombie);
    // }
    gameEngine.addEntity(new Zombie(gameEngine));
    gameEngine.addEntity(globals.player);

    gameEngine.init(ctx);
    gameEngine.start();
});