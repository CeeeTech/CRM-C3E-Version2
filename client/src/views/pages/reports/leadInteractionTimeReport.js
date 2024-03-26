import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import config from '../../../config';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// third-party
import ApexCharts from 'apexcharts';
import LineChart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { useAuthContext } from '../../../context/useAuthContext';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// ==============================|| Lead Interaction - LINE CHART ||============================== //

const LeadInteraction = () => {
  const { user } = useAuthContext();
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

  const [leadsData, setLeadsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  //  frech leads details

  useEffect(() => {
    // ...

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(config.apiUrl + 'api/allfollowupcount', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        console.log(response);
        const followupCount = await response.json();

        setLeadsData(followupCount); // Update state with total counts array

        if (searchTerm) {
          const response = await fetch(`${config.apiUrl}api/followupcount/${searchTerm}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${user.token}` }
          });
          console.log(response);
          const followupCount = await response.json();

          setLeadsData(followupCount); // Update state with total counts array
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
  }, [user, searchTerm]);

  console.log(leadsData);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

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
        categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        title: {
          text: 'Follow ups'
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

    // do not load chart when loading

    ApexCharts.exec(`line-chart`, 'updateOptions', newChartData);
  }, [navType, primary200, primaryDark, secondaryMain, secondaryLight, primary, grey200, grey500]);

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard title="Leads Interaction Time">
          <Typography variant="body2" color="text.secondary">
            The Leads Interaction Time chart illustrates the frequency of follow-ups made over weeks for various lead reference numbers.
            Each line on the chart represents the follow-up count for a specific lead reference number over four weeks.
          </Typography>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Grid item xs={12} sm={12}>
                    <Typography variant="h5" component="h5">
                      Lead Reference No
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="lead Ref No"
                      type="text"
                      SelectProps={{ native: true }}
                      defaultValue=""
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                      onChange={handleSearch} // Call handleSearch on input change
                    />
                  </Grid>
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
                      '11th week'
                    ],
                    title: {
                      text: 'Weeks',
                      offsetY: 95 // Adjust top padding here
                    }
                  },
                  yaxis: {
                    type: 'category',
                    categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    title: {
                      text: 'Follow ups'
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
                      leadsData?.Week1,
                      leadsData?.Week2,
                      leadsData?.Week3,
                      leadsData?.Week4,
                      leadsData?.Week5,
                      leadsData?.Week6,
                      leadsData?.Week7,
                      leadsData?.Week8,
                      leadsData?.Week9,
                      leadsData?.Week10,
                      leadsData?.Week11
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

LeadInteraction.propTypes = {
  isLoading: PropTypes.bool
};

export default LeadInteraction;
