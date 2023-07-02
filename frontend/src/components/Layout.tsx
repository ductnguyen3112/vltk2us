import React from 'react';
import { Box, Container, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import Login from './Login';
import Logo from '../logo.svg';

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    align-items: center;
  `
);

function Layout() {
  return (
    <OverviewWrapper>
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" py={1} alignItems="center">
          <img src={Logo} alt="Logo"  style={{ width: '200px', height: '200px' }} />
        </Box>
        <Card sx={{ paddingTop:8, paddingBottom: 10, mb: 10, borderRadius: 8 }}>
          <Login />
        </Card>
      </Container>
    </OverviewWrapper>
  );
}

export default Layout;
