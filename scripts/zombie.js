/**
 * Created by Josh on 2/10/2016.
 */
/**
 * Zombie Object
 * @param game to host me
 * @constructor
 */
function Zombie(game) {
    this.game = game;
    this.name = "Zombie";
    this.states = {};
    this.health = 100;
    this.isDead = false;
    this.isOnScreen = true;
    this.scale = 0.3;
    this.speed = 8;

    this.radius = 30;
    this.ground = 500;

    this.x = randomInt(1200); //hardcoded for prototype zombie
    this.y = randomInt(1200); //TODO come up with a zombie spawning system using timers or something

    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;

    // TODO create speedScale variable so zombies of different types can have different speeds
    // EX: speedScale = 100 for slow zombies, 200 for slightly faster, etc.

    this.speedScale = 100;

    this.velocity = {x: Math.random() * this.speedScale, y: Math.random() * this.speedScale};

    this.states = {
        IDLE: 0,
        MOVING: 1
    };

    this.animations = {};
    this.animations.idle  = new Animation(ASSET_MANAGER.getAsset("./img/zombie/zombie.png"), 0, 0, 71, 71, 0.15, 1, true, false);
    this.animations.dying = new Animation(ASSET_MANAGER.getAsset("./img/zombie/zombie_death.png"), 0, 0, 75, 75, 0.05, 20, false, false);
    this.animations.move  = new Animation(ASSET_MANAGER.getAsset("./img/zombie/zombie_move.png"), 0, 0, 288, 311, 0.05, 17, true, false);
    this.animations.dying = new Animation(ASSET_MANAGER.getAsset("./img/zombie/zombie_death.png"), 0, 0, 75, 75, 0.05, 20, false, false);

    var hbX = this.worldX + (this.animations.move.frameWidth  / 2);
    var hbY = this.worldY + (this.animations.move.frameHeight / 2);

    this.hitbox = new Hitbox(hbX, hbY, this.radius, game);

    Entity.call(this, game, this.worldX, this.worldY);
}

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.setCoordinates = function(x, y) {
    this.x = x;
    this.y = y;

    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;

};

Zombie.prototype.updateCoords = function() {
    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;
};

/**
 * Update for the game loop
 */
Zombie.prototype.update = function () {
    var maxSpeed = 100;
    var minSpeed = 5;
    this.convertToOnScreen();

    //handle movement and stuff
    //TODO iron this out
    if (!this.isDead) {

        this.collideOtherZombies();

        // TODO Explain this?
        // todo u wot m8
        this.screenX += this.velocity.x * this.game.clockTick;
        this.screenY += this.velocity.y * this.game.clockTick;

        //TODO be careful here, not sure what I'm doing because no explanation of above
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;

        //console.log("I'm a zombie my hitbox position is (" + this.hitbox.x + "," + this.hitbox.y + ")");
        this.updateCoords(); //testing

        this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
            this.screenY + (this.animations.idle.frameHeight / 2));

        // follow player
        if (globals.player.health > 0) { //player is alive

            this.findPlayerDirection();
        }
        // player dead, bounce off walls
        // this isn't necessary if we stop updating when the player isn't dead anymore
        // heh
        else this.bounceOffWalls();

        // var i;
        //check if getting shot the F up
        this.checkForBulletWounds();

        var acceleration = 1000;

        //Handle collision with the player
        var playerX = globals.player.x;
        var playerY = globals.player.y;
        var dist = distance(this, globals.player);


        if (dist > this.radius + globals.player.radius + 2) {
            var difX = (playerX - this.screenX) / dist;
            var difY = (playerY - this.screenY) / dist;
            this.velocity.x += difX * acceleration / (dist * dist);
            this.velocity.y += difY * acceleration / (dist * dist);
        }
    }

    //TODO create dying animation and stuff
    //Do this by setting dying=true; then have a conditional that checks for dying and changes the animation
    //accordingly
    if (this.health <= 0) this.die();

    if (this.animations.dying.isDone()) this.removeAndReplace();

    //this.convertToOffScreen();

};

