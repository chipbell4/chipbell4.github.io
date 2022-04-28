var LSystem = {
  parseFromDom: function() {
    var rules = {};
    
    var ruleNodes = document.querySelectorAll('#rules > .rule');
    for(var i = 0; i < ruleNodes.length; i++) {
      var node = ruleNodes[i];

      var start = node.querySelector('.start').value.trim();
      var end = node.querySelector('.end').value.trim();

      rules[start] = rules[start] || [];
      rules[start].push(end);
    }

    return rules;
  },

  randomFromArray: function(array) {
    return array[Math.floor(array.length * Math.random())];
  },

  stepSystem: function(currentProduction, rules) {
    var newProduction = '';
    for(var i = 0; i < currentProduction.length; i++) {
      var letter = currentProduction[i];
      if(letter in rules) {
        newProduction += LSystem.randomFromArray(rules[letter]);
      } else {
        newProduction += letter;
      }
    }

    return newProduction;
  },
};
