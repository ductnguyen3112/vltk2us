import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios, { AxiosError } from "axios";
import { API_URL } from "./Token";
import { useState } from "react";
import Alert from "@mui/material/Alert";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://webunity.ca/">
        WebUnity
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [register, setRegister] = useState(false);
  const [forgetPass, setForgetPass] = useState(false);

  const openForgetPass = () => {
    setForgetPass((prevState) => !prevState);
  };

  const openRegister = () => {
    setRegister((prevState) => !prevState);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("username");
    const password = data.get("password");
    if (!username || !password) {
      setErrorMessage("Kiểm tra lại thông tin!");
      return; // stop function execution here
    }
    try {
      const response = await axios.post(`${API_URL}api/login`, {
        username,
        password,
      });

      // This block is only entered if the request was successful (status 200)
      if ("token" in response.data) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        window.location.href = "/";
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      // This block is entered for HTTP errors (like 401)
      if (axiosError.response && axiosError.response.status === 401) {
        setErrorMessage("Check Username or Password!");
      } else {
        setErrorMessage("An error occurred!");
      }
    }
  };

  function ForgetPassword() {
    const handleSubmitForget = async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const username = data.get("username");
      const password = data.get("password");
      const secpassword = data.get("secpassword");

      if (!username || !password || !secpassword) {
        setErrorMessage("Kiểm tra lại thông tin!");
        return; // stop function execution here
      }

      try {
        const response = await axios.post(`${API_URL}api/password-reset`, {
          username,
          password,
          secpassword,
        });
        if (response.status === 200) {
          setSuccessMessage("Đổi Mật Khẩu Thành Công");
        }

        // Rest of the code...
      } catch (error) {
        const axiosError = error as AxiosError;
        // This block is entered for HTTP errors (like 401)
        if (axiosError.response && axiosError.response.status === 401) {
          setErrorMessage("Kiểm Tra Lại Thông Tin");
        } else {
          setErrorMessage("Lỗi Nghiêm Trọng, Liên Hệ Nhà Phân Phối!");
        }
      }
    };
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Forget Password
          </Typography>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmitForget}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Tài Khoản"
                  name="username"
                  autoComplete="username"
                  autoFocus
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Mật Khẩu Mới"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="secpassword"
                  label="Mật Khẩu Cấp 2"
                  type="password"
                  id="secpassword"
                  autoComplete="sec-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Xác Nhận Đổi Mật Khẩu
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="#" variant="body2" onClick={openForgetPass}>
                  Đăng Nhập Tài Khoản
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    );
  }

  function SignUp() {
    const handleSubmitRegister = async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const username = data.get("username");
      const password = data.get("password");
      const email = data.get("email");
      const firstname = data.get("firstname");
      const lastname = data.get("lastname");
      const fullname = firstname?.toString() + " " + lastname?.toString();
      const secpassword = data.get("secpassword");

      if (!username || !password || !fullname || !secpassword) {
        setErrorMessage("Kiểm tra lại thông tin!");
        return; // stop function execution here
      }

      try {
        const response = await axios.post(`${API_URL}api/register`, {
          username,
          password,
          email,
          fullname, // Concatenate firstname and lastname with a space
          secpassword,
        });
        if (response.status === 200) {
          setSuccessMessage("Đăng Ký Tài Khoản Thành Công");
        }

        // Rest of the code...
      } catch (error) {
        const axiosError = error as AxiosError;
        // This block is entered for HTTP errors (like 401)
        if (axiosError.response && axiosError.response.status === 401) {
          setErrorMessage("Kiểm Tra Lại Thông Tin");
        } else {
          setErrorMessage("Lỗi Nghiêm Trọng, Liên Hệ Nhà Phân Phối!");
        }
      }
    };

    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmitRegister}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstname"
                  required
                  fullWidth
                  id="firstName"
                  label="Tên"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Họ"
                  name="lastname"
                  autoComplete="family-name"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Tài Khoản"
                  name="username"
                  autoComplete="username"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="secpassword"
                  label="Mật Khẩu Cấp 2"
                  type="password"
                  id="secpassword"
                  autoComplete="sec-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng Kí
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="#" variant="body2" onClick={openRegister}>
                  Đăng Nhập Tài Khoản
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {register ? (
        <Container component="main" maxWidth="xs">
          <SignUp />
        </Container>
      ) : forgetPass ? (
        <Container component="main" maxWidth="xs">
          <ForgetPassword />
        </Container>
      ) : (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Login
            </Typography>

            {successMessage && (
              <Alert severity="success">{successMessage}</Alert>
            )}
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Tài Khoản"
                name="username"
                autoComplete="username"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật Khẩu"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Đăng Nhập
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2" onClick={openForgetPass}>
                    Quên Mật Khẩu?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2" onClick={openRegister}>
                    {"Đăng Kí Tài Khoản"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      )}
    </ThemeProvider>
  );
}
