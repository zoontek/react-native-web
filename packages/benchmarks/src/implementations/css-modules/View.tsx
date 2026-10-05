import classnames from 'classnames';
import { Component, type ComponentProps } from 'react';

import styles from './view-styles.module.css';

type Props = ComponentProps<'div'>;

class View extends Component<Props> {
  render() {
    const props = this.props;
    return (
      <div {...props} className={classnames(styles.initial, props.className)} />
    );
  }
}

export default View;
