Examples = {
  bird: {
    axiom: 'F',
    iterations: 8,
    angle: 0.38,
    'angle-chaos': 0.1,
    'distance-chaos': 0.1,
    rules: [
      { value: 'F', replacement: 'F[RF][LF]' }
    ]
  },
  dandelion: {
    axiom: 'F',
    iterations: 7,
    angle: 0.3,
    'angle-chaos': 0.7,
    'distance-chaos': 0.4,
    rules: [
      { value: 'F', replacement: 'F[RF][LF]' }
    ]
  },
  coral: {
    axiom: 'F',
    iterations: 7,
    angle: 1.3,
    'angle-chaos': 0,
    'distance-chaos': 0,
    rules: [
      { value: 'F', replacement: 'FRFLLFRF' }
    ]
  },
  koch: {
    axiom: 'F',
    iterations: 7,
    angle: 0.7853,
    'angle-chaos': 0,
    'distance-chaos': 0,
    rules: [
      { value: 'F', replacement: 'FRFLFLFRF' }
    ]
  },
  maze: {
    "axiom": 'F',
    "iterations": 8,
    "angle": 1.57,
    "angle-chaos": 0,
    "distance-chaos": 0,
    "rules": [
      { "value": "F", "replacement": "FRFRFLFL" }
    ]
  },
  plant: {
    "axiom": "X",
    "iterations": 5,
    "angle": 0.43,
    "angle-chaos": 0,
    "distance-chaos": 0,
    "rules": [
      {
        "value": "F",
        "replacement": "FF"
      },
      {
        "value": "X",
        "replacement": "FL[[X]RX]RF[RFX]LX"
      }
    ]
  },
  dragon: {
    axiom: 'FX',
    iterations: 15,
    angle: 1.57,
    "angle-chaos": 0,
    "distance-chaos": 0,
    "rules": [
      {
        value: "X",
        replacement: "XRYFR"
      },
      {
        value: "Y",
        replacement: "LFXLY"
      }
    ]
  },
  tunnel: {
    "axiom": 'F',
    "iterations": 10,
    "angle": 2.844,
    "angle-chaos": 0,
    "distance-chaos": 0,
    "rules": [
      {
        "value": "F",
        "replacement": "FRF"
      }
    ]
  }
};

