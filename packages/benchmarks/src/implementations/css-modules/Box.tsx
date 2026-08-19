import type { BoxProps } from '../../impl';

import classnames from 'classnames';
import View from './View';
import styles from './box-styles.module.css';

const Box = ({
  color,
  fixed = false,
  layout = 'column',
  outer = false,
  ...other
}: BoxProps) => (
  <View
    {...other}
    className={classnames(
      styles[`color${color}`],
      fixed && styles.fixed,
      outer && styles.outer,
      layout === 'row' && styles.row
    )}
  />
);

export default Box;
