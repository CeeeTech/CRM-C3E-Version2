import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import EarningCard from './NewCard';
import TotalIncomeDarkCard from './MeetingCard';
import TotalOrderLineChartCard from './RingNoAwswerCard';
import TotalIncomeLightCard from './FakeCard';
import TotalIncomeDarkCard1 from './DuplicateCard';
import TotalOrderLineChartCard1 from './EmailCard';
import TotalIncomeLightCard1 from './CourseDetailCard';
import TotalOrderLineChartCard2 from './NextIntakeCard';
import EarningCard1 from './RegisteredCard';
import EarningCard2 from './DroppedCard';
import EarningCard3 from './WhatsappCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import { gridSpacing } from 'store/constant';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import io from 'socket.io-client';
import Bumps from './Bumps';

const Dashboard = () => {
  const socket = io();
  const { user } = useAuthContext();
  const [isLoading, setLoading] = useState(true);
  const { permissions } = user || {};
  const { userType } = user || {};
  const [cardData, setCardData] = useState();
  const [counsellors, setCounsellors] = useState();

  useEffect(() => {
    if (user) {
      console.log('user type', userType.name);
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

  async function fetchStatusDetails() {
    try {
      const response = await fetch(config.apiUrl + 'api/followupsdate', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const getdata = await response.json();
      console.log(getdata);
      setCardData(getdata);
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
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }
  //fetching Counsellor data
  async function fetchCounselorData() {
    try {
      const response = await fetch(config.apiUrl + 'api/leads-details', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      console.log('counsellor data', data);

      // Filter data where status_id is "Registered"
      const registeredCounsellors = data.filter((counsellor) => counsellor.status_id && counsellor.status_id.name === 'Registered');

      // Group leads by counsellor_id
      const groupedLeads = registeredCounsellors.reduce((acc, lead) => {
        if (!acc[lead.counsellor_id]) {
          acc[lead.counsellor_id] = [];
        }
        acc[lead.counsellor_id].push(lead);
        return acc;
      }, {});

      // Convert object to array of entries, sort, and slice the top 5
      const top5Groups = Object.entries(groupedLeads)
        .sort((a, b) => b[1].length - a[1].length) // Sort by number of leads
        .slice(0, 5); // Slice the first 5 elements

      // Get counselor names from leads, ordered by the most counselor_id
      const counselorNames = top5Groups.map(([, leads]) => {
        const counselorName = leads[0]?.assignment_id?.counsellor_id?.name || ''; // Get counselor name from the first lead in the group
        return counselorName;
      });

      // Set the counselor names
      setCounsellors(counselorNames);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  useEffect(() => {
    fetchCounselorData();
  }, []);

  console.log('counsellors', counsellors);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} data={cardData?.NewCount} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalOrderLineChartCard isLoading={isLoading} data={cardData?.ringNoAnswerCount} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeDarkCard isLoading={isLoading} data={cardData?.meetingCount} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <TotalIncomeLightCard isLoading={isLoading} data={cardData?.fakeCount} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard1
              isLoading={isLoading}
              data={cardData?.registeredCount}
              Coun_data={<ul>{counsellors && counsellors.map((counsellor, index) => <li key={index}>{counsellor}</li>)}</ul>}
            />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <EarningCard3 isLoading={isLoading} data={cardData?.whatsappCount} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalOrderLineChartCard1 isLoading={isLoading} data={cardData?.emailCount} />
              </Grid>

              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeLightCard1 isLoading={isLoading} data={cardData?.cousedetailsCount} />
              </Grid>

              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalOrderLineChartCard2 isLoading={isLoading} data={cardData?.nextintakeCount} />
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
