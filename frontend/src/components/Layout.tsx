import React, { useEffect, useState } from "react";
import { Box, Container, Card } from "@mui/material";
import { styled } from "@mui/material/styles";
import Login from "./Login";
import Logo from "../logo.svg";
import { validateToken, TokenData } from "./Token";
import Coin from "./Coin";

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    align-items: center;
  `
);

function Layout() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token !== null) {
      validateToken(token)
        .then((response) => {
          setLoggedIn(true);
          setToken(response); // directly set the response object as token state
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  return (
    <OverviewWrapper>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center"  alignItems="center" style={{ marginBottom: '-30px'}}>
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "200px", height: "200px", }}
          />
        </Box>
        {loggedIn ? (
          token ? (
            <Container maxWidth="md">
            <Coin token={token} />
            </Container>
          ) : null // Pass the token as a prop
        ) : (
          <Container maxWidth="sm">
            <Card
              sx={{ paddingTop: 8, paddingBottom: 10, mb: 10, borderRadius: 8 }}
            >
              <Login />
            </Card>
          </Container>
        )}
      </Container>
      <div style={{ margin: "100px" }}>
        {/* Content with space using margin. */}
      </div>
    </OverviewWrapper>
  );
}

export default Layout;
