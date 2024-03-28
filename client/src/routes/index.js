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
const ViewReports = Loadable(lazy(() => import('views/pages/reports/viewReports')));
const LeadStatusAnalysisReport = Loadable(lazy(() => import('views/pages/reports/leadStatusAnalysisReport')));
const LeadConversionRateReport = Loadable(lazy(() => import('views/pages/reports/leadConversionRateReport')));
const LeadInteractionTimeReport = Loadable(lazy(() => import('views/pages/reports/leadInteractionTimeReport')));
const LeadProgressReport = Loadable(lazy(() => import('views/pages/reports/leadProgressReport')));
const LeadModuleInteractionReport = Loadable(lazy(() => import('views/pages/reports/leadModuleInteractionReport')));
const ModuleInteractionReport = Loadable(lazy(() => import('views/pages/reports/moduleInteractionReport')));
const AverageLeadConversionTimeReport = Loadable(lazy(() => import('views/pages/reports/averageLeadConversionTimeReport')));
const ViewReferral = Loadable(lazy(() => import('views/pages/referral/viewReferral')));
// const ProductForm = Loadable(lazy(() => import('views/pages/productGroup/productForm')));
// const UpdateProductForm = Loadable(lazy(() => import('views/pages/productGroup/productForm-update')));
// const ViewProduct = Loadable(lazy(() => import('views/pages/productGroup/viewProduct')));

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

        {/* Referral Section */}
        <Route path="referrals" element={<Outlet />}>
          <Route index element={permissions?.lead?.includes('read-all') ? <ViewReferral /> : <Navigate to="/app/access-denied" replace />} />
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

        {/* Reports Section */}
        <Route path="reports" element={<Outlet />}>
          <Route index element={permissions?.lead?.includes('read-all') ? <ViewReports /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="viewReports"
            element={permissions?.lead?.includes('read-all') ? <ViewReports /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="leadStatusAnalysisReport"
            element={permissions?.lead?.includes('read-all') ? <LeadStatusAnalysisReport /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="leadConversionRateReport"
            element={permissions?.lead?.includes('read-all') ? <LeadConversionRateReport /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="leadInteractionTimeReport"
            element={permissions?.lead?.includes('read-all') ? <LeadInteractionTimeReport /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="leadProgressReport"
            element={permissions?.lead?.includes('read-all') ? <LeadProgressReport /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="leadModuleInteractionReport"
            element={
              permissions?.lead?.includes('read-all') ? <LeadModuleInteractionReport /> : <Navigate to="/app/access-denied" replace />
            }
          />
          <Route
            path="moduleInteractionReport"
            element={permissions?.lead?.includes('read-all') ? <ModuleInteractionReport /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="averageLeadConversionTimeReport"
            element={
              permissions?.lead?.includes('read-all') ? <AverageLeadConversionTimeReport /> : <Navigate to="/app/access-denied" replace />
            }
          />
        </Route>

        {/* Products Section
        <Route path="products" element={<Outlet />}>
          <Route index element={permissions?.course?.includes('create') ? <ViewProduct /> : <Navigate to="/app/access-denied" replace />} />
          <Route path="add" element={permissions?.user?.includes('create') ? <ProductForm /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="update"
            element={permissions?.user?.includes('update') ? <UpdateProductForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route> */}

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
