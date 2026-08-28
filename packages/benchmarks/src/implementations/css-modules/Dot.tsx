import type { DotProps } from '../../impl';

import styles from './dot-styles.module.css';

const Dot = ({ size, x, y, children, color }: DotProps) => (
  <div
    className={styles.root}
    style={{
      borderBottomColor: color,
      borderRightWidth: `${size / 2}px`,
      borderBottomWidth: `${size / 2}px`,
      borderLeftWidth: `${size / 2}px`,
      marginLeft: `${x}px`,
      marginTop: `${y}px`
    }}
  >
    {children}
  </div>
);

export default Dot;
