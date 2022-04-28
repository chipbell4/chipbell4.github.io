/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const Sprite = __webpack_require__(7);
const util = __webpack_require__(2);

module.exports = {
  // display list constants
  BACKGROUND: 0,
  UI: 1,
  SPRITES: 2,
  TOP: 3,

  // default pixel density
  PIXEL_DENSITY: 6,

  init: function() {
    this.canvas = document.getElementById('canvas');

    // set size and width attributes appropriately
    let boundingRect = this.canvas.getBoundingClientRect();
    this.canvas.width = boundingRect.width;
    this.canvas.height = boundingRect.height;

    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    this.isStarted = false;
    this.clearDisplayList();

    this.PIXEL_DENSITY = Math.floor(boundingRect.height / 133);
  },

  clearDisplayList: function() {
    this.displayList = [[], [], [], []];
  },

  pushDisplayList: function(subList, item) {
    this.displayList[subList].push(item);
  },

  removeItem: function(item) {
    this.displayList.forEach(sublist => {
      let index = sublist.indexOf(item);
      if(index > -1) {
        sublist.splice(index, 1);
      }
    });
  },

  start: function() {
    this.isStarted = true;

    let lastValue = null;
    let loop = currentTime => {
      let dt = 1 / 60;
      if(lastValue !== null) {
        dt = (currentTime - lastValue) / 1000;
      }
      lastValue = currentTime;

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.draw();
      this.update(dt);

      if(this.isStarted) {
        requestAnimationFrame(loop);
      }
    };

    requestAnimationFrame(loop);
  },

  stop: function() {
    this.isStarted = false;
  },

  update: function(dt) {
    util.forEachRecursive(this.displayList, item => item.update(dt));
  },

  draw: function() {
    util.forEachRecursive(this.displayList, item => item.draw(this.context));
  },

  pointer: function(x, y) {
    util.forEachRecursive(this.displayList, item => {
      if(item.contains(x, y)) {
        item.pointer(x, y);
      }
    });
  }
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Timeout = __webpack_require__(8);

class BitmapSprite {
  constructor(bitmap, colors) {
    this.bitmap = bitmap;
    this.colors = colors;
    this.x = 0;
    this.y = 0;
    this.xPixelSize = 1;
    this.yPixelSize = 1;
    this.visible = true;
  }
  
  playAnimation(animation, frameDelay) {
    var promise = Promise.resolve();

    for(var i = 0; i < animation.length; i++) {
      let j = i;
      promise = promise.then(() => {
        this.bitmap = animation[j];
        this.currentTimeout = new Timeout(frameDelay);
        return this.currentTimeout.start();
      });
    }

    return promise;
  }


  height() {
    return this.bitmap.length * this.yPixelSize;
  }

  width() {
    return this.bitmap[0].length * this.xPixelSize;
  }

  update(dt) {
  }

  contains(x, y) {
    var right = this.x + this.bitmap[0].length * this.xPixelSize;
    var bottom = this.y + this.bitmap.length * this.yPixelSize;
    return x >= this.x && this.x <= right && y >= this.y && y < bottom;
  }

  pointer(x, y) {
  }

  prerender() {
    this.prefab = document.createElement('canvas');
    this.prefab.width = this.width();
    this.prefab.height = this.height();
    this.prefab.style.backgroundColor = 'rgba(0, 0, 0, 0)';

    var context = this.prefab.getContext('2d');
    context.imageSmoothingEnabled = false;
    this.renderByPixelToContext(context, 0, 0);
  }

  renderByPixelToContext(context, x, y) {
    for(var i = 0; i < this.bitmap.length; i++) {
      for(var j = 0; j < this.bitmap[i].length; j++) {
        if(this.bitmap[i][j] === null) {
          continue;
        }

        context.fillStyle = this.colors[this.bitmap[i][j]];
        context.fillRect(
          x + j * this.xPixelSize,
          y + i * this.yPixelSize,
          this.xPixelSize * 1.1,
          this.yPixelSize * 1.1
        );
      }
    }
  }

  draw(context) {
    if(!this.visible) {
      return;
    }

    if(this.prefab !== undefined) {
      context.drawImage(this.prefab, this.x, this.y);
    } else {
      this.renderByPixelToContext(context, this.x, this.y);
    }
  }
}

module.exports = BitmapSprite


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {
  percentageToFrequency: percentage => {
    return 110 * Math.pow(2, 48 * percentage / 12 );
  },
  percentageToVolume: percentage => {
    return 0.5 * percentage;
  },
  boxArea: (trackEvent, color) => {
    return trackEvent.data
      .filter(box => box.color === color)
      .map(box => box.width * box.height)
      .reduce((a, b) => Math.max(a, b), 0);
  },
  shuffle: array => {
    for(var i = array.length - 1; i >= 1; i--) {
      let j = Math.floor(Math.random() * i);
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  },
  forEachRecursive: function(array, callback) {
    array.forEach(item => {
      if(item instanceof Array) {
        this.forEachRecursive(item, callback);
      } else {
        callback(item);
      }
    });
  }
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const BitmapSprite = __webpack_require__(1);
const canvas = __webpack_require__(0);
const sequencer = __webpack_require__(4);
const Timeout = __webpack_require__(8);

const POP_TIME = 150;

class Popup extends BitmapSprite {
  constructor(mainBitmap, palette, animations) {
    super(mainBitmap, palette);
    this.mainBitmap = mainBitmap;
    this.animations = animations;
    this.visible = false;
  }

  pop(waitTimeMillis) {
    this.initialY = this.y;
    this.visible = true;
    this.hittable = false;
    this.wasHit = false;
    this.currentTimeout = null;

    return this.playAnimation(this.animations.intro, 200)
      .then(() => {
        this.bitmap = this.mainBitmap;
        this.hittable = true;
        this.currentTimeout = new Timeout(waitTimeMillis);
        return this.currentTimeout.start();
      })
      .then(() => this.hittable = false)
      .then(() => {
        sequencer.play('miss'); // TODO: Figure out why this fixes the bug
        return this.playAnimation(this.animations.attack, 300)
      })
      .catch(() => this.playAnimation(this.animations.outro, 100)) // catch implies timeout was cancelled
      .then(() => {
        this.visible = false;
        if(!this.wasHit) {
          throw new Error('Popup was not hit');
        }
      });
  }

  pointer(x, y) {
    this.tryHit();
  }

  tryHit() {
    if(!this.hittable || this.initialY === undefined) {
      return false;
    }

    sequencer.play('hit');

    this.hittable = false;
    this.wasHit = true;
    if(this.currentTimeout) {
      this.currentTimeout.cancel();
    }

    return true;
  }
}

module.exports = Popup;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var context = new AudioContext();
var oscillator = context.createOscillator();
oscillator.type = 'square';
var gain = context.createGain();
gain.gain.value = 0;
oscillator.connect(gain);
gain.connect(context.destination);
oscillator.start();

module.exports = {
  init: function() {
    this.play('empty');
    requestAnimationFrame(this.next.bind(this));
  },

  next: function() {
    requestAnimationFrame(this.next.bind(this));

    var currentSequenceData = this.sequenceData[this.sequenceIndex];
    if(currentSequenceData === undefined) {
      gain.gain.value = 0;
      if(this.onFinishPlaying) {
        this.onFinishPlaying(this.sequenceData);
        delete this.onFinishPlaying;
      }
      return;
    }

    this.frameCounter++;

    if(this.frameCounter >= currentSequenceData.d) {
      this.frameCounter = 0;
      this.sequenceIndex++;

      var nextSequenceData = this.sequenceData[this.sequenceIndex];
      if(nextSequenceData !== undefined) {
        gain.gain.value = 0.1;
        oscillator.frequency.setValueAtTime(nextSequenceData.f, context.currentTime);
      }
    }
  },

  play: function(name) {
    this.sequenceData = this.data[name];
    this.sequenceIndex = 0;
    this.frameCounter = 0;
      
    if(this.sequenceData.length > 0) {
      gain.gain.value = 0.1;
      oscillator.frequency.setValueAtTime(this.sequenceData[0].f, context.currentTime);
      return new Promise((resolve, reject) => {
        this.onFinishPlaying = resolve;
      });
    } else {
      return Promise.resolve();
    }
  },

  data: {
    empty: [],
    newGame: [
      { f: 261.63, d: 4 },
      { f: 329.63, d: 4 },
      { f: 392.00, d: 4 },
      { f: 523.25, d: 4 },
      { f: 659.26, d: 4 },
      { f: 783.99, d: 4 },
      { f: 1046.5, d: 4 },
      { f: 783.99, d: 4 },
      { f: 659.26, d: 4 },
      { f: 523.25, d: 4 },
      { f: 392.00, d: 4 },
      { f: 329.63, d: 4 },
      { f: 261.63, d: 30 }
    ],
    hit: [
      { f: 1108.7, d: 6 },
      { f: 1244.5, d: 3 }
    ],
    miss: [
      { f: 1108.7, d: 3 },
      { f: 1046.5, d: 3 },
      { f: 987.77, d: 3 },
      { f: 932.33, d: 3 },
      { f: 880   , d: 6 } 
    ],
    endRound: [
      { f: 523.25, d: 4 },
      { f: 493.88, d: 4 },
      { f: 523.25, d: 4 },
      { f: 659.26, d: 4 },
      { f: 622.25, d: 4 },
      { f: 659.26, d: 4 },
      { f: 783.99, d: 4 },
      { f: 739.99, d: 4 },
      { f: 783.99, d: 4 },
      { f: 1046.5, d: 30 },
    ],
    endGame: [
      { f: 523.75, d: 8 },
      { f:      0, d: 4 },
      { f: 523.75, d: 4 },
      { f:      0, d: 4 },
      { f: 523.75, d: 2 },
      { f:      0, d: 2 },
      { f: 523.75, d: 12 },


      { f: 622.25, d: 8 },
      { f: 587.33, d: 2 },
      { f:      0, d: 2 },
      { f: 587.33, d: 8 },
      { f: 523.75, d: 2 },
      { f:      0, d: 2 },
      { f: 523.75, d: 8 },
      { f: 493.88, d: 4 },
      { f: 523.75, d: 12 },
      { f: 261.63, d: 12 },
    ]
  }
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const canvas = __webpack_require__(0);
const Sprite = __webpack_require__(7);

class TextSprite extends Sprite {
  constructor() {
    super(new Image());
    var fontSize = Math.floor(canvas.PIXEL_DENSITY * 5);
    this.font = fontSize + 'px "Press Start 2P"';
  }

  draw(context) {
    context.font = this.font;
    context.fillStyle = 'white';

    var metrics = context.measureText(this.text);

    context.fillText(this.text, this.x - metrics.width / 2, this.y);
  }
}

module.exports = TextSprite;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

var context = new AudioContext();
var oscillator = context.createOscillator();
var gain = context.createGain();
gain.gain.value = 0;

oscillator.connect(gain);
gain.connect(context.destination);

oscillator.start();

module.exports = {
  setFrequency: frequency => {
    oscillator.frequency.value = frequency;
  },

  setVolume: volume => {
    gain.gain.value = volume;
  }
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {

class Sprite {
  constructor(image) {
    this.image = image;
    this.x = 0;
    this.y = 0;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  update(dt) {
  }

  draw(context) {
    // wait for the image to load
    if(!this.image.complete) {
      return;
    }

    context.drawImage(
      this.image,
      this.x,
      this.y,
      this.scaleX * this.image.width,
      this.scaleY * this.image.height
    );
  }

  contains(x, y) {
    var right = this.x + this.scaleX * this.image.width;
    var top = this.y + this.scaleY * this.image.height;
    return x >= this.x && x <= right && y >= this.y && y <= top;
  }

  pointer(x, y) {
  }
}

module.exports = Sprite;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

class Timeout {
  constructor(millis) {
    this.millis = millis;
    this.timeout = null;
    this.callback = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.callback = reject;
      this.timeout = setTimeout(resolve, this.millis);
    });
  }

  cancel() {
    clearTimeout(this.timeout);
    this.callback();
  }
}

module.exports = Timeout;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const Popup = __webpack_require__(3);
const bitmap = __webpack_require__(15);

class GhostPopup extends Popup {
  constructor(palette) {
    super(
      bitmap.ghost,
      palette,
      {
        intro: [bitmap.ghostVanish2, bitmap.ghostVanish1],
        outro: [bitmap.ghostVanish1, bitmap.ghostVanish2],
        attack: [bitmap.ghostAttack1, bitmap.ghostAttack2]
      }
    );
  }
}

module.exports = GhostPopup;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var audio = __webpack_require__(6);
var util = __webpack_require__(2);
const canvas = __webpack_require__(0);

module.exports = {
  init: function() {
    canvas.canvas.addEventListener('mousemove', evt => {
      var boundingRect = canvas.canvas.getBoundingClientRect();

      this.position = {
        x: evt.clientX - boundingRect.left,
        y: evt.clientY - boundingRect.top,
        distance: 1
      };
    });
  },

  position: {
    x: 0,
    y: 0,
    distance: 0
  },

  trackedDistances: []
};


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = {"tombstone":["#6c6c6c","#909090","#404040","#6c6c6c","#909090"],"ground":[["#442800"],["#644818"],["#846830"],["#a08444"],["#b89c58"]],"logo":["#b03c3c","#b8b840"],"moon":["#b0b0b0","#404040"],"cloud":["#404040"],"spider":[["#302098","#e8e85c"],["#844414","#e8e85c"],["#b03c3c","#e8e85c"],["#ececec","#909090"]],"pumpkin":[["#b8b840","#fcfc68","#848424","#440"],["#d0805c","#fcbc94","#ac5030","#841800"],["#c070b0","#d4b0fc","#78005c","#78005c"],["#b0b0b0","#ececec","#6c6c6c","#000"]],"ghost":[["#1c5c48","#ececec","#9c2020"],["#8c2074","#ececec","#9c2020"],["#844414","#ececec","#9c2020"],["#404040","#ececec","#9c2020"]]}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var audio = __webpack_require__(6);
var util = __webpack_require__(2);
var canvas = __webpack_require__(0);
var game = __webpack_require__(13);
const tracking = __webpack_require__(10);
const sequencer = __webpack_require__(4);

const noopFactory = function(message) {
  return function() {
    console.log('Hitting noop for ' + message);
  };
};
const mute = function() {
  audio.setVolume(0);
};

/*
new springroll.TinyApplication({
  soundMuted: mute,
  captionsMuted: noopFactory('captionsMuted'),
  musicMuted: mute,
  voMuted: mute,
  sfxMuted: mute,
  captionsStyles: noopFactory('captionsStyles'),
  pause: noopFactory('pause'),
  close: noopFactory('close')
});
*/

audio.setVolume(0.00);
canvas.init();
tracking.init();
sequencer.init();
canvas.start();
game.init();
game.start();


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

const canvas = __webpack_require__(0);
const Round = __webpack_require__(14);
const ScoreManager = __webpack_require__(18);
const Scoreboard = __webpack_require__(19);
const Crosshairs = __webpack_require__(20);
const sequencer = __webpack_require__(4);
const TextSprite = __webpack_require__(5);
const HighScoreText = __webpack_require__(22);
const HighScoreManager = __webpack_require__(23);
const BitmapSprite = __webpack_require__(1);

const GhostPopup = __webpack_require__(9);
const PumpkinPopup = __webpack_require__(24);
const SpiderPopup = __webpack_require__(26);

const Graveyard = __webpack_require__(28);

const palettes = __webpack_require__(11);

module.exports = {
  init: function() {
  },

  start: function() {
    return this.startScreen()
      .then(() => this.doRounds())
      .catch(e => console.log(e))
      .then(() => this.scoreScreen())
      .then(() => this.start())
  },

  startScreen: function() {
    canvas.clearDisplayList();

    var logo = new BitmapSprite(__webpack_require__(32), palettes.logo);
    logo.xPixelSize = logo.yPixelSize = Math.floor(canvas.PIXEL_DENSITY / 3);
    logo.x = (canvas.canvas.width - logo.width()) * 0.5;
    logo.y = (canvas.canvas.height - logo.height()) * 0.5;

    var currentHighScore = new TextSprite();
    currentHighScore.text = 'HI SCORE ' + HighScoreManager.get();
    currentHighScore.x = canvas.canvas.width * 0.5;
    currentHighScore.y = canvas.canvas.height * 0.9;

    canvas.pushDisplayList(canvas.UI, logo);
    canvas.pushDisplayList(canvas.UI, currentHighScore);
    canvas.pushDisplayList(canvas.TOP, new Crosshairs());

    return new Promise(function(resolve, reject) {
      logo.pointer = () => resolve();
    }).then(() => sequencer.play('newGame'));
  },

  doRounds: function() {
    canvas.clearDisplayList();

    this.scoreManager = new ScoreManager();
    this.scoreboard = new Scoreboard(this.scoreManager);
    this.scoreboard.x = canvas.canvas.width * 0.5;
    this.scoreboard.y = canvas.canvas.height * 0.95;

    canvas.pushDisplayList(canvas.BACKGROUND, new Graveyard);
    canvas.pushDisplayList(canvas.UI, this.scoreboard);
    canvas.pushDisplayList(canvas.TOP, new Crosshairs());

    var allRounds = Promise.resolve();
    for(var i = 0; i < this.roundData.length; i++) {
      let j = i;
      allRounds = allRounds.then(() => this.doRound(j));
    }

    return allRounds;
  },

  doRound: function(roundIndex) {
    var currentRoundData = this.roundData[roundIndex];
    var round = new Round(
      currentRoundData[0], // number of pops
      currentRoundData[1], // pop concurrency
      currentRoundData[2], // pop time length
      currentRoundData[3], // type of popup to use
      currentRoundData[4], // render color
      this.scoreManager);
    
    return round.start().then(() => sequencer.play('endRound'));
  },

  scoreScreen: function() {
    var scoreValue = new TextSprite();
    scoreValue.text = this.scoreManager.value;
    scoreValue.x = canvas.canvas.width / 2;
    scoreValue.y = canvas.canvas.height / 2;

    canvas.clearDisplayList();
    canvas.pushDisplayList(canvas.UI, scoreValue);

    var isHighScore = HighScoreManager.trySet(this.scoreManager.value);

    return sequencer.play('endGame')
      .then(() => {
        if(!isHighScore) {
          return;
        }

        var highScoreText = new HighScoreText();
        highScoreText.x = canvas.canvas.width / 2;
        highScoreText.y = canvas.canvas.height * 0.9;
        canvas.pushDisplayList(canvas.UI, highScoreText);
      })
      .then(() => new Promise(resolve => setTimeout(resolve, 4000)));
  },

  roundData: [
    [5,  1, 2000, SpiderPopup, palettes.spider[0]],
    [10, 1, 2000, PumpkinPopup, palettes.pumpkin[0]],
    [15, 1, 2000, GhostPopup, palettes.ghost[0]],
    [15, 2, 1500, SpiderPopup, palettes.spider[1]],
    [15, 2, 1250, PumpkinPopup, palettes.pumpkin[1]],
    [15, 2, 1000, GhostPopup, palettes.ghost[1]],
    [15, 3, 2000, SpiderPopup, palettes.spider[2]],
    [15, 3, 1500, PumpkinPopup, palettes.pumpkin[2]],
    [15, 3, 1250, GhostPopup, palettes.ghost[2]],
    [15, 3, 1000, SpiderPopup, palettes.spider[3]],
    [15, 3,  750, PumpkinPopup, palettes.pumpkin[3]],
    [15, 3,  500, GhostPopup, palettes.ghost[3]],
  ]
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

const canvas = __webpack_require__(0);
const Popup = __webpack_require__(3);
const GhostPopup = __webpack_require__(9);
const util = __webpack_require__(2);
const Health = __webpack_require__(16);

const MAX_MISSES = 5;

class Round {
  constructor(revealCount, concurrency, targetDelay, PopupType, palette, scoreboard) {
    this.revealCount = revealCount;
    this.concurrency = concurrency;
    this.targetDelay = targetDelay;
    this.scoreboard = scoreboard;
    this.PopupType = PopupType;
    this.palette = palette;
    this.health = new Health();
  }

  start() {
    canvas.pushDisplayList(canvas.UI, this.health);

    var promise = Promise.resolve();

    for(var i = 0; i < this.revealCount; i++) {
      promise = promise.then(() => this.doSingleShow());
    }

    return promise.then(this.removeHealthFromDisplayList.bind(this));
  }

  removeHealthFromDisplayList() {
    canvas.removeItem(this.health);
  }

  doSingleShow() {
    var rails = this.pickRails(this.concurrency);
    var popups = [];
    for(var i = 0; i < this.concurrency; i++) {
      let popup = new this.PopupType(this.palette);
      popup.x = this.pickXLocation();
      popup.y = rails[i] * 288 / 4;
      popup.xPixelSize = popup.yPixelSize = canvas.PIXEL_DENSITY;
      popups.push(popup);
      canvas.pushDisplayList(canvas.SPRITES, popup);
    }

    var promises = popups.map(popup => {
      return popup.pop(this.targetDelay)
        .then(() => this.scoreboard.hit())
        .catch(() => {
          this.scoreboard.miss();
          this.health.loseHealth();
          if(this.health.currentHealth <= 0) {
            this.removeHealthFromDisplayList();
            throw new Error('Missed too many!');
          }
        });
    });

    return Promise.all(promises);
  }

  pickXLocation() {
    var totalSlots = 4;
    var slotIndex = Math.floor(totalSlots * Math.random());
    return (slotIndex / totalSlots) * canvas.canvas.width;
  }

  pickRails(number) {
    var rails = [0, 1, 2, 3];
    util.shuffle(rails);
    return rails.slice(0, number);
  }
}

module.exports = Round;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = {"ghost":[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,0,0,1,0,0,1,0,0,0,0],[0,0,0,1,1,0,0,1,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,1,1,1,1,1,0,0,0],[0,0,0,0,0,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,null,0,null,0,0,null,0,null,0,0]],"ghostVanish1":[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,null,null,0,null,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,null,0,null,0,null,0,null,0,null],[0,0,0,0,1,0,0,1,0,0,0,0],[null,0,null,1,null,0,null,1,null,0,null,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,null,0,null,0,null,0,null,0,null,0,null],[0,0,0,1,1,1,1,1,1,0,0,0],[null,0,null,0,null,1,null,0,null,0,null,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,null,null,null,null,null,0,null,0,null,0,null]],"ghostVanish2":[[null,null,null,null,null,null,0,null,null,null,null,null],[null,null,null,null,null,0,null,0,null,null,null,null],[null,null,0,null,0,null,0,null,0,null,null,null],[null,0,null,0,null,0,null,0,null,0,null,null],[0,null,0,null,1,null,0,null,0,null,0,null],[null,0,null,1,null,0,null,1,null,0,null,0],[0,null,0,null,0,null,0,null,0,null,0,null],[null,0,null,0,null,0,null,0,null,0,null,0],[0,null,0,null,1,null,1,null,1,null,0,null],[null,0,null,0,null,1,null,0,null,0,null,0],[0,null,0,null,0,null,0,null,0,null,0,null],[null,0,null,0,null,0,null,null,null,null,null,0]],"ghostAttack1":[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,0,0,1,0,0,1,0,0,0,0],[0,0,0,1,2,0,0,2,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,1,1,2,1,0,0,0],[0,0,0,0,0,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,null,0,null,0,0,null,0,null,0,0]],"ghostAttack2":[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,0,2,2,0,0,2,2,0,0,0],[0,0,0,2,2,0,0,2,2,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,2,1,1,1,1,2,0,0,0],[0,0,0,2,1,1,1,1,2,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,null,0,null,0,0,null,0,null,0,0]]}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const canvas = __webpack_require__(0);
const BitmapSprite = __webpack_require__(1);
const heart = __webpack_require__(17);

class Health {
  constructor() {
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.sprites = [];
    for(var i = 0; i < this.maxHealth; i++) {
      var sprite = new BitmapSprite(heart.heartFull, ['white', 'red']);
      sprite.xPixelSize = sprite.yPixelSize = Math.floor(canvas.PIXEL_DENSITY / 2);
      sprite.x = i * 45 + 10;
      sprite.y = canvas.canvas.height - 50;
      this.sprites.push(sprite);
    }
  }

  update(dt) {
  }

  draw(context) {
    this.sprites.forEach(sprite => sprite.draw(context));
  }

  loseHealth() {
    this.currentHealth--;
    var sprite = this.sprites[this.currentHealth];
    return sprite
      .playAnimation([heart.heartLose1, heart.heartLose2, heart.heartLose3], 70)
      .then(() => sprite.bitmap = heart.heartEmpty);
  }

  contains(x, y) {
    return false;
  }

  pointer(x, y) {
  }
};

module.exports = Health;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = {"heartFull":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,0,0,null,null,0,0,null,null,null],[null,null,0,1,1,0,0,1,1,0,null,null],[null,0,1,1,1,1,1,1,1,1,0,null],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0],[null,0,1,1,1,1,1,1,1,1,0,null],[null,null,0,1,1,1,1,1,1,0,null,null],[null,null,null,0,1,1,1,1,0,null,null,null],[null,null,null,null,0,1,1,0,null,null,null,null],[null,null,null,null,null,0,0,null,null,null,null,null]],"heartLose1":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,0,0,null,null,0,0,null,null,null],[null,null,0,null,null,0,0,null,null,0,null,null],[null,0,null,1,1,null,null,1,1,null,0,null],[0,null,1,1,1,1,1,1,1,1,null,0],[0,null,1,1,1,1,1,1,1,1,null,0],[0,null,1,1,1,1,1,1,1,1,null,0],[null,0,null,1,1,1,1,1,1,null,0,null],[null,null,0,null,1,1,1,1,null,0,null,null],[null,null,null,0,null,1,1,null,0,null,null,null],[null,null,null,null,0,null,null,0,null,null,null,null],[null,null,null,null,null,0,0,null,null,null,null,null]],"heartLose2":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,0,0,null,null,0,0,null,null,null],[null,null,0,null,null,0,0,null,null,0,null,null],[null,0,null,null,null,null,null,null,null,null,0,null],[0,null,null,1,1,null,null,1,1,null,null,0],[0,null,null,1,1,1,1,1,1,null,null,0],[0,null,null,1,1,1,1,1,1,null,null,0],[null,0,null,null,1,1,1,1,null,null,0,null],[null,null,0,null,null,1,1,null,null,0,null,null],[null,null,null,0,null,null,null,null,0,null,null,null],[null,null,null,null,0,null,null,0,null,null,null,null],[null,null,null,null,null,0,0,null,null,null,null,null]],"heartLose3":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,0,0,null,null,0,0,null,null,null],[null,null,0,null,null,0,0,null,null,0,null,null],[null,0,null,null,null,null,null,null,null,null,0,null],[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,1,null,null,1,null,null,null,0],[0,null,null,null,1,1,1,1,null,null,null,0],[null,0,null,null,null,1,1,null,null,null,0,null],[null,null,0,null,null,null,null,null,null,0,null,null],[null,null,null,0,null,null,null,null,0,null,null,null],[null,null,null,null,0,null,null,0,null,null,null,null],[null,null,null,null,null,0,0,null,null,null,null,null]],"heartEmpty":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,0,0,null,null,0,0,null,null,null],[null,null,0,null,null,0,0,null,null,0,null,null],[null,0,null,null,null,null,null,null,null,null,0,null],[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0],[null,0,null,null,null,null,null,null,null,null,0,null],[null,null,0,null,null,null,null,null,null,0,null,null],[null,null,null,0,null,null,null,null,0,null,null,null],[null,null,null,null,0,null,null,0,null,null,null,null],[null,null,null,null,null,0,0,null,null,null,null,null]]}

