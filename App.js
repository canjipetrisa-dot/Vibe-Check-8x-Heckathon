import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VibeProvider } from './src/context/VibeContext';
import MainScreen from './src/screens/MainScreen';
import WelcomeScreen from './src/components/WelcomeScreen';
import { COLORS } from './src/theme';

export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <SafeAreaProvider>
      <VibeProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
          <StatusBar style="light" />
          <MainScreen />
          {!entered && <WelcomeScreen onDone={() => setEntered(true)} />}
        </View>
      </VibeProvider>
    </SafeAreaProvider>
  );
}
