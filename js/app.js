/* globals for taking back to the origin the hero after winning or dying */
var pWin = false,
    pDie = false;

/*Sprite class -superclass of all entitites*/
var Sprite = function(loc, frame, url) {
    //location on the canvas
    this.x = loc.x;
    this.y = loc.y;
    //frame around the actual sprite
    this.topX = frame.topX;
    this.topY = frame.topY;
    this.width = frame.width;
    this.height = frame.height;
    //kind of center of mass for collision detection
    this.centerX = 0;
    this.centerY = 0;
    //the sprite URL
    this.sprite = url;
};

// Draw the sprite on the screen, required method for game
Sprite.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Calc the sprite's center of mass
Sprite.prototype.center = function() {
    this.centerX = this.x + this.topX + this.width / 2;
    this.centerY = this.y + this.topY + this.height / 2;
};

// Enemies Subclass of Sprite our player must avoid
var Enemy = function(loc, frame, url, speed, speedFX) {
    //delegate to Sprite
    Sprite.call(this, loc, frame, url);
    //How fast the enemies should move
    this.speed = speed;
    //Speed factor for the different difficulty settings
    this.speedFX = speedFX;
};

Enemy.prototype = Object.create(Sprite.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.x += this.speed * this.speedFX * dt;
    if (this.x > 505) {
        this.x = -101;
        this.speed = randomSpeed(4);
        this.y = randomY(83, 3, 1, -20);
    };
    this.center();
};

//Collectible items subclass of Sprite
var Treasure = function(loc, frame, url, speed) {
    Sprite.call(this, loc, frame, url);
    //How fast are going awyay
    this.speed = speed;
};
Treasure.prototype = Object.create(Sprite.prototype)
Treasure.prototype.constructor = Treasure;

Treasure.prototype.update = function(dt) {
    //there are moving upwards and if they are not coolected reimerge
    var rate = this.speed * dt;
    if (this.y < 20) {
        this.x = randomX(tileW, 4);
        this.y = 220;
    } else {
        this.y -= rate;
    };
    this.center();
};

// Player subclass of Sprite
var Player = function(loc, frame, url, step, lives, score) {
    Sprite.call(this, loc, frame, url);
    //step size in px
    this.step = step;
    this.lives = lives;
    this.score = score;
};

Player.prototype = Object.create(Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
    /*this used mainly to take back the player to its origin after winning or dying
    also keeps track of the lives and score*/
    var dx = this.x - pOrigin.x,
        dy = pOrigin.y - this.y,
        one = false,
        two = false;
    if (pWin || pDie) {
        if (dx <= 0) {
            if (-dx >= pReturnLimit) {
                this.x += pReturnSpeed * dt;
            } else {
                this.x = pOrigin.x;
                one = true;
            };
        };
        if (dx > 0) {
            if (dx >= pReturnLimit) {
                this.x -= pReturnSpeed * dt;
            } else {
                this.x = pOrigin.x;
                one = true;
            };
        };
        if (dy >= pReturnLimit) {
            this.y += pReturnSpeed * dt;
        } else {
            this.y = pOrigin.y;
            two = true;
        };
        this.center();
        if (one && two) {
            if (pWin) {
                pWin = false;
                this.score++;
            };
            if (pDie) {
                pDie = false;
                this.lives--;
            };
        };
    };
};

Player.prototype.handleInput = function(key) {
    //keep track of the player's movements in the game area
    switch (key) {
        case 'left':
            if (this.centerX > this.step) {
                this.x -= this.step;
            };
            if (this.x < 0) {
                this.x = 0;
            };
            break;
        case 'up':
            if (this.y > this.step) {
                this.y -= this.step;
            } else {
                pWin = true;
            };
            break;
        case 'right':
            if (this.centerX < 505 - this.step) {
                this.x += this.step;
            };
            if (this.x > 404) {
                this.x = 404;
            }
            break;
        case 'down':
            if (this.centerY < 505) {
                this.y += this.step;
            };
            if (this.y > 415) {
                this.y = 415;
            }
            break;
    };
    this.center();
};