/***/ }),
/* 18 */
/***/ (function(module, exports) {

const BASE_SCORE_ADDITION = 10;
const MAX_MULTIPLIER = 5;

const BONUS_FOR_TIME_DELTA = dt => {
  return 0;
};

class ScoreManager {
  constructor() {
    this.value = 0;
    this.bonusMultiplier = 1;
  }

  hit() {
    if(this.lastTime === undefined) {
      this.lastTime = Date.now();
    } else {
      var dt = Date.now() - this.lastTime;
      this.lastTime = Date.now();

      this.value += BONUS_FOR_TIME_DELTA(dt);
    }

    this.value += this.bonusMultiplier * BASE_SCORE_ADDITION;
    this.bonusMultiplier = Math.min(this.bonusMultiplier + 1, MAX_MULTIPLIER);
  }

  miss() {
    this.bonusMultiplier = 1;
  }
}

module.exports = ScoreManager;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

const TextSprite = __webpack_require__(5);

class Scoreboard extends TextSprite {
  constructor(score) {
    super();
    this.score = score;
  }

  draw(context) {
    this.text = this.score.value;
    super.draw(context);
  }
}

module.exports = Scoreboard;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

const BitmapSprite = __webpack_require__(1);
const tracking = __webpack_require__(10);
const canvas = __webpack_require__(0);
const bitmap = __webpack_require__(21);

const FRAMES_PER_SCARE = 30;

class Crosshairs extends BitmapSprite {
  constructor() {
    super(bitmap, ['#f33']);
    this.xPixelSize = canvas.PIXEL_DENSITY;
    this.yPixelSize = canvas.PIXEL_DENSITY;
  }

  pointer(x, y) {
  }

  update(dt) {
    this.x = tracking.position.x;
    this.y = tracking.position.y;

    var centerX = this.x + 0.5 * this.xPixelSize * this.bitmap.length;
    var centerY = this.y + 0.5 * this.yPixelSize * this.bitmap[0].length;

    canvas.pointer(centerX, centerY);
  }
}

module.exports = Crosshairs;


/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = [[null,null,null,null,0,null,null,null,null],[null,null,null,0,0,0,null,null,null],[null,null,0,null,0,null,0,null,null],[null,0,null,null,0,null,null,0,null],[0,0,0,0,0,0,0,0,0],[null,0,null,null,0,null,null,0,null],[null,null,0,null,0,null,0,null,null],[null,null,null,0,0,0,null,null,null],[null,null,null,null,0,null,null,null,null]]

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

const TextSprite = __webpack_require__(5);

const FRAMES_PER_SWITCH = 30;

class HighScoreText extends TextSprite {
  constructor() {
    super();
    this.text = 'HI SCORE';
    this.isOn = true;
    this.frameCounter = 0;
  }

  update(dt) {
    this.frameCounter++;

    if(this.frameCounter >= FRAMES_PER_SWITCH) {
      this.isOn = !this.isOn;
      this.frameCounter = 0;
    }
  }

  draw(context) {
    if(this.isOn) {
      super.draw(context);
    }
  }
}

module.exports = HighScoreText;


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = {
  trySet: function(newValue) {
    var currentHighScore = this.get();

    if(newValue > currentHighScore) {
      localStorage.setItem('high-score', newValue);
      return true;
    }

    return false;
  },

  get: function() {
    var currentHighScore = 0;
    if(localStorage.getItem('high-score') !== null) {
      currentHighScore = Number(localStorage.getItem('high-score'));
    }

    return currentHighScore;
  }
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

const Popup = __webpack_require__(3);
const bitmap = __webpack_require__(25);

class PumpkinPopup extends Popup {
  constructor(palette) {
    super(
      bitmap.pumpkin,
      palette,
      {
        intro: [bitmap.pumpkinTiny, bitmap.pumpkinMedium],
        outro: [bitmap.pumpkinExplode1, bitmap.pumpkinExplode2],
        attack: [bitmap.pumpkinAttack1, bitmap.pumpkinAttack2]
      }
    );
  }
}

module.exports = PumpkinPopup;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = {"pumpkin":[[null,null,null,null,null,null,2,2,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,1,1,0,0,0,0,1,1,0,0],[0,0,0,1,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,1,1,0,1,0,0,0],[null,0,0,0,1,1,1,1,0,0,0,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,null,null,null]],"pumpkinMedium":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,1,0,0,1,0,0,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,0,0,1,1,1,1,0,0,null,null],[null,null,0,0,0,1,1,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null]],"pumpkinTiny":[[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,0,0,0],[null,null,null,null,null,0,0,0],[null,null,null,null,null,0,0,0]],"pumpkinExplode1":[[null,null,null,null,null,null,2,2,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,1,1,0,null,null,0,1,1,0,0],[0,0,0,1,null,null,null,null,1,0,0,0],[0,0,0,0,null,null,null,null,0,0,0,0],[0,0,0,0,0,null,null,0,0,0,0,0],[0,0,0,1,0,1,1,0,1,0,0,0],[null,0,0,0,1,1,1,1,0,0,0,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,null,null,null]],"pumpkinExplode2":[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,null,null,0,0,null,null,0,null,null],[0,0,null,null,null,null,null,null,null,null,null,null],[0,0,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,0,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,0,0,null,null],[null,null,null,null,null,null,null,null,0,0,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,0,0,null,null,null,null,null,null,null,null],[null,null,0,0,null,null,null,null,null,0,null,null],[null,null,null,null,null,null,null,null,null,null,null,null]],"pumpkinAttack1":[[null,null,null,null,null,null,2,2,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,0,1,3,0,0,3,1,0,0,0],[0,0,0,0,1,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,3,1,1,3,1,0,0,0],[null,0,0,0,0,1,1,0,0,0,0,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,null,null,null]],"pumpkinAttack2":[[null,null,null,null,null,null,2,2,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,0,3,3,0,0,3,3,0,0,0],[0,0,0,3,3,0,0,3,3,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,3,3,3,3,3,3,0,0,0],[null,0,0,3,3,3,3,3,3,0,0,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,null,null,null]]}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

