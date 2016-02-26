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
    this.speed = 5;

    this.radius = 20;
    this.ground = 500;

    //todo spawning needs work so zombies don't spawn off the edges of the map
    //this.x = randomInt(1200); //hardcoded for prototype zombie
    //this.y = randomInt(1200); //TODO come up with a zombie spawning system using timers or something
    this.x = 400;
    this.y = 400;

    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;
    //this.worldX = 1600;
    //this.worldY = 1600;


    console.log("spawning zombie at: " + this.screenX + ", " + this.screenY);

    // TODO create speedScale variable so zombies of different types can have different speeds
    // EX: speedScale = 100 for slow zombies, 200 for slightly faster, etc.

    this.speedScale = 100;

    this.velocity = {x: Math.random() * this.speedScale, y: Math.random() * this.speedScale};

    this.states = {
        IDLE: 0,
        MOVING: 1
    };

    this.animations = {};
    this.animations.idle  = new Animation(ASSET_MANAGER.getAsset("./img/zombie.png"), 0, 0, 71, 71, 0.15, 1, true, false);
    this.animations.move  = new Animation(ASSET_MANAGER.getAsset("./img/zombie_move.png"), 0, 0, 288, 311, 0.15, 17, true, false);
    this.animations.dying = new Animation(ASSET_MANAGER.getAsset("./img/death_animation/zombie_death.png"), 0, 0, 75, 75, 0.05, 20, false, false);

    var hbX = this.worldX + (this.animations.idle.frameWidth  / 2);
    var hbY = this.worldY + (this.animations.idle.frameHeight / 2);

    this.hitbox = new Hitbox(hbX, hbY, this.radius, game);

    Entity.call(this, game, this.worldX, this.worldY);
}

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

/**
 * Update for the game loop
 */
