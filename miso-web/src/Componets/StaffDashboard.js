import {
  Box,
  Grid,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";

import ViewSchedule from "./ViewSchedule";

function StaffDashboard() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        width: "100%",
        height: "100vh",
        backgroundColor: (theme) => theme.palette.background.default,
        boxSizing: "border-box",
      }}
    >
      {/* Main Content Layout */}
      <Box
        sx={{
          flexGrow: 1,
          padding: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* ViewSchedule Component */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={8}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  boxShadow: 3,
                  backgroundColor: "#fff",
                }}
              >
                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  <Typography variant="h5" sx={{ marginBottom: 2 }}>
                    Staff Schedule
                  </Typography>
                  <ViewSchedule />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default StaffDashboard;