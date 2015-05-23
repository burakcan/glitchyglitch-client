var Dispatcher        = require('root/dispatcher');
var React             = require('react/addons');
var Ore               = require('orejs');
var PureRenderMixin   = React.PureRenderMixin;
var Spinner           = require('components/spinner');

var ENTER_KEY       = 13;
var ESC_KEY         = 27;
var BACKSPACE_KEY   = 8;
var CMD_KEY         = 91;
var SHIFT_KEY       = 16;
var LEFT_KEY        = 37;
var RIGHT_KEY       = 39;

module.exports = React.createClass({

  mixins : [PureRenderMixin, Ore.Mixin],

  getInitialState: function(){
    return {
      inputValue      : '',
      cursorPosition  : 0
    }
  },

  defineRequiredData: function(){
    return [
      'song:busy',
      'song:exampleTags'
    ]
  },

  componentDidMount: function(){
    var input = this.refs['realInput'].getDOMNode();
    input.focus();
    input.onblur = input.focus;
    input.onkeydown = this.handleKeyDown;
  },

  componentDidUpdate: function(){
    var innerWrapper        = this.refs['innerWrapper'].getDOMNode();
    var wrapperWidth        = this.refs['wrapper'].getDOMNode().clientWidth;
    var innerWrapperWidth   = innerWrapper.clientWidth;
    var diff = innerWrapperWidth - wrapperWidth;

    var input = this.refs['realInput'].getDOMNode();
    input.focus();

    if (diff > 0) {
      innerWrapper.style.marginLeft = (-1 * diff - 2) + 'px';
    } else {
      innerWrapper.style.marginLeft = 0;
    }

  },

  handleKeyDown: function(e){
    var key = e.which;

    switch (key){
      case ESC_KEY:
        return this.handleEsc()
        break;

      case ENTER_KEY:
        return this.handleEnter()
        break;

      case LEFT_KEY:
        return this.moveCursor('left');
        break;

      case RIGHT_KEY:
        return this.moveCursor('right');
        break;
    }
  },

  handleEsc: function(){
    this.setState({
      inputValue: ''
    });
  },

  handleEnter: function(){
    var inputValue = this.state['inputValue'];

    Dispatcher.dispatch( new Ore.ACTION({
      type         : 'search:submit',
      payload      : {
        searchTerm : inputValue
      }
    }) );
  },

  moveCursor: function(direction){
    var cursorPosition = this.state['cursorPosition'];
    var inputValue     = this.state['inputValue'];

    if (direction == 'left' && cursorPosition == 0){
      cursorPosition = 0;
    } else if (direction == 'left'){
      cursorPosition = cursorPosition - 1;
    } else if(cursorPosition != inputValue.length) {
      cursorPosition = cursorPosition + 1;
    }

    this.setState({
      cursorPosition : cursorPosition
    });

  },

  handleChange: function(){
    var input           = this.refs['realInput'].getDOMNode();
    var value           = input.value;
    var cursorPosition  = input.selectionStart;
    this.setState({
      inputValue : value,
      cursorPosition : cursorPosition
    });
  },

  render: function(){
    var cursorPosition    = this.state['cursorPosition'];
    var inputValue        = this.state['inputValue'];
    var isEmpty           = (inputValue.length == 0) ? 'is-empty' : '';
    var isSearching       = (this.state['song:busy']) ? 'is-searching' : '';
    var exampleTags       = this.state['song:exampleTags'];

    var r1 = Math.floor(Math.random() * (exampleTags.size));
    var r2 = Math.floor(Math.random() * (exampleTags.size));

    return (
      <div className={'Page SearchPage ' + isEmpty + ' ' + isSearching}>
        <Spinner />
        <div ref='wrapper' className='SearchInput'>
          <div ref='innerWrapper' className='SearchInput-inner'>
            {inputValue.slice(0, cursorPosition)}
            <span className='SearchInput-cursor'></span>
            {inputValue.slice(cursorPosition, inputValue.length)}
            <span className='SearchInput-placeHolder is-hidden'>search something, e.g. {exampleTags.get(r1)} or {exampleTags.get(r2)}...</span>
          </div>
          <input ref='realInput' className='SearchInput-input' onChange={this.handleChange} />
        </div>
      </div>
    )
  }
});
