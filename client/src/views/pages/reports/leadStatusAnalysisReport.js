import { useEffect, useState } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import ReactApexChart from 'react-apexcharts';
import { useAuthContext } from '../../../context/useAuthContext';
import config from '../../../config';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

const LeadStatusChart = ({ seriesData, categories, barColors, isLoading }) => {
  const options = {
    chart: {
      height: 350,
      type: 'bar'
    },
    colors: barColors,
    plotOptions: {
      bar: {
        columnWidth: '45%',
        distributed: true
      }
    },
    dataLabels: {
      enabled: false
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
    xaxis: {
      type: 'category',
      categories: categories
    },
    grid: {
      show: true
    }
  };

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard>
          <Grid item xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12} md={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Grid container direction="column" spacing={1}>
                      <Grid item>
                        <Typography variant="subtitle2" style={{ color: 'black', fontWeight: 'bold', fontSize: '17px' }}>
                          Leads Status Analysis
                        </Typography>
                        <Grid sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: 13 }} color="text.secondary">
                            This chart offers a comprehensive overview of lead distribution across various statuses and acquisition
                            channels, enabling users to analyze trends, identify patterns, and make informed decisions to optimize lead
                            management strategies.
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <div id="chart">
                  <ReactApexChart options={options} series={seriesData} type="bar" height={480} />
                </div>
              </Grid>
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

LeadStatusChart.propTypes = {
  seriesData: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  barColors: PropTypes.array.isRequired, // Add barColors prop
  isLoading: PropTypes.bool
};

const LeadAnalysis = () => {
  const [cardData, setCardData] = useState();
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const { user } = useAuthContext();

  useEffect(() => {
    async function fetchStatusDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(config.apiUrl + 'api/followupsdate', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const getdata = await response.json();
        setCardData(getdata);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching data:', error.message);
      }
    }

    fetchStatusDetails();

    // Clean-up function (if needed)
    return () => {
      // Perform any clean-up (if needed)
    };
  }, [user]);

  console.log(cardData);
  // Sample series data, categories, and bar colors
  const seriesData = [
    {
      name: 'This year',
      data: [
        cardData?.NewCount,
        cardData?.registeredCount,
        cardData?.nextintakeCount +
          cardData?.ringNoAnswerCount +
          cardData?.cousedetailsCount +
          cardData?.meetingCount +
          cardData?.whatsappCount +
          cardData?.emailCount,
        cardData?.droppedCount,
        cardData?.fakeCount,
        cardData?.duplicateCount
      ]
    }
  ];
  const categories = ['New', 'Registered', 'Pending', 'Dropped', 'Fake', 'Duplicate'];
  const barColors = ['#001d4f', '#508D69', '#FFC300', '#820300', '#c26a4c', '#944E63'];

  return <LeadStatusChart seriesData={seriesData} categories={categories} barColors={barColors} isLoading={isLoading} />;
};

export default LeadAnalysis;
