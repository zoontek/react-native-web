import { Dimensions, Platform } from 'react-native-web';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

const breakpoints = {
  small: 360,
  medium: 600,
  large: 800,
  xLarge: 1100
};

/**
 * Color palette
 * DO NOT add new colors unless they are part of @design's color palette.
 * DO NOT use colors that are not specified here.
 * source: go/uicolors
 */
export const colors = {
  // Primary
  blue: '#1DA1F2',
  purple: '#794BC4',
  green: '#17BF63',
  yellow: '#FFAD1F',
  orange: '#F45D22',
  red: '#E0245E',
  // Text and interface grays
  textBlack: '#14171A',
  deepGray: '#657786',
  mediumGray: '#AAB8C2',
  lightGray: '#CCD6DD',
  fadedGray: '#E6ECF0',
  faintGray: '#F5F8FA',
  white: '#FFF',
  textBlue: '#1B95E0'
};

// On web, change the root font-size at specific breakpoints to scale the UI
// for larger viewports.
if (Platform.OS === 'web' && canUseDOM) {
  const { medium, large } = breakpoints;
  const htmlElement = document.documentElement;
  const setFontSize = (width: number) => {
    const fontSize =
      width > medium ? (width > large ? '18px' : '17px') : '16px';
    if (htmlElement) {
      htmlElement.style.fontSize = fontSize;
    }
  };

  setFontSize(Dimensions.get('window').width);
  Dimensions.addEventListener('change', (dimensions) => {
    setFontSize(dimensions.window.width);
  });
}
