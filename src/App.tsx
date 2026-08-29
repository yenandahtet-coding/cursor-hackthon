import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/components/Login';
import CustomerApp from '@/components/CustomerApp';
import RMDashboard from '@/components/RMDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rm"
          element={
            <ProtectedRoute role="rm">
              <RMDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