Zombie.prototype.update = function () {
    var friction = 1;
    var maxSpeed = 100;
    var minSpeed = 5;
    this.convertToOnScreen();
    //this.convertToOffScreen();
    //console.log("screen X:  " + this.screenX + " | screen  Y: " + this.screenY + "\nworld X: " + this.worldX + " | world Y: " + this.worldY);
    //console.log("zombie x: " + this.x + " | zombie y: " + this.y);

    //handle movement and stuff
    //TODO iron this out
    if (!this.isDead) {

        this.collideOtherZombies();

        // TODO Explain this?
        // todo u wot m8
        //if (!globals.background.scrolling) {
            this.screenX += this.velocity.x * this.game.clockTick;
            this.screenY += this.velocity.y * this.game.clockTick;
        //} else {
        //    this.screenX = (this.velocity.x * 0.3) * this.game.clockTick;
        //    this.screenY = (this.velocity.y * 0.3) * this.game.clockTick;
        //}
        //
        //this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
        //    this.screenY + (this.animations.idle.frameHeight / 2));
        //
        // follow player
        if (globals.player.health > 0) { //player is alive
            var dx = globals.player.x - this.screenX;
            var dy = globals.player.y - this.screenX;
            var pointDistance = Math.sqrt(dx * dx + dy * dy);

            this.velocity.x = (dx / pointDistance) * friction * this.speedScale;
            this.velocity.y = (dy / pointDistance) * friction * this.speedScale;

            //Not sure how often to do this
            this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
                this.screenY + (this.animations.idle.frameHeight / 2));

        }
        // player dead, bounce off walls
        // this isn't necessary if we stop updating when the player isn't dead anymore
        // heh
        //else if (this.hitbox.collideLeft() || this.hitbox.collideRight()) {
        //
        //    this.velocity.x = -this.velocity.x * friction;
        //
        //    this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
        //        this.screenY + (this.animations.idle.frameHeight / 2));
        //}
        //else if (this.hitbox.collideTop() || this.hitbox.collideBottom()) {
        //    this.velocity.y = -this.velocity.y * friction;
        //
        //    this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
        //        this.screenY + (this.animations.idle.frameHeight / 2));
        //}

        var i;
        //check if getting shot the F up
        for (i = 0; i < this.game.bullets.length; i++) {
            var bullet = this.game.bullets[i];
            //console.log("Distance From Bullet: " + distance(this, bullet));

            if (!bullet.spent && this.isCollidingWith(bullet)) {
                this.health -= bullet.damage;
                bullet.spent = true;
                bullet.removeFromWorld = true;
                if (globals.debug) console.log("You shot me!");
            }
        }

        var acceleration = 1000; //TODO add comments explaining this?

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
    //
    //
    if (this.animations.dying.isDone()) {
        this.removeFromWorld = true;
        ++globals.zombieDeathCount;
        ++globals.killCount;

        // TODO add more features for drops
        var chance = randomInt(10) + 1;
        if (chance > 8) {
            // TODO this will turn into a switch at some point to change types
            // TODO currently 20% chance of godlike, 80% hp
            chance = randomInt(10) + 1;
            if (chance > 2)
                this.game.addEntity(new PowerUp(this.game, this, "hp"));
            else
                this.game.addEntity(new PowerUp(this.game, this, "godlike"));
        }

        // var currentFib = globals.fib1 + globals.fib2;
        if (globals.debug) console.log("Current Fib: " + globals.fibs.currFib + ", Death Count: " + globals.zombieDeathCount);
        if (globals.zombieDeathCount === globals.fibs.currFib) {
            // see in Background.prototype.draw for wave counter
            globals.wave++;

            if (globals.debug) console.log("killed goal reached, spawning " + globals.fibs.currFib + " zombies.");
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

    }

    //if ((this.x > 0 || this.y < 0) && !this.isOnScreen) {
    //    //console.log("converting zombie to screen coords");
    //    this.convertToOnScreen();
    //}
    //
    //if ((this.x > 800 || this.y < 800) && this.isOnScreen) {
    //    //console.log("converting zombie to off-screen coords");
    //    this.convertToOffScreen();
    //}

    //this.convertToOffScreen();

};

Zombie.prototype.convertToOnScreen = function() {
    this.isOnScreen = false;
    var convert = worldToScreen(this.worldX, this.worldY);
    //this.x = convert.x;
    //this.y = convert.y;
    this.screenX = convert.x;
    this.screenY = convert.y;
    this.hitbox.updateXY(this.screenX + (this.animations.idle.frameWidth / 2),
                         this.screenY + (this.animations.idle.frameHeight / 2));
};

Zombie.prototype.convertToOffScreen = function() {
    this.isOnScreen = true;
    var convert = screenToWorld(this.screenX, this.screenY);
    //this.x = convert.x;
    //this.y = convert.y;
    this.worldX = convert.x;
    this.worldY = convert.y;
    this.hitbox.updateXY(this.worldX + (this.animations.idle.frameWidth / 2),
                         this.worldY + (this.animations.idle.frameHeight / 2));
    //this.hitbox.x = convert.x;
    //this.hitbox.y = convert.y;
};

/**
 * Draw for the game loop
 * @param ctx
 */
Zombie.prototype.draw = function (ctx) {
    this.convertToOffScreen();
    //this.convertToOnScreen();
    ctx.font = "12px Courier New";
    ctx.fillText("sX: " + Math.round(this.screenX) + " | sY: " + Math.round(this.screenY), this.screenX, this.screenY + 10);
    ctx.fillText("wX: " + Math.round(this.worldX) + " | wY: " + Math.round(this.worldX), this.worldX, this.worldY + 20);


    if (!this.isDead /*|| this.isOnScreen*/) {
        var rotation = Math.atan2(-(this.screenY - globals.player.hitbox.y), -(this.screenX - globals.player.hitbox.x));

        ctx.save();
        ctx.translate((this.screenX + (71 / 2)), this.screenY + (71 / 2)); //magic numbers for zombie sprite dimensions
        //ctx.translate((this.x + (288 / 2)), this.y + (311 / 2)); //movement animation stuff, will replace idle animation with this soon
        ctx.rotate(rotation);
        ctx.translate(-(this.screenX + (71 / 2)), -(this.screenY + (71 / 2)));
        //ctx.translate(-(this.x + (288 / 2)), -(this.y + (311 / 2)));
        ctx.drawImage(ASSET_MANAGER.getAsset("./img/zombie.png"), this.screenX, this.screenY);
        //this.animations.move.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.3);
        ctx.restore();
    } else this.animations.dying.drawFrame(this.game.clockTick, ctx, this.screenX, this.screenY, 1);

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
Zombie.prototype.die = function (powerUpSpawn) {
    // stops zombies and moves hitbox out of canvas
    this.isDead = true;
    //  this.hitbox.updateXY(undefined, undefined);
 //   this.hitbox.radius = undefined;
    this.velocity.x = 0;
    this.velocity.y = 0;


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
                    this.y += bounceDist;
                    this.x += bounceDist;

                } else if (collisionInfo.dirs.top && collisionInfo.dirs.right) {
                    this.y += bounceDist;
                    this.x -= bounceDist;
                } else if (collisionInfo.dirs.top) {
                    this.y += bounceDist;
                }
                if (collisionInfo.dirs.bottom && collisionInfo.dirs.left) {
                    this.y += bounceDist;
                    this.x += bounceDist;
                } else if (collisionInfo.dirs.bottom && collisionInfo.dirs.right) {
                    this.y += bounceDist;
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