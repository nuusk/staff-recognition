const cv = require('opencv');
require('console.table');

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
let adaptiveBlockSize = 13;
let adaptiveConstant = 2;
let verticalKernelReduction = 195;
let kernelWidth = 4;

  //const camera = new cv.VideoCapture(0);
  const window = new cv.NamedWindow('Video', 0)
setInterval( () => {
  cv.readImage('img/doramon.jpg', (err, frame) => {
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
      let bw = frame.adaptiveThreshold(255, 0, 1, adaptiveBlockSize, adaptiveConstant);
      //bw.bitwiseNot(bw);

      //clone the image that will be processed as an output
      let outSheet = bw.clone();

      //determine how big the kernel will be according to the width of the image
      let kernelSize = outSheet.size()[0] / verticalKernelReduction;
      console.log(kernelSize);

      //create kernel with height of 1 and width of a given kernelSize
      let kernel = cv.imgproc.getStructuringElement(1, [1, kernelWidth]);
      //console.table(kernel);


      //morphological operations with created kernel
      outSheet.erode(1, kernel);
      outSheet.dilate(1, kernel);
      outSheet.erode(1, kernel);
      outSheet.dilate(1, kernel);


      //inverse the output so that notes are black and the paper is white
      outSheet.bitwiseNot(outSheet);

      // Save output image
      //vertical.save('../tmp/note.png');*/

      window.show(outSheet);

    window.blockingWaitKey(0, 50);
  });
  }, frameRate);
