import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface AppState {
  xp: number;
  level: number;
  streak: number;
  completedLessons: string[];
  mood: string | null;
}

type AppAction =
  | { type: 'SET_XP'; payload: number }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'SET_LEVEL'; payload: number }
  | { type: 'SET_STREAK'; payload: number }
  | { type: 'ADD_COMPLETED_LESSON'; payload: string }
  | { type: 'SET_MOOD'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  xp: 0,
  level: 1,
  streak: 0,
  completedLessons: [],
  mood: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_XP':
      return { ...state, xp: action.payload };
    case 'ADD_XP':
      return { ...state, xp: state.xp + action.payload };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'SET_STREAK':
      return { ...state, streak: action.payload };
    case 'ADD_COMPLETED_LESSON':
      return {
        ...state,
        completedLessons: [...state.completedLessons, action.payload],
      };
    case 'SET_MOOD':
      return { ...state, mood: action.payload };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    async function loadState() {
      try {
        // Skip AsyncStorage on web for now to avoid errors
        if (Platform.OS === 'web') {
          return;
        }
        const stored = await AsyncStorage.getItem('appState');
        if (stored) {
          dispatch({ type: 'LOAD_STATE', payload: JSON.parse(stored) });
        }
      } catch (error) {
        console.error('Failed to load app state:', error);
      }
    }
    loadState();
  }, []);

  // Persist state to AsyncStorage whenever it changes
  useEffect(() => {
    async function saveState() {
      try {
        // Skip AsyncStorage on web for now to avoid errors
        if (Platform.OS === 'web') {
          return;
        }
        await AsyncStorage.setItem('appState', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save app state:', error);
      }
    }
    saveState();
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
