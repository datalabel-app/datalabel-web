import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import HomeLayout from "../layout/HomeLayout";
import ProjectsPage from "../pages/ProjectsPage";
import TasksPage from "../pages/TasksPage";
import CreateProjectPage from "../pages/CreateProjectPage";
import ProfilePage from "../pages/ProfilePage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import AnnotationPage from "../pages/AnnotationPage";

import PrivateRoute from "./PrivateRoute";
import UserManagementPage from "../pages/UserManagementPage";
import CreateDatasetPage from "../pages/CreateDatasetPage";
import DatasetDetailPage from "../pages/DatasetDetailPage";

const AppRouter: React.FC = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={!token ? <LoginPage /> : <Navigate to="/" />}
        />

        {/* HOME */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomeLayout>
                <HomePage />
              </HomeLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/user-manage"
          element={
            <PrivateRoute>
              <HomeLayout>
                <UserManagementPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />

        {/* PROJECTS */}
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <HomeLayout>
                <ProjectsPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/create"
          element={
            <PrivateRoute>
              <HomeLayout>
                <CreateProjectPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <HomeLayout>
                <ProjectDetailPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />
        {/* DATASET */}
        <Route
          path="/projects/:id/dataset"
          element={
            <PrivateRoute>
              <HomeLayout>
                <CreateDatasetPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/datasets/:datasetId"
          element={
            <PrivateRoute>
              <HomeLayout>
                <DatasetDetailPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />
        
        {/* TASKS */}
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <HomeLayout>
                <TasksPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />

        {/* ANNOTATION */}
        <Route
          path="/annotate"
          element={
            <PrivateRoute>
              <HomeLayout>
                <AnnotationPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <HomeLayout>
                <ProfilePage />
              </HomeLayout>
            </PrivateRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
