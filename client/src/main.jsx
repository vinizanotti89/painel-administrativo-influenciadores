import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


console.log('Main.jsx executando');
const root = document.getElementById('root');
console.log('Root element:', root);


try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element não encontrado');
  }
  
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Erro ao inicializar a aplicação:', error);
}