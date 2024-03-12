// assets
import { IconKey,IconAffiliate,IconUsers,IconCertificate } from '@tabler/icons';

// constant
const icons = {
  IconKey,
  IconAffiliate,
  IconUsers,
  IconCertificate
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
        },
      ]
    },
    {
      id: 'referrals',
      title: 'referrals',
      type: 'collapse',
      icon: icons.IconCertificate,
      children: [
        {
          id: 'view-referal',
          title: 'View Referal',
          type: 'item',
          external: true,
          url: '/app/referrals',
          breadcrumbs: false
        },
       
      ]
    },
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
    }

  ]
};

export default pages;
