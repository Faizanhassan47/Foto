import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PhotoDetailsPage } from './pages/PhotoDetailsPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { UploadPage } from './pages/UploadPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'search',
        element: <SearchPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'photos/:photoId',
        element: <PhotoDetailsPage />
      },
      {
        element: <ProtectedRoute allowedRoles={['creator']} />,
        children: [
          {
            path: 'upload',
            element: <UploadPage />
          }
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
