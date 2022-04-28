var Turtle = {
  currentDirection: Math.PI / 4,
  currentPosition: { x: 0, y: 0 },

  positionStack: [],
  directionStack: [],

  ANGLE: Math.PI / 4,
  ANGLE_CHAOS: 0.2,
  DISTANCE_CHAOS: 0.2,
  DISTANCE: 10,
  DISTANCE_REDUCTION: 1,

  moves: {
    'L' : function() {
      Turtle.currentDirection -= Turtle.ANGLE + (Math.random() - 0.5) * Turtle.ANGLE_CHAOS * Turtle.ANGLE;
    },
    'R' : function() {
      Turtle.currentDirection += Turtle.ANGLE + (Math.random() - 0.5) * Turtle.ANGLE_CHAOS * Turtle.ANGLE;
    },
    'F' : function() {
      var distance = Turtle.DISTANCE + (Math.random() - 0.5) * Turtle.DISTANCE * Turtle.DISTANCE_CHAOS;
      Turtle.currentPosition.x += distance * Math.cos(Turtle.currentDirection);
      Turtle.currentPosition.y += distance * Math.sin(Turtle.currentDirection);
    },
    '[' : function() {
      Turtle.positionStack.push({
        x: Turtle.currentPosition.x,
        y: Turtle.currentPosition.y
      });
      Turtle.directionStack.push(Turtle.currentDirection);
      Turtle.DISTANCE *= Turtle.DISTANCE_REDUCTION;
    },
    ']' : function() {
      var nextPosition = Turtle.positionStack.pop();
      var nextDirection = Turtle.directionStack.pop();
      if(nextPosition) {
        Turtle.currentPosition = nextPosition;
        Turtle.currentDirection = nextDirection;
        Turtle.DISTANCE /= Turtle.DISTANCE_REDUCTION;
      }
    }
  },

  reset: function() {
    Turtle.currentPosition = { x: 0, y: 0 };
    Turtle.currentDirection = Math.PI / 4;
    Turtle.positionStack = [];
    Turtle.directionStack = [];
  },

  followProduction: function(production) {
    var paths = [];
    var positions = [];

    Turtle.reset();
    for(var i = 0; i < production.length; i++) {
      if(production[i] == ']') {
        paths.push(positions);
        positions = [];
      }

      if(production[i] in Turtle.moves) {
        Turtle.moves[production[i]]();
      }

      positions.push({
        x: Turtle.currentPosition.x,
        y: Turtle.currentPosition.y,
      });
    }

    paths.push(positions);
    return paths;
  },
};
