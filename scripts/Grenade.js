/**
 * Created by Brandon on 2/26/2016.
 */
function Grenade(startX, startY, targetX, targetY, game) {
    this.x = startX;
    this.y = startY;
    this.velocity = calculateVelocity(startX, startY, targetX, targetY);
    this.speed = 25; //playing with different values
    this.radius = 5;
    this.explosionRadius = 150;
    this.damage = 100;

    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;

    this.thrownTime = Date.now();
    this.timeToExplode = 3;

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
        this.speed -= 1;
    }

    if (this.checkEnemyCollision() || (Date.now() - this.thrownTime) / 1000 > this.timeToExplode) {
        this.explode();
        this.removeFromWorld = true;
    }




    Entity.prototype.update.call(this);
};

Grenade.prototype.draw = function(ctx) {
    this.convertToOffScreen();
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#979748";
    ctx.arc(this.screenX, this.screenY, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
};

Grenade.prototype.explode = function() {
    for (var i = 0; i < this.game.entities.length; i++) {
        var currentEnt = this.game.entities[i];

        if (currentEnt.name === 'Zombie') {

            if (distance(this, currentEnt) < this.explosionRadius + currentEnt.hitbox.radius) {
                currentEnt.health -= this.damage;
            }

        }

    }
};

Grenade.prototype.checkEnemyCollision = function() {
    for (var i = 0; i < this.game.entities.length; i++) {
        var currentEnt = this.game.entities[i];

        if (currentEnt.name === 'Zombie') {

            if (this.isCollidingWith(currentEnt)) {
                console.log("I got hit by a grenade");
                currentEnt.health -= this.damage;
                return true;
            }

        }

    }
    return false;
};


Grenade.prototype.isCollidingWith = function(other) {
    return distance(this, other) < this.radius + other.hitbox.radius;
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

