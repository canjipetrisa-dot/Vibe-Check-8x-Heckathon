import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function LogoHeader({ width = 110 }) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width, height: width * 0.5 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 4,
  },
});
