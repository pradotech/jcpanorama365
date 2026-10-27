import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NewsProvider } from './context/NewsContext';
import { AuthProvider } from './context/AuthContext';
import { ColumnistsProvider } from './context/ColumnistsContext';

import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import ColumnistsPage from './pages/ColumnistsPage';
import ColumnistDetailPage from './pages/ColumnistDetailPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNews from './pages/admin/AdminNews';
import AdminNewsForm from './pages/admin/AdminNewsForm';
import AdminColumnists from './pages/admin/AdminColumnists';
import AdminEditions from './pages/admin/AdminEditions';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  return (
    <AuthProvider>
      <ColumnistsProvider>
        <NewsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/categoria/:slug" element={<CategoryPage />} />
                <Route path="/noticia/:slug" element={<ArticlePage />} />
                <Route path="/busca" element={<SearchPage />} />
                <Route path="/colunistas" element={<ColumnistsPage />} />
                <Route path="/colunista/:id" element={<ColumnistDetailPage />} />
                <Route path="/colunistas/:id" element={<ColumnistDetailPage />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="noticias" element={<AdminNews />} />
                <Route path="noticias/nova" element={<AdminNewsForm />} />
                <Route path="noticias/editar/:id" element={<AdminNewsForm />} />
                <Route path="colunistas" element={<AdminColumnists />} />
                <Route path="edicoes" element={<AdminEditions />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NewsProvider>
      </ColumnistsProvider>
    </AuthProvider>
  );
}

export default App;
