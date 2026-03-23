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
import CreateDatasetPage from "../pages/CreateDatasetPage";
import DatasetDetailPage from "../pages/DatasetDetailPage";
import UserManagementPage from "../pages/UserManagementPage";
import ClassificationPage from "../pages/ClassificationPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import ManagerDashboard from "../pages/ManagerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import MyLabelRequests from "../pages/MyLabelRequests";


const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test" element={<MyLabelRequests />} />
        <Route path="/login" element={<LoginPage />} />

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
        <Route
          path="/request-labels"
          element={
            <PrivateRoute>
              <HomeLayout>
                <MyLabelRequests />
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
          path="/dashboard-manager"
          element={
            <PrivateRoute>
              <HomeLayout>
                <ManagerDashboard />
              </HomeLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <HomeLayout>
                <AdminDashboard />
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
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePasswordPage />
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
          path="/classification/:taskId"
          element={
            <PrivateRoute>
              <HomeLayout>
                <ClassificationPage />
              </HomeLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/annotate/:id"
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
