var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        animID,
        lastTime,
        counter = 0;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    var gameOverStyle = {
            'font': 'bold 46pt Georgia',
            'fillStyle': 'red',
            'strokeStyle': 'orange',
            'textAlign': 'center'
        },
        scoreStyle = {
            'font': 'bold 24pt Georgia',
            'fillStyle': 'red',
            'strokeStyle': 'yellow',
            'textAlign': 'left'
        },
        livesStyle = {
            'font': 'bold 30pt Georgia',
            'fillStyle': 'yellow',
            'strokeStyle': 'orange',
            'textAlign': 'center'
        };

    var gameOver = new Text({
            x: canvas.width / 2,
            y: canvas.height / 2
        }, 'Game Over!'),
        livesTxt = new Text({
            x: 455,
            y: 90
        }, ''),
        scoreTxt = new Text({
            x: 10,
            y: 80
        }, '');

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        if (player.lives == 0) {
            startGame = false;
            player.lives = 5;
            selectSubItem = false;
            cancelAnimationFrame(animID);
        } else {
            counter++;
            update(dt);
            render();
            /* Set our lastTime variable which is used to determine the time delta
             * for the next time this function is called.
             */
            lastTime = now;
            /* Use the browser's requestAnimationFrame function to call this
             * function again as soon as the browser is able to draw another frame.
             */
            animId = win.requestAnimationFrame(main);
        }
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        lastTime = Date.now();
        if (startGame) { //running main after selecting Play from the menu
            main();
        } else { //render the menu and start the navigation
            render();
            menu.render(mdx, mdy, mStyle);
            menu.nav('down', mdx, mdy, mStyle, xS, dyS, dySS);
        };
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
            updateEntities(dt);
            if (!pWin && !pDie) { //check for collision only if the player is not winning or dyeing
                checkCollisions();
            };
        }
        /* This is called by the update function  and loops through all of the
         * objects within your allEnemies array as defined in app.js and calls
         * their update() methods. It will then call the update function for your
         * player object. These update methods should focus purely on updating
         * the data/properties related to  the object. Do your drawing in your
         * render methods.
         */
    function updateEntities(dt) {
        allEnemies.forEach(function(Enemy) {
            Enemy.update(dt);
        });
        allTreasures.forEach(function(Treasure) {
            Treasure.update(dt);
        });
        var lt = allTreasures.length,
            n; //add treasures after 500 cycles or when they were collected
        if (lt == 0) {
            counter++;
        };
        if (counter > 500 && lt < 3) {
            n = Math.round(Math.random() * 2);
            addTreasures(n);
            counter = 0;
        };
        player.update(dt);
    }

    function detectCollision(entity, n) {
        /*detects the collision if the CM of the two entities
        are less then a fraction of their frame-dimensions*/
        var dx, dy;
        for (var i = 0; i < n; i++) {
            dx = entity[i].centerX - player.centerX;
            if (dx < 0) {
                dx = -dx
            };
            dy = entity[i].centerY - player.centerY;
            if (dy < 0) {
                dy = -dy
            };
            if ((dx <= entity[i].width / 3 + player.width / 3) &&
                (dy <= entity[i].height / 3 + player.height / 3)) {
                return [true, i];
            };
        };
        return [false, i];
    }

    function checkCollisions() {
        var n = allEnemies.length,
            nt = allTreasures.length,
            result;
        result = detectCollision(allEnemies, n);
        if (result[0]) {
            //colliding with an enemy
            pDie = true;
        };
        result = detectCollision(allTreasures, nt);
        if (result[0]) {
            //collecting treasure items they have to disappear
            switch (result[1]) {
                case 0:
                    allTreasures.shift();
                    break;
                case 1:
                    allTreasures.pop();
                    break;
                default:
                    allTreasures.splice(result[1], 1);
            };
            player.score += 10;
            counter = 0;
        };
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
        renderText();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allTreasures.forEach(function(Treasure) {
            Treasure.render();
        });
        allEnemies.forEach(function(Enemy) {
            Enemy.render();
        });

        player.render();
        if (pWin) { //attaching winning text to the player
            winText.x = player.centerX;
            winText.y = player.centerY - 40;
            winText.render(0, 0, wStyle);
        };
        if (pDie) { //attaching dying text to the player
            dieText.x = player.centerX;
            dieText.y = player.centerY - 40;
            dieText.render(0, 0, dieStyle);
        };
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        //this was implemented in different other functions
    }

    function renderText() {
        //Game over
        if (player.lives == 0) {
            player.score = 0;
            gameOver.render(0, 0, gameOverStyle);
        }
        //lives
        ctx.drawImage(Resources.get('images/Heart.png'), 4 * 101, 0);
        livesTxt.str = player.lives.toString();
        livesTxt.render(0, 0, livesStyle);
        //score
        scoreTxt.str = 'Score ' + player.score.toString();
        scoreTxt.render(0, 0, scoreStyle);
        //help
        helpTxt.render(0, 0, helpStyle);
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-pink-girl.png',
        'images/char-boy.png',
        'images/char-horn-girl.png',
        'images/char-princess-girl.png',
        'images/Heart.png',
        'images/Star.png',
        'images/Selector.png',
        'images/Gem orange.png',
        'images/Gem green.png',
        'images/Gem blue.png',
        'images/Key.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.init = init;
    global.render = render;
})(this);