UI = {
  $: function(selector) {
    return document.querySelector(selector);
  },

  addRule: function() {
    var template = UI.$('#rule-template > .rule').cloneNode(true);
    UI.$('#rules').appendChild(template);
    template.querySelector('.remove-rule').addEventListener('click', UI.removeRule.bind(UI));
    return template;
  },

  removeRule: function(evt) {
    evt.target.parentElement.remove();
  },

  clearRules: function() {
    UI.$('#rules').innerHTML = '';
  },

  writeRule: function(node, value, replacement) {
    node.querySelector('.start').value = value;
    node.querySelector('.end').value = replacement;
  },

  loadConfig: function(config) {
    ['axiom', 'iterations', 'angle', 'angle-chaos', 'distance-chaos'].forEach(function(field) {
      UI.$('#' + field).value = config[field];
    });

    UI.clearRules();
    config.rules.forEach(function(rule) {
      var node = UI.addRule();
      UI.writeRule(node, rule.value, rule.replacement);
    });
  },

  redraw: function() {
    var ruleset = LSystem.parseFromDom();

    // update the turtle with parameters
    Turtle.ANGLE = Number(UI.$('#angle').value);
    Turtle.ANGLE_CHAOS = Number(UI.$('#angle-chaos').value);
    Turtle.DISTANCE_CHAOS = Number(UI.$('#distance-chaos').value);

    var iterations = Number(UI.$('#iterations').value);
    var production = UI.$('#axiom').value;
    for(var i = 0; i < iterations && production.length < 100000; i++) {
      production = LSystem.stepSystem(production, ruleset);
    }

    Canvas.clear();

    var paths = Turtle.followProduction(production);
    paths = Canvas.normalize(paths);
    paths.forEach(function(path) {
      Canvas.drawPath(path);
    });
  },

  serializePreset: function() {
    var preset = {};
    preset.axiom = UI.$('#axiom').value;
    ['iterations', 'angle', 'angle-chaos', 'distance-chaos'].forEach(function(field) {
      preset[field] = Number(UI.$('#' + field).value);
    });

    preset.rules = [];

    var ruleNodes = document.querySelectorAll('#rules > .rule');
    for(var i = 0; i < ruleNodes.length; i++) {
      var node = ruleNodes[i];

      var start = node.querySelector('.start').value.trim();
      var end = node.querySelector('.end').value.trim();

      preset.rules.push({
        value: start,
        replacement: end
      });
    }

    return preset;
  },

  init: function() {
    UI.$('#add-rule').addEventListener('click', UI.addRule.bind(UI));
    UI.$('#redraw').addEventListener('click', UI.redraw.bind(UI));
    UI.$('#presets').addEventListener('change', function(evt) {
      UI.loadConfig(Examples[this.value]);
    });

    var sessionKey = 'lSystemSavedWork';
    if(localStorage.getItem(sessionKey) !== null) {
      var config = JSON.parse(localStorage.getItem(sessionKey));
      UI.loadConfig(config);
    }

    window.addEventListener("beforeunload", function (event) {
      localStorage.setItem(sessionKey, JSON.stringify(UI.serializePreset()));
    });
  }
};
