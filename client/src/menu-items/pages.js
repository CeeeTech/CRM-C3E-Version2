// assets
import { IconKey, IconAffiliate, IconUsers, IconCertificate, IconArticle, IconCategory, IconReport } from '@tabler/icons';

// constant
const icons = {
  IconKey,
  IconAffiliate,
  IconUsers,
  IconCertificate,
  IconArticle,
  IconCategory,
  IconReport
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'Tools',
  caption: '',
  type: 'group',
  children: [
    {
      id: 'leads',
      title: 'Leads',
      type: 'collapse',
      icon: icons.IconAffiliate,
      children: [
        {
          id: 'leads-list',
          title: 'View Leads',
          type: 'item',
          external: true,
          url: '/app/leads',
          breadcrumbs: false
        },
        {
          id: 'addLead',
          title: 'Add Lead',
          type: 'item',
          url: '/app/leads/add',
          breadcrumbs: false
        },
        {
          id: 'bulkImport',
          title: 'Bulk Import',
          type: 'item',
          url: '/app/leads/bulk-import',
          breadcrumbs: false
        }
      ]
    },
    // {
    //   id: 'referrals',
    //   title: 'Referrals',
    //   type: 'collapse',
    //   icon: icons.IconArticle,
    //   children: [
    //     {
    //       id: 'view-referal',
    //       title: 'View Referal',
    //       type: 'item',
    //       external: true,
    //       url: '/app/referrals',
    //       breadcrumbs: false
    //     },

    //   ]
    // },
    {
      id: 'courses',
      title: 'Courses',
      type: 'collapse',
      icon: icons.IconCertificate,
      children: [
        {
          id: 'courses-list',
          title: 'View Course',
          type: 'item',
          external: true,
          url: '/app/courses',
          breadcrumbs: false
        },
        {
          id: 'addLead',
          title: 'Add Course',
          type: 'item',
          url: '/app/courses/add',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'users',
      title: 'Users',
      type: 'collapse',
      icon: icons.IconUsers,
      children: [
        {
          id: 'users-list',
          title: 'View User',
          type: 'item',
          external: true,
          url: '/app/users',
          breadcrumbs: false
        },
        {
          id: 'addLead',
          title: 'Add User',
          type: 'item',
          url: '/app/users/add',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      type: 'collapse',
      icon: icons.IconReport,
      children: [
        {
          id: 'view-report',
          title: 'View Report',
          type: 'item',
          external: true,
          url: '/app/reports/viewReports',
          breadcrumbs: false
        },
        {
          id: 'lead-analysis',
          title: 'Lead Status Analysis Report',
          type: 'item',
          url: '/app/reports/leadStatusAnalysisReport',
          breadcrumbs: false
        },
        {
          id: 'lead-conversion',
          title: 'Lead Conversion Rate Report',
          type: 'item',
          url: '/app/reports/leadConversionRateReport',
          breadcrumbs: false
        },
        {
          id: 'lead-interaction',
          title: 'Lead Interaction Time Report',
          type: 'item',
          url: '/app/reports/leadInteractionTimeReport',
          breadcrumbs: false
        },
        {
          id: 'lead-progress',
          title: 'Lead Progress Report',
          type: 'item',
          url: '/app/reports/leadProgressReport',
          breadcrumbs: false
        },
        {
          id: 'lead-module-interaction',
          title: 'Lead Module Interaction Report',
          type: 'item',
          url: '/app/reports/leadModuleInteractionReport',
          breadcrumbs: false
        },
        {
          id: 'module-interaction',
          title: 'Module Interaction Report',
          type: 'item',
          url: '/app/reports/moduleInteractionReport',
          breadcrumbs: false
        },
        {
          id: 'average-lead-interaction',
          title: 'Average Lead Conversion Time Report',
          type: 'item',
          url: '/app/reports/averageLeadConversionTimeReport',
          breadcrumbs: false
        }
      ]
    }

    // {
    //   id: 'products',
    //   title: 'Products',
    //   type: 'collapse',
    //   icon: icons.IconCategory,
    //   children: [
    //     {
    //       id: 'products-list',
    //       title: 'View Products',
    //       type: 'item',
    //       external: true,
    //       url: '/app/products',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'addProduct',
    //       title: 'Add Product',
    //       type: 'item',
    //       url: '/app/products/add',
    //       breadcrumbs: false
    //     }
    //   ]
    // }
  ]
};

export default pages;
