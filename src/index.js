import React, {Component} from 'react';
const BLOCKED = {};

/**
 * ## derive
 *
 * Used to define derived data.
 * When used in conjunction with @elegant, @derive should be below @elegant.
 *
 * @param {Object} options
 * @param {Boolean} debug
 * @return {Object}
 */
export function derive(options={}, debug=false) {

  function deriveProps(prevProps, nextProps, derivedProps) {
    const nextDerivedProps = {};

    const calcDerivedProp = (key, xf) => {

      // When `@derive` is used in conjunction with `@track`, we only re-calculate
      // derived props when the tracked props changed. If they didn't change,
      // use previously calculated derived props.
      //
      // So if @track was used then the mapper function (xf) will be annotated
      // with 'trackedPops' property, an array of string prop names.
      // So here we check if these props have changed and if they haven't,
      // we can skip recalculation.
      if (xf.trackedProps && xf.trackedProps.every(p => prevProps[p] === nextProps[p])) {
        return derivedProps[key];
      }

      if (debug) console.log(`${DeriveDecorator.displayName}: recalculating derived prop '${key}'`);
      return xf.call(delegates, nextProps, derivedProps);
    };

    // `delegates` is the object that will be attached to the `this` Object
    // of deriver functions. (see `xf.call(delegates...)` above)
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
        nextDerivedProps[key] = calcDerivedProp(key, options[key]);
    });

    return {...nextProps, ...nextDerivedProps};
  }

  // The HoC that will pass along the derived props.
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
 * @method track
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
 * ## map
 * map an object to an object
 *
 * @param {Function} f
 * @return {Object}
 */
function map(f, result={}) {
  Object.keys(this).forEach(k => result[k] = f(this[k],k));
  return result;
}
