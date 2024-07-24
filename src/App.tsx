import React from 'react';
import MetersDataTable from './components/MetersDataTable';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Список счётчиков</h1>
      <MetersDataTable />
    </div>
  );
}

export default App;
