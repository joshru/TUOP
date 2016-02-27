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

    this.thrownTime = Date.now();
    this.timeToExplode = 3;

    Entity.call(this, game, this.x, this.y);
}




Grenade.prototype = new Entity();
Grenade.prototype.constructor = Grenade;


Grenade.prototype.update = function() {

    console.log("I'm a grenade, my speed is: " + this.speed);
    if (this.speed > 0) {
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;
        this.speed -= 1;
    }

    if (this.checkEnemyCollision() || (Date.now() - this.thrownTime) / 1000 > this.timeToExplode) {
        this.explode();
        this.removeFromWorld = true;
    }




    Entity.prototype.update.call(this);
};

Grenade.prototype.draw = function(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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

function calculateVelocity(sX, sY, eX, eY) {
    var dx = eX - sX;
    var dy = eY - sY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var xVel = dx / dist;
    var yVel = dy / dist;

    return {x: xVel, y: yVel};
}