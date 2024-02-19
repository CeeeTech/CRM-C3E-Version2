import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';
import { useNavigate } from 'react-router-dom';
// assets
import EarningIcon from 'assets/images/icons/phone-hang-up-svgrepo.svg';

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: ' #3f33a3',
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: 'linear-gradient(210.04deg, #6659d9 -50.94%, rgba(144, 202, 249, 0) 83.49%)',
    borderRadius: '50%',
    top: -30,
    right: -180,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140
    }
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: 'linear-gradient(140.9deg, #6659d9 -14.02%, rgba(144, 202, 249, 0) 77.58%)',
    borderRadius: '50%',
    top: -160,
    right: -130
  }
}));

// ==============================|| DASHBOARD - TOTAL INCOME LIGHT CARD ||============================== //

const TotalIncomeLightCard = ({ isLoading, data }) => {
  const theme = useTheme();

  //fetch status details
  const navigate = useNavigate();

  useEffect(() => {
    
  }, []);

  const handleClick = () => {
    navigate('/app/leads/filtered?status=Ring no answer');
  };

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2 }}>
            <List sx={{ py: 0 }}>
              <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                <ListItemAvatar onClick={handleClick}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      ...theme.typography.commonAvatar,
                      ...theme.typography.largeAvatar,
                      backgroundColor: '#574cba',
                      color: theme.palette.warning.dark
                    }}
                  >
                    <img src={EarningIcon} alt="Notification" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    py: 0,
                    mt: 0.45,
                    mb: 0.45
                  }}
                  primary={
                    <Typography variant="h4" style={{ color: 'white' }}>
                      {data}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#fff',
                        mt: 0.5
                      }}
                    >
                        RING NO ANSWER
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

TotalIncomeLightCard.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.number,
};

export default TotalIncomeLightCard;
