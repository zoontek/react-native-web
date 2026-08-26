import {
  Component,
  Fragment,
  type ChangeEvent,
  type ComponentRef
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  unstable_createElement as createElement
} from 'react-native-web';

import type { TestSetupType, TestsType } from '../index';
import Benchmark from './Benchmark';
import type { BenchResultsType } from './Benchmark/types';
import Button from './Button';
import { IconClear, IconEye } from './Icons';
import Layout from './Layout';
import ReportCard from './ReportCard';
import Text from './Text';
import { colors } from './theme';

const Overlay = () => <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]} />;

type SelectProps = {
  disabled: boolean;
  onValueChange: (value: string) => void;
  options: Array<string>;
  style?: NonNullable<Parameters<typeof createElement>[1]>['style'];
  value: string;
};

const Select = ({
  disabled,
  onValueChange,
  options,
  style,
  value
}: SelectProps) =>
  createElement('select', {
    disabled,
    onChange: (e: ChangeEvent<HTMLSelectElement>) =>
      onValueChange(e.target.value),
    style,
    value,
    children: options.map((option) =>
      createElement('option', { key: option, children: option, value: option })
    )
  });

type Props = {
  tests: TestsType;
};

type ResultType = BenchResultsType & {
  id: string;
  benchmarkName: string;
  libraryName: string;
  libraryVersion: string;
};

type State = {
  currentBenchmarkName: string;
  currentLibraryName: string;
  status: 'complete' | 'idle' | 'running';
  results: Array<ResultType>;
};

export default class App extends Component<Props, State> {
  static displayName = '@app/App';

  _benchmarkRef: Benchmark | null = null;
  _benchWrapperRef: HTMLElement | null = null;
  _scrollRef: ComponentRef<typeof ScrollView> | null = null;
  _shouldHideBenchmark = false;

  constructor(props: Props) {
    super(props);
    const currentBenchmarkName = Object.keys(props.tests)[0] ?? '';
    this.state = {
      currentBenchmarkName,
      currentLibraryName: 'react-native-web',
      status: 'idle',
      results: []
    };
  }

  override render() {
    const { tests } = this.props;
    const { currentBenchmarkName, status, currentLibraryName, results } =
      this.state;
    const currentBenchmark = tests[currentBenchmarkName] ?? {};
    const currentImplementation = currentBenchmark[
      currentLibraryName
    ] as TestSetupType;
    const {
      benchmarkType,
      Component,
      Provider,
      getComponentProps,
      sampleCount
    } = currentImplementation;

    return (
      <Layout
        actionPanel={
          <View>
            <View style={styles.pickers}>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Library</Text>
                <Text style={{ fontWeight: 'bold' }}>{currentLibraryName}</Text>

                <Select
                  disabled={status === 'running'}
                  onValueChange={this._handleChangeLibrary}
                  options={Object.keys(currentBenchmark)}
                  style={styles.picker}
                  value={currentLibraryName}
                />
              </View>
              <View style={{ width: 1, backgroundColor: colors.fadedGray }} />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Benchmark</Text>
                <Text>{currentBenchmarkName}</Text>
                <Select
                  disabled={status === 'running'}
                  onValueChange={this._handleChangeBenchmark}
                  options={Object.keys(tests)}
                  style={styles.picker}
                  value={currentBenchmarkName}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={styles.grow}>
                <Button
                  onPress={this._handleStart}
                  style={styles.button}
                  title={status === 'running' ? 'Running…' : 'Run'}
                />
              </View>
            </View>

            {status === 'running' ? <Overlay /> : null}
          </View>
        }
        listPanel={
          <View style={styles.listPanel}>
            <View style={styles.grow}>
              <View style={styles.listBar}>
                <View style={styles.iconClearContainer}>
                  <Pressable onPress={this._handleClear}>
                    <IconClear />
                  </Pressable>
                </View>
              </View>
              <ScrollView ref={this._setScrollRef} style={styles.grow}>
                {results.map((r) => (
                  <ReportCard
                    benchmarkName={r.benchmarkName}
                    key={r.id}
                    libraryName={r.libraryName}
                    libraryVersion={r.libraryVersion}
                    mean={r.mean}
                    meanLayout={r.meanLayout}
                    meanScripting={r.meanScripting}
                    sampleCount={r.sampleCount}
                    stdDev={r.stdDev}
                  />
                ))}
                {status === 'running' ? (
                  <ReportCard
                    benchmarkName={currentBenchmarkName}
                    libraryName={currentLibraryName}
                  />
                ) : null}
              </ScrollView>
            </View>
            {status === 'running' ? <Overlay /> : null}
          </View>
        }
        viewPanel={
          <View style={styles.viewPanel}>
            <View style={styles.iconEyeContainer}>
              <Pressable onPress={this._handleVisuallyHideBenchmark}>
                <IconEye style={styles.iconEye} />
              </Pressable>
            </View>

            <Provider>
              {status === 'running' ? (
                <Fragment>
                  <View ref={this._setBenchWrapperRef}>
                    <Benchmark
                      component={Component}
                      forceLayout={true}
                      getComponentProps={getComponentProps}
                      onComplete={this._createHandleComplete({
                        benchmarkName: currentBenchmarkName,
                        libraryName: currentLibraryName
                      })}
                      ref={this._setBenchRef}
                      sampleCount={sampleCount}
                      timeout={20000}
                      type={benchmarkType}
                    />
                  </View>
                </Fragment>
              ) : (
                <Component {...getComponentProps({ cycle: 10 })} />
              )}
            </Provider>

            {status === 'running' ? <Overlay /> : null}
          </View>
        }
      />
    );
  }

