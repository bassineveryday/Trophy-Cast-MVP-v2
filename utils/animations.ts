import { Animated } from 'react-native';

/**
 * Fade in animation
 * @param animatedValue - Animated.Value to animate
 * @param duration - Animation duration in ms (default: 300)
 */
export const fadeIn = (animatedValue: Animated.Value, duration = 300) => {
  Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  }).start();
};

/**
 * Fade out animation
 * @param animatedValue - Animated.Value to animate
 * @param duration - Animation duration in ms (default: 300)
 */
export const fadeOut = (animatedValue: Animated.Value, duration = 300) => {
  Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  }).start();
};

/**
 * Slide up animation
 * @param animatedValue - Animated.Value to animate
 * @param duration - Animation duration in ms (default: 400)
 */
export const slideUp = (animatedValue: Animated.Value, duration = 400) => {
  Animated.spring(animatedValue, {
    toValue: 0,
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  }).start();
};

/**
 * Scale animation
 * @param animatedValue - Animated.Value to animate
 * @param toValue - Target scale value (default: 1)
 * @param duration - Animation duration in ms (default: 200)
 */
export const scale = (animatedValue: Animated.Value, toValue = 1, duration = 200) => {
  Animated.spring(animatedValue, {
    toValue,
    friction: 5,
    tension: 40,
    useNativeDriver: true,
  }).start();
};

/**
 * Stagger animation for lists
 * @param animations - Array of Animated.Values
 * @param duration - Duration per animation in ms (default: 100)
 * @param delay - Delay between each animation in ms (default: 50)
 */
export const staggerFadeIn = (
  animations: Animated.Value[],
  duration = 100,
  delay = 50
) => {
  const animatedSequence = animations.map((anim, index) =>
    Animated.timing(anim, {
      toValue: 1,
      duration,
      delay: index * delay,
      useNativeDriver: true,
    })
  );

  Animated.parallel(animatedSequence).start();
};

/**
 * Create a fade-in animated style
 * @param animatedValue - Animated.Value
 */
export const createFadeInStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
});

/**
 * Create a slide-up animated style
 * @param animatedValue - Animated.Value
 * @param distance - Distance to slide from (default: 50)
 */
export const createSlideUpStyle = (animatedValue: Animated.Value, distance = 50) => ({
  opacity: animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  }),
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [distance, 0],
      }),
    },
  ],
});

/**
 * Create a scale animated style
 * @param animatedValue - Animated.Value
 */
export const createScaleStyle = (animatedValue: Animated.Value) => ({
  transform: [{ scale: animatedValue }],
});
