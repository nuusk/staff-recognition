const cv = require('opencv');

const frameRate = 20;
const lowThresh = 40;
const highThresh = 60;
const nDilIters = 2;
const nErodIters = 2;
const WHITE = [255, 255, 255];
let contours;
let allContoursImg;
try {
  const camera = new cv.VideoCapture(0);
  const window = new cv.NamedWindow('Video', 0)

  setInterval( () => {
    camera.read((err, frame) => {
      if (err) throw err;

      if (frame.size()[0] > 0 && frame.size()[1] > 0){
        frame.convertGrayscale();
        frame.gaussianBlur([9, 9]);
        frame.canny(lowThresh, highThresh);
        frame.dilate(nDilIters);
        frame.erode(nErodIters);
        //console.log(frame);

        window.show(frame);


      }
      window.blockingWaitKey(0, 50);
    });
  }, frameRate);

} catch (e) {
  console.log("Error while recording: ", e)
}
