import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import HomeLayout from "../layout/HomeLayout";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import AnnotationPage from "../pages/AnnotationPage";
import TasksPage from "../pages/TasksPage";

const AppRouter: React.FC = () => {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" />}
        />

        {/* HOME */}
        <Route
          path="/"
          element={
              <HomeLayout>
                <HomePage />
              </HomeLayout>
          }
        />

        <Route
          path="/projects"
          element={
            <HomeLayout>
              <ProjectsPage/>
            </HomeLayout>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <HomeLayout>
              <ProjectDetailPage/>
            </HomeLayout>
          }
        />
        <Route
          path="/annotate"
          element={
            <HomeLayout>
              <AnnotationPage />
            </HomeLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <HomeLayout>
              <TasksPage />
            </HomeLayout>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
