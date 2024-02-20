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



// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
  const socket = io();
  const { user } = useAuthContext();
  const [isLoading, setLoading] = useState(true);
  const { permissions } = user || {};
  const { userType } = user || {};
  const [cardData, setCardData] = useState();
  const [registeredLeads, setRegisteredLeads] = useState();
  const [counsellors, setCounsellors] = useState();

  
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

  useEffect(() => {
    const fetchRegisteredLeads = async () => {
        try {
            const response = await fetch(config.apiUrl + 'api/leads', {
                method: 'GET',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await response.json();
            // Filter leads with status_id of '65ada308da40b8a3e87bda83'
            const filteredLeads = data.filter(lead => lead.status_id === '65ada308da40b8a3e87bda83');
            // Find lead with highest council_id
            const leadWithHighestCouncilId = filteredLeads.reduce((prevLead, currentLead) => {
                return parseInt(currentLead.council_id) > parseInt(prevLead.council_id) ? currentLead : prevLead;
            }, filteredLeads[0]);
            setRegisteredLeads(leadWithHighestCouncilId);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching registered leads:', error.message);
        }
    };

    if (user) {
        fetchRegisteredLeads();
        socket.on('notification', (message) => {
            console.log('Received notification:', message);
        });
    }
}, [user]);

useEffect(() => {
    const fetchcounselors = async () => {
        try {
            const response = await fetch(config.apiUrl + 'api/getCounsellors', {
                method: 'GET',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await response.json();
            setCounsellors(data);
            setLoading(false);
        }
        catch (error) {
            console.error('Error fetching counselors:', error.message);
        }
    };

    if (user) {
        fetchcounselors();
        socket.on('notification', (message) => {
            console.log('Received notification:', message);
        });
    }
}, [user]);

console.log(registeredLeads);
console.log(counsellors);

// Filter counsellors based on the councilor id from registeredLeads
// const filteredCounsellors = counsellors.filter(counsellor => counsellor.id === registeredLeads.counsellor_id);
// console.log(filteredCounsellors);

  

  async function fetchCardDetails(usertype) {
    try {
      const response = await fetch(config.apiUrl + `api/statusCount?user_id=${user._id}&user_type=${usertype}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const getdata = await response.json();
      setCardData(getdata);
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
             
                <EarningCard  isLoading={isLoading}  data={cardData?.NewCount} />
              
            </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
          <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeDarkCard isLoading={isLoading} data={cardData?.meetingCount} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <TotalOrderLineChartCard  isLoading={isLoading} data={cardData?.registeredCount}  />

              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
          <TotalIncomeLightCard  isLoading={isLoading} data={cardData?.fakeCount} />

          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard1  isLoading={isLoading} data={ cardData?.registeredCount} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
          <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <TotalOrderLineChartCard1  isLoading={isLoading} data={ cardData?.emailCount} />

              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeLightCard1  isLoading={isLoading} data={ cardData?.cousedetailsCount} />
              </Grid>
              
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <EarningCard3  isLoading={isLoading} data={cardData?.whatsappCount} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
              <TotalOrderLineChartCard2  isLoading={isLoading} data={cardData?.nextintakeCount} />
             
            </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
    <div style={{ marginBottom: '27px' }}>
        <TotalIncomeDarkCard1 isLoading={isLoading} data={cardData?.duplicateCount} />
    </div>
    
    <EarningCard2 isLoading={isLoading} data={cardData?.droppedCount} />
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