//Text class
var Text = function(loc, str) {
    this.x = loc.x;
    this.y = loc.y;
    this.str = str;
};

Text.prototype.style = function(style) {
    ctx.save();
    ctx.font = style.font;
    ctx.fillStyle = style.fillStyle;
    ctx.strokeStyle = style.strokeStyle;
    ctx.textAlign = style.textAlign;
};

Text.prototype.render = function(dx, dy, style) {
    //renders one string or renders vertically an array of strings
    this.style(style);
    if (this.str instanceof Array) {
        for (i = 0; i < this.str.length; i++) {
            ctx.fillText(this.str[i], this.x + dx, this.y + i * dy);
            ctx.strokeText(this.str[i], this.x + dx, this.y + i * dy);
        }
    } else {
        ctx.fillText(this.str, this.x + dx, this.y + dy);
        ctx.strokeText(this.str, this.x + dx, this.y + dy);
    }
    ctx.restore();
}

//Menu subclass of Text
var Menu = function(loc, items, cursor, url) {
    Text.call(this, loc, items);
    this.cursor = cursor;
    this.selector = url;
};

Menu.prototype = Object.create(Text.prototype);
Menu.prototype.constructor = Menu;

Menu.prototype.renderSelector = function(dx, dy, style, xS, dyS, dySS) {
    var y = this.y - dyS + (this.cursor + dySS) * 53;
    render(); //redraw the canvas
    this.render(dx, dy, style); //redraw the menu
    ctx.drawImage(Resources.get(this.selector), xS, y);
};

Menu.prototype.nav = function(key, dx, dy, style, xS, dyS, dySS) {
    //Navigation in the main menu
    switch (key) {
        case 'up':
        case 'left':
            (this.cursor == 0) ? this.cursor = this.str.length - 1: this.cursor--;
            this.renderSelector(dx, dy, style, xS, dyS, dySS);
            break;
        case 'down':
        case 'right':
            (this.cursor == this.str.length - 1) ? this.cursor = 0: this.cursor++;
            this.renderSelector(dx, dy, style, xS, dyS, dySS);
            break;
        case 'enter':
            this.select();
            if (this.cursor != 0) {
                selectSubItem = true;
            };
            if (this.cursor == 2) {
                diffText.str = eDifficulty[crtDiff].name;
                diffText.render(0, 0, dStyle);
            };
            break;
    };
};

function repaintBackGround(ColRow, dC, dR, url) {
    //used with Menu.select()
    for (var i = 0; i <= dC; i++) {
        for (var j = 0; j <= dR; j++) {
            ctx.drawImage(Resources.get(url), (ColRow.x + i) * tileW, (ColRow.y + j) * tileH);
        };
    };
}

function renderSelectedPlayer() {
    //used with Menu.select()
    player.sprite = avatars[crtPlayer];
    player.render();
    helpTxt.render(0, 0, helpStyle);
}

