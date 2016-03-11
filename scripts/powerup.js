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

    var screen = worldToScreen(this.x, this.y);
    var world  = screenToWorld(this.x, this.y);
    this.screenX = screen.x;
    this.screenY = screen.y;
    this.worldX = world.x;
    this.worldY = world.y;

    this.spawnTime = Date.now() / 1000;

    this.lifeSpan = 20;


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

    Entity.call(this, game, this.worldX, this.worldY);
};
PowerUp.prototype = new Entity();
PowerUp.prototype.constructor = PowerUp;

/**
 * Updates the hitbox for power up
 */
PowerUp.prototype.update = function () {
    this.convertToOnScreen();

    if ((Date.now() / 1000 - this.spawnTime > this.lifeSpan)) this.removeFromWorld = true;


    this.hitbox.updateXY(this.screenX + this.sprite.width / 2, this.screenY + this.sprite.height / 2);
};

PowerUp.prototype.draw = function (ctx) {
    this.convertToOffScreen();
    if (globals.debug) this.hitbox.draw(ctx);

    this.hitbox.updateXY(this.screenX + (this.radius / 2),
        this.screenY + (this.radius / 2));
    ctx.drawImage(this.sprite, this.screenX, this.screenY);

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

PowerUp.prototype.convertToOnScreen = function() {
    var convert = worldToScreen(this.worldX, this.worldY);
    this.screenX = convert.x;
    this.screenY = convert.y;
    this.hitbox.updateXY(this.screenX + (this.radius / 2),
        this.screenY + (this.radius / 2));
};

PowerUp.prototype.convertToOffScreen = function() {
    var convert = screenToWorld(this.screenX, this.screenY);
    this.worldX = convert.x;
    this.worldY = convert.y;
    this.hitbox.updateXY(this.screenX + (this.radius / 2),
        this.screenY + (this.radius / 2));
};