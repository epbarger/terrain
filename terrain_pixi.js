let canvas = document.getElementById("terrain");
let w = window.innerWidth;
let h = window.innerHeight;
canvas.width = w;
canvas.height = h;

let stage = new PIXI.Container();
let renderer = PIXI.autoDetectRenderer(w, h, {view: canvas, backgroundColor: 0xf3cb9e});
let graphics = new PIXI.Graphics();

function buildTerrain(color, yRange, roughness, verticalDisplacement, iterations, speed){
  let pointsOne = generatePoints(
    {x: 0, y: randomInterval(h * yRange.min, h * yRange.max)},
    {x: w, y: randomInterval(h * yRange.min, h * yRange.max)},
    roughness, verticalDisplacement, iterations);
  let pointsTwo = generatePoints(
    {x: 0, y: pointsOne[pointsOne.length - 1].y},
    {x: w, y: randomInterval(h * yRange.min, h * yRange.max)},
    roughness, verticalDisplacement, iterations);
  return {
    color: color,
    pointsOne: pointsOne,
    pointsTwo: pointsTwo,
    offset: 0,
    speed: speed,
    swapAndRegen: function() {
      this.pointsOne = this.pointsTwo
      this.pointsTwo = generatePoints(
        {x: 0, y: this.pointsOne[this.pointsOne.length - 1].y},
        {x: w, y: randomInterval(h * yRange.min, h * yRange.max)},
        roughness, verticalDisplacement, iterations);
      this.offset = 0;
    },
    move: function() {
      this.offset -= speed;
      if (this.offset < -w) {
        this.swapAndRegen();
      }
    }
  }
}

function generatePoints(start, end, roughness, verticalDisplacement, iterationCount){
  let points = [start, end]
  for (let i = 0; i < iterationCount; i++){
    let workingPoints = points.slice();
    for (let k = 0; k < workingPoints.length - 1; k++){
      pointA = workingPoints[k];
      pointB = workingPoints[k+1];
      midpoint = {x: (pointA.x + pointB.x)/2, y: (pointA.y + pointB.y)/2}
      midpoint.y += randomInterval(-verticalDisplacement, verticalDisplacement)
      points.splice(k*2+1, 0, midpoint)
    }
    verticalDisplacement *= Math.pow(2, -roughness);
  }
  return points
} 

function drawTerrain(terrain){
  drawPoints(terrain.pointsOne, terrain.offset, terrain.color);
  drawPoints(terrain.pointsTwo, terrain.offset + w - 1, terrain.color);
}


function drawPoints(points, offset, color) {
  graphics.beginFill(color);
  graphics.moveTo(points[0].x + offset, points[0].y);
  points.forEach((point) => graphics.lineTo(point.x + offset, point.y));

  graphics.lineTo(points[points.length - 1].x + offset, h);
  graphics.lineTo(offset, h);
  graphics.endFill();  
}

function randomInterval(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function runAnimation(){
  graphics.clear();
  terrainD.move();
  terrainC.move();
  terrainB.move();
  terrainA.move();
  drawTerrain(terrainD);
  drawTerrain(terrainC);
  drawTerrain(terrainB);
  drawTerrain(terrainA);
  stage.addChild(graphics);

  renderer.render(stage);
  window.requestAnimationFrame(runAnimation);
}

let speedMultiplier = 10;

let terrainD = buildTerrain(0xa94bd2, {min: 0.2, max: 0.4}, 0.9, 250, 8, speedMultiplier * 1/20);
let terrainC = buildTerrain(0x8a428d, {min: 0.4, max: 0.6}, 1, 120, 9, speedMultiplier * 1/7);
let terrainB = buildTerrain(0x4b0066, {min: 0.7, max: 0.8}, 1.2, 30, 12, speedMultiplier * 1/3);
let terrainA = buildTerrain(0x370055, {min: 0.8, max: 1.0}, 1.4, 20, 12, speedMultiplier * 1);

runAnimation();