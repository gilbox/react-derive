import React, {Component} from 'react';
const BLOCKED = {};

/**
 * When used in conjunction with @track, will only re-calculate
 * derived props when the tracked props changed. If they didn't change,
 * will use previously calculated derived props.
 *
 * Obviously, when used as a sub-HoC of @elegant this is only necessary
 * when there are other props that might change that are not tracked.
 *
 * Note: when used in conjunction with @elegant, @derive should be
 *       below @elegant.
 */
export function derive(options={}, debug=false) {

  function calcDerivedProp(prevProps, nextProps, derivedProps, key, xf, delegates) {
    // if @track was used then the mapper function (xf) will be annotated
    // with 'trackedPops' property, an array of string prop names.
    // So here we check if these props have changed and if they haven't,
    // we can skip recalculation.
    if (xf.trackedProps && xf.trackedProps.every(p => prevProps[p] === nextProps[p])) {
      return derivedProps[key];
    }

    if (debug) console.log(`${DeriveDecorator.displayName}: recalculating derived prop '${key}'`);
    return xf.call(delegates, nextProps, derivedProps);
  }

  function deriveProps(prevProps, nextProps, derivedProps) {
    const nextDerivedProps = {};
    const delegates =
      options::map((xf,key) =>
        () => {
          if (!nextDerivedProps.hasOwnProperty(key)) {
            nextDerivedProps[key] = BLOCKED;
            return nextDerivedProps[key] = calcDerivedProp(
              prevProps, nextProps, derivedProps, key, xf, delegates);
          } else {
            if (nextDerivedProps[key] === BLOCKED) {
              throw Error(`Circular dependencies in derived props, '${key}' was blocked.`)
            }
            return nextDerivedProps[key]
          }
        });

    Object.keys(options).forEach(key => {
      if (!nextDerivedProps.hasOwnProperty(key))
        nextDerivedProps[key] = calcDerivedProp(
          prevProps, nextProps, derivedProps, key, options[key], delegates);
    });

    return {...nextProps, ...nextDerivedProps};
  }

  return DecoratedComponent => class DeriveDecorator extends Component {
    static displayName = `Derive(${getDisplayName(DecoratedComponent)})`;
    static DecoratedComponent = DecoratedComponent;

    componentWillMount() {
      this.derivedProps = deriveProps({}, this.props, {});
    }

    componentWillUpdate(nextProps) {
      this.derivedProps = deriveProps(this.props, nextProps, this.derivedProps);
    }

    render() {
      return React.createElement(DecoratedComponent, this.derivedProps);
    }
  }
}

/**
 * Object literal decorator that annotates a mapper function
 * to have a 'trackedProps' property
 */
export function track(...trackedProps) {
  return function(target, key, descriptor) {
    descriptor.value.trackedProps = trackedProps;
  }
}

function getDisplayName (comp) {
  return comp.displayName || comp.name || 'Component';
}

/**
 * map an object to an object
 */
function map(f, result={}) {
  Object.keys(this).forEach(k => result[k] = f(this[k],k));
  return result;
}