Menu.prototype.select = function(key) {
    //Select different Menu/SubMenu items
    switch (this.cursor) {
        case 0: //Play
            startGame = true;
            init();
            break;
        case 1: //Choose Avatar from an array of players
            this.renderSelector(mdx, mdy, mStyle, xS, dyS, 4);
            switch (key) {
                case 'left':
                case 'up':
                    crtPlayer == 0 ? crtPlayer = avatars.length - 1 : crtPlayer--;
                    repaintBackGround(pOrigColRow, 0, 1, 'images/grass-block.png');
                    renderSelectedPlayer();
                    break;
                case 'right':
                case 'down':
                    crtPlayer == avatars.length - 1 ? crtPlayer = 0 : crtPlayer++;
                    repaintBackGround(pOrigColRow, 0, 1, 'images/grass-block.png');
                    renderSelectedPlayer();
                    break;
                case 'enter':
                    selectSubItem = false;
                    this.renderSelector(mdx, mdy, mStyle, xS, dyS, dySS);
                    break;
            }
            break;
        case 2: //Choose the difficulty level
            this.renderSelector(mdx, mdy, mStyle, xS, dyS, 4.25);
            switch (key) {
                case 'left':
                case 'up':
                    crtDiff == 0 ? crtDiff = eDifficulty.length - 1 : crtDiff--;
                    this.renderSelector(mdx, mdy, mStyle, xS, dyS, 4.25);
                    diffText.str = eDifficulty[crtDiff].name;
                    diffText.render(0, 0, dStyle);
                    break;
                case 'right':
                case 'down':
                    crtDiff == eDifficulty.length - 1 ? crtDiff = 0 : crtDiff++;
                    this.renderSelector(mdx, mdy, mStyle, xS, dyS, 4.25);
                    diffText.str = eDifficulty[crtDiff].name;
                    diffText.render(0, 0, dStyle);
                    break;
                case 'enter': //Set up game settings according to the difficulty level
                    selectSubItem = false;
                    var dif = allEnemies.length - eDifficulty[crtDiff].MaxEnemies;
                    switch (crtDiff) {
                        case 0: //Easy
                            if (dif > 0) {
                                removeEnemies(dif);
                                updateDifficulty(eDifficulty[crtDiff].speedFX);
                            };
                            break;
                        case 1: //Normal
                            if (dif < 0) {
                                addEnemies(-dif);
                                updateDifficulty(eDifficulty[crtDiff].speedFX);
                            } else {
                                if (dif > 0) {
                                    removeEnemies(dif);
                                    updateDifficulty(eDifficulty[crtDiff].speedFX);
                                };
                            };
                            break;
                        case 2: //Hard
                            if (dif < 0) {
                                addEnemies(-dif);
                                updateDifficulty(eDifficulty[crtDiff].speedFX);
                            };
                            break;
                    };
                    this.renderSelector(mdx, mdy, mStyle, xS, dyS, dySS);
                    break;
            };
            break;
    };
};

//FUNCTIONS
function randomX(width, cols) {
    //calculates a random X position
    return width * Math.ceil((Math.random() * cols));
}

function randomY(height, toRow, fromRow, dy) {
    //calculates a random Y position between given rows
    return height * Math.floor((Math.random() * toRow) + fromRow) + dy;
}

function randomSpeed(s) {
    return Math.random() * s + 1;
}

function addEnemies(n) {
    //Fill up the allEnemies array
    for (var i = 0; i < n; i++) {
        eLoc.x = randomX(50, 8); //put the enemy in 1 of 5 columns
        eLoc.y = randomY(83, 3, 1, -20); //put the enemy in 1 of 3 rows
        eSpeed = randomSpeed(4);
        allEnemies.push(new Enemy(eLoc, eFrame, eSprite, eSpeed, eDifficulty[crtDiff].speedFX));
    };
}

function removeEnemies(n) {
    //Remove enemies when adjusting difficulty level
    for (var i = 0; i < n; i++) {
        allEnemies.pop();
    };
}

function updateDifficulty(difficulty) {
    //Updates the difficulty settings on changing it
    for (var i = 0; i < allEnemies.length; i++) {
        allEnemies[i].difficulty = difficulty;
    };
}

function addTreasures(n) {
    var t;
    for (var i = 0; i < n; i++) {
        tLoc.x = randomX(50, 8); //put the treasure in 1 of 5 columns
        tLoc.y = 120; //put the treasure in 1 of 3 rows
        tSpeed = randomSpeed(4);
        t = Math.ceil(Math.random() * 3);
        allTreasures.push(new Treasure(tLoc, tFrame, tSprite[t], tSpeed));
    };
}

/*GLOBAL VARIABLES */
/* used to control the 'keyup' event */
var startGame = false,
    selectSubItem = false;

/*Players for the Avatar Menu*/
var avatars = [
        'images/char-pink-girl.png',
        'images/char-boy.png',
        'images/char-horn-girl.png',
        'images/char-princess-girl.png'
    ],
    crtPlayer = 0;

/*Settings for Difficulty levels*/
var eDifficulty = [{
    'name': 'Easy',
    'MaxEnemies': 3,
    'speedFX': 20
}, {
    'name': 'Normal',
    'MaxEnemies': 4,
    'speedFX': 40
}, {
    'name': 'Hard',
    'MaxEnemies': 5,
    'speedFX': 80
}];

