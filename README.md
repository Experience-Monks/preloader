# Preloader

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A library for loading common web assets

## Usage

[![NPM](https://nodei.co/npm/preloader.png)](https://www.npmjs.com/package/preloader)

# preloader

The preloader is capable of loading almost all types of files, if it does not understand a file type, it will attempt to load it as a basic xhr request. It extends the [nodejs event emitter](https://nodejs.org/api/events.html) and uses the following events.

```progress```: `Event` Sends updates on loading progress to other part of application (loading ui)
```complete```: `Event` Notifies loading completion to other part of application

Here is a common usage of the preloader.

```js
var preloader = require('preloader');
var loader = preloader({
  xhrImages: false
});
loader.on('progress',function(progress) {
  console.log(progress);
});
loader.on('complete',function() {
  var data = loader.get('site_data.json');
  console.log('all content loaded!');
});
loader.add('video1.mp4');
loader.add('test_image.jpg',{
  onComplete: function(content) {
    document.body.appendChild(loader.get('test_image.jpg'));
  }
});
loader.add('site_data.json');
loader.load();
```

### new Preloader(options) / preloader(options)

This creates a new instance of the preloader on which on you use the following api. It is not a singleton and must be instantiated to use. The options object contains the following properties.

```xhrImages``` Loads images via XHR and converts to a Blob instead of the image tag, default: false
```onComplete``` A function to attach to the complete event
```onProgress``` A function to attach to the progress event
```throttle``` A integer specifying maximum amount of connections at a time, 0 = infinite

### add(url, options)

Generic asset loader function - determines loader to be used based on file-extension

```url```: `String` URL of asset
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### addImage(url ,options)

Load image - uses the LoaderImage loader

```url```: `String` URL of asset
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### addJSON(url, options)

Load JSON - uses the LoaderJSON loader

```url```: `String` URL of asset
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### addText(url, options)

Load text - uses the LoaderText loader

```url```: `String` URL of asset
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### addVideo(url, options)

Load video - uses the LoaderVideo loader

```url```: `String` URL of asset
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### addAudio(url, options)

Load audio - uses the LoaderAudio loader

```url```: `String` URL of asset
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### addImage(url, options)

Load image - uses the LoaderImage loader

```url```: `String` URL of asset
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### addFromLoaderType(url, loaderType, options)

Load asset using custom loader

```url```: `String` URL of asset
```loaderType```: `function` Custom loader function
```options```: `Object` Custom options to override the global options created at instantiation, can also pass in `onComplete` and `onProgress` to listen to the events on this particular item.

### setPercentage(url, percentageOfLoad)

Sets percentage of total load for a given asset

```url```: `String` URL of asset
```percentageOfLoad```: `Number`  representing percentage of total load

### load()

Begins loading process

### stopLoad()

Stops loading process

### get(url)

Retrieves loaded asset from loader

```url```: `String` URL of asset
```Returns```: asset instance

### reset()

Resets loading so you can reuse the preloader. does not remove cached loads so `get()` continues to function for all assets.

## License

MIT, see [LICENSE.md](https://github.com/Jam3/preloader/blob/master/LICENSE.md) for details.