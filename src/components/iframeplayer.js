var Dispatcher        = require('root/dispatcher');
var React             = require('react/addons');
var Ore               = require('orejs');
var PureRenderMixin   = React.PureRenderMixin;
var SongInfo          = require('components/songinfo');

var icons = {
  pause       : "<svg class='icon-pause'><use xlink:href='/icons.svg#icon-pause'></use></svg>",
  play        : "<svg class='icon-play'><use xlink:href='/icons.svg#icon-play'></use></svg>",
  next        : "<svg class='icon-next'><use xlink:href='/icons.svg#icon-next'></use></svg>",
  search      : "<svg class='icon-search'><use xlink:href='/icons.svg#icon-search'></use></svg>",
  fullScreen  : "<svg class='icon-fullscreen'><use xlink:href='/icons.svg#icon-fullscreen'></use></svg>"
}

module.exports = React.createClass({

  mixins : [PureRenderMixin, Ore.Mixin],

  defineRequiredData: function(){
    return [
      'song:current'
    ]
  },

  componentDidMount: function(){
    this.createPlayer();
    this.startProgressBar();
  },

  componentDidUpdate: function(){
    if (this.player && this.player.loadVideoById){
      this.player.loadVideoById(this.state['song:current'].get('videoId'));
      this.player.playVideo();
    }
  },

  componentWillUnmount: function(){
    this.player = null;
  },

  createPlayer: function(){
    var currentSong = this.state['song:current'];
    this.player = new YT.Player('iframePlayer', {
      width: 355,
      height: 200,
      videoId: currentSong.get('videoId'),
      playerVars: {
        controls: 1,
        iv_load_policy: 3,
        autoplay: 1,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        onStateChange: function(event){
          if (event.data == 0){
            Dispatcher.dispatch( new Ore.ACTION({
              type : 'song:ended'
            }) );

            ga('send', {
              'hitType'      : 'event',
              'eventCategory': 'player',
              'eventAction'  : 'next song',
              'eventLabel'   : 'system'
            });
          } else if (event.data == 2) {
            this.setFavicon(2);
            this.refs['playPause'].getDOMNode().innerHTML = icons['play'];
          } else if (event.data == 1) {
            this.setFavicon(1);
            this.refs['playPause'].getDOMNode().innerHTML = icons['pause'];
          }
        }.bind(this)
      }
    });
  },

  startProgressBar: function(){
    window.requestAnimationFrame(function(){
      if (this.player && !this.player.getVideoLoadedFraction) return this.startProgressBar();

      var bufferState   = this.player.getVideoLoadedFraction() || 0;
      var timeState     = this.player.getCurrentTime() || 0;
      var length        = this.player.getDuration() || 0;

      var bufferBar     = this.refs['buffer'].getDOMNode();
      var timeBar       = this.refs['time'].getDOMNode();

      bufferBar.style['width'] = (bufferState * 100) + '%';
      timeBar.style['width'] = (timeState * 100 / length) + '%';

      if (this.isMounted()){
        this.startProgressBar();
      }
    }.bind(this));
  },

  search: function(){
    Dispatcher.dispatch( new Ore.ACTION({
      type : 'search:again'
    }) );

    ga('send', {
      'hitType'      : 'event',
      'eventCategory': 'player',
      'eventAction'  : 'search again',
      'eventLabel'   : 'user'
    });
  },

  fullScreen: function(){
    var elem = document.body;
    if (window.innerWidth == screen.width && window.innerHeight == screen.height){

      if(document.exitFullscreen) {
        document.exitFullscreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }

    } else {

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }

    ga('send', {
      'hitType'      : 'event',
      'eventCategory': 'player',
      'eventAction'  : 'toggle fullScreen',
      'eventLabel'   : 'user'
    });

  },

  next: function(){
    Dispatcher.dispatch( new Ore.ACTION({
      type : 'song:next'
    }) );

    ga('send', {
      'hitType'      : 'event',
      'eventCategory': 'player',
      'eventAction'  : 'next song',
      'eventLabel'   : 'user'
    });
  },

  togglePlayingState: function(){
    var currentState = this.player.getPlayerState();

    if (currentState == 2) { //paused
      this.player.playVideo();
      this.refs['playPause'].getDOMNode().innerHTML = icons['pause'];
    } else if(currentState == 1) {
      this.player.pauseVideo();
      this.refs['playPause'].getDOMNode().innerHTML = icons['play'];
    }

    ga('send', {
      'hitType'      : 'event',
      'eventCategory': 'player',
      'eventAction'  : 'toggle playing state',
      'eventLabel'   : 'user'
    });
  },

  setFavicon: function(state){
    var icon      = (state == 1) ? './fav-play.png' : './fav-pause.png';

    var canvas    = document.createElement('canvas');
    canvas.width  = 32;
    canvas.height = 32;
    var context   = canvas.getContext('2d');
    var link      = document.getElementById('favicon');
    var imageObject = new Image();

    imageObject.onload = function(){
      context.drawImage(this, 0, 0);
      link.href = canvas.toDataURL('image/png');
    }

    imageObject.src = icon;
  },

  render: function(){
    return (
      <div>
        <SongInfo />
        <div className='Progress'>
          <div ref='buffer' className='Progress-buffer' />
          <div ref='time' className='Progress-time' />
        </div>
        <div className='Controls'>
          <button
            className='Controls-button'
            onClick={this.search}
            dangerouslySetInnerHTML={{__html : icons['search']}} />

          <button
            className='Controls-button'
            onClick={this.fullScreen}
            dangerouslySetInnerHTML={{__html : icons['fullScreen']}} />

          <button
            className='Controls-button'
            onClick={this.togglePlayingState}
            ref='playPause'
            dangerouslySetInnerHTML={{__html : icons['pause']}} />

          <button
            className='Controls-button'
            onClick={this.next}
            dangerouslySetInnerHTML={{__html : icons['next']}} />

        </div>
        <div id='iframePlayer' className=''></div>
      </div>
    );
  }
});
