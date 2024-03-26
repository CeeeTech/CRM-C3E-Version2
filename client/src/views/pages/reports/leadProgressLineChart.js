import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import config from '../../../config';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Typography } from '@mui/material';

// third-party
import ApexCharts from 'apexcharts';
import LineChart from 'react-apexcharts';

// project imports

import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { useAuthContext } from '../../../context/useAuthContext';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// ==============================|| Lead Interaction -  LINE CHART ||============================== //

const LeadProgressChart = () => {
  const { user } = useAuthContext();
  const theme = useTheme();
  const customization = useSelector((state) => state.customization);

  const { navType } = customization;
  const { primary } = theme.palette.text;
  const darkLight = theme.palette.dark.light;
  const grey200 = theme.palette.grey[200];
  const grey500 = theme.palette.grey[500];

  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.primary.dark;
  const secondaryMain = theme.palette.secondary.main;
  const secondaryLight = theme.palette.secondary.light;

  const [leadsData, setLeadsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  //  frech leads details

  useEffect(() => {
    // ...

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(config.apiUrl + 'api/repleads', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const leadsCountByMonth = await response.json();

        setLeadsData(leadsCountByMonth); // Update state with total counts array
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

  useEffect(() => {
    const newChartData = {
      colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      xaxis: {
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary]
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

    // do not load chart when loading

    ApexCharts.exec(`line-chart`, 'updateOptions', newChartData);
  }, [navType, primary200, primaryDark, secondaryMain, secondaryLight, primary, darkLight, grey200, grey500]);

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
                      <Typography variant="subtitle2" style={{ color: 'black', fontWeight: 'bold', fontSize: '16px' }}>
                        Leads Progress
                      </Typography>
                    </Grid>
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
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
                    name: 'last year',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  },
                  {
                    name: 'This year',
                    data: [
                      leadsData?.January,
                      leadsData?.February,
                      leadsData?.March,
                      leadsData?.April,
                      leadsData?.May,
                      leadsData?.June,
                      leadsData?.July,
                      leadsData?.August,
                      leadsData?.September,
                      leadsData?.October,
                      leadsData?.November,
                      leadsData?.December
                    ],
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

LeadProgressChart.propTypes = {
  isLoading: PropTypes.bool
};

export default LeadProgressChart;
