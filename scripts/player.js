/**
 * Created by Josh on 2/10/2016.
 */
/**
 * Player Object. Represents the player character
 * @param game
 * @param scale
 * @constructor
 */
function Player(game, scale) {
    this.game = game;
    this.name = "Player";
    this.scale = scale || 1;
    this.stepDistance = 3;
    this.scrollStep = 1.5;
    this.health = 100;
    this.godlike = false;
    this.drawLazer = false;
    this.throwingGrenade = false;
    this.weaponShotDelay = .5;

    this.lastShotFired = Date.now();
    this.currentFiringMode = "full auto";

    this.audio = document.getElementById('soundFX');


    this.states = {
        IDLE:         0,
        MOVING:       1,
        SHOOTING:     2,
        RELOADING:    3,
        CURRENT_GUN: 'pistol'
    };



    this.state = this.states.IDLE;
    this.animations = {};

    this.animations.idle = new Animation(ASSET_MANAGER.getAsset("./img/player/hgun_idle.png"), 0, 0, 258, 220, 0.2, 1, true, false);
    this.animations.run = new Animation(ASSET_MANAGER.getAsset("./img/player/hgun_move.png"), 0, 0, 258, 220, 0.15, 15, true, false);
    this.animations.shootPistol = new Animation(ASSET_MANAGER.getAsset("./img/player/hgun_flash.png"), 0, 0, 258, 220, 0.03, 1, true, false);
    this.animations.reloadPistol = new Animation(ASSET_MANAGER.getAsset("./img/player/hgun_reload.png"), 0, 0, 269, 241, 0.13, 15, false, false);
    this.animations.idleFeet = new Animation(ASSET_MANAGER.getAsset("./img/player/idle_feet.png", 0, 0, 132, 155, 0.2, 1, true, false));
    this.animations.runFeet = new Animation(ASSET_MANAGER.getAsset("./img/player/moving_feet.png"), 0, 0, 204, 124, 0.1, 20, true, false);
    //this.animation = this.animations.hgunIdle;

    this.radius = 120 * this.scale;

    this.hitbox = new Hitbox(this.x, this.y, this.radius, game);

    this.ground = 400;
    Entity.call(this, game, 0, this.ground);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

/**
 * creates a bullet and adds it to the game's bullet data structure
 */
Player.prototype.shoot = function (endX, endY, firingMode) {
    var bulletX = this.x + (this.animations.idle.frameWidth * this.scale) / 2;
    var bulletY = this.y + (this.animations.idle.frameWidth * this.scale) / 2;

    var dx = (endX - bulletX);
    var dy = (endY - bulletY);

    var mag = Math.sqrt(dx * dx + dy * dy);

    var xVelocity = (dx / mag); // * 5;
    var yVelocity = (dy / mag); // * 5;

    var rotation = Math.atan2(-(bulletY - globals.clickPosition.y), -(bulletX - globals.clickPosition.x));

    this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity, yVelocity, rotation, this.states.CURRENT_GUN, this.game));
    switch (firingMode) {
        case "full auto":
            this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity, yVelocity, this.states.CURRENT_GUN, this.game));

            break;

        case "spread":
            this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity, yVelocity, this.states.CURRENT_GUN, this.game));
            this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity + .3, yVelocity , this.states.CURRENT_GUN, this.game)); //left of bullet
            this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity + .3, yVelocity, this.states.CURRENT_GUN, this.game)); //right of bullet

            for (var i = 0; i < 8; i++) {
                var randomSpread = (randomInt(4)) / 10;
                var negChance = randomInt(2) + 1;
                if (negChance > 1) randomSpread *= -1;
                this.game.bullets.push(new Bullet(bulletX, bulletY, xVelocity + randomSpread, yVelocity , this.states.CURRENT_GUN, this.game)); //left of bullet

            }


            break;
        default:
            break;
    }
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

/**
 * Checks for movement input
 */
