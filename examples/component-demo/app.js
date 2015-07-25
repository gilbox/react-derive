import React, {Component} from 'react';
import {Derive, track, globalOptions} from 'react-derive';

globalOptions.debug = true;

const deriveOptions = {
  @track('taxPercent')
  tax({taxPercent}) {
    return this.subtotal() * (taxPercent / 100);
  },

  @track('items')
  subtotal({items}) {
    return items.reduce((acc, item) => acc + item, 0);
  },

  @track('taxPercent')
  total({taxPercent}) {
    return this.subtotal() + this.tax();
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taxPercent: 5,
      items: [10,55,99,23,56]
    };
  }

  render() {
    const {taxPercent,items} = this.state;

    return <div>

      <label>
        Tax Percent:
        <input
          value={taxPercent}
          onChange={event =>
            this.setState({taxPercent: event.target.value})} />
      </label>

      <Derive {...{taxPercent, items}} options={deriveOptions}>
      {({tax, subtotal, total}) =>

        <ul>
          <li>tax: {tax}</li>
          <li>subtotal: {subtotal}</li>
          <li>total: {total}</li>
        </ul>

      }</Derive>

    </div>
  }
}

React.render(<App />, document.getElementById('example'));
