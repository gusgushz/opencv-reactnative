import { requireNativeComponent, ViewStyle } from 'react-native';
import React from 'react';

interface Props {
  style?: ViewStyle;
}

const NativeCameraView = requireNativeComponent<Props>('CameraXView');

export const CameraView = (props: Props) => {
  return <NativeCameraView {...props} />;
};
