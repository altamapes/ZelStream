import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Category from './pages/Category';
import Search from './pages/Search';
import Detail from './pages/Detail';

const CategoriesPage: React.FC = () => {
    // A simple page to list all categories if needed, or redirect to home for now
    return <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/search" element={<Search />} />
            <Route path="/detail/:detailPath" element={<Detail />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="bg-black py-8 mt-auto border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p className="mb-2">&copy; {new Date().getFullYear()} ZelStream. All rights reserved.</p>
            <p>Disclaimer: This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;