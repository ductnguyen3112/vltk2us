import React, { useState, useEffect } from "react";
import axios from "axios";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { TokenData } from "./Token";
import Mill from "../images/1.png";
import FourH from "../images/2.png";
import TwoH from "../images/3.png";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://webunity.ca/">
        WebUnity
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
const cards = [
  { id: 1, price: "10", image: TwoH },
  { id: 2, price: "20", image: FourH },
  { id: 3, price: "50", image: Mill },
];

function Donation({ username }: { username: string }) {
  interface PaymentData {
    // Define the properties of the data object
    orderID: string;
    facilitatorAccessToken: string;
  }

  
const handlePaymentSuccess = async (data: PaymentData, price: any) => {

  try {
    await axios.post("http://localhost:3333/api/payment", {
      facilitatorAccessToken: data.facilitatorAccessToken,
      orderID: data.orderID,
      username: username,
      coins: price,
    });
    // Handle the successful API call if needed
  } catch (error) {
    console.error("Error:", error);
    // Handle the error if needed
  }
};

  const handlePaymentError = () => {
    console.log("error");
  };

  return (
    <Container sx={{ py: 8 }} maxWidth="md" id="donation-section">
      <Grid container spacing={4}>
        {cards.map((card) => (
          <Grid item key={card.id} xs={12} sm={6} md={4}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography align="center" sx={{ marginTop: "10px" }}>
                Vietin Bank
              </Typography>
              '
              <CardMedia
                component="div"
                sx={{ pt: "56.25%" }}
                image={card.image}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  align="center"
                >
                  {card.price}000 Xu
                </Typography>
                <Typography align="center">
                  Nội Dung CK Tài Khoản khi chuyển tiền mã QR
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <PayPalScriptProvider
                  options={{
                    clientId:
                      "AVNVdiMjntpJC1vll1dSzzXM7PH_GsrY7KKcftavZow8J9FUrIpxAe4J7aVJ_TUQGu5w6yhXU3qJjzgR",
                  }}
                >
                  {/* PayPalButtons component and other components */}
                  <PayPalButtons
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: card.price,
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      await actions?.order?.capture();
                  
                      handlePaymentSuccess(data, card.price); 
                      // Remove the unnecessary object wrapper
                    }}
                    onError={handlePaymentError}
                  />
                </PayPalScriptProvider>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

const Coin = ({ token }: { token: TokenData }) => {
  const [getDonation, setGetDonation] = useState(false);

  const handleDonation = () => {
    setGetDonation((prevState) => !prevState);
  };

  useEffect(() => {
    if (getDonation) {
      const donationSection = document.getElementById("donation-section");
      if (donationSection) {
        donationSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [getDonation]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" color="inherit" noWrap>
            Xin Chào! {token.fullname}
          </Typography>
          <Button variant="outlined" color="inherit" onClick={handleLogout}>
            Thoát
          </Button>
        </Toolbar>
      </AppBar>

      <main>
        <Box sx={{ bgcolor: "background.paper", pt: 8, pb: 6 }}>
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h5"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Thông Tin Tài Khoản
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary">
              Tài Khoản: {token.username}
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary">
              Email: {token.email}
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary">
              Mật Khẩu: ********
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary">
              Mật Khẩu Cấp 2: ********
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained" onClick={handleDonation}>
                Nạp Xu
              </Button>
              <Button variant="outlined">Đổi Mật Khẩu</Button>
            </Stack>
          </Container>
        </Box>
        {getDonation && <Donation username={token.username} />}
      </main>

      <Box sx={{ bgcolor: "background.paper", p: 5 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Võ Lâm 2 US Remake 2023
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Phát Triển Bởi Cộng Đồng Võ Lâm 2 US
        </Typography>
        <Copyright />
      </Box>
    </ThemeProvider>
  );
};

export default Coin;
