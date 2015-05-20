var Dispatcher        = require('root/dispatcher');
var React             = require('react/addons');
var Ore               = require('orejs');
var PureRenderMixin   = React.PureRenderMixin;
var Spinner           = require('components/spinner');

var filters   = {
  apply: function (canvas, context, manipulation) {
    var pixels = this.getPixels(canvas, context);
    var processed = manipulation(
          pixels,
          canvas.width,
          canvas.height
      );
    context.putImageData(processed, 0, 0);
  },

  run: function (canvas, manipulation) {
      var context = canvas.getContext('2d');
      return this.apply(canvas, context, manipulation)
  },

  getPixels: function (canvas, context) {
    return context.getImageData(0, 0, canvas.width, canvas.height)
  },

  manipulations: [
    function (pixels) { // TV
      if (Math.random() >= 0.1) return pixels;

      var data = pixels.data;

      for (var i=0; i<data.length; i+=4) {
        if (i % 12 == 0) {
          var randomChannel = parseInt(Math.random() * 3);
          data[i+randomChannel] = 255;
        }
      }

      return pixels;
    },

    function(pixels){ //GrayScale
      if (Math.random() >= 0.4) return pixels;

      var data = pixels.data;

      for (var i=0; i<data.length; i+=4) {
        var r = data[i];
        var g = data[i+1];
        var b = data[i+2];

        // CIE luminance for the RGB
        // http://en.wikipedia.org/wiki/Luminance_(relative)

        var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        data[i] = data[i+1] = data[i+2] = v;
      }

      return pixels;
    },

    function (pixels) { //Brightness
      if (Math.random() >= 0.1) return pixels;

      var data = pixels.data;
      var brightnessLevel = Math.floor(Math.random() * ((-10-10)+1) + 10);

      for (var i=0; i<data.length; i+=4) {
        data[i]   -= 100;
        data[i+1] -= 100;
        data[i+2] -= 100;
      }

      return pixels;
    }
  ]
}

module.exports = React.createClass({
  mixins : [PureRenderMixin, Ore.Mixin],

  defineRequiredData: function(){
    return [
      'image:randomImage'
    ]
  },

  loop : null,

  glitcher : {
    to_base64: function (buffer) {
       var binary = '';
       var bytes = new Uint8Array(buffer);
       var len = bytes.byteLength;
       for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[ i ]);
       }
       return window.btoa(binary);
   },

   to_buffer: function (base64_value) {
       var binary_string = window.atob(base64_value);
       var len = binary_string.length;
       var bytes = new Uint8Array(len);
       for (var i = 0; i < len; i++)        {
         var ascii = binary_string.charCodeAt(i);
         bytes[i] = ascii;
       }
       return bytes;
   },

   glitch: function (imageData, iteration) {
     iteration = iteration || 0;
     var indicator = 'base64,',
         parts = imageData.split(indicator),
         data = this.to_buffer(parts[1]),
         prefix = parts[0] + indicator;

     for (var i=0; i < data.length; i++) {
       if (i>(1000) && i < (data.length/4)) {
          data[i] = data[i+50]
       }
     }

     var glitched = prefix + this.to_base64(data);

     if (iteration < (Math.random() * 20)) {
       return this.glitch(glitched, iteration + 1)
     }

     return glitched;
   }
  },

  imageToData: function (img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL("image/jpeg");
  },

  loadImg: function(imgUrl, callback){
    var ImgObject = new Image();
    ImgObject.crossOrigin = 'anonymous';

    ImgObject.onload = function(){
      callback(this.imageToData(ImgObject));
    }.bind(this)

    ImgObject.src = imgUrl;
  },

  preprocess: function(data){
    if (Math.random() >= 0.8) return data;
    return this.glitcher.glitch(data);
  },

  postProcess: function(data, callback){
    var canvas    = document.createElement('canvas');
    var ctx       = canvas.getContext("2d");
    var ImageObj  = new Image();

    ImageObj.onload = function(){
      canvas.width  = ImageObj.width;
      canvas.height = ImageObj.height;
      ctx.drawImage(ImageObj, 0, 0);

      filters.manipulations.forEach(function(manipulation){
        filters.run(canvas, manipulation);
      });

      callback(canvas.toDataURL());
    }
    ImageObj.src = data;
  },

  glitch: function(data, filters){
    var glitchedImageData         = this.preprocess(data);
    if (!this.isMounted()) return clearInterval(this.loop);
    this.postProcess(glitchedImageData, function(data){
      this.refs['Glitch'].getDOMNode().style.backgroundImage = 'url('+data+')';
    }.bind(this));
  },

  doGlitch: function(){
    this.loadImg(this.state['image:randomImage'], function(data){
      if (this.loop){ clearInterval(this.loop) };
      this.loop = setInterval(function(){
        this.glitch(data, []);
      }.bind(this), 100)
    }.bind(this));
  },

  componentDidMount: function(){
    this.doGlitch()
  },

  componentDidUpdate: function(){
    this.doGlitch();
  },

  componentWillUnmount: function(){
    clearInterval(this.loop);
  },

  render: function(){
    return (
      <div>
        <div ref='Glitch' className='Glitch' />
      </div>
    );
  }
});
