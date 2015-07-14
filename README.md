# react-derive

For **organizing** and **optimizing** rendering of react components
that rely on derived data (experimental). For example, lets say your
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

Note that the first and only argument to a *deriver* function is always `newProps`.

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
for redux, but takes a different approach. reselect has a
very nice way to compose *selector* functions.  However,
react-derive offers a different approach
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

To compose calculations
an alternative is to use regular functions with a
separate `memoize` decorator (which is not provided by this package but simple to create).

    const calcSubtotal = memoize(
      (items) =>
        items.reduce((acc, item) => acc + item.value, 0)
    );

    const calcTax = memoize(
      (subtotal, taxPercent) => subtotal * (taxPercent / 100)
    );

    @derive({
      @track('shop')
      total({shop: {items, taxPercent}}) {
        const subtotal = calcSubtotal(items);
        return subtotal + calcTax(subtotal, taxPercent);
      }
    })
    class Total extends React.Component {
      render() {
        return <div>{ this.props.total }</div>
      }
    }

Be sure to checkout the [reselect version of the example above](https://github.com/faassen/reselect#example)

# install + import

    npm i react-derive -S

then:

    import {derive, track} from 'react-derive';

or when included via script tag it's available as the global variable `ReactDerive`:

    const {derive, track} = ReactDerive;
