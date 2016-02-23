/**
 * Created by Josh on 2/10/2016.
 */
/**
 * Bullet Object. Created when a gun is fired.
 * @param x
 * @param y
 * @param xVelocity
 * @param yVelocity
 * @param src of bullet
 * @param game
 * @constructor
 */
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

    switch (this.src) {
        case 'pistol':
            this.speed = 10;
            this.damage = 34;
            this.radius = 5;
            this.animation = new Animation(ASSET_MANAGER.getAsset("./img/bullet.jpg"), 0, 0, 114, 114, .15, 1, true, false);
            break;
        case 'assault rifle':
            this.speed = 50;
            this.damage = 25;
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
/**
 * Update for the game loop
 */
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
/**
 * For the game loop
 * @param ctx
 */
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