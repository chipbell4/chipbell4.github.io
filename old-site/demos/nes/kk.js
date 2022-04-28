var KK = (function() {
  var tempo = 194;
  var SIXTH = Math.round(1/ 6 * 3600 / tempo);

  return {
    tempo: 200,
    // Some constants for common durations
    S: SIXTH,
    T: SIXTH * 2,
    D: SIXTH * 4,
    Q: SIXTH * 6,
    H: SIXTH * 12,
    melody: { }
  };
})();
KK.melody.TRIANGLE = (function() {
  var bassMml = [
    't' + KK.tempo,
    'v75',
    'l4 r', // pickup
    '<<',
    'l12',

    // Main theme
    'e r6 e r6 e4^6 a',
    'r6 a r6 a a4 r4',
    'd r6 d r6 d4^6 b',
    'r6 b r6 b b4 r4',
    'e r6 e r6 e4^6 a',
    'r6 a r6 a a4 r4',
    'd r6 d r6 d4^6 b',
    'r6 b r6 b b4 r4',
    'e r6 e r6 e4^6 a',
    'r6 a r6 a a4 r4',
    'd r6 d r6 d4^6 b',
    'r6 b r6 b b4 r4',
    'e r6 e r6 e4^6 a',
    'r6 a r6 a a4 r4',
    'b r6 b r6 b4^6 e',
    'r6 e r6 e e4 r4',
  
    // bridge
    'g+ r6^6 g+ g+4 r4 g+ r6^6 g+ g+4 r4',
    'c+ r6^6 c+ c+4 r4 c+ r6^6 c+ c+4 r4',
    'f+ r6^6 f+ f+4 r4 f+ r6^6 f+ f+4 r4',
    'l8 br br > cr cr < br l4 rrr l12',
    
    // Reprise
    'e r6 e r6 e4^6 a',
    'r6 a r6 a a4 r4',
    'd r6 d r6 d4^6 b',
    'r6 b r6 b b4 r4',
    'e r6 e r6 e4^6 a',
    'r6 a r6 a a4 r4',
    'c r6 c r6 d4^6 e',
    'l4 rrrr l12',
    'c r6 c r6 d4^6 e',
    'l4 rrrr l12',
    'c r6 c r6 d4^6 e2',
  ].join('\n');

  return bassMml;
})();
KK.melody.PWM2 = (function() {
  var chordsMml = [
    't' + KK.tempo,
    'v20',
    'l4 r', // pickup

    // melody chords
    'l8',
    'rr[ e g+ b]r rr[e g+ b]r',
    'rr[ e a c+]r rr[e a c+]r',
    'rr[ d a f+]r rr[d a f+]r',
    'rr[d+ f+ b]r rr[d+ f+ b]r',
    'rr[ e g+ b]r rr[e g+ b]r',
    'rr[ e a c+]r rr[e a c+]r',
    'rr[ d a f+]r rr[d a f+]r',
    'rr[d+ f+ b]r rr[d+ f+ b]r',
    'rr[ e g+ b]r rr[e g+ b]r',
    'rr[ e a c+]r rr[e a c+]r',
    'rr[ d a f+]r rr[d a f+]r',
    'rr[d+ f+ b]r rr[d+ f+ b]r',
    'rr[ e g+ b]r rr[e g+ b]r',
    'rr[ e a c+]r rr[e a c+]r',
    'rr[d+ f+ b]r rr[d+ f+ b]r',
    'rr[ e g+ b]r rr[e g+ b]r',
    
    // bridge chords
    'l1 v10',
    '[g+ c d+]^', 
    '[g+ b f]^',
    '[f+ a+ c+ e]^',
    'l8',
    '[b d+ f+]r',
    '[b d+ f+]r',
    '[e g > c]r',
    '[e g > c]r',
    '[b d+ f+]r',
    'l4 rrr',
    
    // Reprise
    'l8 v20',
    'rr[ e g+ b]r rr[e g+ b]r',
    'rr[ e a c+]r rr[e a c+]r',
    'rr[ d a f+]r rr[d a f+]r',
    'rr[d+ f+ b]r rr[d+ f+ b]r',
    'rr[ e g+ b]r rr[e g+ b]r',
    'rr[ e a c+]r rr[e a c+]r',
    'l12',
    '[ceg] r6 [ceg] r6 [df+a]4^6 [eg+b]',
    'l4 rrrr l12',
    '[ceg] r6 [ceg] r6 [df+a]4^6 [eg+b]',
    'l4 rrrr l12',
    '[ceg] r6 [ceg] r6 [df+a]4^6 [eg+b]2',
  ].join('\n');

  return chordsMml;
})();
KK.melody.NOISE = (function() {
  var rest = function(cyclesName) {
    return { frequency: 0, volume: 0, cycles: KK[cyclesName] };
  };

  var drumTypes = {
    B: 100,
    S: 1000,
  };

  var rhythmMML = [
    't' + KK.tempo,
    'v100',
    '<< c6  c12 /: c12 r6 >>> c12 r6 <<< c6 c12 >>> c12 r6 <<< :/35'
  ].join('\n');
  return rhythmMML;
})();
KK.melody.PWM1 = (function() {
  var melodyMML = [
    't' + KK.tempo,
    'v20',
    'l4',

    // The melody
    '> e6 d+12 e < b g+ a6 b12 r r r',
    '> d6 c+12 d e < > c+ < a6 b12 r r r',
    '> e6 d+12 e f+ g+ e6 a12 r r r',
    'a6 g+12 a g+ f+ e6 f+12 r r r',
    'e6 d+12 e < b g+ a6 b12 r r r',
    '> d6 c+12 d e < > c+ < a6 b12 r r r',
    '> e6 d+12 e f+ g+ e6 a a12 g+ f+ e d+ e f+ d+6 e12 r4 r4 r4 r4',

    // bridge
    'c4 c+6 d12 d+6 f12 d+6 <b12 >c6 d+12 c6 <g+6^6',
    'g+12 g12 f+12',
    'e6 f12 g+6 a+12 b6 a+12 g+6 e12 f6 g+12 f6 c+12',
    'r6 c+12 d+6 f12',
    'l12 f+4 c+d+ef+g+aa+b>cc+d+ef+g+aa+f+d+c+<a+f+',
    'l8 br br > cr cr < br l4 rr',

    // Reprise
    '> e6 d+12 e < b g+ a6 b12 r r r',
    '> d6 c+12 d e < > c+ < a6 b12 r r r',
    '> e6 d+12 e f+ g+ e6 a12 r r r r6 a12',
    'l12',
    'g r6 g r6 a4^6 b ',
    'l4 rrrr6 l12 a',
    'g r6 g r6 a4^6 b',
    'l4 rrrr6 l12 a',
    'g r6 g r6 a4^6 b2',

  ].join('\n');
  return melodyMML;
})();
