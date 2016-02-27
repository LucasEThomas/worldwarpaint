"use strict"

function generateMatrix(){
    var translationMatrix = makeTranslation(0.5, 0);
    var rotationMatrix = makeWrongRotation();//makeRotation(Math.TWOPI*(-1/8));//rotate -45 degrees
    
    var ProjectionAngle = Math.PI / 6;//Math.atan(0.5);
    var stretchX = Math.cos(ProjectionAngle)/ Math.sqrt(3);
    var stretchY = Math.sin(ProjectionAngle);
    var scaleMatrix = makeScale(stretchX, stretchY);
 
    // Multiply the matrices.
    var matrix = matrixMultiply(rotationMatrix, scaleMatrix);
    matrix = matrixMultiply(matrix, translationMatrix);
    console.log(matrix);
    console.log('ProjectionAngle:' + ProjectionAngle + ' stretchX:' + stretchX + ' stretchY' + stretchY);
}

function makeTranslation(tx, ty) {
  return [
    1, 0, 0,
    0, 1, 0,
    tx, ty, 1
  ];
}
 
function makeRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return [
    c,-s, 0,
    s, c, 0,
    0, 0, 1
  ];
}

//the "right" way would be to make a unit circle rotation matrix, however the isometric phaser plugin that we're using
//uses a non-unit circle rotatation matrix instead, so to make it line up, we do to.
function makeWrongRotation() {
  var c = 1;
  var s = -1;
  return [
    c,-s, 0,
    s, c, 0,
    0, 0, 1
  ];
}
 
function makeScale(sx, sy) {
  return [
    sx, 0, 0,
    0, sy, 0,
    0, 0, 1
  ];
}

//multiplies 3x3 matrices
function matrixMultiply(a, b) {
  var a00 = a[0*3+0];
  var a01 = a[0*3+1];
  var a02 = a[0*3+2];
  var a10 = a[1*3+0];
  var a11 = a[1*3+1];
  var a12 = a[1*3+2];
  var a20 = a[2*3+0];
  var a21 = a[2*3+1];
  var a22 = a[2*3+2];
  var b00 = b[0*3+0];
  var b01 = b[0*3+1];
  var b02 = b[0*3+2];
  var b10 = b[1*3+0];
  var b11 = b[1*3+1];
  var b12 = b[1*3+2];
  var b20 = b[2*3+0];
  var b21 = b[2*3+1];
  var b22 = b[2*3+2];
  return [a00 * b00 + a01 * b10 + a02 * b20,
          a00 * b01 + a01 * b11 + a02 * b21,
          a00 * b02 + a01 * b12 + a02 * b22,
          a10 * b00 + a11 * b10 + a12 * b20,
          a10 * b01 + a11 * b11 + a12 * b21,
          a10 * b02 + a11 * b12 + a12 * b22,
          a20 * b00 + a21 * b10 + a22 * b20,
          a20 * b01 + a21 * b11 + a22 * b21,
          a20 * b02 + a21 * b12 + a22 * b22];
}

Math.TWOPI = Math.PI * 2;

generateMatrix();