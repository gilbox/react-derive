# react-derive

For **organizing** and **optimizing** rendering of react components
that rely on derived data. Works by wrapping your component in a HoC.
For example, lets say your
component shows the result of adding two numbers.

    export default class Add extends Component {
      render() {
        const {a,b,fontSize} = this.props;
        return <div style={{fontSize}}>a + b = {a+b}</div>
      }
    }

We can move the calculation of `a+b` to a decorator named `@derive`
where we'll create the *deriver* function named `sum`. And because we
named the function `sum`, the deriver's result will be passed
into the `Add` component via a prop likewise named `sum`.

    @derive({
      sum({a,b}) { return a+b }
    })
    export default class Add extends Component {
      render() {
        const {sum,fontSize} = this.props;
        return <div style={{fontSize}}>a + b = {sum}</div>
      }
    }

Note that

- The first argument to a *deriver* function is `newProps`.
- The second argument is the previously derived props object
  (in this case it would look something like `{a:5,b:3,sum:8}`)
- The value of `this` allows you to reference the result of other
  derivers like `this.sum()`.

But wait, every time the component renders, `sum` will recalculate even
if `a` and `b` didn't change. To optimize, we can memoize the calculation with `@track`
so when the `fontSize` prop changes `sum` won't be recalculated.

    @derive({
      @track('a', 'b')
      sum({a,b}) { return a+b }
    })
    export default class Add extends Component {
      render() {
        const {sum,fontSize} = this.props;
        return <div style={{fontSize}}>a + b = {sum}</div>
      }
    }

We supply args `'a'` and `'b'` to the `@track`
decorator to indicate that the `sum` deriver only
cares about those two props. If `fontSize` changes,
`sum` won't recalculate.

-------

This project is similar to [reselect](https://github.com/faassen/reselect)
for redux. However, while reselect helps manage derived data from 
global state, react-derive manages derived data from props.

## `@derive` as a decorator

You can use `this` object to depend on other derived props:

    @derive({
      @track('taxPercent')
      tax({taxPercent}) {
        return this.subtotal() * (taxPercent / 100);
      },

      @track('items')
      subtotal({items}) {
        return items.reduce((acc, item) => acc + item.value, 0);
      },

      @track('taxPercent')
      total({taxPercent}) {
        return this.subtotal() + this.tax();
      }
    })
    class Total extends React.Component {
      render() {
        return <div>{ this.props.total }</div>
      }
    }

See the [reselect version of the example above](https://github.com/faassen/reselect#example)

## `Derive` as a Component

`options` prop is the same as first argument to `@derive`.
The child is a function that accepts the derived props object
as it's first argument:

    <Derive {...{taxPercent, items}} options={deriveOptions}>
    {({tax, subtotal, total}) =>
      <ul>
        <li>tax: {tax}</li>
        <li>subtotal: {subtotal}</li>
        <li>total: {total}</li>
      </ul>
    }</Derive>

## ES6 support

Using ES7 decorators is in fact optional. If you want to stick with
ES6 constructs, it's easy to do:

    export const Add =
      (derive({
        sum: track('a','b')
          (function({a,b}) { return a+b })
      })                                   // <--- function returned...
      (class Add extends Component {       // <--- immediately invoked by passing in class
        render() {
          const {sum,fontSize} = this.props;
          return <div style={{fontSize}}>a + b = {sum}</div>
        }
      });
      
See the `examples/` dir of this repo for additional examples.

## install + import

    npm i react-derive -S

then:

    import {Derive, derive, track} from 'react-derive';

or when included via script tag it's available as the global variable `ReactDerive`:

    const {Derive, derive, track} = ReactDerive;

## [documentation](http://gilbox.github.io/react-derive/index.js.html)

## examples

- decorator demo:  [source](https://github.com/gilbox/react-derive/blob/master/examples/decorator-demo/app.js) - [live demo](http://gilbox.github.io/react-derive/examples/decorator-demo/demo.html)
- component demo:  [source](https://github.com/gilbox/react-derive/blob/master/examples/component-demo/app.js) - [live demo](http://gilbox.github.io/react-derive/examples/component-demo/demo.html)
- [elegant-react-hot-demo](https://github.com/gilbox/elegant-react-hot-demo) (still a WIP)
