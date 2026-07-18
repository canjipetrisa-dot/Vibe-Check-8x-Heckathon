import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VibeProvider } from './src/context/VibeContext';
import VibeSlider from './src/components/VibeSlider';
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

function TabIcon({ label, focused }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{label}</Text>
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
  return (
    <SafeAreaProvider>
      <VibeProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            tabBar={(props) => <TabBarWithSlider {...props} />}
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: COLORS.card,
                borderTopWidth: 0,
                height: 62,
                paddingTop: 6,
              },
              tabBarActiveTintColor: COLORS.accent,
              tabBarInactiveTintColor: COLORS.textDim,
              tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarIcon: ({ focused }) => (
                  <TabIcon label="✨" focused={focused} />
                ),
              }}
            />
            <Tab.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                tabBarIcon: ({ focused }) => (
                  <TabIcon label="🎙️" focused={focused} />
                ),
              }}
            />
            <Tab.Screen
              name="Photo"
              component={PhotoScreen}
              options={{
                tabBarIcon: ({ focused }) => (
                  <TabIcon label="📸" focused={focused} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </VibeProvider>
    </SafeAreaProvider>
  );
}
