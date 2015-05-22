require('styles/main.sass');

window.GLOBALS        = {
  'API_URL'           : function(){
    if (process.env.NODE_ENV === 'development'){
      return 'http://localhost:1993';
    } else {
      return 'http://178.62.172.240:1993';
    }
  }()
}

var Dispatcher        = require('root/dispatcher');
var React             = require('react/addons');
var Ore               = require('orejs');
var PureRenderMixin   = React.PureRenderMixin;
var SearchPage        = require('components/pages/search');
var PlayerPage        = require('components/pages/player');
var Notifications     = require('components/notifications');
var ImageStore        = require('stores/image');
var SongStore         = require('stores/song');

(function(){
  var AppView = React.createClass({

    mixins : [PureRenderMixin, Ore.Mixin],

    defineRequiredData: function(){
      return [
        'song:current'
      ]
    },

    setTitle: function(){
      document.title = (this.state['song:current']) ?
                        this.state['song:current'].get('name') +' - ' + this.state['song:current'].get('artist'):
                        'Glitchy Glitch';
    },

    componentDidUpdate: function(){
      this.setTitle();
    },

    render: function(){
      var page = (this.state['song:current']) ?
        <PlayerPage />:
        <SearchPage />;

      return (
        <div>
          {page}
          <Notifications />
          <footer className='Footer'>
            <a href='http://twitter.com/neoberg' title='Burak Can' target='blank'>burakcan</a>|
            <a href='http://github.com/burakcan/glitchyglitch' title='Glitchy glitch' target='blank'>source</a>
          </footer>
        </div>
      );
    }
  });

  React.render(<AppView />, document.getElementById('render'));
})();
