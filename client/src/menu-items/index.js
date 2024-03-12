// menu-items/index.js

import dashboard from './dashboard';
import pages from './pages';
import pagesUser from './pages-user';
import pagesCounselor from './pages-counselor';
import utilities from './utilities';
import { useAuthContext } from 'context/useAuthContext';

// ==============================|| MENU ITEMS ||============================== //

const MenuItems = () => {
  const { user } = useAuthContext();
  const userType = user?.userType?.name;

  let userSpecificPages;

  if (userType === 'admin' || userType === 'sup_admin' || userType === 'admin_counselor') {
    userSpecificPages = [dashboard, pages, utilities];
  } else if (userType === 'user') {
    userSpecificPages = [dashboard, pagesUser, utilities];
  } else if (userType === 'counselor') {
    userSpecificPages = [dashboard, pagesCounselor, utilities];
  }

  const menuItems = {
    items: userSpecificPages,
  };

  return menuItems;
};

export default MenuItems;
