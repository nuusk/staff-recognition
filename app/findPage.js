var cv = require('opencv');
var math = require('mathjs');
var BLUR = 11;
const LOW_THRESH = 0;
const HIGH_THRESH = 150;
const DILATE_ITERATION_NUM = 2;
const SQUARE_APPROX = 0.01;
const RED = [0, 0, 255];


module.exports = {

  distance: function(x,y,cx,cy) {
    dist = Math.sqrt(Math.pow(x-cx,2)+Math.pow(y-cy,2));
    return dist;
  },

  dstArrayGen: function(points_sq,height, width) {
    newPoints = [0,0,0,0];
    best = 0;
    for (let j = 1 ; j< 4; j++) {
      if(distance(points_sq[newPoints[0]].x,points_sq[newPoints[0]].y,0,0)>distance(points_sq[j].x,points_sq[j].y,0,0)){
        best = j;
      }
    }
    newPoints[0] = best;
    newPoints[1] = (best+1)%4;
    newPoints[2] = (best+2)%4;
    newPoints[3] = (best+3)%4;

    //console.log(newPoints);
    //console.log(points_sq);

    return [points_sq[newPoints[0]].x, points_sq[newPoints[0]].y, points_sq[newPoints[1]].x, points_sq[newPoints[1]].y, points_sq[newPoints[2]].x, points_sq[newPoints[2]].y, points_sq[newPoints[3]].x, points_sq[newPoints[3]].y];
  },

  findPage: function(im_orginal) {
      //saving orginal image
      im = im_orginal.copy();

      // blur will enhance edge detection
      im.medianBlur(BLUR);

      // find squares in every color plane of the image (B,G,R) TODO

      im_transformed = im.copy();
      im_transformed.convertGrayscale();
      im_transformed.canny(LOW_THRESH, HIGH_THRESH);
      im_transformed.dilate(DILATE_ITERATION_NUM);

      contours = im_transformed.findContours();


      //find biggest countour
      let largestContourImg;
      let largestArea = 0;
      let largestAreaIndex;

      for (let i = 0; i < contours.size(); i++) {
        if (contours.area(i) > largestArea) {
          largestArea = contours.area(i);
          largestAreaIndex = i;
        }
      }


      im_contour = im_orginal.copy();
      im_contour.drawAllContours(contours, RED,5);
      im_contour.save('./all.png');


      //find approximated polygon
      epsilon = 0.1*contours.arcLength(largestAreaIndex,true)
      //approx = cv2.approxPolyDP(largestAreaIndex,epsilon,True)
      contours.approxPolyDP(largestAreaIndex, epsilon, true);


      im_contour = im_orginal.copy();
      im_contour.drawContour(contours, largestAreaIndex, RED,5);
      im_contour.save('./polygon.png');


      //
      var width =im_orginal.width();
      var height = im_orginal.height();
      points_sq = contours.points(largestAreaIndex);
      //console.log(Math.size(points_sq)>3);
      if(math.size(points_sq)>3){
        var srcArray = [0, 0, 0, height, width, height,width, 0];
        var dstArray = dstArrayGen(points_sq,height, width);
        //console.log(dstArray);
        var xfrmMat = im.getPerspectiveTransform(dstArray,srcArray);

        im_orginal.warpPerspective(xfrmMat, width, height, [255, 255, 255]);
      }
      else{
        console.log('Zdjęcie za mało wyrażne');
      }
      return im_orginal;
  }
}
