const cv = require('opencv');
require('console.table');

const frameRate = 20;
const lowThresh = 40;
const highThresh = 60;
const nDilIters = 2;
const nErodIters = 2;

const minArea = 2000;
const maxArea = 10000000000;
const SQUARE_APPROX = 0.005;

//colors (B, G, R)!!!
const BLUE = [0, 255, 0];
const RED   = [0, 0, 255];
const GREEN = [0, 255, 0];
const WHITE = [255, 255, 255];

let contours;
const adaptiveBlockSize = 13;
const adaptiveConstant = 2;
const verticalKernelReduction = 195;
const staffKernelWidth = 7;
const barKernelHeight = 5;

//create kernel with height of 1 and width of a given kernelSize
let staffKernel = cv.imgproc.getStructuringElement(1, [1, staffKernelWidth]);

//vertical kernel for bar morphological transformations
let barKernel = cv.imgproc.getStructuringElement(1, [barKernelHeight, 1]);

//base kernel, used in staff (five lines) finding
let baseKernel = cv.imgproc.getStructuringElement(2, [1, staffKernelWidth]);

let notesKernel = cv.imgproc.getStructuringElement(1, [7, 7]);

//const camera = new cv.VideoCapture(0);
const window = new cv.NamedWindow('Video', 0)

//iterator is used to iterate through all parts of the sheet
//the program runs for each row and finds notes in order to play them
let iterator = 0;
function findAndDrawNotes(image) {
  //we need single channel image to apply threshhold
  image.cvtColor('CV_BGR2GRAY');

  //get the threshholded image
  //255 is the max value that pixels are set to if the conditions are satisfied
  //second argument - 0 - ADAPTIVE_THRESH_MEAN_C
  //third argument - 0 - THRESH_BINARY
  //fourth argument is the area around pixel that we're comparing against
  //the last argument is a value that is subtracted from the mean of every pixel
  let bw = image.adaptiveThreshold(255, 0, 1, adaptiveBlockSize, adaptiveConstant);
  //bw.bitwiseNot(bw);

  //clone the image that will be processed as an output
  let outSheet = bw.clone();

  // !!! currently not used
  //determine how big the kernel will be according to the width of the image
  //let kernelSize = outSheet.size()[0] / verticalKernelReduction;
  //console.log(kernelSize);

  //morphological operations with created kernel

  // first we erode with staff kernel to get rid of horizontal lines
  outSheet.erode(1, staffKernel);
  // the following dilatation is applied to make sure that none of the notes disappear
  outSheet.dilate(2, staffKernel);
  //next we erode with bar kernel to get rid of vertical lines
  outSheet.erode(1, barKernel);
  //dilatation with vertical lines will keep notes from disappearing
  outSheet.dilate(2, barKernel);
  // inverse the output so that notes are black and the paper is white
  outSheet.bitwiseNot(outSheet);

  //clone the outSheet matrix
  //~~ outNotes matrix will contain the information used for contour finding (and ellipse drawing)
  outNotes = outSheet.clone();

  //first dilatate to make ellipses a little bigger
  outNotes.dilate(1, notesKernel);
  //the erode to smooth them
  outNotes.erode(1, notesKernel);
  outNotes.canny(0, 100);

  let notesContours = outNotes.findContours();
  const lineType = 8;
  const maxLevel = 2;
  const thickness = 2;
  let big = new cv.Matrix(outNotes.size()[0], outNotes.size()[1]);
  for(i = 0; i < notesContours.size(); i++) {
    if(notesContours.area(i) > 150 && notesContours.area(i) < 460) {
      //WE NEED TO FIND VALUES INSTEAD OF 235 AND 300!!!!!!!!
      let moments = notesContours.moments(i);
      let centerX = Math.round(moments.m10 / moments.m00);
      let centerY = Math.round(moments.m01 / moments.m00);
      console.log('Center of the note: [' + centerX + '][' + centerY + '].');
      big.drawContour(notesContours, i, RED, thickness, lineType, maxLevel, [0, 0]);
      big.line([centerX - 2, centerY], [centerX + 2, centerY], WHITE);
      big.line([centerX, centerY - 2], [centerX, centerY + 2], WHITE);
    }
  }

  //console.log(outSheet.col(1));
  big.save('./con['+iterator+'].png');
  // console.log('Saved contours to output/contours.png');
  outSheet.save('./sheet['+iterator+'].png');
  // console.log('Saved notes without the staff to output/outSheet.png')
  //frame.save('./output/frame.png');
  //console.log('Saved staff frames to output/frame.png')
  iterator += 1;
}

let frames = [];

