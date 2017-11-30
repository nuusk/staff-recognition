var cv = require('opencv');
var BLUR = 11;
const LOW_THRESH = 0;
const HIGH_THRESH = 150;
const DILATE_ITERATION_NUM = 2;
const SQUARE_APPROX = 0.005;
const RED = [0, 0, 255];



function find_page (im_orginal) {
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
    im_contour.save('output/all.png');


    //find approximated polygon
    contours.approxPolyDP(largestAreaIndex, contours.arcLength(largestAreaIndex, true) * SQUARE_APPROX, true);


    im_contour = im_orginal.copy();
    im_contour.drawContour(contours, largestAreaIndex, RED,5);
    im_contour.save('output/polygon.png');


    //
    var width = im_orginal.width();
    var height = im_orginal.height();
    points_sq = contours.points(largestAreaIndex);

    var srcArray = [0, 0, 0, height, width, height,width, 0];
    var dstArray = [points_sq[0].x, points_sq[0].y, points_sq[1].x, points_sq[1].y, points_sq[2].x, points_sq[2].y, points_sq[3].x, points_sq[3].y];
    var xfrmMat = im.getPerspectiveTransform(dstArray,srcArray);

    im_orginal.warpPerspective(xfrmMat, width, height, [255, 255, 255]);

    return im_orginal;
}


cv.readImage('./img/page2.jpg', function(err, im) {
    if (err) throw err;

    im = find_page(im);

    im.save('output/page.png');
    console.log('Image saved to ./page.png');
});
