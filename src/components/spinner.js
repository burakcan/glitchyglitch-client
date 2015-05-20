var React = require('react/addons');

module.exports = React.createClass({
  render: function(){
    return (
      <div className='Spinner'>
        <div className='Spinner-part' />
        <div className='Spinner-part' />
        <div className='Spinner-part' />
        <div className='Spinner-part' />
        <div className='Spinner-part' />
      </div>
    )
  }
});
