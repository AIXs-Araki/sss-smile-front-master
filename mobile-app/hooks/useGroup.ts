import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
export const STORAGE_KEY = '@selectedGroup';

export const useGroup = () => {
  const [defaultGroup, setDefaultGroup] = useState<number | null>(null);

  // Load saved group on mount
  useEffect(() => {
    const loadGroup = async () => {
      try {
        const savedGroup = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedGroup !== null) {
          setDefaultGroup(Number(savedGroup));
        }
      } catch (e) {
        console.error('Failed to load group.', e);
      }
    };
    loadGroup();
  }, []);

  return {
    defaultGroup, setDefaultGroup
  }
}