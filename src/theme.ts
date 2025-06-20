import { StyleSheet } from 'react-native';
import theme from './config/theme.json';

export const stylesTemplate = StyleSheet.create({
  screenBgColor: {
    backgroundColor: theme.backgroundColor,
  },
  primaryColor: {
    backgroundColor: theme.primaryColor,
  },
});