const Popup = __webpack_require__(3);
const bitmap = __webpack_require__(27);

class SpiderPopup extends Popup {
  constructor(palette) {
    super(
      bitmap.spider,
      palette,
      {
        intro: [bitmap.spiderTiny, bitmap.spiderMedium],
        outro: [bitmap.spiderSquish1, bitmap.spiderSquish2],
        attack: [bitmap.spiderAttack1, bitmap.spiderAttack2]
      }
    );
  }
}

module.exports = SpiderPopup;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = {"spider":[[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0],[null,0,null,null,null,null,null,null,null,null,0,null],[null,null,0,null,null,0,0,null,null,0,null,null],[0,null,null,0,0,0,0,0,0,null,null,0],[null,0,0,0,0,0,0,0,0,0,0,null],[null,null,null,0,0,0,0,0,0,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0],[null,null,0,null,0,0,0,0,null,0,null,null],[null,0,null,null,null,0,0,null,null,null,0,null],[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0]],"spiderMedium":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,0,null,null,null,null,null,null,0,null,null],[null,null,null,0,null,0,0,null,0,null,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,null,null,0,0,0,0,null,null,null,null],[null,null,null,0,null,null,null,null,0,null,null,null],[null,null,0,null,null,null,null,null,null,0,null,null],[null,null,null,null,null,null,null,null,null,null,null,null]],"spiderTiny":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,0,null,null,null,null,0,null,null,null],[null,null,null,null,0,null,null,0,null,null,null,null],[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,null,0,null,null,0,null,null,null,null],[null,null,null,0,null,null,null,null,0,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null]],"spiderSquish1":[[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0],[null,0,null,null,0,0,0,0,null,null,0,null],[null,null,0,0,0,0,0,0,0,0,null,null],[0,null,null,0,0,0,0,0,0,null,null,0],[null,0,0,0,0,0,0,0,0,0,0,null],[null,null,0,0,0,0,0,0,0,0,null,null],[0,0,0,0,0,0,0,0,0,0,0,0],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,null,0,0,0,0,0,0,null,0,null],[0,null,null,null,0,0,0,0,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0]],"spiderSquish2":[[null,null,null,null,0,0,0,null,null,null,null,null],[null,null,null,null,0,0,0,0,0,null,0,0],[0,0,0,null,0,0,0,0,0,null,0,0],[0,0,0,0,0,0,0,0,0,null,0,0],[0,0,0,0,0,0,0,0,null,null,null,null],[null,null,null,0,0,0,0,0,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,null,0,0,0,0,null],[null,0,0,0,0,null,null,null,0,0,0,null],[0,0,0,0,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,0,0,null]],"spiderAttack1":[[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0],[null,0,null,null,null,null,null,null,null,null,0,null],[null,null,0,null,null,1,1,null,null,0,null,null],[0,null,null,0,1,1,1,1,0,null,null,0],[null,0,0,1,1,1,1,1,1,0,0,null],[null,null,null,1,1,1,1,1,1,null,null,null],[0,0,0,0,1,1,1,1,0,0,0,0],[null,null,0,null,1,1,1,1,null,0,null,null],[null,0,null,null,null,1,1,null,null,null,0,null],[0,null,null,null,null,null,null,null,null,null,null,0],[0,null,null,null,null,null,null,null,null,null,null,0]],"spiderAttack2":[[1,null,null,null,null,null,null,null,null,null,null,1],[1,null,null,null,null,null,null,null,null,null,null,1],[null,1,null,null,null,null,null,null,null,null,1,null],[null,null,1,null,null,1,1,null,null,1,null,null],[1,null,null,1,1,1,1,1,1,null,null,1],[null,1,1,1,1,1,1,1,1,1,1,null],[null,null,null,1,1,1,1,1,1,null,null,null],[1,1,1,1,1,1,1,1,1,1,1,1],[null,null,1,null,1,1,1,1,null,1,null,null],[null,1,null,null,null,1,1,null,null,null,1,null],[1,null,null,null,null,null,null,null,null,null,null,1],[1,null,null,null,null,null,null,null,null,null,null,1]]}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

