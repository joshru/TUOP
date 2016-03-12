/**
 * Created by Brandon on 2/26/2016.
 * Modified by Josh on 3/9/2016
 */
function Grenade(startX, startY, targetX, targetY, game) {
    this.x = startX;
    this.y = startY;
    this.velocity = calculateVelocity(startX, startY, targetX, targetY);
    this.speed = 18; //playing with different values
    this.radius = 5;
    this.explosionRadius = 150;
    this.damage = 100;

    this.gunSFX = document.getElementById('nadeFX');

    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;

    this.thrownTime = Date.now();
    this.timeToExplode = 3;

    this.animation = {};
    this.animation.explode = new Animation(ASSET_MANAGER.getAsset("./img/effects/explosion.png"), 0, 0, 64, 64, 1, 16, false, false);

    this.pop = (Date.now() - this.thrownTime) / 1000 > this.timeToExplode;

    Entity.call(this, game, this.worldX, this.worldY);
}

Grenade.prototype = new Entity();
Grenade.prototype.constructor = Grenade;


Grenade.prototype.update = function() {
    this.convertToOnScreen();
    //console.log("I'm a grenade, my speed is: " + this.speed);
    if (this.speed > 0) {
        this.screenX += this.velocity.x * this.speed;
        this.screenY += this.velocity.y * this.speed;

        //careful
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;

        //this.updateCoords();
        //console.log("I'm a grenade, my position is: (" + this.worldX + "," + this.worldY + ")");
        this.speed -= 1;
    }
    //this.pop = (Date.now() - this.thrownTime) / 1000 > this.timeToExplode;
   // console.log("I'm a grenade, my screen position is : (" + this.s)
    if (/*this.checkEnemyCollision() || */(Date.now() - this.thrownTime) / 1000 > this.timeToExplode) {
        //console.log((Date.now() - this.thrownTime) / 1000 > this.timeToExplode);
        this.pop = true;
        this.explode();
        //this.removeFromWorld = true;
    }




    Entity.prototype.update.call(this);
};

Grenade.prototype.updateCoords = function() {
    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;
};

Grenade.prototype.draw = function(ctx) {
    this.convertToOffScreen();
    if (Math.ceil((Date.now() - this.thrownTime) / 1000) > this.timeToExplode) {
        if (!globals.mute) {
            this.gunSFX.src = "./sound/nade.mp3";
            this.gunSFX.play();
        }
        ctx.clearRect(this.screenX, this.screenY, this.radius, this.radius);
        this.animation.explode.drawFrame(this.game.clockTick, ctx, this.screenX - 64, this.screenY - 64, 2.5);
        this.removeFromWorld = true;
    } else {
        ctx.drawImage(ASSET_MANAGER.getAsset("./img/ammo/nade.png"), this.screenX, this.screenY);
    }
};

Grenade.prototype.explode = function() {
    for (var i = 0; i < this.game.zombies.length; i++) {
        var currentEnt = this.game.zombies[i];

       // if (currentEnt.name === 'Zombie') {

            if (screenDistance(this, currentEnt) < this.explosionRadius + currentEnt.hitbox.radius) {
                currentEnt.health -= this.damage;
            }

      //  }
    }

};

Grenade.prototype.checkEnemyCollision = function() {
    for (var i = 0; i < this.game.zombies.length; i++) {
        var currentEnt = this.game.zombies[i];

      //  if (currentEnt.name === 'Zombie') {

            if (this.isCollidingWith(currentEnt)) {
                //console.log("I got hit by a grenade");
                currentEnt.health -= this.damage;
                return true;
            }

       // }

    }
    return false;
};


Grenade.prototype.isCollidingWith = function(other) {
    return screenDistance(this, other) < this.radius + other.radius;
};

Grenade.prototype.convertToOnScreen = function() {
    var convert = worldToScreen(this.worldX, this.worldY);
    this.screenX = convert.x;
    this.screenY = convert.y;
};

Grenade.prototype.convertToOffScreen = function() {
    var convert = screenToWorld(this.screenX, this.screenY);
    this.worldX = convert.x;
    this.worldY = convert.y;
};

