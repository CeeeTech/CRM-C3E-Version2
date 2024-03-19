import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { useMediaQuery, Typography, TextField, InputAdornment, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import config from '../../../config';
import LinearProgress from '@mui/material/LinearProgress';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';

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

export default function ViewProduct() {
  const [productData, setProductData] = useState([]);
  // const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const { logout } = useLogout();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { permissions } = user || {};

  // Function to handle search
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    // setSearchTerm(term);

    // Filter the productData based on the search term
    const filteredProducts = productData.filter((product) => product.groupname.toLowerCase().includes(term));
    setFilteredData(filteredProducts);
  };

  //fetch product details

  async function fetchProductDetails() {
    try {
      const response = await fetch(config.apiUrl + 'api/products', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }
        if (response.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        }
        return;
      }

      const allProducts = await response.json();

      // Filter products where status is true
      const filteredProducts = allProducts.filter((product) => product.status === true);

      // Apply transformation to each course in filteredCourses
      const formattedData = filteredProducts.map((product) => ({ id: product._id, ...product }));

      setProductData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductDetails();
  }, []);

  console.log(productData);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const columns = [
    { field: 'groupname', headerName: 'Products Group Name', flex: 2, width: 100, minWidth: 150, maxWidth: 200 },

    // { field: 'product_type', headerName: 'products Type', flex: 2.5, width: 100, minWidth: 250 },
    {
      field: 'edit',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      flex: 1,
      width: 100,
      minWidth: 150,
      maxWidth: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              updateProducts(params.row.id);
            }}
            sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px' }}
          >
            <ModeIcon sx={{ fontSize: '18px' }} />
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Handle delete logic here
            }}
            style={{ marginLeft: '5px' }}
            sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px' }}
          >
            <DeleteIcon sx={{ fontSize: '18px' }} />
          </Button>
        </>
      )
    }
  ];

  function updateProducts(productId) {
    console.log('clicked user id', productId);
    navigate('/app/products/update?id=' + productId);
  }

  function handleButtonClick() {
    navigate('/app/products/add');
  }

  return (
    <MainCard
      title="View Products"
      buttonLabel={
        permissions?.lead?.includes('create') ? (
          <>
            Add New Products
            <AddIcon style={{ marginLeft: '5px' }} /> {/* Adjust styling as needed */}
          </>
        ) : undefined
      }
      onButtonClick={handleButtonClick}
    >
      {loading && <LinearProgress style={{ marginBottom: '30px' }} />}
      <Grid style={{ marginTop: '-30px' }} container direction="column" justifyContent="left">
        <Grid container sx={{ p: 3, marginTop: '4px' }} spacing={matchDownSM ? 0 : 2}>
          <Grid item xs={12} sm={3.5}>
            <Typography variant="h6" component="h6" style={{ marginBottom: '-10px' }}>
              Search
            </Typography>
            <TextField
              fullWidth
              // label="First Name"
              margin="normal"
              name="course"
              type="text"
              size="small"
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
            {/* <div style={{ height: 710, width: '100%' }}> */}
            <StripedDataGrid
              rows={filteredData.length > 0 ? filteredData : productData}
              rowHeight={40}
              columns={columns}
              getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 }
                }
              }}
              getRowId={(row) => row.id}
              getRowStyle={(params) => ({
                backgroundColor: params.index % 2 === 0 ? '#fff' : '#f0f8ff'
              })}
              pageSizeOptions={[10, 25, 100]}
              checkboxSelection
            />
            {/* </div> */}
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
}
