import React, { useState } from "react";
import { useFirebase } from "./firebaseContext"; // Import the useFirebase hook
import { createUserWithEmailAndPassword } from "firebase/auth";
import { TextField, Button, Typography, Box, FormControl, FormLabel } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import ColorSelect from '../customizations/ColorSelect';

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { auth } = useFirebase(); // Access auth from FirebaseContext
  const navigate = useNavigate(); // Use useNavigate for navigation

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // SignUp logic
      await createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          alert("Sign-up successful!");
          redirectToLogin(); // Redirect to the login page after successful signup
        })
        .catch((err) => {
          setError("Sign-up failed: " + err.message);
        });
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const redirectToLogin = () => {
    navigate("/"); // Redirect to the login page
  };

  const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
      maxWidth: '450px',
    },
    boxShadow:
      'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
      boxShadow:
        'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
  }));

  const SignUpContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    justifyContent: 'center', // Center the form vertically
    alignItems: 'center', // Center the form horizontally
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(4),
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      zIndex: -1,
      inset: 0,
      backgroundImage:
        'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
      backgroundRepeat: 'no-repeat',
      ...theme.applyStyles('dark', {
        backgroundImage:
          'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
      }),
    },
  }));

  return (
    <SignUpContainer direction="column" justifyContent="space-between">
      <ColorSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Sign Up
        </Typography>
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        <Box
          component="form"
          onSubmit={handleSignUp}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <TextField
              name="confirmPassword"
              placeholder="••••••"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={!email || !password || !confirmPassword}
            sx={{ py: 2 }}
          >
            Sign Up
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="primary"
          align="center"
          sx={{ mt: 2 }}
          onClick={redirectToLogin}
        >
          Already have an account? <span style={{ textDecoration: "underline", cursor: "pointer" }}>Login</span>
        </Typography>
      </Card>
    </SignUpContainer>
  );
}

export default SignUp;
