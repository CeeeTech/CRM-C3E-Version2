import { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthContext } from '../../../../context/useAuthContext';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Typography
} from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import User1 from 'assets/images/users/man-user-circle-icon.svg';

// assets
import { IconLogout, IconSettings } from '@tabler/icons';
import { useLogout } from '../../../../hooks/useLogout';

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = () => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // const [sdm, setSdm] = useState(true);
  // const [notification, setNotification] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [userTypeName, setUserTypeName] = useState(null);
  const { logout } = useLogout();
  /**
   * anchorRef is used on different componets and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);
  const handleLogout = async (event) => {
    event.preventDefault(); // Prevent default behavior of the anchor tag or button

    try {
      logout(); // Assuming your logout function returns a Promise, make sure it's an async function

      // Other actions after successful logout, e.g., navigating to login page
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle error, e.g., show an error message to the user
    }
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (user) {
      setUserDetails(user);
      if (user.userType?.name === 'sup_admin') {
        setUserTypeName('Super Admin');
      } else if (user.userType?.name === 'admin') {
        setUserTypeName('Admin');
      } else if (user.userType?.name === 'user') {
        setUserTypeName('User');
      } else if (user.userType?.name === 'gen_supervisor') {
        setUserTypeName('General Supervisor');
      } else if (user.userType?.name === 'supervisor') {
        setUserTypeName('Supervisor');
      } else if (user.userType?.name === 'counselor') {
        setUserTypeName('Counsellor');
      } else if (user.userType?.name === 'admin_counselor') {
        setUserTypeName('Admin Counsellor');
      }
    }
  }, [user]);

  const handleListItemClick = (event, index, route = '') => {
    setSelectedIndex(index);
    handleClose(event);

    if (route && route !== '') {
      navigate('/app/profile');
    }
  };
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Chip
        sx={{
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          transition: 'all .2s ease-in-out',
          borderColor: theme.palette.primary.light,
          backgroundColor: theme.palette.primary.light,
          '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.primary.main,
            background: `${theme.palette.primary.main}!important`,
            color: theme.palette.primary.light,
            '& svg': {
              stroke: theme.palette.primary.light
            }
          },
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            src={User1}
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="1.5rem" color={theme.palette.primary.main} />}
        variant="outlined"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 14]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Box sx={{ p: 2 }}>
                    <Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                          {user && userDetails.userName}
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle2">{userTypeName ? userTypeName : ``}</Typography>
                    </Stack>
                  </Box>
                  <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 250px)', overflowX: 'hidden' }}>
                    <Box sx={{ p: 2 }}>
                      <Divider />
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '10px',
                          [theme.breakpoints.down('md')]: {
                            minWidth: '100%'
                          },
                          '& .MuiListItemButton-root': {
                            mt: 0.5
                          }
                        }}
                      >
                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 0}
                          onClick={(event) => handleListItemClick(event, 0, '#')}
                          // href='/create-react-app/src/views/pages/Accounts/Profile.js'
                        >
                          <ListItemIcon>
                            <IconSettings stroke={1.5} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Account Settings</Typography>} />
                        </ListItemButton>
                        <ListItemButton
                          sx={{ borderRadius: `${customization.borderRadius}px` }}
                          selected={selectedIndex === 4}
                          onClick={handleLogout}
                        >
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="1.3rem" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </PerfectScrollbar>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default ProfileSection;
