import React, {Component} from 'react';
const BLOCKED = {};

/**
 * ## derive
 *
 * Create a derived data higher-order component (HoC).
 *
 * @param {Object} options (optional)
 * @param {Boolean} debug (optional)
 * @return {Object}
 */
export function derive(options={}, debug=false) {

  // `deriveProps` takes props from the previous render (`prevProps`), props
  // from the current render (`nextProps`), and derived props from the previous
  // render (`derivedProps`) and returns a new object with the newly derived props.
  function deriveProps(prevProps, nextProps, derivedProps) {
    const nextDerivedProps = {};

    const calcDerivedProp = (key, xf) => {

      // When `xf` is annotated with `trackedProps` (by `@track`), only re-calculate
      // derived props when the tracked props changed.
      if (xf.trackedProps && xf.trackedProps.every(p => prevProps[p] === nextProps[p])) {
        // No change, use previously calculated derived props.
        return derivedProps[key];
      }

      if (debug) console.log(`${DeriveDecorator.displayName}: recalculating derived prop '${key}'`);
      return xf.call(delegates, nextProps, derivedProps);
    };

    // `delegates` is the object that will be attached to the `this` Object
    // of deriver (`xf`) functions. (see `xf.call(delegates...)` above)
    const delegates =
      options::map((xf,key) =>
        () => {
          if (!nextDerivedProps.hasOwnProperty(key)) {
            nextDerivedProps[key] = BLOCKED;
            return nextDerivedProps[key] = calcDerivedProp(key, xf);
          } else {
            if (nextDerivedProps[key] === BLOCKED) {
              throw Error(`Circular dependencies in derived props, '${key}' was blocked.`)
            }
            return nextDerivedProps[key]
          }
        });

    Object.keys(options).forEach(key => {
      if (!nextDerivedProps.hasOwnProperty(key))
        // calculate derived prop
        nextDerivedProps[key] = calcDerivedProp(key, options[key]);
    });

    return {...nextProps, ...nextDerivedProps};
  }

  // Return the HoC that will manage derived props.
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
 * ## track
 *
 * Object literal decorator that annotates a mapper function
 * to have a 'trackedProps' property. Used by `@derive` to memoize
 * props.
 *
 * @param {String...} trackedProps
 * @return {Function}
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
 * ## map (private)
 * map an object to an object
 *
 * @param {Function} f
 * @param {Object} result (optional)
 * @return {Object}
 */
function map(f, result={}) {
  Object.keys(this).forEach(k => result[k] = f(this[k],k));
  return result;
}
