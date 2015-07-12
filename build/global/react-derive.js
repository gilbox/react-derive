(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["ReactDerive"] = factory(require("react"));
	else
		root["ReactDerive"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	exports.derive = derive;
	exports.track = track;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

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

	function derive() {
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	  var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	  return function (DecoratedComponent) {
	    return (function (_Component) {
	      _inherits(DeriveDecorator, _Component);

	      function DeriveDecorator() {
	        _classCallCheck(this, DeriveDecorator);

	        _get(Object.getPrototypeOf(DeriveDecorator.prototype), 'constructor', this).apply(this, arguments);
	      }

	      _createClass(DeriveDecorator, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	          var _this = this;

	          this.derivedProps = _extends({}, this.props);

	          Object.keys(options).forEach(function (key) {
	            _this.derivedProps[key] = options[key](_this.props);
	          });
	        }
	      }, {
	        key: 'componentWillUpdate',
	        value: function componentWillUpdate(nextProps) {
	          var _this2 = this;

	          var derivedProps = _extends({}, nextProps);

	          Object.keys(options).forEach(function (key) {
	            var xf = options[key];
	            var trackedProps = xf.trackedProps;

	            // if @track was used then the mapper function (xf) will be annotated
	            // with 'trackedPops' property, an array of string prop names.
	            // So here we check if these props have changed and if they haven't,
	            // we can skip recalculation.
	            if (xf.trackedProps) {
	              var _ret = (function () {
	                var changed = false;
	                xf.trackedProps.forEach(function (p) {
	                  changed = changed || _this2.props[p] !== nextProps[p];
	                });
	                if (!changed) return {
	                    v: derivedProps[key] = _this2.derivedProps[key]
	                  };
	              })();

	              if (typeof _ret === 'object') return _ret.v;
	            }

	            if (debug) console.log(DeriveDecorator.displayName + ': recalculating derived prop \'' + key + '\'');
	            derivedProps[key] = xf(nextProps);
	          });

	          this.derivedProps = derivedProps;
	        }
	      }, {
	        key: 'render',
	        value: function render() {
	          return _react2['default'].createElement(DecoratedComponent, this.derivedProps);
	        }
	      }], [{
	        key: 'displayName',
	        value: 'Derive(' + getDisplayName(DecoratedComponent) + ')',
	        enumerable: true
	      }, {
	        key: 'DecoratedComponent',
	        value: DecoratedComponent,
	        enumerable: true
	      }]);

	      return DeriveDecorator;
	    })(_react.Component);
	  };
	}

	/**
	 * Object literal decorator that annotates a mapper function
	 * to have a 'trackedProps' property
	 */

	function track() {
	  for (var _len = arguments.length, trackedProps = Array(_len), _key = 0; _key < _len; _key++) {
	    trackedProps[_key] = arguments[_key];
	  }

	  return function (target, key, descriptor) {
	    descriptor.value.trackedProps = trackedProps;
	  };
	}

	function getDisplayName(comp) {
	  return comp.displayName || comp.name || 'Component';
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }
/******/ ])
});
;