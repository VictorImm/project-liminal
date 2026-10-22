import React, { createContext, useContext, useState, useEffect } from 'react';

export type DifficultyLevel = 'explorer' | 'easy' | 'normal' | 'nightmare';

export interface GameSettings {
  enableJumpscares: boolean;
  difficulty: DifficultyLevel;
  masterVolume: number;
  mouseSensitivity: number;
  enableCRTShader: boolean;
  headBobIntensity: number; // 0.0 (Off / Anti-Motion Sickness) to 1.0 (Gentle Translational Bob)
}

interface SettingsContextType {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  enableJumpscares: true,
  difficulty: 'easy', // Default to easy so players can explore peacefully!
  masterVolume: 0.8,
  mouseSensitivity: 1.0,
  enableCRTShader: true,
  headBobIntensity: 0.4, // Default to gentle, anti-motion sickness level
};

const STORAGE_KEY = 'liminal_drift_settings_v2';

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
