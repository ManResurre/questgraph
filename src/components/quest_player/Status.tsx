import React from "react";
import {
  Box,
  List,
  ListItem,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

interface StatusItem {
  id: number;
  name: string;
  value: string | number;
}

interface StatusProps {
  statusList: StatusItem[];
}

const Status = ({ statusList }: StatusProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status
        </Typography>
        <Box>
          <List>
            {statusList.map((item) => (
              <ListItem key={`status_${item.id}`}>
                <Typography variant="body1">
                  <strong>{item.name}:</strong> {item.value}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(Status);
