import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Registrar o componente principal para web
AppRegistry.registerComponent(appName, () => App);

// Para web, iniciar a aplicação
if (typeof document !== 'undefined') {
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}
