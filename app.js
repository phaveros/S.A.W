//window.addEventListener sets up an event listener for the 'load' event. The function inside it will run when the page has finished loading.
window.addEventListener('load', function() {
    //canvas setup
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;
            //keydown event checks if the correct keys are pressed, and at the same time checks if they are in the array 
            window.addEventListener('keydown', e => {
                if (((e.key === 'ArrowUp') ||
                        (e.key === 'ArrowDown')
                    ) &&
                    this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' ') {
                    this.game.player.shootTop();
                } else if (e.key === 'd') {
                    this.game.debug = !this.game.debug
                }

            });
            //this event checks if the ArrowUp is in the array if it is and the key is pressed again it removes it from the array
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }

            });
        }
    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);

        }
    }


    class Player {
        constructor(game) {
            //this.game points to the Game class so it can take information from there
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.projectiles = []
            this.image = document.getElementById('player')

        }
        update(deltaTime) {

            //this checks if the key pressed is ArrowUp/Down and moves the object accordingly
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed
            else this.speedY = 0;
            this.y += this.speedY;
            // vertical boundaries
            if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
            //handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            // sprite animation logic
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }
        draw(context) {

            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 100, this.y + 30));
                this.game.ammo--;
            }
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -2.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;

        }
        update() {

            this.x += this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            //sprite animation logic

            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else this.frameX = 0;

        }
        draw(context) {
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
            if (this.game.debug) {
                context.fillText(this.lives, this.x, this.y);
                context.font = '20px Helvetica';
            }

        }
    }
    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
        }
    }
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update() {
            //this makes it so once the background moves past the edge of the screen it can start again from the beginning giving it an infite scrolling effect
            if (this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            //to create an "infinite" image, I run the same image side by side so it feels the empty gap left by the first image leaving the screen. and I offset the second image by the width of the first one
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.3);
            this.layer2 = new Layer(this.game, this.image2, 0.6);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 2);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update() {
            this.layers.forEach(layer => layer.update());
        }
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontsize = 25;
            this.fontFamily = "Chelsea Market";
            this.color = "white";
        }
        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontsize + 'px ' + this.fontFamily;
            //score
            context.fillText('Score: ' + this.game.score, 20, 40);
            //ammo
            context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(5 * i, 50, 3, 20);
            }
            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);
            //game over messages
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore) {
                    message1 = 'You Win!';
                    message2 = 'Well done!';
                } else {
                    message1 = 'You Lost!';
                    message2 = 'Try again next time!';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.4);
            }
            context.restore();
        }
    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 100;
            this.gameTime = 0;
            this.timeLimit = 600000;
            this.speed = 1;
            this.debug = true;
            //the keys pressed are stored in the game here
            this.keys = [];


            //the ammo functions represent the current Ammo amount, the max Ammo amount and how long it takes for it to reload
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 200;
        }
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy => {
                enemy.update();

                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    if (!this.gameOver) this.score -= enemy.score;
                }

                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0) {
                            enemy.markedForDeletion = true;
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context)
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.background.layer4.draw(context);
        }
        addEnemy() {
            this.enemies.push(new Angler1(this));
        }
        checkCollision(rect1, rect2) {

            return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y

            )

        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;



    // animation loop
    function animate(timeStamp) {

        //deltaTime calculates the differences between the current animation loop and the previous animation loop
        const deltaTime = timeStamp - lastTime;

        //lastTime is set to timeStamp so it can be used to calculate deltaTime in the next loop
        //it calculates how long it takes to run one animation frame in my case this is about 16ms
        lastTime = timeStamp;

        // clearRect makes it so after each animation loop the previous instance of the object is cleared
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //deltaTime is included here to be able to trigger periodic events
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0)
});