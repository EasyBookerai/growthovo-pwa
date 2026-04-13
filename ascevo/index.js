import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Register the app
registerRootComponent(App);

// For web, also ensure the app mounts
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  if (rootTag) {
    registerRootComponent(App);
  }
}
