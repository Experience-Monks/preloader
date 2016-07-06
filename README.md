# Preloader

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A library for loading common web assets 

## Usage

[![NPM](https://nodei.co/npm/preloader.png)](https://www.npmjs.com/package/preloader)

# preloader

This module will contain everything related to preloading.

## Class: Preloader
This module will contain everything related to preloading. It includes [signals](https://www.npmjs.com/package/signals) for its events system.

**onProgress**: `Signal` Sends updates on loading progress to other part of application (loading ui)  
**onComplete**: `Signal` Notifies loading completion to other part of application

### add(url, modifiers, modifierFunction) 

Generic asset loader function - determines loader to be used based on file-extension

**Parameters**

**url**: `String` Base URL of asset

**modifiers**: `Array` list of image pixel-densities to be made available

**modifierFunction**: `function` optional string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])


### addImage(url, modifiers, modifierFunction) 

Load image - uses the LoaderImage loader

**Parameters**

**url**: `String` Base URL of asset

**modifiers**: `Array` list of image pixel-densities to be made available

**modifierFunction**: `function` string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])


### addJSON(url, modifiers, modifierFunction) 

Load JSON - uses the LoaderJSON loader

**Parameters**

**url**: `String` Base URL of asset

**modifiers**: `Array` list of image pixel-densities to be made available

**modifierFunction**: `function` string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])


### addText(url, modifiers, modifierFunction) 

Load text- uses the LoaderText loader

**Parameters**

**url**: `String` Base URL of asset

**modifiers**: `Array` list of image pixel-densities to be made available

**modifierFunction**: `function` string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])


### addFromLoaderType(url, loaderType, modifiers, modifierFunction) 

Load asset using custom loader

**Parameters**

**url**: `String` Base URL of asset

**loaderType**: `function` Custom loader function

**modifiers**: `Array` list of image pixel-densities to be made available

**modifierFunction**: `function` string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])


### setCacheID(url, cacheID) 

Sets ID for asset in the cache for future retrieval

**Parameters**

**url**: `String` Base URL of asset

**cacheID**: `String` New identifier of asset to be used in cache


### setPercentage(url, percentageOfLoad) 

Sets percentage of total load for a given asset

**Parameters**

**url**: `String` Base URL of asset

**percentageOfLoad**: `Number` Number <= 1 representing percentage of total load


### load() 

Begins loading process


### stopLoad() 

Stops loading process


### getContent(url) 

Retrieves loaded asset from loader

**Parameters**

**url**: `String` Base URL of asset

**Returns**: , asset instance


## License

MIT, see [LICENSE.md](https://github.com/Jam3/preloader/blob/master/LICENSE.md) for details.
