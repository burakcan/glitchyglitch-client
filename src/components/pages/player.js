var Dispatcher        = require('root/dispatcher');
var React             = require('react/addons');
var PureRenderMixin   = React.PureRenderMixin;
var IframePlayer      = require('components/iframeplayer');
var Glitch            = require('components/glitch');

module.exports = React.createClass({

  mixins : [PureRenderMixin],

  render: function(){
    return (
      <div className='Page PlayerPage'>
        <Glitch />
        <IframePlayer />
      </div>
    );
  }
});
