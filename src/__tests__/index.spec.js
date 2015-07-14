jest.dontMock('../index');
import {derive} from '../index';
import React, {Component, addons} from 'react/addons';
const {TestUtils} = addons;

function createTestComponent(options, cb) {
  @derive(options)
  class TestComponent extends Component {
    render() {
      const props = this.props;
      cb(props);
      return null;
    }
  }
  return TestComponent;
}

function deriveProps(options, props) {
  var derivedProps;
  const Comp = createTestComponent(options, props => derivedProps = props);
  TestUtils.renderIntoDocument(<Comp {...props} />);
  return derivedProps;
}

describe('derive', () => {
  it('simple case', () => {
    const options = {
      foo({bar}) {
        return bar+1;
      }
    };
    const derivedProps = deriveProps(options, { bar: 1 } )
    expect(derivedProps).toEqual({bar:1, foo:2});
  });

  it('multiple options', () => {
    const options = {
      foo({bar}) {
        return bar+1;
      },
      baz({bar}) {
        return bar+10;
      },
      x({x}) {
        return x + ' world';
      }
    };
    const derivedProps = deriveProps(options, {bar: 1, x: 'hello'} )
    expect(derivedProps).toEqual({bar:1, foo:2, baz: 11, x: 'hello world'});
  });

  it('simple case of deriving from derived data', () => {
    const options = {
      foo({bar}) {
        return bar+1;
      },
      baz({bar}) {
        return this.foo() + bar + 10;
      }
    };
    const derivedProps = deriveProps(options, {bar: 1} )
    expect(derivedProps).toEqual({bar:1, foo:2, baz: 13});
  });

  it('another case of deriving from derived data', () => {
    const options = {
      foo({bar}) {
        return this.baz() + bar + 1;
      },
      baz({bar}) {
        return bar + 10;
      }
    };
    const derivedProps = deriveProps(options, {bar: 1} )
    expect(derivedProps).toEqual({bar:1, foo:13, baz: 11});
  });

  it('multiple derivers deriving from one deriver', () => {
    const options = {
      oops({ack}) {
        return ack + this.foo() + this.bar();
      },
      foo({bar}) {
        return this.baz() + bar + 1;
      },
      bar({bar}) {
        return this.baz() + bar + 5;
      },
      baz({bar}) {
        return bar + 10;
      }
    };
    const derivedProps = deriveProps(options, {bar: 1, ack:100} )
    expect(derivedProps).toEqual({bar:17, foo:13, baz: 11, ack: 100, oops: 130});
  });

  it('should error when deriving causes loop', () => {
    const options = {
      foo({bar}) {
        return this.baz() + bar + 1;
      },
      baz({bar}) {
        return bar + 10 + this.foo();
      }
    };
    try {
      const derivedProps = deriveProps(options, {bar: 1} )
    } catch(e) {
      if (e.toString() !== "Error: Circular dependencies in derived props, 'baz' was blocked.")
        throw Error(`Circular error test failed (${e.toString()}`)
    }
  });
});
