var preloader = require('../');
var loader = preloader({
  xhrImages: false,
  loadFullAudio: false,
  loadFullVideo: false
});
loader.on('progress', function (progress) {
  console.log(progress);
});
loader.on('complete', function () {
  var data = loader.get('test_data.json');
  console.log('all content loaded:', data.success);
});
loader.add('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4', {
  onComplete: function (content) {
    document.body.appendChild(loader.get('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'));
  }
});
loader.add('http://sandbox.thewikies.com/vfe-generator/images/big-buck-bunny_poster.jpg', {
  onComplete: function (content) {
    document.body.appendChild(content);
  }
});
loader.add('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEACAhITMkM1EwMFFCLy8vQiccHBwcJyIXFxcXFyIRDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwBIjMzNCY0IhgYIhQODg4UFA4ODg4UEQwMDAwMEREMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAAYABgMBIgACEQEDEQH/xABVAAEBAAAAAAAAAAAAAAAAAAAAAxAAAQQCAwEAAAAAAAAAAAAAAgABAxQEIxIkMxMBAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIE7MwkbOUJDJWx+ZjXATitx2/h2bEWvX5Y0npQ7aIiD/9k=', {
  onComplete: function (content) {
    document.body.appendChild(content);
  }
});
loader.add('test_data.json');
loader.load();
