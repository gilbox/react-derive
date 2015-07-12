# react-derive

For **organizing** and **optimizing** rendering of react components
that rely on derived data. For example, lets say your
component shows the result of adding two numbers.

    export default class List extends Component {
      render() {
        const {a,b,fontSize} = this.props;
        return <div style={{fontSize}}>a + b = {a+b}</div>
      }
    }

We can move the calculation of `a+b` to another location
which we'll call the `deriver` function.

    @derive({
      sum({a,b}) { return a+b }
    })
    export default class List extends Component {
      render() {
        const {sum,fontSize} = this.props;
        return <div style={{fontSize}}>a + b = {sum}</div>
      }
    }

But wait, we can do better. We can memoize the calculation with `@track`
so when the `fontSize` prop changes `sum` won't be recalculated.

    @derive({
      @track('a', 'b')
      sum({a,b}) { return a+b }
    })
    export default class List extends Component {
      render() {
        const {sum,fontSize} = this.props;
        return <div style={{fontSize}}>a + b = {sum}</div>
      }
    }

We supply args `'a'` and `'b'` to the track
decorator to indicator that the `sum` deriver only
cares about those two props. If `fontSize` changes,
sum won't recalculate`.

This project is similar to [reselect](https://github.com/faassen/reselect)
for redux, but takes a different approach.
