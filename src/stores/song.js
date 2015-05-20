var Ore        = require('orejs');
var Dispatcher = require('root/dispatcher');
var Ajax       = require('microajax');
var Immutable  = require('immutable');

var API_URL    = window.GLOBALS['API_URL'];

module.exports = window.songStore = Ore.createStore({
  initialState: {
    'song:busy'           : false,
    'song:current'        : null,
    'song:queue'          : Immutable.List(),
    'song:queue:pending'  : false,
    'song:notification'   : null
  },

  interestedIn : {
    'search:submit'       : 'search',
    'song:ended'          : 'next',
    'song:next'           : 'next',
    'search:again'        : 'clear'
  },

  methods : {
    init: function(){
      this.setState({
        'song:busy' : true
      });

      var apiScript = document.createElement('script');
      apiScript.src = "https://www.youtube.com/iframe_api";

      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(apiScript, firstScriptTag);

      window.onYouTubeIframeAPIReady = this.iframeApiReady.bind(this);
    },

    iframeApiReady: function(){
      this.setState({
        'song:busy' : false
      });
    },

    search: function(action){
      this.setState({
        'song:busy'     : true
      });

      var searchTerm = action.get('payload').searchTerm;
      var url = API_URL + '/song/search/' + searchTerm;

      Ajax(url, function(res){
        if (res.status == 404){
          return this.notFound(searchTerm);
        } else if (res.status != 200){
          return this.shitHappened();
        }

        var result = JSON.parse(res.response);
        this.setState({
          'song:busy'       : false,
          'song:current'    : result,
          'song:searchTerm' : searchTerm
        });

        this.fillQueue(result);
      }.bind(this));
    },

    fillQueue: function(current, count){
      this.setState({
        'song:queue:pending' : true
      });

      var url = API_URL + '/song/' + current['artist'] + '/' + current['name'] + '/' + current['mbid'] + '/getqueue/' + (count || 15);

      Ajax(url, function(res){
        var result= JSON.parse(res.response);
        var queue = this.state.get('song:queue').concat(result);
        this.setState({
          'song:queue'          : result,
          'song:queue:pending'  : false
        });
      }.bind(this));
    },

    next: function(){
      var nextSong = this.state.getIn(['song:queue', 0]);

      this.setState({
        'song:current' : nextSong,
        'song:queue'   : this.state.get('song:queue').rest()
      });

      if (this.state.get('song:queue').size <= 10 && !this.state.get('song:queue:pending')){
        var current = this.state.get('song:current').toJS();
        this.fillQueue(current, 10);
      }
    },

    setNotification: function(message){
      this.setState({
        'song:notification' : message
      });

      setTimeout(function(){
        this.setState({
          'song:notification' : null
        });
      }.bind(this), 5000)
    },

    notFound: function(searchTerm){
      this.clear();
      var validTags = [
        'happy',
        'sad',
        'monster',
        'istanbul',
        'new york',
        'exciting',
        'chill',
        'groove',
        'coffee',
        'oldies',
        'acoustic',
        'ambient',
        'blues',
        'classical',
        'country',
        'electronic',
        'emo',
        'folk',
        'hardcore',
        'hip hop',
        'indie',
        'jazz',
        'latin',
        'metal',
        'pop',
        'pop punk',
        'punk',
        'reggae',
        'rnb',
        'rock',
        'soul',
        'world',
        '60s',
        '70s',
        '80s',
        '90s'
      ];

      var r1 = Math.floor(Math.random() * (validTags.length));
      var r2 = Math.floor(Math.random() * (validTags.length));
      this.setNotification('No results for ' + searchTerm + '. Maybe you can try "'+validTags[r1]+'" or "'+validTags[r2]+'"?');
    },

    shitHappened: function(){
      this.clear();
      this.setNotification('Yeah, listen, uh... we fucked up. We\'re trying our best to fix this.');
    }
  }

}, Dispatcher);