Player.prototype.handleMovementInput = function () {
    var bgX = globals.background.x;
    var bgY = globals.background.y;
    var centerX = this.game.ctx.canvas.width / 2;
    var centerY = this.game.ctx.canvas.height / 2;

    if (Key.isDown(Key.RIGHT)) {
        this.state = this.states.MOVING;
        if (bgX === -1248 || this.hitbox.x < centerX) {
            globals.background.scrolling = false;
            this.move(this.stepDistance, 0);
        } else {
            globals.background.scrolling = true;
            this.move(this.scrollStep, 0);
        }
    }
    if (Key.isDown(Key.LEFT)) {
        this.state = this.states.MOVING;
        if (bgX === 0 || this.hitbox.x > centerX) {
            globals.background.scrolling = false;
            this.move(-this.stepDistance, 0);
        } else {
            globals.background.scrolling = true;
            this.move(-this.scrollStep, 0);
        }
    }
    if (Key.isDown(Key.UP)) {
        this.state = this.states.MOVING;
        if (bgY === 0 || this.hitbox.y > centerY) {
            globals.background.scrolling = false;
            this.move(0, -this.stepDistance);
        } else {
            globals.background.scrolling = true;
            this.move(0, -this.scrollStep);
        }
    }
    if (Key.isDown(Key.DOWN)) {
        this.state = this.states.MOVING;
        if (bgY === -1248 || this.hitbox.y < centerY) {
            globals.background.scrolling = false;
            this.move(0, this.stepDistance);
        } else {
            globals.background.scrolling = false;
            this.move(0, this.scrollStep);
        }
    }
    if (!Key.isDown(Key.RIGHT) && !Key.isDown(Key.LEFT) && !Key.isDown(Key.UP) && !Key.isDown(Key.DOWN)) {
        this.state = this.states.IDLE;
    }

    //this.updateZombies(bgX, bgY);
};
/**
 * Update for the game loop
 */
Player.prototype.update = function () {
    this.convertToOffScreen();
    this.handleMovementInput();
    this.hitbox.updateXY(this.x + (this.animations.idle.frameWidth * this.scale) / 2,
        this.y + (this.animations.idle.frameHeight * this.scale) / 2);

    //console.log("player x: " + this.x + " | player y: " + this.y);
    if (this.states.CURRENT_GUN != 'sniper') this.drawLazer = false;

    if (!Key.keyPressed()) this.state = this.states.IDLE;


    //if (this.game.RELOAD) {
    //    this.state = this.states.RELOADING;
    //    if (globals.debug) console.log("Starting reload");
    //}

    this.grabPowerups();
    this.checkForWeaponSwap();


    if (this.throwingGrenade) {

        this.throwGrenade();
        this.throwingGrenade = false;

    }

    if (this.game.RELOAD) {
        this.state = this.states.RELOADING;
        if (globals.debug) console.log("Starting reload");
    }

    if (this.game.leftClick) {
        if (globals.debug) console.log("shooting");

        //SHOOT DA GUNZ
        if (this.game.firing) {

            var currentTime = Date.now();

            if ((currentTime - this.lastShotFired) / 1000 > this.weaponShotDelay) {
                this.shoot(globals.mousePosition.x, globals.mousePosition.y, this.currentFiringMode);
                this.lastShotFired = Date.now();
            }

        }


        if (this.game.mouseup) {
            // mouseStillDown = false;
            this.state = this.states.IDLE;
        }


        if (this.animations.reloadPistol.isDone()) {
            this.game.RELOAD = false;
            this.animations.reloadPistol.elapsedTime = 0;
            this.game.leftClick = false;
        } else if (!this.states.MOVING && !this.states.SHOOTING) {
            this.state = this.states.IDLE;

        }


        Entity.prototype.update.call(this);
    }
};

Player.prototype.checkForWeaponSwap = function () {
    if (Key.isDown(Key.ONE)) {
        this.states.CURRENT_GUN = 'pistol';
        console.log("pistol equipped");
        this.weaponShotDelay = .5;
        this.currentFiringMode = "full auto";
    }

    if (Key.isDown(Key.TWO)) {
        this.states.CURRENT_GUN = "assault rifle";
        console.log("assault rifle equipped");
        this.weaponShotDelay = .1;
        this.currentFiringMode = "full auto";

    }

    if (Key.isDown(Key.THREE)) {
        this.states.CURRENT_GUN = 'shotgun';
        console.log("shotgun equipped");
        this.weaponShotDelay = .8;
        this.currentFiringMode = "spread";

    }

    if (Key.isDown(Key.FOUR)) {
        this.states.CURRENT_GUN = 'sniper';
        this.drawLazer = true;

        console.log("sniper equipped");
        this.weaponShotDelay = 1.5;
        this.currentFiringMode = "full auto";

    }


};

Player.prototype.throwGrenade = function () {
    var startX = this.x + (this.animations.idle.frameWidth * this.scale);
    var startY = this.y + (this.animations.idle.frameWidth * this.scale) / 2;

    this.game.addEntity(new Grenade(startX, startY, globals.mousePosition.x, globals.mousePosition.y, this.game));
};

/**
 * Draw for the game loop
 * @param ctx
 */
