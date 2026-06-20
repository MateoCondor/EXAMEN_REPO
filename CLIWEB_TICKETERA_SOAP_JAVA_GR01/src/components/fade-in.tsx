import React, { useEffect, useMemo } from 'react';
import { Animated, Platform, type ViewProps } from 'react-native';

type FadeInViewProps = ViewProps & {
  delay?: number;
  duration?: number;
};

export function FadeInView({ delay = 0, duration = 380, style, children, ...rest }: FadeInViewProps) {
  const opacity = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(10), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [delay, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      {...rest}>
      {children}
    </Animated.View>
  );
}
