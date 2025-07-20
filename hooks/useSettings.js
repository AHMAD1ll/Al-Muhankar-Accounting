import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSettings = () => {
  const [settings, setSettings] = useState({
    companyName: 'شركتي',
    companyPhone: '',
    companyAddress: '',
    taxRate: 0,
    currency: 'USD',
    theme: 'light',
    language: 'ar'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('appSettings');
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return { settings, updateSettings };
};

export default useSettings;

