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

const pagesUser = {
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
      ]
    }

  ]
};

export default pagesUser;
