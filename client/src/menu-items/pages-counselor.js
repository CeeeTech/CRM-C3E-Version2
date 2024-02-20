// assets
import { IconKey, IconAffiliate, IconUsers, IconCertificate } from '@tabler/icons';

// constant
const icons = {
  IconKey,
  IconAffiliate,
  IconUsers,
  IconCertificate
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pagesCounselor = {
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
        }
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
        }
      ]
    }
  ]
};

export default pagesCounselor;
