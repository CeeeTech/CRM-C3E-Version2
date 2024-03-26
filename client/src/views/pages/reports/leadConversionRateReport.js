import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import config from '../../../config';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Typography, Button } from '@mui/material';

// third-party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { useAuthContext } from '../../../context/useAuthContext';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// ==============================|| LEAD CONVERSION - BAR CHART ||============================== //

const LeadConversion = () => {
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

  const [showRegisteredData, setShowRegisteredData] = useState(false);

  const [leadsData, setLeadsData] = useState([]);
  const [pendingData, setpendingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  //  frech leads details

  useEffect(() => {
    // ...

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(config.apiUrl + 'api/regSourceCount', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const soureCounts = await response.json();

        setLeadsData(soureCounts); // Update state with total counts array

        const response1 = await fetch(config.apiUrl + 'api/pendSourceCount', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const pendingCounts = await response1.json();

        setpendingData(pendingCounts); // Update state with total counts array
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching leads:', error.message);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  console.log(leadsData);
  console.log(pendingData);

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
  }, [navType, primary200, primaryDark, secondaryMain, secondaryLight, primary, grey200, grey500]);

  const handleToggleRegisteredData = () => {
    setShowRegisteredData(!showRegisteredData);
  };

  const seriesData = showRegisteredData
    ? [
        {
          name: 'Registered',
          data: [leadsData?.Manual, leadsData?.Referral, leadsData?.Facebook, leadsData?.Internal, leadsData?.Bulk_Upload],
          color: primaryDark
        }
      ]
    : [
        {
          name: 'Pending',
          data: [pendingData?.Manual, pendingData?.Referral, pendingData?.Facebook, pendingData?.Internal, pendingData?.Bulk_Upload],
          color: primary200
        }
      ];

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography
                        variant="subtitle2"
                        style={{
                          color: 'black',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      >
                        Leads Conversion Rate
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" onClick={handleToggleRegisteredData}>
                    {showRegisteredData ? 'Show Pending Data' : 'Show Registered Data'}
                  </Button>
                </Grid>
              </Grid>
              <Grid md={9}>
                <Typography variant="body2" sx={{ fontSize: 13 }} color="text.secondary">
                  The chart allows users to compare the conversion rates of leads for different channels, enabling them to identify which
                  channels are most effective in converting leads into registered or pending statuses.
                </Typography>
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
                    categories: ['Manual', 'Referral', 'Facebook', 'Internal', 'Bulk']
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
                series={seriesData}
              />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

LeadConversion.propTypes = {
  isLoading: PropTypes.bool
};

export default LeadConversion;
