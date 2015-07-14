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
  return DecoratedComponent => class DeriveDecorator extends Component {
    static displayName = `Derive(${getDisplayName(DecoratedComponent)})`;
    static DecoratedComponent = DecoratedComponent;

    _calcDerivedProp(nextProps, key, xf, delegates) {
      const trackedProps = xf.trackedProps;

      // if @track was used then the mapper function (xf) will be annotated
      // with 'trackedPops' property, an array of string prop names.
      // So here we check if these props have changed and if they haven't,
      // we can skip recalculation.
      if (xf.trackedProps) {
        let changed = false;
        xf.trackedProps.forEach(p => {
          changed = changed || (this.props[p] !== nextProps[p]);
        });
        if (!changed) return this.derivedProps[key];
      }

      if (debug) console.log(`${DeriveDecorator.displayName}: recalculating derived prop '${key}'`);
      return xf.call(delegates, nextProps, this.derivedProps);
    }

    _derive(nextProps) {
      const derivedProps = {};
      const delegates =
        options::map((xf,key) =>
          () => {
            if (!derivedProps.hasOwnProperty(key)) {
              derivedProps[key] = BLOCKED;
              return derivedProps[key] = this._calcDerivedProp(nextProps, key, xf, delegates);
            } else {
              if (derivedProps[key] === BLOCKED) {
                throw Error(`Circular dependencies in derived props, '${key}' was blocked.`)
              }
              return derivedProps[key]
            }
          });

      Object.keys(options).forEach(key => {
        if (!derivedProps.hasOwnProperty(key))
          derivedProps[key] = this._calcDerivedProp(nextProps, key, options[key], delegates);
      });

      this.derivedProps = {...nextProps, ...derivedProps};
    }

    componentWillMount() {
      this._derive(this.props);
    }
    
    componentWillUpdate(nextProps) {
      this._derive(nextProps);
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
