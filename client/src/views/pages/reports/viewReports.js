import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { useMediaQuery, Typography, TextField, InputAdornment, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Import View Icon
import { useState, useEffect } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
//import { useNavigate } from 'react-router-dom';
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';

const ODD_OPACITY = 0.2;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    '&:hover, &.Mui-hovered': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent'
      }
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity)
        }
      }
    }
  }
}));

export default function ViewReports() {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  //const navigate = useNavigate();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  // Function to handle search
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    // Filter the courseData based on the search term
    const filteredReports = reportData.filter((report) => report.name.toLowerCase().includes(term));
    setFilteredData(filteredReports);
  };

  useEffect(() => {
    // Mock course data fetching
    const ReportData = [
      { id: 1, name: 'Lead Status Analysis Report', description: 'Analyzes the current status of leads.' },
      { id: 2, name: 'Lead Conversion Rate Report', description: 'Tracks the conversion rates of leads.' },
      { id: 3, name: 'Lead Interaction Time Report', description: 'Measures the interaction time with leads.' },
      { id: 4, name: 'Lead Progress Report', description: 'Monitors the progress of leads.' },
      { id: 5, name: 'Lead Module Interaction Report', description: 'Examines interactions of leads with modules.' },
      { id: 6, name: 'Module Interaction Report', description: 'Provides insights into general module interactions.' },
      { id: 7, name: 'Average Lead Conversion Time Report', description: 'Calculates the average time for lead conversion.' }
    ];

    // Simulate API request delay
    const timeout = setTimeout(() => {
      setReportData(ReportData);
      setFilteredData(ReportData);
      setLoading(false);
    }, 1000);

    // Cleanup timeout to prevent memory leaks
    return () => clearTimeout(timeout);
  }, []);

  const columns = [
    { field: 'name', headerName: 'Report Name', flex: 1.5 },
    { field: 'description', headerName: 'Report Description', flex: 3 },
    {
      field: 'view',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          component={Link} // Use Link component from react-router-dom
          to={`/app/reports/${params.row.name.replace(/\s+/g, '')}`} // Construct the link dynamically
          style={{ marginLeft: '5px' }}
          sx={{ borderRadius: '100px', padding: '7px' }}
        >
          <VisibilityIcon /> {/* View icon button */}
        </Button>
      )
    }
  ];

  return (
    <>
      <MainCard title="View Reports">
        {loading && <LinearProgress />}
        <Grid container direction="column" justifyContent="center">
          <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
            <Grid item xs={8} sm={5}>
              <Typography variant="h5" component="h5">
                Search
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="lead Report No"
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
            <Grid item xs={12} sm={12}>
              <div style={{ height: 560, width: '100%' }}>
                <StripedDataGrid
                  rows={filteredData}
                  columns={columns}
                  getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 8 }
                    }
                  }}
                  getRowId={(row) => row.id}
                  getRowStyle={(params) => ({
                    backgroundColor: params.index % 2 === 0 ? '#fff' : '#f0f8ff'
                  })}
                  pageSizeOptions={[8, 10, 15]}
                  checkboxSelection
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
}
