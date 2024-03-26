import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuthContext } from '../../../context/useAuthContext';
import config from '../../../config';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, TextField, InputAdornment } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';

// third-party
import ApexCharts from 'apexcharts';
import LineChart from 'react-apexcharts';

// project imports

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// ==============================|| Lead Interaction -  LINE CHART ||============================== //

const AverageLead = () => {
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);

  const { navType } = customization;
  const { primary } = theme.palette.text;
  const grey200 = theme.palette.grey[200];
  const grey500 = theme.palette.grey[500];

  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.primary.dark;
  const secondaryMain = theme.palette.secondary.main;
  const secondaryLight = theme.palette.secondary.light;

  // const [leadData, setLeadData] = useState([]);
  //const [leadsCountByMonth] = useState({});

  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  useEffect(() => {
    const newChartData = {
      colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      xaxis: {
        type: 'category',
        categories: ['1st week', '2nd week', '3rd week', '4th week'],
        title: {
          text: 'Weeks'
        }
      },
      yaxis: {
        type: 'category',
        categories: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        title: {
          text: 'Registered leads'
        }
      },
      grid: {
        borderColor: grey200
      },
      tooltip: {
        theme: 'light'
      },
      legend: {
        labels: {
          colors: grey500
        }
      }
    };

    ApexCharts.exec(`line-chart`, 'updateOptions', newChartData);
  }, [navType, primary200, primaryDark, secondaryMain, secondaryLight, primary, grey200, grey500]);

  const { user } = useAuthContext();
  const [leadsData, setLeadsData] = useState([]);
  const [regCount, setRegCount] = useState([]);

  useEffect(() => {
    const fetchCounsellorsAndRegCount = async () => {
      try {
        setIsLoading(true);
        // Fetch counsellors
        const counsellorsResponse = await fetch(config.apiUrl + 'api/getCounsellors', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const counsellorsData = await counsellorsResponse.json();
        setLeadsData(counsellorsData);

        const regCountResponse = await fetch(config.apiUrl + 'api/allreleadsbyweek', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const regCountData = await regCountResponse.json();
        setRegCount(regCountData);

        // Fetch registered lead count based on selected counsellor_id
        if (selectedStatus) {
          const regCountResponse = await fetch(`${config.apiUrl}api/releadsbyweek/${selectedStatus}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const regCountData = await regCountResponse.json();
          setRegCount(regCountData);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching data:', error.message);
      }
    };

    if (user) {
      fetchCounsellorsAndRegCount();
    }
  }, [user, selectedStatus]);

  console.log(leadsData);
  console.log(regCount);

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard title="Average Lead Conversion Time">
          <Typography variant="body2" color="text.secondary">
            The Average Lead Conversion Time chart visualizes the average time taken to convert leads over a period, segmented by weeks. It
            provides insights into the efficiency of lead conversion processes, allowing for analysis and optimization of lead management
            strategies.
          </Typography>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item xs={8} sm={3}>
                  <Typography variant="h5" component="h5">
                    Counsellor
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="status"
                    select
                    SelectProps={{ native: true }}
                    value={selectedStatus}
                    onChange={(event) => {
                      setSelectedStatus(event.target.value); // Update selectedStatus with the value of the selected option
                      sortStatus(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimelineIcon />
                        </InputAdornment>
                      )
                    }}
                  >
                    <option value="" disabled>
                      Select Counsellor
                    </option>
                    {leadsData.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {' '}
                        {/* Use lead.id as the value */}
                        {lead.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <LineChart
                height={480}
                type="line"
                options={{
                  chart: {
                    id: 'line-chart',
                    stacked: true,
                    toolbar: {
                      show: true
                    },
                    zoom: {
                      enabled: true
                    }
                  },
                  responsive: [
                    {
                      breakpoint: 480,
                      options: {
                        legend: {
                          position: 'bottom',
                          offsetX: -10,
                          offsetY: 0
                        }
                      }
                    }
                  ],
                  xaxis: {
                    type: 'category',
                    categories: [
                      '1st week',
                      '2nd week',
                      '3rd week',
                      '4th week',
                      '5th week',
                      '6th week',
                      '7th week',
                      '8th week',
                      '9th week',
                      '10th week',
                      '11th week',
                      '12th week'
                    ],
                    title: {
                      text: 'Weeks',
                      offsetY: 95 // Adjust top padding here
                    }
                  },
                  yaxis: {
                    type: 'category',
                    categories: [10, 20, 30, 40, 50, 60, 70, 80, 100],
                    title: {
                      text: 'Registered leads'
                    }
                  },
                  legend: {
                    show: true,
                    fontSize: '14px',
                    fontFamily: `'Roboto', sans-serif`,
                    position: 'bottom',
                    offsetX: 20,
                    labels: {
                      useSeriesColors: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  grid: {
                    show: true
                  }
                }}
                series={[
                  {
                    data: [
                      regCount?.Week1,
                      regCount?.Week2,
                      regCount?.Week3,
                      regCount?.Week4,
                      regCount?.Week5,
                      regCount?.Week6,
                      regCount?.Week7,
                      regCount?.Week8,
                      regCount?.Week9,
                      regCount?.Week10,
                      regCount?.Week11,
                      regCount?.Week12
                    ]
                  }
                ]}
              />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

AverageLead.propTypes = {
  isLoading: PropTypes.bool
};

export default AverageLead;