Zombie.prototype.checkForBulletWounds = function() {
    for (var i = 0; i < this.game.bullets.length; i++) {
        var bullet = this.game.bullets[i];
        //console.log("Distance From Bullet: " + distance(this, bullet));

        if (!bullet.spent && this.isCollidingWith(bullet)) {
            this.health -= bullet.damage;

            if (!bullet.penetration ) {
                bullet.spent = true;
                bullet.removeFromWorld = true;
            }
            if (bullet.penetration) {
                if (--bullet.penetration === 0) {
                    bullet.spent = true;
                    bullet.removeFromWorld = true;
                }
            }

            if (globals.debug) console.log("You shot me!");
        }
    }
};

Zombie.prototype.bounceOffWalls = function() {
    var friction = 1;

    if (this.hitbox.collideLeft() || this.hitbox.collideRight()) {

        this.velocity.x = -this.velocity.x * friction;

        this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
            this.screenY + (this.animations.idle.frameHeight / 2));
    }
    else if (this.hitbox.collideTop() || this.hitbox.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;

        this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
            this.screenY + (this.animations.idle.frameHeight / 2));
    }
};

Zombie.prototype.findPlayerDirection = function() {
    var friction = 1;

    var dx = globals.player.x - this.screenX;
    var dy = globals.player.y - this.screenY;
    var pointDistance = Math.sqrt(dx * dx + dy * dy);

    this.velocity.x = (dx / pointDistance) * friction * this.speedScale;
    this.velocity.y = (dy / pointDistance) * friction * this.speedScale;
};


Zombie.prototype.removeAndReplace = function() {
    this.removeFromWorld = true;
    ++globals.zombieDeathCount;
    ++globals.killCount;

    // TODO add more features for drops
    var chance = Math.random();
    if (chance > 4/5) {
        // TODO this will turn into a switch at some point to change types
        // TODO currently 20% chance of godlike, 80% hp
        chance = Math.random();
        if (chance < 2/5)
            this.game.addEntity(new PowerUp(this.game, this, "hp"));
        else if (chance < 4/5) {
            chance = Math.random();
            console.log(chance);
            if (chance < 1/3)
                this.game.addEntity(new PowerUp(this.game, this, "assault-rifle"));
            else if (chance < 2/3)
                this.game.addEntity(new PowerUp(this.game, this, "shotgun"));
            else
                this.game.addEntity(new PowerUp(this.game, this, "sniper"));
        } else
            this.game.addEntity(new PowerUp(this.game, this, "godlike"));
    }
};


Zombie.prototype.convertToOnScreen = function() {
    var convert = worldToScreen(this.worldX, this.worldY);
    this.screenX = convert.x;
    this.screenY = convert.y;
    this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
        this.screenY + (this.animations.idle.frameHeight / 2));
};

Zombie.prototype.convertToOffScreen = function() {
    var convert = screenToWorld(this.screenX, this.screenY);
    this.worldX = convert.x;
    this.worldY = convert.y;
    this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
        this.screenY + (this.animations.idle.frameHeight / 2));
};

/**
 * Draw for the game loop
 * @param ctx
 */
