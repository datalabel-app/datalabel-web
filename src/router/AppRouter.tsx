import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
const AppRouter: React.FC = () => {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
