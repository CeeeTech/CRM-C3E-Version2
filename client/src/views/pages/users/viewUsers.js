import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { useMediaQuery, Typography, TextField, InputAdornment, MenuItem, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';
import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';

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

export default function ViewUsers() {
  const { user } = useAuthContext();
  const { permissions } = user || {};
  const [userTypes, setUserTypes] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const fetchData = async () => {
    try {
      const res = await fetch(config.apiUrl + 'api/users', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }

        if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        }
        return;
      }
      const data = await res.json();
      const formattedData = data.map((item) => ({ id: item._id, ...item }));
      const filteredUsers = formattedData.filter(
        (user) =>
          (!selectedUserType || user.user_type?.name === selectedUserType) &&
          (user.name.toLowerCase().includes(searchText.toLowerCase()) || user.email.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredData(filteredUsers);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user types
    const fetchUserTypes = async () => {
      try {
        const res = await fetch(config.apiUrl + 'api/user_types', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!res.ok) {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          }

          if (res.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          }
          return;
        }
        const data = await res.json();
        setUserTypes(data);
      } catch (error) {
        console.error(error);
        setError(error);
      }
    };

    if (user) {
      fetchUserTypes();
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [selectedUserType, searchText]);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const columns = [
    { field: 'name', headerName: 'User Name', flex:1.5, width: 100, minWidth: 150, },
    { field: 'email', headerName: 'User Email', flex:2, width: 100, minWidth: 150,},
    {
      field: 'user_type.name',
      headerName: 'User Type',
      flex:1,
      width: 100, minWidth: 100,
      valueGetter: (params) => params.row.user_type?.name || ''
    },
    {
      field: 'edit',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      align: 'right',
      flex:0.5,
      width: 100, minWidth: 100,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              updateUser(params.row._id);
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
              handleDelete(params.row._id);
            }}
            style={{ marginLeft: '5px' }}
            sx={{ borderRadius: '50%', padding: '8px', minWidth: 'unset', width: '32px', height: '32px' }}
          >
            {isDeleting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <DeleteIcon sx={{ fontSize: '18px' }} />
              )}
           
          </Button>
        </>
      )
    }
  ];

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser([id]);
      }
    });
  };

  async function deleteUser(id) {
    setIsDeleting(true);
    try {
      const res = await fetch(config.apiUrl + `api/delete-user/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }

        if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        }
        return;
      }
      fetchData();
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setIsDeleting(false);
    }
  }

  function updateUser(userId) {
    console.log('clicked user id', userId);
    navigate('/app/users/update?id=' + userId);
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  function handleButtonClick() {
    navigate('/app/users/add');
  }

  return (
    <>
      <MainCard
        title="View Users"
        buttonLabel={
          permissions?.lead?.includes('create') ? (
            <>
              Add New User
              <AddIcon style={{ marginLeft: '5px' }} /> {/* Adjust styling as needed */}
            </>
          ) : undefined
        }
        onButtonClick={handleButtonClick}
      >
        {loading && <LinearProgress />}
        <Grid container direction="column" justifyContent="center">
          <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
            {/* Search Textfield */}
            <Grid item xs={12} sm={3.5}>
              <Typography variant="h5" component="h5">
                Search
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="search"
                type="text"
                size="small"
                value={searchText}
                onChange={handleSearchChange}
                SelectProps={{ native: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            {/* User Type Select */}
            <Grid item xs={12} sm={3.5}>
              <Typography variant="h5" component="h5">
                User Type
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="userType"
                size="small"
                select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MergeTypeIcon />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="">Select User Type</MenuItem>
                {userTypes.map((userType) => (
                  <MenuItem key={userType._id} value={userType.name}>
                    {userType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* DataGrid */}
            <Grid item xs={12} sm={12}>
              {/* <div style={{ height: 710, width: '100%' }}> */}
                <StripedDataGrid
                  rows={filteredData}
                  rowHeight={40}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 25 }
                    }
                  }}
                  getRowId={(row) => row._id}
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
    </>
  );
}
