var Dispatcher        = require('root/dispatcher');
var React             = require('react/addons');
var Ore               = require('orejs');
var PureRenderMixin   = React.PureRenderMixin;

module.exports = React.createClass({

  mixins : [PureRenderMixin, Ore.Mixin],

  defineRequiredData: function(){
    return [
      'song:notification'
    ]
  },

  render: function(){
    var isActive = (this.state['song:notification']) ? 'is-active' : '';
    return (
      <div className={'Notification ' + isActive}>
        {this.state['song:notification']}
      </div>
    );
  }
});