Player.prototype.draw = function (ctx) {
    var currAnim;

    this.convertToOnScreen();

    if (this.state === this.states.MOVING) {
        this.animations.runFeet.drawFrame(this.game.clockTick, ctx, this.x + 12, this.y + 17, this.scale);
        //this.animations.run.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        currAnim = this.animations.idle;

    }
    if (this.state === this.states.IDLE || this.animations.shootPistol.isDone()) {
        this.animations.idleFeet.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        //this.animations.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        currAnim = this.animations.idle;

        if (this.state === this.states.RELOADING) {
            this.animations.reloadPistol.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        }
        if (this.state === this.states.SHOOTING) {
            this.animations.idleFeet.drawFrame(this.game.clockTick, ctx, this.x + 12, this.y + 17, this.scale);
            //this.animations.shootPistol.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
            currAnim = this.animations.shootPistol;

        }
        currAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (globals.debug) {
            ctx.font = "12px Courier New";
            ctx.fillText("x: " + Math.round(this.x) + " y: " + Math.round(this.y), this.x, this.y + 10);
            ctx.fillText("sX: " + Math.round(this.screenX) + " | sY: " + Math.round(this.screenY), this.x, this.y + 20);
            ctx.fillText("wX: " + Math.round(this.worldX) + "  | wY: " + Math.round(this.worldX), this.x, this.y + 30);
        }

        //if (this.state === this.states.RELOADING) {
        //    this.animations.runFeet.drawFrame(this.game.clockTick, ctx, this.x + 12, this.y + 17, this.scale);
        //    this.animations.reloadPistol.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        //}

        //Check for collisions with zombies
        for (var i = 0; i < this.game.entities.length; i++) {
            var ent = this.game.entities[i];
            if (ent.name === "Zombie" && !ent.isDead) {
                var currentZombie = this.hitbox.getCollisionInfo(ent);
                if (currentZombie.hit) {
                    if (globals.debug) console.log("Bit by a zombie!");

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

                    if (!globals.mute) {
                        if (this.audio.src !== "./sound/pain.wav") this.audio.src = "./sound/pain.wav";
                        this.audio.play();
                    }

                    if (!this.godlike)
                        this.health -= 5;

                    if (this.health <= 0) {
                        if (!globals.mute) {
                            this.audio.src = "./sound/death.wav";
                            this.audio.play();
                        }
                        this.removeFromWorld = true;
                    }
                }
            }
        }


        if (this.drawLazer) {
            console.log("lazer time");
            lineToMouse(ctx, this.x + this.animations.idle.width / 2, this.y + this.animations.idle.height / 2)


        }

        if (globals.debug) this.hitbox.draw(ctx);

        Entity.prototype.draw.call(this);
    }
};

Player.prototype.grabPowerups = function () {

    for (var i = 0; i < this.game.entities.length; i++) {
        var current = this.game.entities[i];

        if (current.name && current.name === "PowerUp") {
            if (this.hitbox.getCollisionInfo(current).hit) {
                switch (current.type) {
                    case "hp":
                        this.health += 10;
                        current.audio.src = "./sound/hpup.wav";
                        break;
                    case "godlike":
                        this.godlike = true;
                        globals.powerUpTime.godlike += 10;
                        current.audio.src = "./sound/godlike.wav";
                        break;
                }

                if (!globals.mute) {
                    current.audio.play();
                }

                current.removeFromWorld = true;
            }
        }

    }

};

Player.prototype.convertToOnScreen = function () {
    this.isOnScreen = false;
    var convert = worldToScreen(this.x, this.y);
    //this.x = convert.x;
    //this.y = convert.y;
    this.screenX = convert.x;
    this.screenY = convert.y;
    //this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2), this.screenY + (this.animations.idle.frameHeight / 2));
};

Player.prototype.convertToOffScreen = function () {
    this.isOnScreen = true;
    var convert = screenToWorld(this.x, this.y);
    //this.x = convert.x;
    //this.y = convert.y;
    this.worldX = convert.x;
    this.worldY = convert.y;
    //this.hitbox.updateXY(this.worldX + (this.animations.idle.frameWidth / 2), this.worldY + (this.animations.idle.frameHeight / 2));
    //this.hitbox.x = convert.x;
    //this.hitbox.y = convert.y;
};


//TODO use HitBox version instead
Player.prototype.isCollidingWith = function (entity) {
    var collisions = {
        top: this.hitbox.y < entity.hitbox.y,
        right: this.hitbox.x > entity.hitbox.x,
        down: this.hitbox.y > entity.hitbox.y,
        left: this.hitbox.x < entity.hitbox.x
    };


    return {
        hit: distance(this.hitbox, entity.hitbox) < this.hitbox.radius + entity.hitbox.radius,
        dirs: collisions
    };
};
/**
 *
 * @param x
 * @param y
 * @shoutout user "David Brown" @stackoverflow
 */

function lineToMouse(ctx, x, y) {
    var dirX = globals.mousePosition.x - x;
    var dirY = globals.mousePosition.y - y;

    //normalize vector
    var dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= dirLen;
    dirY /= dirLen;

    var lineX = dirX * 100;
    var lineY = dirY * 100;

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

    ctx.moveTo(x, y);
    ctx.lineTo(x + lineX, y + lineY);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
}




