// Zen intro screen: breathing gradient, animated Vibey wordmark.
// Tap anywhere to enter the app.
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function WelcomeScreen({ onDone }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(14)).current;
  const breathe = useRef(new Animated.Value(1)).current;
  const haloPulse = useRef(new Animated.Value(0.35)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 1100, useNativeDriver: true }),
    ]).start();

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.05, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    );
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
        Animated.timing(haloPulse, { toValue: 0.35, duration: 1800, useNativeDriver: true }),
      ])
    );
    breatheLoop.start();
    haloLoop.start();
    return () => {
      breatheLoop.stop();
      haloLoop.stop();
    };
  }, [fadeIn, rise, breathe, haloPulse]);

  const dismiss = () => {
    Animated.timing(fadeOut, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(({ finished }) => finished && onDone());
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: fadeOut }]}>
      <Pressable style={styles.fill} onPress={dismiss}>
        <LinearGradient
          colors={['#0A0A14', '#111C30', '#0D2424']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.bg}
        >
          <Animated.View
            style={[styles.center, { opacity: fadeIn, transform: [{ translateY: rise }, { scale: breathe }] }]}
          >
            <Animated.View style={[styles.halo, { opacity: haloPulse }]} />
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>advice from a friend who gets it</Text>
          </Animated.View>
          <Animated.Text style={[styles.enter, { opacity: fadeIn }]}>
            tap anywhere to begin
          </Animated.Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 10,
    elevation: 10,
  },
  fill: {
    flex: 1,
  },
  bg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(139, 124, 246, 0.16)',
  },
  logo: {
    width: 280,
    height: 140,
  },
  tagline: {
    color: COLORS.textDim,
    fontSize: 15,
    marginTop: 10,
    letterSpacing: 0.4,
  },
  enter: {
    position: 'absolute',
    bottom: 64,
    color: COLORS.textDim,
    fontSize: 13,
    letterSpacing: 0.6,
  },
});
