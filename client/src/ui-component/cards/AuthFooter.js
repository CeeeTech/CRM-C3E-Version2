// material-ui
import { Link, Typography, Stack } from '@mui/material';

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

const AuthFooter = () => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="subtitle2" color={'white'} component={Link} href="https://sltc.edu.lk" target="_blank" underline="hover">
      SLTC - Research Univercity
    </Typography>
    <Typography variant="subtitle2" color={'white'} component={Link} href="https://c3e.tech/" target="_blank" underline="hover">
      &copy; CEEE Technologies
    </Typography>
  </Stack>
);

export default AuthFooter;
