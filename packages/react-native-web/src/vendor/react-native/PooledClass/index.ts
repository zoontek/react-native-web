/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * From React 16.0.0
 */

type PoolableInstance = { destructor: () => void };

type Pooler = (
  this: PoolableClass,
  ...args: Array<unknown>
) => PoolableInstance;

type Releaser = (this: PoolableClass, instance: PoolableInstance) => void;

type PoolableClass = {
  (this: PoolableInstance, ...args: Array<unknown>): void;
  new (...args: Array<unknown>): PoolableInstance;
  instancePool: Array<PoolableInstance>;
  poolSize: number;
  getPooled: Pooler;
  release: Releaser;
};

var twoArgumentPooler: Pooler = function (a1, a2) {
  var Klass = this;
  var instance = Klass.instancePool.pop();
  if (instance != null) {
    Klass.call(instance, a1, a2);
    return instance;
  } else {
    return new Klass(a1, a2);
  }
};

var standardReleaser: Releaser = function (instance) {
  var Klass = this;
  instance.destructor();
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var DEFAULT_POOL_SIZE = 10;
var DEFAULT_POOLER = twoArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances.
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
var addPoolingTo = function (
  CopyConstructor: unknown,
  pooler?: Pooler
): PoolableClass {
  // Casting as any so that flow ignores the actual implementation and trusts
  // it to match the type we declared
  var NewKlass = CopyConstructor as PoolableClass;
  NewKlass.instancePool = [];
  NewKlass.getPooled = pooler || DEFAULT_POOLER;
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE;
  }
  NewKlass.release = standardReleaser;
  return NewKlass;
};

var PooledClass = {
  addPoolingTo: addPoolingTo,
  twoArgumentPooler: twoArgumentPooler
};

export default PooledClass;