const canvas = __webpack_require__(0);
const BitmapSprite = __webpack_require__(1);
const bitmaps = __webpack_require__(29);
const groundBitmaps = __webpack_require__(30);
const skyBitmaps = __webpack_require__(31);
const palettes = __webpack_require__(11);

const sceneConfig = {
  moon: {
    x: 0.85,
    y: 0.10
  },
  clouds: [
    { x: 0.15, y: 0.11 },
    { x: 0.30, y: 0.19 },
    { x: 0.70, y: 0.15 },
  ],
  tombstones: [
    { type: 0, x: 0.25, y: 0.25 },
    { type: 1, x: 0.75, y: 0.45 },
    { type: 2, x: 0.50, y: 0.70 },
  ],
  ground: [
    [
      { type: 0, y: 0.25 },
      { type: 1, y: 0.25 },
      { type: 2, y: 0.25 },
      { type: 0, y: 0.25 },
      { type: 1, y: 0.25 },
    ],
    [
      { type: 2, y: 0.36 },
      { type: 0, y: 0.36 },
      { type: 1, y: 0.36 },
      { type: 2, y: 0.36 },
      { type: 0, y: 0.36 },
    ],
    [
      { type: 1, y: 0.47 },
      { type: 2, y: 0.47 },
      { type: 0, y: 0.47 },
      { type: 1, y: 0.47 },
      { type: 2, y: 0.47 },
    ],
    [
      { type: 0, y: 0.58 },
      { type: 1, y: 0.58 },
      { type: 2, y: 0.58 },
      { type: 0, y: 0.58 },
      { type: 1, y: 0.58 },
    ],
    [
      { type: 2, y: 0.69 },
      { type: 0, y: 0.69 },
      { type: 1, y: 0.69 },
      { type: 2, y: 0.69 },
      { type: 0, y: 0.69 },
    ],
  ]
};

