var Ore        = require('orejs');
var Dispatcher = require('root/dispatcher');
var Ajax       = require('microajax');
var Immutable  = require('immutable');

var API_URL    = window.GLOBALS['API_URL'];

module.exports = window.imgStore = Ore.createStore({
  initialState: {
    'image:randomImages': Immutable.List(),
    'image:randomImage' : null,
    'image:interest'    : null
  },

  interestedIn: {
    'search:submit'     : 'startSearch',
    'search:again'      : 'clear'
  },

  methods : {
    randomImageLoop: function(){
      var photos = this.state.get('image:randomImages');
      var random = Math.floor(Math.random() * (photos.size));
      var photo  = photos.get(random);

      if (!photo) return undefined;

      var imgUrl = 'https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg';

      this.setState({
        'image:randomImage' : imgUrl
      });

      setTimeout(function(){
        this.randomImageLoop();
      }.bind(this), 2000)
    },

    startSearch: function(action){
      var interest = action.get('payload').searchTerm;

      this.setState({
        'image:interest' : interest
      });

      this.getRandomImages();
    },

    getRandomImages: function(){
      var interest = this.state.get('image:interest')
      var url      = API_URL + '/image/random/' + interest;

      Ajax(url, function(res){
        var response = JSON.parse(res.response);
        var photos   = this.state.get('image:randomImages').concat(response.photos.photo);

        this.setState({
          'image:randomImages' : photos
        });

        this.randomImageLoop();
      }.bind(this));

    }
  }

}, Dispatcher);