//setInterval( () => {
    cv.readImage('img/doramon.jpg', (err, frame) => {
    let points;
    if (err) {
      throw err;
    }
    if (frame.width() < 1 || frame.height() < 1) {
      throw new Error('Image has no size');
    }
      let originalWidth = frame.width();
      let originalHeight = frame.height();
      //outedges is the sheet without the notes (only the staff)
      let outEdges = frame.clone();

      outEdges.convertGrayscale();

      //morphological operations with created kernel
      outEdges.dilate(17, barKernel);
      outEdges.erode(2, baseKernel);
      //change grey to black
      outEdges = outEdges.adaptiveThreshold(255, 1, 0, 205, adaptiveConstant);

      outEdges.save('outEdges.png');

      //now we have the rectangles contours (array of contours)
      contours = outEdges.findContours();

      //for each contours array, draw the rectangle corresponding to it
      for (i = 0; i < contours.size(); i++) {

        let area = contours.area(i);
        if (area < minArea || area > maxArea) continue;

        let arcLength = contours.arcLength(i, true);
        // contours.approxPolyDP(i, 0.01 * arcLength, true);
        contours.approxPolyDP(i, contours.arcLength(i, true) * SQUARE_APPROX, true);

        //we have to filter those polygons that aren't rectangles
        if (contours.cornerCount(i) != 4) continue;

        points = [
          contours.point(i, 0),
          contours.point(i, 1),
          contours.point(i, 2),
          contours.point(i, 3)
        ]


        // frame.line([points[0].x,points[0].y], [points[1].x, points[1].y], RED);
        // frame.line([points[1].x,points[1].y], [points[2].x, points[2].y], RED);
        // frame.line([points[2].x,points[2].y], [points[3].x, points[3].y], RED);
        // frame.line([points[3].x,points[3].y], [points[0].x, points[0].y], RED);
        // //frame.cv.circle();
        // console.log('{' + i + '} - points[0].x : '+ points[0].x + '. ');// ,points[0].y], [points[1].x, points[1].y]);
        // console.log('{' + i + '} - points[1].x : '+ points[1].x + '. ');// ,points[1].y], [points[2].x, points[2].y]);
        // console.log('{' + i + '} - points[2].x : '+ points[2].x + '. ');// ,points[2].y], [points[3].x, points[3].y]);
        // console.log('{' + i + '} - points[3].x : '+ points[3].x + '. ');// ,points[3].y], [points[0].x, points[0].y]);

        let tl = {};
        let tr = {};
        let dl = {};
        let dr = {};

        tl.x = points[0].x;
        tr.x = points[0].x;
        dl.x = points[0].x;
        dr.x = points[0].x;
        tl.y = points[0].y;
        tr.y = points[0].y;
        dl.y = points[0].y;
        dr.y = points[0].y;

        for(let j=0; j<4; j++) {
          if (points[j].x < tl.x || points[j].x < dl.x) {
            tl.x = points[j].x;
            dl.x = points[j].x;
          }
          if (points[j].x > tr.x || points[j].x > dr.x) {
            tr.x = points[j].x;
            dr.x = points[j].x;
          }
          if (points[j].y < dl.y && points[j].y < dr.y) {
            dl.y = points[j].y;
            dr.y = points[j].y;
          }
          if (points[j].y > tl.y && points[j].y > tr.y) {
            tl.y = points[j].y;
            tr.y = points[j].y;
          }
        }

        const staffHeight = Math.abs(tl.y - dl.y);
        const staffWidth = Math.abs(tl.x - tr.x);
        const widthRatio = staffWidth / originalWidth;
        //offset that is addesd to the staff height to make sure that notes are not cut off
        const heightOffset = staffHeight/5;
        //the difference between two lines on the sheet
        const lineDifference = staffHeight*5/6;
        // console.log('staffHeight: ' + staffHeight);
        // console.log('staffWidth: ' + staffWidth);
        // console.log('widthRatio: ' + widthRatio);
        // console.log('heightOffset: ' + heightOffset);
        // console.log('lineDifference: ' + lineDifference);
        // console.log('~`~`~`~`');
        console.log('tl: ' + tl.x + ', ' + tl.y);
        console.log('dl: ' + dl.x + ', ' + dl.y);
        console.log('tr: ' + tr.x + ', ' + tr.y);
        console.log('dr: ' + dr.x + ', ' + dr.y);

        let sourceImage = [0, 0, 0, staffHeight, staffWidth, staffHeight, staffWidth, 0];
        let destinationImage = [
          dl.x, dl.y+heightOffset,
          tl.x, tl.y-heightOffset,
          tr.x, tr.y-heightOffset,
          dr.x, dr.y+heightOffset
        ];
        let xfrmMat = frame.getPerspectiveTransform(destinationImage,sourceImage);
        let tmpFrame = frame.copy();
        tmpFrame.warpPerspective(xfrmMat, staffWidth, staffHeight+2*heightOffset, [255, 255, 255]);
        tmpFrame.save(i + '.png');
        frames.push(tmpFrame);
      }

      frames.forEach(findAndDrawNotes);
  });
  //}, frameRate);
