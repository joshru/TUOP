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
            this.sprite = ASSET_MANAGER.getAsset("./img/hp-heart.png");
            break;
    }

    var hbX = this.x;
    var hbY = this.y;

    this.hitbox = new Hitbox(hbX, hbY, this.radius, game);

    Entity.call(this, game, this.x, this.y);
}
/**
 * Updates the hitbox for the game loop
 */
PowerUp.prototype.update = function () {
    // drops HP accordingly
    this.hitbox.updateXY(this.x + this.sprite.width / 2, this.y + this.sprite.height / 2);


    // Player picks up HP
    if (this.isCollidingWith(globals.player)) {
        switch (this.type) {
            case "hp":
                globals.player.health += 10;
                this.audio.src = "./sound/hpup.wav";
                break;
        }

        if (!globals.mute) {
            this.audio.play();
        }

        this.removeFromWorld = true;
    }

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