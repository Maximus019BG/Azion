import React, { useEffect } from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  withDelay,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Expanding Circle component with gradient color
const ExpandingCircle = ({ scale, color }: { scale: Animated.SharedValue<number>; color: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: scale.value,
    height: scale.value,
    borderRadius: scale.value / 2,
    backgroundColor: interpolateColor(
      color.value,
      [0, 1],
      ['#3d77d4', '#070c14'] // Professional colors: blue to dark blue gradient
    ),
    position: 'absolute',
    top: (height - scale.value) / 2,
    left: (width - scale.value) / 2,
  }));

  return <Animated.View style={[styles.circle, animatedStyle]} />;
};

// Logo component with scaling animation
const Logo = ({ scale, opacity }: { scale: Animated.SharedValue<number>; opacity: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.logoContainer, animatedStyle]}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
    </Animated.View>
  );
};

// Main SplashScreenAnimation component
export function SplashScreenAnimation() {
  const navigation = useNavigation();
  
  // Animation values
  const circleScale = useSharedValue(0);
  const colorValue = useSharedValue(0);

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);

  // Animation for exit transition
  const exitCircleScale = useSharedValue(Math.max(width, height) * 1.5);
  const exitColorValue = useSharedValue(1);

  const exitLogoScale = useSharedValue(1);
  const exitLogoOpacity = useSharedValue(1);

  useEffect(() => {
    // Animate the expanding circle and background color
    circleScale.value = withTiming(Math.max(width, height) * 1.5, {
      duration: 2000, // Duration for circle expansion
      easing: Easing.out(Easing.ease),
    });

    colorValue.value = withTiming(1, {
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
    });

    // Animate logo after the circle effect
    logoScale.value = withDelay(
      1800, // Start logo scaling slightly after circle animation starts
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );

    logoOpacity.value = withDelay(
      1800,
      withTiming(1, { duration: 600 })
    );

    // Exit animations
    exitCircleScale.value = withTiming(0, {
      duration: 1000,
      easing: Easing.in(Easing.ease),
    });

    exitColorValue.value = withTiming(0, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    });

    exitLogoScale.value = withDelay(
      3000, // Delay to ensure logo stays visible before shrinking
      withTiming(0.5, { duration: 600, easing: Easing.out(Easing.ease) })
    );

    exitLogoOpacity.value = withDelay(
      3000,
      withTiming(0, { duration: 600 })
    );

  
  }, [navigation]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      exitColorValue.value,
      [0, 1],
      ['#070c14', '#3d77d4'] // Fade out effect
    ),
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <ExpandingCircle scale={circleScale} color={colorValue} />
      <Logo scale={logoScale} opacity={logoOpacity} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
