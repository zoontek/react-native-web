import type { ComponentProps } from 'react';

import classnames from 'classnames';
import React from 'react';
import styles from './view-styles.module.css';

type Props = ComponentProps<'div'>;

class View extends React.Component<Props> {
  render() {
    const props = this.props;
    return (
      <div {...props} className={classnames(styles.initial, props.className)} />
    );
  }
}

export default View;
