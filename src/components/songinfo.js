var Dispatcher        = require('root/dispatcher');
var React             = require('react/addons');
var Ore               = require('orejs');
var PureRenderMixin   = React.PureRenderMixin;

module.exports = React.createClass({

  mixins : [PureRenderMixin, Ore.Mixin],

  defineRequiredData: function(){
    return [
      'song:current'
    ]
  },

  render: function(){
    var song = this.state['song:current'];
    return (
      <div className='SongInfo'>
        <h2>{song.get('name')}</h2><br />
        <h3>{song.get('artist')}</h3>
      </div>
    );
  }
});
