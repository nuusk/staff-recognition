const cv = require('opencv');

cv.readImage('./files/ja.jpg', function (err, img) {
  if (err) {
    throw err;
  }

  const width = img.width();
  const height = img.height();

  if (width < 1 || height < 1) {
    throw new Error('Image has no size');
  }

  // do some cool stuff with img

  // save img
  img.save('img/myNewImage.jpg');
  console.log('saved');
});
