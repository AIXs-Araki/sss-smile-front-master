import { useEffect } from "react";
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from "react-native";

export const useNativationBarWhite = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync('relative')
      NavigationBar.setBackgroundColorAsync('white');
      NavigationBar.setButtonStyleAsync('dark');
    }
  }, []);
}