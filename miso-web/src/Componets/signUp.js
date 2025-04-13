import React, { useState } from "react";
import { useFirebase } from "./Context/firebaseContext";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore"; // ADD FIRESTORE
import { TextField, Button, Typography, Box, FormControl, FormLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import ColorSelect from '../customizations/ColorSelect';

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
  justifyContent: 'center',
  alignItems: 'center',
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

function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { auth, db } = useFirebase();  // Make sure you have db (Firestore) from context
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's displayName (optional but good for authentication later)
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification
      await sendEmailVerification(user);

      // Save user info into Firestore
      await setDoc(doc(collection(db, "users"), user.uid), {
        uid: user.uid,
        name: `${firstName} ${lastName}`,
        email: user.email,
        role: "staff", // Default role you can change
        createdAt: new Date(),
      });

      alert("Sign-up successful! Please check your email for a verification link.");
      redirectToLogin();
    } catch (err) {
      setError("Sign-up failed: " + err.message);
    }
  };

  const redirectToLogin = () => {
    navigate("/");
  };

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
          {/* First Name */}
          <FormControl>
            <FormLabel htmlFor="firstName">First Name</FormLabel>
            <TextField
              id="firstName"
              type="text"
              name="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>

          {/* Last Name */}
          <FormControl>
            <FormLabel htmlFor="lastName">Last Name</FormLabel>
            <TextField
              id="lastName"
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={!firstName || !lastName || !email || !password || !confirmPassword}
            sx={{ py: 2 }}
          >
            Sign Up
          </Button>
        </Box>

        {/* Already have an account link */}
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
