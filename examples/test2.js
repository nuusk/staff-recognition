const cv = require('opencv');
/*
cv.readImage('./files/ja.jpg', function (err, img) {
  if (err) {
    throw err;
  }

  var lowThresh = 0;
  var highThresh = 100;
  const width = img.width();
  const height = img.height();

  if (width < 1 || height < 1) {
    throw new Error('Image has no size');
  }

  // do some cool stuff with img
  img.convertGrayscale();
  img.canny(lowThresh, highThresh);

  // save img
  img.save('img/myNewImage.jpg');
});
*/
const frameRate = 20;
const lowThresh = 30;
const highThresh = 50;
const nIters = 1;

try {
  var camera = new cv.VideoCapture(0);
  var window = new cv.NamedWindow('Video', 0)

  setInterval(function() {
    camera.read(function(err, im) {
      if (err) throw err;
      console.log(im.size())
      if (im.size()[0] > 0 && im.size()[1] > 0){
        im.convertGrayscale();
        im.canny(lowThresh, highThresh);
        im.dilate(nIters);
        im.erode(nIters);
        window.show(im);
      }
      window.blockingWaitKey(0, 50);
    });
  }, frameRate);

} catch (e) {
  console.log("Error while starting recording: ", e)
}
