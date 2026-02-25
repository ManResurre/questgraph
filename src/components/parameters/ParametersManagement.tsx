import { memo } from "react";
import EditParameter from "@/components/parameters/EditParameter";
import { Box, Divider, Stack } from "@mui/material";
import ParametersList from "@/components/parameters/ParametersList";
import ParameterItem from "@/components/parameters/ParameterItem.tsx";

const ParametersManagement = () => {
  return (
    <Box p={1}>
      <Stack spacing={1}>
        <Divider />
        <EditParameter />
        <Divider />
        <ParametersList renderItem={ParameterItem} />
      </Stack>
    </Box>
  );
};

export default memo(ParametersManagement);
