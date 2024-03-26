import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { gridSpacing } from 'store/constant';
import { useAuthContext } from '../../../context/useAuthContext';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// ==============================|| LEAD CONVERSION - BAR CHART ||============================== //

const ModuleInteraction = () => {
  const { user } = useAuthContext();
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);

  const { navType } = customization;
  const { primary } = theme.palette.text;
  const darkLight = theme.palette.dark.light;
  const grey200 = theme.palette.grey[200];
  const grey500 = theme.palette.grey[500];

  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.info.dark;
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
        const response = await fetch(config.apiUrl + 'api/moduleinteraction', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const moduleInteractionCount = await response.json();

        // Extract total counts into an array
        const totalCountArray = [moduleInteractionCount.courseCount, moduleInteractionCount.userCount, moduleInteractionCount.leadCount];

        setMInteraction(totalCountArray); // Update state with total counts array
        if (selectedStatus) {
          // Fetch moduleinteraction
          const response = await fetch(`${config.apiUrl}api/moduleinteractionbycounsellor/${selectedStatus}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${user.token}` }
          });

          const moduleInteractionCount = await response.json();

          // Extract total counts into an array
          const totalCountArray = [moduleInteractionCount.courseCount, moduleInteractionCount.userCount, moduleInteractionCount.leadCount];

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
            colors: [primary, primary, primary]
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
        <MainCard title="Module Interaction">
          <Typography variant="body2" color="text.secondary">
            The Module Interaction chart illustrates the engagement level with different modules within the system. It displays the
            distribution of interactions across these modules, comparing data from the previous year to the current year. This chart
            provides insights into user behavior and module usage trends over time.
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
                    categories: ['Course Module', 'User Module', 'Leads Module']
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
                    data: [0, 0, 0]
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

ModuleInteraction.propTypes = {
  isLoading: PropTypes.bool
};

export default ModuleInteraction;
