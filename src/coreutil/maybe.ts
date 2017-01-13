export class Maybe<T> {
  constructor(public value: T | null) {
  }
}

export function Just<T>(val: T) {
  return new Maybe<T>(val);
}

export function Nothing<T>() {
  return new Maybe<T>(null);
}

export function match<T, U>(just: (t: T) => U, nothing: () => U, maybe: Maybe<T>): U {
  if (maybe.value === null) {
    return nothing();
  } else {
    return just(maybe.value);
  }
}

export function catMaybes<T>(maybes: Maybe<T>[]): T[] {
  return maybes.reduce(function (soFar: T[], curVal: Maybe<T>) {
    return match(
      function (val: T) {
        return soFar.concat(val);
      },
      function () {
        return soFar;
      },
      curVal);
  }, []);
}

export function map<T, U>(f: (t: T) => U, maybe: Maybe<T>): Maybe<U> {
  return match(
    function (t: T) {
      return Just(f(t));
    },
    function () {
      return Nothing<U>();
    },
    maybe);
}

export function munit<T>(t: T) {
  return Just(t);
}

export function mbind<T, U>(f: (t: T) => Maybe<U>, maybe: Maybe<T>): Maybe<U> {
  return match(
    f,
    function () {
      return Nothing<U>();
    },
    maybe);
}
