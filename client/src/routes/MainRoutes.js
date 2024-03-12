import { lazy } from 'react';


// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));
const LeadFrom = Loadable(lazy(() => import('views/pages/leads/leadForm')));
const ViewLeads = Loadable(lazy(() => import('views/pages/leads/viewLeads')));
const ViewReferral = Loadable(lazy(() => import('views/pages/referral/viewReferral')));
const CourseForm = Loadable(lazy(() => import('views/pages/courses/courseForm')));
const ViewCourses = Loadable(lazy(() => import('views/pages/courses/viewCourses')));
const UserForm = Loadable(lazy(() => import('views/pages/users/userForm')));
const ViewUsers = Loadable(lazy(() => import('views/pages/users/viewUsers')));


// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-typography',
          element: <UtilsTypography />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-color',
          element: <UtilsColor />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-shadow',
          element: <UtilsShadow />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'tabler-icons',
          element: <UtilsTablerIcons />
        }
      ]
    },
    
    {
      path: 'icons',
      children: [
        {
          path: 'material-icons',
          element: <UtilsMaterialIcons />
        }
      ]
    },
    
    {
      path: 'sample-page',
      element: <SamplePage />
    },

    {
      path: 'leads',
      children: [
        {
          path: 'add',
          element: <LeadFrom />
        }
      ]
    },
    {
      path: 'leads',
      children: [
        {
          path: 'view',
          element: <ViewLeads />
        }
      ]
    },
    {
      path: 'referral',
      children: [
        {
          path: 'view',
          element: <ViewReferral/>
        }
      ]
    },
    {
      path: 'courses',
      children: [
        {
          path: 'add',
          element: <CourseForm />
        }
      ]
    },
    {
      path: 'courses',
      children: [
        {
          path: 'view',
          element: <ViewCourses />
        }
      ]
    },
    {
      path: 'users',
      children: [
        {
          path: 'add',
          element: <UserForm />
        }
      ]
    },
    {
      path: 'users',
      children: [
        {
          path: 'view',
          element: <ViewUsers />
        }
      ]
    },

  ]
};

export default MainRoutes;
