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
import Chart from 'react-apexcharts';

// project imports

import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// ==============================|| LEAD CONVERSION - BAR CHART ||============================== //

const LeadModule = () => {
  const { user } = useAuthContext();
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);

  const { navType } = customization;
  const { primary } = theme.palette.text;
  const darkLight = theme.palette.dark.light;
  const grey200 = theme.palette.grey[200];
  const grey500 = theme.palette.grey[500];

  const primaryDark = theme.palette.primary.dark;
  const primary200 = theme.palette.primary[200];
  const secondaryMain = theme.palette.secondary.main;
  const secondaryLight = theme.palette.secondary.light;

  const [mInteraction, setMInteraction] = useState([]);
  // const [mInteractionCoun, setmInteractionCoun] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  //  frech leads details

  useEffect(() => {
    // ...

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch counsellors
        const counsellorsResponse = await fetch(config.apiUrl + 'api/getCounsellors', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const counsellorsData = await counsellorsResponse.json();
        setLeadsData(counsellorsData);
        // Fetch moduleinteraction
        const response = await fetch(config.apiUrl + 'api/funcnames', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const moduleInteractionCount = await response.json();

        // Extract total counts into an array
        const totalCountArray = [
          moduleInteractionCount.api_leadswithstudent,
          moduleInteractionCount.api_leads,
          moduleInteractionCount.leads_65c1c22fae426daa177b1bfd,
          moduleInteractionCount.api_followUps
        ];

        setMInteraction(totalCountArray); // Update state with total counts array
        if (selectedStatus) {
          // Fetch moduleinteraction
          const response = await fetch(`${config.apiUrl}api/funcnamesbycounsellor/${selectedStatus}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${user.token}` }
          });

          const moduleInteractionCount = await response.json();

          // Extract total counts into an array
          const totalCountArray = [
            moduleInteractionCount.api_leadswithstudent,
            moduleInteractionCount.api_leads,
            moduleInteractionCount.leads_65c1c22fae426daa177b1bfd,
            moduleInteractionCount.api_followUps
          ];

          setMInteraction(totalCountArray); // Update state with total counts array
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching leads:', error.message);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, selectedStatus]);

  console.log(leadsData);
  console.log(mInteraction);
  // console.log(mInteractionCoun);

  // Define selectedStatus and sortStatus

  const sortStatus = () => {
    // Your sorting logic here
  };

  useEffect(() => {
    const newChartData = {
      colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      xaxis: {
        labels: {
          style: {
            colors: [primary, primary, primary, primary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
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

    ApexCharts.exec(`bar-chart`, 'updateOptions', newChartData);
  }, [navType, primary200, primaryDark, secondaryMain, secondaryLight, primary, darkLight, grey200, grey500]);

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard title="Leads Module Interaction">
          <Typography variant="body2" color="text.secondary">
            The Leads Module Interaction chart visualizes the interaction activities performed by counselors within the lead management
            system. This chart helps track and analyze counselor activities over time, comparing data from the previous year to the current
            year.
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
              <Chart
                height={480}
                type="bar"
                options={{
                  chart: {
                    id: 'bar-chart',
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
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: '50%'
                    }
                  },
                  xaxis: {
                    type: 'category',
                    categories: ['Add new lead with existing student', 'Add new lead with new student', 'Edit lead', 'Followup']
                  },
                  legend: {
                    show: true,
                    fontSize: '14px',
                    fontFamily: `'Roboto', sans-serif`,
                    position: 'bottom',
                    offsetX: 20,
                    labels: {
                      useSeriesColors: false
                    },
                    markers: {
                      width: 16,
                      height: 16,
                      radius: 5
                    },
                    itemMargin: {
                      horizontal: 15,
                      vertical: 8
                    }
                  },
                  fill: {
                    type: 'solid'
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
                    name: 'last year',
                    data: [0, 0, 0, 0]
                  },
                  {
                    name: 'This year',
                    data: Object.values(mInteraction),
                    color: primaryDark
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

LeadModule.propTypes = {
  isLoading: PropTypes.bool
};

export default LeadModule;