class Graveyard {
  constructor() {
    this.moon = new BitmapSprite(skyBitmaps.moon, palettes.moon);
    this.moon.x = canvas.canvas.width * sceneConfig.moon.x;
    this.moon.y = canvas.canvas.height * sceneConfig.moon.y;
    this.moon.xPixelSize = this.moon.yPixelSize = Math.floor(canvas.PIXEL_DENSITY);

    this.clouds = [];
    sceneConfig.clouds.forEach((cloudConfig, index) => {
      var cloud = new BitmapSprite(skyBitmaps.clouds[index], palettes.cloud);
      cloud.x = cloudConfig.x * canvas.canvas.width;
      cloud.y = cloudConfig.y * canvas.canvas.height;
      cloud.xPixelSize = cloud.yPixelSize = canvas.PIXEL_DENSITY;
      cloud.prerender();
      this.clouds.push(cloud);
    });

    this.ground = [];

    sceneConfig.ground.forEach((row, paletteIndex) => {
      var sprites = row.forEach((config, index) => {
        var ground = new BitmapSprite(groundBitmaps[config.type], palettes.ground[paletteIndex]);
        ground.y = config.y * canvas.canvas.height;
        ground.xPixelSize = ground.yPixelSize = canvas.PIXEL_DENSITY;
        ground.x = index * ground.xPixelSize * ground.bitmap[0].length;
        ground.prerender();
        this.ground.push(ground);
      });
    });

    this.tombstones = sceneConfig.tombstones.map(config => {
      var tombstone = new BitmapSprite(bitmaps[config.type], palettes.tombstone);
      tombstone.x = config.x * canvas.canvas.width;
      tombstone.y = config.y * canvas.canvas.height;
      tombstone.xPixelSize = tombstone.yPixelSize = canvas.PIXEL_DENSITY;
      tombstone.prerender();
      return tombstone;
    });
  }

