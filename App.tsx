import React from 'react';
import KanbanBoard from './components/KanbanBoard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-100">Adevx Consultants</h1>
        </div>
      </header>
      <main className="p-2 sm:p-6 lg:p-8">
        <KanbanBoard />
      </main>
    </div>
  );
};

export default App;