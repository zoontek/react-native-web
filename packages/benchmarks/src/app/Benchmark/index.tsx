/**
 * The MIT License (MIT)
 * Copyright (c) 2017 Paul Armstrong
 * https://github.com/paularmstrong/react-component-benchmark
 */

import type { ComponentType, ReactNode } from 'react';
import { Component } from 'react';

import { getMean, getStdDev } from './math';
import type {
  BenchResultsType,
  FullSampleTimingType,
  SampleTimingType
} from './types';

export const BenchmarkType = {
  MOUNT: 'mount',
  UPDATE: 'update'
} as const;

const Timing = {
  // Returns a high resolution time (if possible) in milliseconds
  now(): number {
    if (window && window.performance) {
      return window.performance.now();
    } else {
      return Date.now();
    }
  }
};

export type BenchmarkTypeValue =
  (typeof BenchmarkType)[keyof typeof BenchmarkType];

const shouldRender = (cycle: number, type: BenchmarkTypeValue): boolean => {
  switch (type) {
    // Render every odd iteration (first, third, etc)
    // Mounts and unmounts the component
    case BenchmarkType.MOUNT:
      return !((cycle + 1) % 2);
    // Render every iteration (updates previously rendered module)
    case BenchmarkType.UPDATE:
      return true;
    default:
      return false;
  }
};

const shouldRecord = (cycle: number, type: BenchmarkTypeValue): boolean => {
  switch (type) {
    // Record every odd iteration (when mounted: first, third, etc)
    case BenchmarkType.MOUNT:
      return !((cycle + 1) % 2);
    // Record every iteration
    case BenchmarkType.UPDATE:
      return true;
    default:
      return false;
  }
};

const isDone = (
  cycle: number,
  sampleCount: number,
  type: BenchmarkTypeValue
): boolean => {
  switch (type) {
    case BenchmarkType.MOUNT:
      return cycle >= sampleCount * 2 - 1;
    case BenchmarkType.UPDATE:
      return cycle >= sampleCount - 1;
    default:
      return true;
  }
};

const sortNumbers = (a: number, b: number): number => a - b;

export type ComponentPropsType = Record<string, unknown>;

type BenchmarkPropsType = {
  component: ComponentType<ComponentPropsType>;
  forceLayout?: boolean;
  getComponentProps: (options: { cycle: number }) => ComponentPropsType;
  onComplete: (x: BenchResultsType) => void;
  sampleCount: number;
  timeout: number;
  type: BenchmarkTypeValue;
};

type BenchmarkStateType = {
  componentProps: ComponentPropsType;
  cycle: number;
  running: boolean;
};

/**
 * Benchmark
 * TODO: documentation
 */
export default class Benchmark extends Component<
  BenchmarkPropsType,
  BenchmarkStateType
> {
  _raf: number | null = null;
  _startTime: number;
  _samples: Array<SampleTimingType>;

  static displayName: string = 'Benchmark';

  static defaultProps = {
    sampleCount: 50,
    timeout: 10000, // 10 seconds
    type: BenchmarkType.MOUNT
  };

  constructor(props: BenchmarkPropsType) {
    super(props);
    const cycle = 0;
    const componentProps = props.getComponentProps({ cycle });
    this.state = {
      componentProps,
      cycle,
      running: false
    };
    this._startTime = 0;
    this._samples = [];
  }

  componentWillReceiveProps(nextProps: BenchmarkPropsType) {
    this.setState((state) => ({
      componentProps: nextProps.getComponentProps({ cycle: state.cycle })
    }));
  }

  componentWillUpdate(
    nextProps: BenchmarkPropsType,
    nextState: BenchmarkStateType
  ) {
    if (nextState.running && !this.state.running) {
      this._startTime = Timing.now();
    }
  }

  componentDidUpdate() {
    const { forceLayout, sampleCount, timeout, type } = this.props;
    const { cycle, running } = this.state;

    if (running && shouldRecord(cycle, type)) {
      const sample = this._samples[cycle] as SampleTimingType;
      sample.scriptingEnd = Timing.now();

      // force style recalc that would otherwise happen before the next frame
      if (forceLayout) {
        sample.layoutStart = Timing.now();
        if (document.body) {
          document.body.offsetWidth;
        }
        sample.layoutEnd = Timing.now();
      }
    }

    if (running) {
      const now = Timing.now();
      if (
        !isDone(cycle, sampleCount, type) &&
        now - this._startTime < timeout
      ) {
        this._handleCycleComplete();
      } else {
        this._handleComplete();
      }
    }
  }

  componentWillUnmount() {
    if (this._raf) {
      window.cancelAnimationFrame(this._raf);
    }
  }

  render(): ReactNode {
    const { component: Component, type } = this.props;
    const { componentProps, cycle, running } = this.state;
    if (running && shouldRecord(cycle, type)) {
      this._samples[cycle] = { scriptingStart: Timing.now() };
    }
    return running && shouldRender(cycle, type) ? (
      <Component {...componentProps} />
    ) : null;
  }

  start() {
    this._samples = [];
    this.setState(() => ({ running: true, cycle: 0 }));
  }

  _handleCycleComplete() {
    const { getComponentProps, type } = this.props;
    const { cycle } = this.state;

    // Calculate the component props outside of the time recording (render)
    // so that it doesn't skew results
    const componentProps = getComponentProps({ cycle });
    // make sure props always change for update tests
    if (type === BenchmarkType.UPDATE) {
      componentProps['data-test'] = cycle;
    }

    this._raf = window.requestAnimationFrame(() => {
      this.setState((state: BenchmarkStateType) => ({
        cycle: state.cycle + 1,
        componentProps
      }));
    });
  }

  getSamples(): Array<FullSampleTimingType> {
    return this._samples.reduce<Array<FullSampleTimingType>>(
      (
        memo: Array<FullSampleTimingType>,
        { scriptingStart, scriptingEnd, layoutStart, layoutEnd }
      ): Array<FullSampleTimingType> => {
        memo.push({
          start: scriptingStart,
          end: layoutEnd || scriptingEnd || 0,
          scriptingStart,
          scriptingEnd: scriptingEnd || 0,
          layoutStart,
          layoutEnd
        });
        return memo;
      },
      []
    );
  }

  _handleComplete() {
    const { onComplete } = this.props;
    const samples = this.getSamples();

    this.setState(() => ({ running: false, cycle: 0 }));

    const sortedElapsedTimes = samples
      .map(({ start, end }) => end - start)
      .sort(sortNumbers);
    const sortedScriptingElapsedTimes = samples
      .map(({ scriptingStart, scriptingEnd }) => scriptingEnd - scriptingStart)
      .sort(sortNumbers);
    const sortedLayoutElapsedTimes = samples
      .map(
        ({ layoutStart, layoutEnd }) => (layoutEnd || 0) - (layoutStart || 0)
      )
      .sort(sortNumbers);

    onComplete({
      sampleCount: samples.length,
      mean: getMean(sortedElapsedTimes),
      stdDev: getStdDev(sortedElapsedTimes),
      meanLayout: getMean(sortedLayoutElapsedTimes),
      meanScripting: getMean(sortedScriptingElapsedTimes)
    });
  }
}