  update(dt) {
    this.clouds.forEach(cloud => {
      cloud.x += dt * 10;
      if(cloud.x > canvas.canvas.width) {
        cloud.x -= canvas.canvas.width;
      }
    });
  }

  draw(context) {

    this.moon.draw(context);
    this.clouds.forEach(cloud => cloud.draw(context));
    
    var i = null;
    for(i = 0; i < this.ground.length; i++) {
      this.ground[i].draw(context);
    }

    this.tombstones.forEach(tombstone => tombstone.draw(context));
  }

  contains(x, y) {
    return false;
  }

  pointer(x, y) {
  }
}

module.exports = Graveyard;


/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = [[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,1,1,1,1,0,0,null,null],[null,0,0,1,1,1,1,1,1,0,0,null],[0,0,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,2,2,2,2,1,1,0],[0,1,1,1,2,2,2,2,1,1,1,0],[0,1,1,1,2,2,2,1,1,1,1,0],[0,1,1,1,2,2,2,2,1,1,1,0],[0,1,1,1,1,2,2,2,2,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0]],[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,1,1,1,1,0,0,null,null],[null,0,0,1,1,1,1,1,1,0,0,null],[0,0,1,1,1,2,2,1,1,1,0,0],[0,1,1,1,2,2,2,2,2,1,1,0],[0,1,1,2,2,2,2,2,2,2,1,0],[0,1,2,2,3,3,4,3,4,3,1,0],[0,1,2,2,2,3,3,3,3,3,1,0],[0,1,1,2,2,2,2,2,2,2,1,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0]],[[null,null,null,null,null,0,0,null,null,null,null,null],[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,1,1,1,1,0,0,null,null],[null,0,0,1,1,1,1,1,1,0,0,null],[0,0,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,2,2,2,2,2,2,1,1,0],[0,1,1,2,2,2,2,1,2,1,1,0],[0,1,1,2,1,2,2,2,2,1,1,0],[0,1,1,2,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0]]]

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = [[[null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],[[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0],[0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],[[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],[[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null],[0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]]

/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports = {"moon":[[null,null,null,0,0,0,0,0,0,null,null,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[null,0,0,0,0,0,0,0,0,0,0,null],[null,null,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,null,null,null]],"clouds":[[[null,0,0,0,0,0,0,null,null,null,null,null],[null,0,0,0,0,0,0,0,0,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,null,0,0,0,0,0,0,0,null]],[[null,null,null,null,0,0,0,null,null,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,null],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,null,null,null],[0,0,null,null,null,null,null,null,null,null,null,null]],[[null,null,null,null,null,null,null,null,0,0,null,null],[null,null,null,null,null,0,0,0,0,0,0,null],[null,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,null,null,null,null]]]}

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = [[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null],[null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null],[null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null],[null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,0,0,null,null,0,null,null,null,null,null,null,null,null,null,null,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,null,null,1,1,1,1,1,null,null,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,1,1,null,null,null,null,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,1,1,1,1,1,null,null,1,1,1,1,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,1,1,1,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,1,1,1,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,null,null,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,1,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,1,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]]

/***/ })
/******/ ]);