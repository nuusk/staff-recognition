const cv = require('opencv');

const frameRate = 400;
const lowThresh = 40;
const highThresh = 60;
const nDilIters = 2;
const nErodIters = 2;

const minArea = 2000;
const maxArea = 100000;

//colors (B, G, R)!!!
var BLUE = [0, 255, 0];
var RED   = [0, 0, 255];
var GREEN = [0, 255, 0];
var WHITE = [255, 255, 255];

let contours;
let adaptiveBlockSize = 15;
let adaptiveConstant = 0;

  //const camera = new cv.VideoCapture(0);
  const window = new cv.NamedWindow('Video', 0)
setInterval( () => {
  cv.readImage('./examples/files/note.png', (err, frame) => {
    if (err) {
      throw err;
    }
    if (frame.width() < 1 || frame.height() < 1) {
      throw new Error('Image has no size');
    }

/*setInterval( () => {
  camera.read((err, frame) => {
    if (err) throw err;

    if (frame.size()[0] > 0 && frame.size()[1] > 0){
/*
      var out = frame.copy();

      out.convertGrayscale();
      out.gaussianBlur([9, 9]);
      out.canny(lowThresh, highThresh);
      out.dilate(nDilIters);
      out.erode(nErodIters);


      contours = out.findContours();

      for (i = 0; i < contours.size(); i++) {

        let area = contours.area(i);

        if (area < minArea || area > maxArea) continue;

        let arcLength = contours.arcLength(i, true);
        contours.approxPolyDP(i, 0.01 * arcLength, true);

        if (contours.cornerCount(i) != 4) continue;
        //console.log('asd');

        let points = [
          contours.point(i, 0),
          contours.point(i, 1),
          contours.point(i, 2),
          contours.point(i, 3)
        ]

        frame.line([points[0].x,points[0].y], [points[2].x, points[2].y], RED);
        frame.line([points[1].x,points[1].y], [points[3].x, points[3].y], RED);
      }
      */

      //we need single channel image to apply threshhold
      frame.cvtColor('CV_BGR2GRAY');

      //get the threshholded image
      //255 is the max value that pixels are set to if the conditions are satisfied
      //second argument - 0 - ADAPTIVE_THRESH_MEAN_C
      //third argument - 0 - THRESH_BINARY
      //fourth argument is the area around pixel that we're comparing against
      //the last argument is a value that is subtracted from the mean of every pixel
      var bw = frame.adaptiveThreshold(255, 0, 1, adaptiveBlockSize, adaptiveConstant);
      adaptiveConstant ++;
      //bw.bitwiseNot(bw);

      var vertical = bw.clone();

      var verticalsize = vertical.size()[0] / 30;
      console.log(adaptiveConstant);
      /*var verticalStructure = cv.imgproc.getStructuringElement(1, [1, verticalsize]);

      // Apply morphology operations
      vertical.erode(1, verticalStructure);
      vertical.dilate(1, verticalStructure);

      vertical.bitwiseNot(vertical);
      vertical.gaussianBlur([3, 3]);

      // Save output image
      vertical.save('./tmp/note.png');*/

      window.show(vertical);

    window.blockingWaitKey(0, 50);
  });
  }, frameRate);
