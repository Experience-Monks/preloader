var preloader = require('../');
var loader = preloader({
  xhrImages: false,
  loadFullAudio: false,
  loadFullVideo: false
});
loader.on('progress',function(progress) {
  console.log(progress);
});
loader.on('complete',function() {
  var data = loader.get('test_data.json');
  console.log('all content loaded:',data.success);
});
loader.add('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4');
loader.add('http://sandbox.thewikies.com/vfe-generator/images/big-buck-bunny_poster.jpg');
loader.add('test_data.json');
loader.load();