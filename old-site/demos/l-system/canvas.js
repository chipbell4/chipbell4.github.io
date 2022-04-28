var Canvas = {
  clear: function() {
    var svg = document.getElementById('canvas');
    while(svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  },

  bounds: function(pathSet) {
    var allPoints = pathSet.reduce((last, current) => last.concat(current), []);
    // get bounding points
    var xValues = allPoints.map(point => point.x);
    var yValues = allPoints.map(point => point.y);

    return {
      minX: xValues.reduce((best, current) => Math.min(best, current), xValues[0]),
      maxX: xValues.reduce((best, current) => Math.max(best, current), xValues[0]),
      minY: yValues.reduce((best, current) => Math.min(best, current), yValues[0]),
      maxY: yValues.reduce((best, current) => Math.max(best, current), yValues[0]),
    }
  },

  normalize: function(pathSet) {
    var bounds = Canvas.bounds(pathSet);
    var scaleX = 100 / (bounds.maxX - bounds.minX);
    var scaleY = 100 / (bounds.maxY - bounds.minY);
    scaleY = Math.min(scaleY, scaleX);
    scaleX = Math.min(scaleY, scaleX);

    var rescale = (point) => {
      return {
        x: (point.x - bounds.minX) * scaleX,
        y: (point.y - bounds.minY) * scaleY,
      };
    }

    return pathSet.map((path) => {
      return path.map(rescale);
    });
  },

  drawPath: function(path) {
    var svg = document.querySelector('svg');

    // create the polyline class
    var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute('stroke', 'black');
    polyline.setAttribute('stroke-width', 0.1);
    polyline.setAttribute('fill', 'none');
    var pointString = path.reduce((last, point) => last + ' ' + point.x + ',' + point.y, '', '');
    polyline.setAttribute('points', pointString);
    svg.appendChild(polyline);
  }
};
