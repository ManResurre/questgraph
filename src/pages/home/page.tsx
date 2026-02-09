import "../../globals.css";
import { Card, CardContent, Typography, Container, Box } from "@mui/material";
import Registration from "@/components/auth/registration.tsx";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db.ts";

export default function Home() {
  const user = useLiveQuery(() => db.user.orderBy("id").first());

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Card variant="outlined" sx={{ background: "transparent", border: "none", boxShadow: "none", width: "100%" }}>
          <CardContent>
            <Box textAlign="center" mb={4}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to Questgraph
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Create, explore, and share interactive quests
              </Typography>
            </Box>
            
            {!user && (
              <Box mt={4} textAlign="center">
                <Typography variant="h6" paragraph>
                  Sign up to get started
                </Typography>
                <Registration />
              </Box>
            )}
            
            {user && (
              <Box mt={4} textAlign="center">
                <Typography variant="h6" paragraph>
                  Ready to create your first quest?
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}