import React, { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VibeProvider } from './src/context/VibeContext';
import VibeSlider from './src/components/VibeSlider';
import WelcomeScreen from './src/components/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import PhotoScreen from './src/screens/PhotoScreen';
import { COLORS } from './src/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.bg,
    card: COLORS.card,
    text: COLORS.text,
    primary: COLORS.accent,
  },
};

function TabIcon({ name, focused, color }) {
  return (
    <Ionicons name={focused ? name : `${name}-outline`} size={33} color={color} />
  );
}

// The vibe slider renders as part of the tab bar, so it is pinned
// to the bottom and ALWAYS visible on every tab.
function TabBarWithSlider(props) {
  return (
    <View>
      <VibeSlider />
      <BottomTabBar {...props} />
    </View>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <SafeAreaProvider>
      <VibeProvider>
        <View style={{ flex: 1 }}>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            tabBar={(props) => <TabBarWithSlider {...props} />}
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: COLORS.card,
                borderTopWidth: 0,
                height: 78,
                paddingTop: 10,
              },
              tabBarActiveTintColor: COLORS.text,
              tabBarInactiveTintColor: COLORS.textDim,
              tabBarLabelStyle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon name="people" focused={focused} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon name="mic" focused={focused} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Photo"
              component={PhotoScreen}
              options={{
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon name="camera" focused={focused} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        {!entered && <WelcomeScreen onDone={() => setEntered(true)} />}
        </View>
      </VibeProvider>
    </SafeAreaProvider>
  );
}