/* Text styles */
var mStyle = { //for Menu text
        'font': 'bold 36pt Impact',
        'fillStyle': 'green',
        'strokeStyle': 'orange',
        'textAlign': 'center'
    },
    dStyle = { //for Difficulty text
        'font': 'bold 36pt Impact',
        'fillStyle': 'red',
        'strokeStyle': 'green',
        'textAlign': 'center'
    },
    wStyle = { //for winning text
        'font': 'bold 26pt Impact',
        'fillStyle': 'blue',
        'strokeStyle': 'green',
        'textAlign': 'center'
    },
    dieStyle = { //for dying text
        'font': 'bold 26pt Impact',
        'fillStyle': 'black',
        'strokeStyle': 'white',
        'textAlign': 'center'
    },
    helpStyle = { //for the onscreen help text
        'font': 'bold 16pt Georgia',
        'fillStyle': 'orange',
        'strokeStyle': 'red',
        'textAlign': 'center'
    };

// Now instantiate your objects.
// Data for the Menu
var mLoc = { //Origin
        x: 505 / 2,
        y: 606 / 3
    },
    mdx = 0, //delta x
    mdy = 53, //delta y
    xS = 80, //x for the selector sprite
    dyS = 130, // y for the selector sprite
    dySS = 0, // extra y for the selector sprite

    mItems = ['Play', 'Avatar', 'Difficulty'];

var menu = new Menu(mLoc, mItems, mItems.length - 1, 'images/Star.png');

// Difficulty levles data
var dLoc = {
        'x': 252,
        'y': 520
    },
    diffText = new Text(dLoc, ''),
    crtDiff = 1, //current difficulty level = Normal
    //diferent text messages
    winText = new Text(dLoc, 'YAY'),
    dieText = new Text(dLoc, 'OUCH'),
    helpTxt = new Text({
        x: 252,
        y: 550
    }, 'Arrows to Play/Select & Enter to Confirm');

// Place all enemy objects in an array called allEnemies
var allEnemies = [],
    eLoc = {
        x: 0,
        y: 0
    }, //Origin holder
    eFrame = {
        topX: 3,
        topY: 78,
        width: 96,
        height: 64
    }, //Frame for the center of mass
    eSprite = 'images/enemy-bug.png',
    eSpeed;

addEnemies(eDifficulty[crtDiff].MaxEnemies);

//Collectible data
var allTreasures = [],
    tLoc = {
        x: 0,
        y: 0
    },
    tFrame = {
        topX: 4,
        topY: 58,
        width: 94,
        height: 104
    },
    tSprite = [
        'images/Gem orange.png',
        'images/Gem green.png',
        'images/Gem blue.png',
        'images/Key.png'
    ],
    tSpeed;

// Place the player object in a variable called player
//Player data
var tileW = 101,
    tileH = 83,
    pOrigColRow = {
        x: 2,
        y: 4
    },
    pOrigin = {
        x: pOrigColRow.x * tileW,
        y: pOrigColRow.y * tileH
    },
    pFrame = {
        topX: 16,
        topY: 63,
        width: 64,
        height: 74
    },
    pSprite = avatars[crtPlayer],
    pStep = 60,
    pLives = 5,
    pScore = 0;
pReturnSpeed = 150;
pReturnLimit = 10;

var player = new Player(pOrigin, pFrame, pSprite, pStep, pLives, pScore);
player.center();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        13: 'enter',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
    };
    if (!pWin && !pDie) { //after winning and dying the keys arn't handled
        if (startGame) {
            player.handleInput(allowedKeys[e.keyCode]); //moving around the player
        } else {
            if (selectSubItem) {
                menu.select(allowedKeys[e.keyCode]); //select a menu or submenu item
            } else {
                menu.nav(allowedKeys[e.keyCode], mdx, mdy, mStyle, xS, dyS, dySS); //using keyup for navigating the menu
            };
        };
    };
});