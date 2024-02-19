import { useEffect, useState } from 'react';

// material-ui
import { Grid } from '@mui/material';

// project imports
import EarningCard from './NewCard';
import EarningCard1 from './RegisteredCard';
import EarningCard2 from './DroppedCard';
import EarningCard3 from './WhatsappCard';
import TotalOrderLineChartCard from './RingNoAwswerCard';
import TotalOrderLineChartCard1 from './EmailCard';
import TotalOrderLineChartCard2 from './NextIntakeCard';
import TotalIncomeDarkCard from './MeetingCard';
import TotalIncomeDarkCard1 from './DuplicateCard';
import TotalIncomeLightCard from './FakeCard';
import TotalIncomeLightCard1 from './CourseDetailCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import { gridSpacing } from 'store/constant';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import io from 'socket.io-client';
import Bumps from './Bumps';
import { CircularProgress } from '@mui/material';
import EarningIcon from 'assets/images/icons/undraw_statistic_chart_re_w0pk.svg';



// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const socket = io();
  const { user } = useAuthContext();
  const [isLoading, setLoading] = useState(true);
  const { permissions } = user || {};
  const { userType } = user || {};

  

  const [cardData, setCardData] = useState();

  //fetch course details

 

  async function fetchStatusDetails() {
    try {
      const response = await fetch(config.apiUrl + 'api/followupsdate', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const getdata = await response.json();
      console.log(getdata);
      setCardData(getdata);
      // setIsTrue(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  async function fetchCardDetails(usertype) {
    try {
      const response = await fetch(config.apiUrl + `api/statusCount?user_id=${user._id}&user_type=${usertype}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const getdata = await response.json();
      setCardData(getdata);
      // setIsTrue(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  useEffect(() => {
    if (user) {
      console.log("user type", userType.name);
      socket.on('notification', (message) => {
        console.log('Received notification:', message);
      });
      if (permissions?.lead?.includes('read-all')) {
        fetchStatusDetails().then(() => setLoading(false));
      } else if (permissions?.lead?.includes('read') && userType?.name === 'counselor') {
        fetchCardDetails(userType.name).then(() => setLoading(false));
      } else if (permissions?.lead?.includes('read') && userType?.name === 'user') {
        fetchCardDetails(userType.name).then(() => setLoading(false));
      }
    }
  }, [user]);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
             
                <EarningCard  data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.NewCount} />
              
            </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
          <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeDarkCard data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.meetingCount} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <TotalOrderLineChartCard data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.registeredCount} />

              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
          <TotalIncomeLightCard data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.fakeCount} />

          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard1 data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.registeredCount} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
          <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <TotalOrderLineChartCard1 data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.emailCount} />

              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeLightCard1 data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.cousedetailsCount} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
          <TotalIncomeDarkCard1 data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.duplicateCount} />

          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
          <img src={EarningIcon} alt="Notification" />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
          <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <TotalOrderLineChartCard2 data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.nextintakeCount} />

              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <EarningCard3 data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.whatsappCount} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
          <EarningCard2 data={isLoading ? (<CircularProgress color="inherit"  />) : cardData?.droppedCount} />

          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} md={7}>
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Bumps isLoading={isLoading} />
          </Grid>
         
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
