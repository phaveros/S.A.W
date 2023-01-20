//window.addEventListener sets up an event listener for the 'load' event. The function inside it will run when the page has finished loading.
window.addEventListener('load', function() {
    //canvas setup
    const canvas = this.document.getElementById('canvas1');
    // ctx here stands for contenxt. It is used to create and manipulate images and other graphics. 
    // It has useful methods such as drawImage() and fillRect() which are used throughout this code
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 500;
    // The InputHandler class is used to listen to keyboard input and to control the player's behaviour based on that input
    class InputHandler {
        constructor(game) {
            this.game = game;
            //When the 'keydown' event is fired, the code checks if the key pressed is the 'ArrowUp' or 'ArrowDown' key, and if it is, it adds that key to an array. 
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
            //If the 'keyup' event is fired, the code checks if the key that was released is in the array, and if it is, it removes it from the array.
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
            //sets the coordinates for the projectile, as well as its dimension and speed
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            //makes its default state not marked for delation, this is so it can be called on for deletion later
            this.markedForDeletion = false;
            //calls for the image from the html
            this.image = document.getElementById('projectile');
        }
        update() {
            // update method updates the position of the projectile by increasing its x-coordinate by its speed
            this.x += this.speed;
            // if the projecitle goes too far it is marked for deletion
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {

            // draws image the projectile's current x and y coordinates on the canvas
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
        update() {

            // This function updates the position of the player object based on the arrow keys pressed.
            // It checks if the key pressed is ArrowUp/Down and moves the object accordingly.
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed
            else this.speedY = 0;
            this.y += this.speedY;

            // This code sets the boundaries for the player object so it can't move off the screen.
            if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;

            // This updates the position of any projectiles that have been shot and removes any projectiles that are marked for deletion.
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

            // This function draws the player object on the canvas.
            // If the game is in "debug" mode, it will draw a rectangle around the player object.

            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);

            // This code draws any projectiles that have been shot.
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop() {
            // This function allows the player to shoot projectiles.
            // It checks if the player has enough ammo, and if so, creates a new Projectile object and adds it to the projectiles array.
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 100, this.y + 30));
                this.game.ammo--;
            }
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            // Set the initial position and speed of the enemy
            this.x = this.game.width;
            this.speedX = Math.random() * -2.5 - 0.5;
            // Initialize properties for tracking and animation
            this.markedForDeletion = false;
            this.lives = 5;
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;

        }
        update() {
            // Move the enemy, if the enemy moves past the screen it is deleted
            this.x += this.speedX;
            if (this.x + this.width < 0) this.markedForDeletion = true;

            //this checks if the current frame is less than the maximum frame of the sprite, it cycles the frames until it reaches the end and then starts from 0 again
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
            // Call the parent class's constructor, this uses the paramaters of the Enemy class, I put this in as a way to create more enemy types in the future
            super(game);
            // Set the dimensions and starting position of the enemy
            this.width = 228;
            this.height = 169;
            //To make sure the enemies spawn from different places I used the following
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            // Get the image from the html
            this.image = document.getElementById('angler1');
            //picks a random frame from the sprite (sprites have multiple variations)
            this.frameY = Math.floor(Math.random() * 3);
        }
    }
    class Layer {
        constructor(game, image, speedModifier) {
            // Store a reference to the game object and the image to be drawn
            this.game = game;
            this.image = image;

            // Store the speed modifier and the dimensions of the layer
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update() {
            // Check if the layer has moved past the edge of the screen
            if (this.x <= -this.width) this.x = 0;
            // Move the layer based on the game speed and the speed modifier
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
            // Get the images for each layer from the html
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            // Takes images and creates them into layer, it gives them a location (this.game, and a speed which is the number)
            this.layer1 = new Layer(this.game, this.image1, 0.3);
            this.layer2 = new Layer(this.game, this.image2, 0.6);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 2);
            //this.layers holds all layers in an array they can then be called on when needed
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update() {
            // Iterate through all the layers and update them
            this.layers.forEach(layer => layer.update());
        }
        draw(context) {
            // draws the layers on screen
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    class UI {
        constructor(game) {
            // Store a reference to the game object which is used to refer to the class Game
            this.game = game;

            // Set font size, family, and color
            this.fontsize = 25;
            this.fontFamily = "Chelsea Market";
            this.color = "white";
        }
        draw(context) {
            //Save and Restore are both used so the shadows are drawn only on the desired text and not everything else
            context.save();

            // Set text fill style and shadow properties
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontsize + 'px ' + this.fontFamily;

            // Draw the score on the screen
            context.fillText('Score: ' + this.game.score, 20, 40);

            // Draw the ammo on the screen
            context.fillStyle = this.color;
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(5 * i, 50, 3, 20);
            }

            // Draw the timer on the screen
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);

            // Draw game over messages
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;

                // Set the game over messages based on whether the player won or lost
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

            // Creates instances of the background, player, input handler, and user interface
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);

            // Initialize an array to store enemies and timers for spawning enemies
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;

            // Set initial game state and score variables
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
            // Increase the game time and check if the time limit has been reached
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;

            // Update the background and player
            this.background.update();
            this.background.layer4.update();
            this.player.update();

            // Update the ammo reload timer
            if (this.ammoTimer > this.ammoInterval) {
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            // Iterate through all the enemies
            this.enemies.forEach(enemy => {
                enemy.update();
                // Check for collision between the player and the enemy
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    if (!this.gameOver) this.score -= enemy.score;
                }
                // Check for collision between the projectiles and the enemy
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

            // Remove enemies that have been marked for deletion
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

            // Check if it's time to spawn a new enemy
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