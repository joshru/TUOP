/**
/**
 * Created by Josh on 2/10/2016.
 */
/**
 * Powerup Object. Represents the various pickups that are dropped by zombies.
 * @param game to host me
 * @param other TODO not sure what this is for
 * @param type of powerup
 * @constructor
 */
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
    //Assign attributes based on type
    //Will be more types later
    switch (type) {
        case "hp":
            this.sprite = ASSET_MANAGER.getAsset("./img/powerups/hp-heart.png");
            break;
        case "godlike":
            this.sprite = ASSET_MANAGER.getAsset("./img/powerups/godlike.png");
            break;
    }

    var hbX = this.x;
    var hbY = this.y;

    this.hitbox = new Hitbox(hbX, hbY, this.radius, game);

    Entity.call(this, game, this.x, this.y);
};
PowerUp.prototype = new Entity();
PowerUp.prototype.constructor = PowerUp;

/**
 * Updates the hitbox for power up
 */
PowerUp.prototype.update = function () {
    this.hitbox.updateXY(this.x + this.sprite.width / 2, this.y + this.sprite.height / 2);
};

PowerUp.prototype.draw = function (ctx) {
    if (globals.debug) this.hitbox.draw(ctx);

    ctx.drawImage(this.sprite, this.x, this.y);

    Entity.prototype.draw.call(this)
};

/**
 * Determines whether this powerup is colliding with another entity
 * @param entity to compare location to
 * @returns {boolean} true if colliding, false otherwise
 */
PowerUp.prototype.isCollidingWith = function (entity) {
    if (globals.debug) {
        if (distance(this.hitbox, entity.hitbox) < this.hitbox.radius + entity.hitbox.radius)
            console.log("Entity picking up Power Up: " + entity.name);
    }
    return distance(this.hitbox, entity.hitbox) < this.hitbox.radius + entity.hitbox.radius;
};