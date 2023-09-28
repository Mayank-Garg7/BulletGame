
      // Defines a general class used to specify game objects.
      class GameObject {
        constructor(x, y, width, height, color) {
          // Define the object's position
          this.x = x;
          this.y = y;

          // Define the object's size
          this.width = width;
          this.height = height;

          // Define the object's color
          this.color = color;
        }

        // Draw the object on the canvas
        draw(ctx) {
          ctx.fillStyle = this.color;
          ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Update the object's position
        update(dx, dy) {
          this.x += dx;
          this.y += dy;
        }

        // Check if the object is colliding with another object
        collidesWith(obj) {
          return (this.x < obj.x + obj.width
               && this.x + this.width > obj.x
               && this.y < obj.y + obj.height 
               && this.y + this.height > obj.y);
        }
      }

      // The bullet class defines the properties and behavior of bullets.
      class Bullet extends GameObject {
        constructor(x, y, width, height, color, dy) {
          super(x, y, width, height, color);
          // Set the bullet's y direction.
          this.dy = dy;
        }
        
        update(x, y) {
          this.y += this.dy; 
        }
      }

      // The spaceship class defines the general properties and behavior of the player and enemies.
      class SpaceShip extends GameObject {
        constructor(x, y, width, height, color, canvasHeight) {
          super(x, y, width, height, color);
          // Set canvas height.
          this.canvasHeight = canvasHeight;
          // Set the spaceship's bullet size.
          this.bulletWidth = 4;
          this.bulletHeight = 8;
          // Set the spaceship's bullet color.
          this.bulletColor = "#ff7800";
          // Bullets fired by the spaceship
          this.bullets = [];
        }

        // Override the draw method to also draw the spaceship's bullets.
        draw(ctx) {
          super.draw(ctx);
          // Draw the spaceship's bullets.
          for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].draw(ctx);
            this.bullets[i].update(0, 0);

            // Check if the bullet is out of bounds.
            if (this.bullets[i].y < 0 || this.bullets[i].y > this.canvasHeight) {
              // Remove the bullet from the array.
              this.bullets.splice(i, 1);
            }
          }
        }
        
        // A method used to fire bullets from a spaceship
        shoot(dy) {
          this.bullets.push(new Bullet(
            this.x + this.width / 2 - this.bulletWidth / 2,
            this.y - this.bulletHeight,
            this.bulletWidth,
            this.bulletHeight,
            this.bulletColor,
            dy
          ));
        }
      }
      
      // The Player class defines the properties and behavior of the player.
      class Player extends SpaceShip {
        constructor(x, y, width, height, color, canvasHeight, canvasWidth) {
          super(x, y, width, height, color, canvasHeight);
          this.canvasWidth = canvasWidth;
        }

        // Update the player's position
        update(dx, dy) {
          super.update(dx, dy);

          // Keep the player within the canvas
          if (this.x < 0) {
            this.x = 0;
          } else if (this.x + this.width > this.canvasWidth) {
            this.x = this.canvasWidth - this.width;
          }
        }
      }

      // The Asteroid class defines the properties and behavior of the asteroids.
      class Asteroid {
        constructor(x, y, width, height, color, noParts) {
          // Set an empty array for asteroid parts.
          this.parts = [];
          // Create the asteroid's parts.
          for (var i = 0; i < noParts; i++) {
            for (var j = 0; j < noParts; j++) {
              this.parts.push(new GameObject(
                x + i * width,
                y + j * height,
                width,
                height,
                color
              ));
            }
          }
        }
            
        // Draw the asteroid on the canvas.
        draw(ctx) {
          for (var i = 0; i < this.parts.length; i++) {
            this.parts[i].draw(ctx);
          }
        }

        // Check if the asteroid is colliding with another object.
        collidesWith(obj) {
          for (var i = 0; i < this.parts.length; i++) {
            if (this.parts[i].collidesWith(obj)) {
              return true;
            }
          }
          return false;
        }

        // Remove sub object on collide.
        removeOnCollide(obj) {
          for (var i = 0; i < this.parts.length; i++) {
            if (this.parts[i].collidesWith(obj)) {
              this.parts.splice(i, 1);
              break;
            }
          }
        }
      }
      
      // Defines an empty object used to specify game properties and behavior.
      var game = {};
      
      // Define canvas and context
      game.canvas = document.getElementById('canvas');
      game.ctx = game.canvas.getContext('2d');
      
      // Define background color
      game.backgroundColor = '#000000';

      // Setup asteroids array
      game.asteroidsParts = 8;
      game.noOfAsteroids = 8;
      game.asteroidsSpace = 85;

      // Setup enemies
      game.enemiesEachLine = 20;
      game.enemyLines = 8;
      game.enemySpace = 30;
      game.enemyFireRate = 1000;
      game.enemyFireTimer = 0;
      game.enemyDirection = 1;
      game.enemyStep = 5;
      
      // Defines a function to handle the game loop
      game.update = function() {
        // Draw canvas background
        game.ctx.fillStyle = game.backgroundColor;
        game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        
        // Draw player
        game.player.draw(game.ctx);

        // Draw asteroids
        for (var i = 0; i < game.asteroids.length; i++) {
          game.asteroids[i].draw(game.ctx);
        }

        // Draw enemies
        for (var i = 0; i < game.enemies.length; i++) {
          game.enemies[i].draw(game.ctx);
          game.enemies[i].update(game.enemyDirection, 0);
        }

        // Check if the player has destroyed all enemies
        if (game.enemies.length == 0) {
          // Reset the game
          game.restart();
        }

        // Check if the enemies are out of bounds.
        if (game.enemyDirection == 1)
        {
          // Find the enemy closest to the right side of the screen
          var closestToRightSideEnemy = game.enemies[0];
          for (var i = 1; i < game.enemies.length; i++) {
            if (game.enemies[i].x > closestToRightSideEnemy.x) {
              closestToRightSideEnemy = game.enemies[i];
            }
          }

          // Check if the enemy closest to the right side of 
          // the screen has reached the right side of the screen.
          if (closestToRightSideEnemy.x + 
              closestToRightSideEnemy.width > game.canvas.width) {
            // Reverse the direction of the enemies.
            game.enemyDirection = -1;            
            // Move the enemies down.
            for (var i = 0; i < game.enemies.length; i++) {
              game.enemies[i].update(0, game.enemyStep);
            }
          }          
        }
        else if (game.enemyDirection == -1)
        {
          // Find the enemy closest to the left side of the screen
          var closestToLeftSideEnemy = game.enemies[0];
          for (var i = 1; i < game.enemies.length; i++) {
            if (game.enemies[i].x < closestToLeftSideEnemy.x) {
              closestToLeftSideEnemy = game.enemies[i];
            }
          }

          // Check if the enemy closest to the left side of 
          // the screen has reached the left side of the screen.
          if (closestToLeftSideEnemy.x < 0) {
            // Reverse the direction of the enemies.
            game.enemyDirection = 1;
            // Move the enemies down.
            for (var i = 0; i < game.enemies.length; i++) {
              game.enemies[i].update(0, game.enemyStep);
            }
          }
        }

        // Enemy fire counter
        game.enemyFireTimer += Math.random() * 10;
        if (game.enemyFireTimer > game.enemyFireRate) {
          game.enemyFireTimer = 0;
          // Fire enemy bullet
          game.enemies[Math.floor(Math.random() * game.enemies.length)].shoot(5);
        }

        // Check if player bullet collides with asteroid
        for (var i = 0; i < game.player.bullets.length; i++) {
          for (var j = 0; j < game.asteroids.length; j++) {
            if (game.asteroids[j].collidesWith(game.player.bullets[i])) {
              game.asteroids[j].removeOnCollide(game.player.bullets[i]);
              game.player.bullets.splice(i, 1);
              break;
            }
          }
        }

        // Check if enemy bullet collides with asteroid
        for (var i = 0; i < game.enemies.length; i++) {
          for (var j = 0; j < game.enemies[i].bullets.length; j++) {
            for (var k = 0; k < game.asteroids.length; k++) {
              if (game.asteroids[k].collidesWith(game.enemies[i].bullets[j])) {
                game.asteroids[k].removeOnCollide(game.enemies[i].bullets[j]);
                game.enemies[i].bullets.splice(j, 1);
                break;
              }
            }
          }
        }

        // Check if player bullet collides with enemy
        for (var i = 0; i < game.player.bullets.length; i++) {
          for (var j = 0; j < game.enemies.length; j++) {
            if (game.enemies[j].collidesWith(game.player.bullets[i])) {
              game.enemies.splice(j, 1);
              game.player.bullets.splice(i, 1);
              break;
            }
          }
        }

        // Check if enemy bullet collides with player
        for (var i = 0; i < game.enemies.length; i++) {
          for (var j = 0; j < game.enemies[i].bullets.length; j++) {
            if (game.player.collidesWith(game.enemies[i].bullets[j])) {
              // Reset the game
              game.restart();
              break;
            }
          }
        }
      
        // Check if an enemy has reached the player's y position.
        for (var i = 0; i < game.enemies.length; i++) {
          if (game.enemies[i].y + game.enemies[i].height > game.player.y) {
            game.restart();
            break;
          }
        }
      }
      
      // Defines a function to handle key events
      game.keydown = function(e) {
        // If the left arrow key is pressed, move the player left.
        if (e.keyCode == 37 || e.keyCode == 65) {
          game.player.update(-5, 0);
        }
        // If the right arrow key is pressed, move the player right.
        else if (e.keyCode == 39 || e.keyCode == 68) {
          game.player.update(5, 0);
        }
        // If the space bar is pressed, fire a bullet.
        else if (e.keyCode == 32) {
          game.player.shoot(-5);
        }
      }      
      
      // Defines a function to start the game loop
      game.init = function() {
        // Set the game loop
        game.interval = setInterval(game.update, 1000 / 60);

        // Setup player
        game.player = new Player(
          game.canvas.width / 2 - 50,
          game.canvas.height - 50,
          20,
          20,
          '#0099CC',
          game.canvas.width
        );

        // Setup asteroids
        game.asteroids = [];
        for (var i = 0; i < game.noOfAsteroids; i++) {
          game.asteroids.push(new Asteroid(
            game.asteroidsSpace + i * game.asteroidsSpace,
            game.canvas.height - 180,
            5,
            5,
            '#ffffff',
            game.asteroidsParts
          ));
        }

        // Setup enemies
        game.enemies = [];
        for (var i = 0; i < game.enemyLines; i++) {
          for (var j = 0; j < game.enemiesEachLine; j++) {
            game.enemies.push(new SpaceShip(
              game.enemySpace + j * game.enemySpace,
              game.enemySpace + i * game.enemySpace,
              20,
              20,
              '#FF0000'
            ));
          }
        }
      }

      // Defines a function to stop the game loop
      game.stop = function() {
        clearInterval(game.interval);
      }

      // Defines a function to restart the game
      game.restart = function() {
        game.stop();
        game.init();
      }

      // Start the game on window load
      window.onload = game.init;

      // Detect keydown events
      window.onkeydown = game.keydown;