Zombie.prototype.draw = function (ctx) {
    this.convertToOffScreen();
    //this.convertToOnScreen();
    if (globals.debug) {
        ctx.font = "12px Courier New";
        ctx.fillText("sX: " + Math.round(this.screenX) + " | sY: " + Math.round(this.screenY), this.screenX, this.screenY + 10);
        ctx.fillText("wX: " + Math.round(this.worldX) + " | wY: " + Math.round(this.worldX), this.screenX, this.screenY + 20);
    }


    if (!this.isDead /*|| this.isOnScreen*/) {
        var rotation = Math.atan2(-(this.screenY - globals.player.hitbox.y), -(this.screenX - globals.player.hitbox.x));

        ctx.save();
        //ctx.translate((this.screenX + (71 / 2)), this.screenY + (71 / 2)); //magic numbers for zombie sprite dimensions
        ctx.translate((this.screenX + (288 * this.scale / 2)), this.screenY + (311 * this.scale / 2)); //movement animation stuff, will replace idle animation with this soon
        ctx.rotate(rotation);
        //ctx.translate(-(this.x + (71 / 2)), -(this.y + (71 / 2)));
        //ctx.translate(-(this.screenX + (71 / 2)), -(this.screenY + (71 / 2)));
        ctx.translate(-(this.screenX + (288 * this.scale / 2)), -(this.screenY + (311 * this.scale / 2)));
        //ctx.drawImage(ASSET_MANAGER.getAsset("./img/zombie/zombie.png"), this.screenX, this.screenY);
        this.animations.move.drawFrame(this.game.clockTick, ctx, this.screenX, this.screenY, this.scale, 'Zombie');
        ctx.restore();
    } else {
        var rotation = Math.atan2(-(this.screenY - globals.player.hitbox.y), -(this.screenX - globals.player.hitbox.x));
        ctx.save();
        ctx.translate((this.screenX + (71 / 2)), this.screenY + (71 / 2)); //magic numbers for zombie sprite dimensions
        ctx.rotate(rotation);
        ctx.translate(-(this.screenX + (71 / 2)), -(this.screenY + (71 / 2)));
        this.animations.dying.drawFrame(this.game.clockTick, ctx, this.screenX, this.screenY, 1, 'Zombie');
        ctx.restore();
    }

    //this.currAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    //console.log("Zombie position (" + this.x + "," + this.y + ")");

    if (globals.debug) this.hitbox.draw(ctx);

    Entity.prototype.draw.call(this);

};

/**
 * Checks for collisions. This behavior moved to Hitbox
 * @param bullet
 * @returns {boolean}
 */
Zombie.prototype.isCollidingWith = function (bullet) {
    return distance(this.hitbox, bullet) < this.hitbox.radius + bullet.radius;
};

/**
 * Takes care of behavior of moving the zombie onto the after-afterlife.
 */
Zombie.prototype.die = function () {
    this.isDead = true;

    this.velocity.x = 0;
    this.velocity.y = 0;

    if (globals.debug) console.log("Zombies killed this wave " + globals.zombieDeathCount);

};
/**
 * Handles collision between zombies. At the moment tries to teleport zombies over 60 pixels
 */
Zombie.prototype.collideOtherZombies = function () {
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent.name === 'Zombie') {

            var collisionInfo = this.hitbox.getCollisionInfo(ent);
            //TODO make this work a little better
            // it roughly works for now and prevents zombies from overlapping,
            // but looks wonky because the zombies just teleport
            if (ent !== this && collisionInfo.hit) {
                var bounceDist = 60;
                // check combinations of directions
                if (collisionInfo.dirs.top && collisionInfo.dirs.left) {
                    this.screenY += bounceDist;
                    this.screenX += bounceDist;

                } else if (collisionInfo.dirs.top && collisionInfo.dirs.right) {
                    this.screenY += bounceDist;
                    this.screenX -= bounceDist;
                } else if (collisionInfo.dirs.top) {
                    this.screenY += bounceDist;
                }
                if (collisionInfo.dirs.bottom && collisionInfo.dirs.left) {
                    this.screenY += bounceDist;
                    this.screenX += bounceDist;
                } else if (collisionInfo.dirs.bottom && collisionInfo.dirs.right) {
                    this.screenY += bounceDist;
                    this.screenX -= bounceDist;
                } else if (collisionInfo.dirs.bottom) {
                    this.screenY += bounceDist;
                }
                else if (collisionInfo.dirs.left) this.screenX += bounceDist;
                else if (collisionInfo.dirs.right) this.screenX -= bounceDist;

                this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
                    this.screenY + (this.animations.idle.frameHeight / 2));
            }

        }
    }
};