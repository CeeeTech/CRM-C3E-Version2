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
          id: 'material-icons',
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
      id: 'courses',
      title: 'Courses',
      type: 'collapse',
      icon: icons.IconCertificate,
      children: [
        {
          id: 'material-icons',
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
          id: 'material-icons',
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
