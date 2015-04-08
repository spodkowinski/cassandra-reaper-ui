### Cassandra Reaper UI

#### About

Complimentary web UI for [Cassandra Reaper](https://github.com/spotify/cassandra-reaper).

#### Installation

You'll have to recompile Cassandra Reaper to include the UI.

1. Download [latest release](https://github.com/spodkowinski/cassandra-reaper-ui/releases/download/v0.2.0/cassandra-reaper-ui-0.2.zip)
1. Get [Cassandra Reaper](https://github.com/spotify/cassandra-reaper) sources
1. Extract zip archive to `src/main/resources/assets/`
1. Build Cassandra Reaper `mvn package`
1. Install and setup Cassandra Reaper as described on [project page](https://github.com/spotify/cassandra-reaper)

Afterwards you should be able to access the UI under the following URL (change hostname if necessary):
http://localhost:8080/webui/index.html


#### Development

Getting started to work with the source code is easy.

Requirments:
* [node](https://nodejs.org/) (v0.12+ recommended)
* [bower](http://bower.io/)

Then run:

* `npm install`
* `bower install`

The dev-server can be started as follows:

`npm run start`

Afterwards you should be able to access the server under the following url:
http://localhost:8000/webpack-dev-server/

Make sure to enable cross-origin requests to the reaper server by starting it with the `-DenableCrossOrigin` jvm parameter.

##### Frameworks and tools

It's probably a good idea to familiar yourself with the following set of tools and frameworks, in case you want to know what you're doing while working with the source code.

Used libraries:
* [React](https://facebook.github.io/react/)
* [RxJS](https://github.com/Reactive-Extensions/RxJS)
* [Bootstrap](http://getbootstrap.com/) (CSS)

Tooling:
* [webpack](http://webpack.github.io/)
* [Babel](http://babeljs.io/) (ES6)
* [react-hot-reloader](gaearon.github.io/react-hot-loader/)

##### Building a new release

`npm run minimize`

The content of the `build` directory will correspond to what will be released as archive on github. Install it by copying it to the reaper directory as described in the installation section.
