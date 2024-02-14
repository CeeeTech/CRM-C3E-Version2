import { useAuthContext } from '../context/useAuthContext';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Loadable from '../ui-component/Loadable';
import MainLayout from 'layout/MainLayout';
import { lazy } from 'react';

// routes
const AuthLogin = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
const ViewDashboard = Loadable(lazy(() => import('views/dashboard/Default/index')));
const AddLead = Loadable(lazy(() => import('views/pages/leads/leadForm')));
const UpdateLead = Loadable(lazy(() => import('views/pages/leads/leadForm-update')));
const ViewLead = Loadable(lazy(() => import('views/pages/leads/viewLeads')));
const ViewFilteredLead = Loadable(lazy(() => import('views/pages/leads/viewFilteredLeads')));
const AddFollowup = Loadable(lazy(() => import('views/pages/leads/addFollowup')));
const AddCourse = Loadable(lazy(() => import('views/pages/courses/courseForm')));
const UpdateCourse = Loadable(lazy(() => import('views/pages/courses/courseForm-update')));
const ViewCourses = Loadable(lazy(() => import('views/pages/courses/viewCourses')));
const AddUser = Loadable(lazy(() => import('views/pages/users/userForm')));
const UpdateUser = Loadable(lazy(() => import('views/pages/users/userForm-update')));
const ViewUsers = Loadable(lazy(() => import('views/pages/users/viewUsers')));
const AccessDeniedPage = Loadable(lazy(() => import('views/pages/access-denied-page/access-denied')));
const UserForm = Loadable(lazy(() => import('views/pages/account/profile')));
const FBHealth = Loadable(lazy(() => import('views/pages/settings/fbLeadsHealth')));
const PageNotFound = Loadable(lazy(() => import('views/pages/page-not-found/page-not-found')));
const BulkImport = Loadable(lazy(() => import('views/pages/leads/bulkImport')));

export default function ThemeRoutes() {
  const { user } = useAuthContext();
  const { permissions } = user || {};

  return (
    <Routes>
      <Route path="/" element={!user ? <AuthLogin /> : <Navigate to="/app/dashboard" />} />

      <Route path="*" element={<PageNotFound />} />

      <Route path="app" element={user ? <MainLayout /> : <Navigate to="/" />}>
        <Route path="access-denied" element={<AccessDeniedPage />} />
        <Route path="dashboard" element={<ViewDashboard />} />
        <Route path="profile" element={<UserForm />} />

        {/* Leads Section */}
        <Route path="leads" element={<Outlet />}>
          <Route index element={permissions?.lead?.includes('read') ? <ViewLead /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="filtered"
            element={permissions?.lead?.includes('read') ? <ViewFilteredLead /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route path="add" element={permissions?.lead?.includes('create') ? <AddLead /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="addfollowup"
            element={permissions?.lead?.includes('update') ? <AddFollowup /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="bulk-import"
            element={
              permissions?.lead?.includes('create') && permissions?.lead?.includes('read-all') ? (
                <BulkImport />
              ) : (
                <Navigate to="/app/access-denied" replace />
              )
            }
          />
          <Route
            path="update"
            element={permissions?.lead?.includes('update') ? <UpdateLead /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Courses Section */}
        <Route path="courses" element={<Outlet />}>
          <Route index element={permissions?.course?.includes('read') ? <ViewCourses /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.course?.includes('create') ? <AddCourse /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update"
            element={permissions?.course?.includes('update') ? <UpdateCourse /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Users Section */}
        <Route path="users" element={<Outlet />}>
          <Route index element={permissions?.user?.includes('read') ? <ViewUsers /> : <Navigate to="/app/access-denied" replace />} />
          <Route path="add" element={permissions?.user?.includes('create') ? <AddUser /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="update"
            element={permissions?.user?.includes('update') ? <UpdateUser /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        <Route path="settings" element={<Outlet />}>
          <Route
            path="fb-health"
            element={permissions?.user?.includes('read-all') ? <FBHealth /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
