/**
 * This project is an example on how to easily create your own
 * signals. It's meant to create a better understanding how signals
 * and effects work and how to use them in your project.
 */

// Start of the core functionality
let current;

function createSignal(initialValue) {
  let value = initialValue;
  const observers = [];

  const getter = () => {
    if (current && !observers.includes(current)) {
      observers.push(current);
    }
    return value;
  };
  const setter = (newValue) => {
    value = newValue;
    observers.forEach((fn) => fn());
  };

  return [getter, setter];
}

function createEffect(fn) {
  current = fn;
  fn();
  current = undefined;
}

/**
 * Stores are like signals, but use the Proxy API to register the
 * getter and setter we know from signals, on objects.
 *
 * Note that the interface does not match that of Solid.
 */
function createStore(base) {
  const observers = [];
  const storeHandler = {
    get(target, prop) {
      if (current && !observers.includes(current)) {
        observers.push(current);
      }
      return target[prop];
    },
    set(target, prop, value) {
      target[prop] = value;
      observers.forEach((fn) => fn());
    },
  };

  const value = new Proxy(base, storeHandler);
  return [value];
}

// End of functionality

/**
 * Example console app
 *
 * It renders components to the console using the observer-pattern
 * through the signals and effects we have created.
 * To simulate user interaction we inject a `handleClick` function
 * in the renderer which is bound to that component instance.
 */
const [count, setCount] = createSignal(3);

function MyComponent() {
  const [profiles] = createStore({ one: { id: 'one' }, two: { id: 'two' } });

  const renderer = () =>
    'The current count is ' + count() + ' and profile ' + profiles.one.id;
  renderer.handleClick = () => (profiles.one = { id: 'three' });
  return renderer;
}

const myComponentRenderer = MyComponent();
const myComponentRenderer2 = MyComponent();
createEffect(() => {
  console.log(myComponentRenderer());
});
createEffect(() => {
  console.log(myComponentRenderer2());
});

// User interaction
myComponentRenderer.handleClick();
setCount(5);
