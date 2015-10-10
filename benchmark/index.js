import { derive, track } from '../src/index';
import React, { Component } from 'react';

const deriveOptions = {
  tax: track('taxPercent')
    (function({taxPercent}) {
      return this.subtotal() * (taxPercent / 100);
    }),

  subtotal: track('items')
    (function({items}) {
      return items.reduce((acc, item) => acc + item, 0);
    }),

  total: track('taxPercent')
    (function({taxPercent}) {
      return this.subtotal() + this.tax();
    })
};

const Calculated =
  derive({
    tax: track('taxPercent')
      (function({taxPercent}) {
        return this.subtotal() * (taxPercent / 100);
      }),

    subtotal: track('items')
      (function({items}) {
        return items.reduce((acc, item) => acc + item, 0);
      }),

    total: track('taxPercent')
      (function({taxPercent}) {
        return this.subtotal() + this.tax();
      })
  })
  (class Calculated extends Component {
    render() {
      const {tax,subtotal,total} = this.props;

      return <ul>
        <li>tax: {tax}</li>
        <li>subtotal: {subtotal}</li>
        <li>total: {total}</li>
      </ul>
    }
  });
  
const t = Date.now();

for (let j = 0; j < 10; j++) {
  const taxPercent =  Math.random()*10;
  const items = [10,55,99,23,56].map(x => Math.random() * x);
  
  for (let i = 0; i < 1000; i++) {
    React.renderToStaticMarkup(<Calculated {...{taxPercent, items}} />);
  }
}

console.log('time:', Date.now() - t);