  _handleChangeBenchmark = (value: string) => {
    this.setState(() => ({ currentBenchmarkName: value }));
  };

  _handleChangeLibrary = (value: string) => {
    this.setState(() => ({ currentLibraryName: value }));
  };

  _handleStart = () => {
    this.setState(
      () => ({ status: 'running' }),
      () => {
        if (this._shouldHideBenchmark && this._benchWrapperRef) {
          this._benchWrapperRef.style.opacity = '0';
        }
        this._benchmarkRef?.start();
        this._scrollToEnd();
      }
    );
  };

  // hide the benchmark as it is performed (no flashing on screen)
  _handleVisuallyHideBenchmark = () => {
    this._shouldHideBenchmark = !this._shouldHideBenchmark;
    if (this._benchWrapperRef) {
      this._benchWrapperRef.style.opacity = this._shouldHideBenchmark
        ? '0'
        : '1';
    }
  };

  _createHandleComplete =
    ({
      benchmarkName,
      libraryName
    }: {
      benchmarkName: string;
      libraryName: string;
    }) =>
    (results: BenchResultsType) => {
      this.setState(
        (state) => ({
          results: state.results.concat([
            {
              ...results,
              id: `${benchmarkName}-${libraryName}-${state.results.length}`,
              benchmarkName,
              libraryName,
              libraryVersion:
                this.props.tests[benchmarkName]?.[libraryName]?.version ?? ''
            }
          ]),
          status: 'complete' as const
        }),
        this._scrollToEnd
      );
    };

  _handleClear = () => {
    this.setState(() => ({ results: [] }));
  };

  _setBenchRef = (ref: Benchmark | null) => {
    this._benchmarkRef = ref;
  };

  _setBenchWrapperRef = (ref: HTMLElement | null) => {
    this._benchWrapperRef = ref;
  };

  _setScrollRef = (ref: ComponentRef<typeof ScrollView> | null) => {
    this._scrollRef = ref;
  };

  // scroll the most recent result into view
  _scrollToEnd = () => {
    window.requestAnimationFrame(() => {
      if (this._scrollRef) {
        this._scrollRef.scrollToEnd?.();
      }
    });
  };
}

const styles = StyleSheet.create({
  viewPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'black'
  },
  iconEye: {
    color: 'white',
    height: 32
  },
  iconEyeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1
  },
  iconClearContainer: {
    height: '100%',
    marginLeft: 5
  },
  grow: {
    flex: 1
  },
  listPanel: {
    flex: 1,
    width: '100%',
    marginHorizontal: 'auto'
  },
  listBar: {
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.fadedGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    justifyContent: 'flex-end'
  },
  pickers: {
    flexDirection: 'row'
  },
  pickerContainer: {
    flex: 1,
    padding: 5
  },
  pickerTitle: {
    fontSize: 12,
    color: colors.deepGray
  },
  picker: {
    ...StyleSheet.absoluteFill,
    appearance: 'none',
    opacity: 0,
    width: '100%'
  },
  button: {
    borderRadius: 0,
    flex: 1
  }
});
