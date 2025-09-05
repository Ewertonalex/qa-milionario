import { AppRegistry } from 'react-native';
import App from './App';

// Registrar o app para web
AppRegistry.registerComponent('QA Milionário', () => App);

// Inicializar o app na web
AppRegistry.runApplication('QA Milionário', {
  rootTag: document.getElementById('root')
});
