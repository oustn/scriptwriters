import React from "react";
import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import SwipeableViews from "react-swipeable-views";

import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import HomeIcon from "@mui/icons-material/Home";
import ImageIcon from "@mui/icons-material/Image";

import { useMetadata } from "./api/metadata.js";
import { RewritePanel } from "./rewrite-panel.js";
import { TaskPanel } from "./task-panel.js";
import { IconPanel } from "./icon-panel.js";

const { default: SwipeableViewsWrapper } = SwipeableViews as unknown as {
  default: typeof SwipeableViews;
};

declare const TITLE: string;

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
      style={{ height: "var(--content-height)" }}
    >
      {value === index && <Box sx={{ p: 2, height: "100%" }}>{children}</Box>}
    </div>
  );
}

export function App() {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const { data, isLoading, isError } = useMetadata();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "var(--app-height)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <Box
      sx={{ position: "relative", pb: 7, pt: 7, height: "var(--app-height)" }}
    >
      <Paper
        sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: "appBar" }}
        elevation={0}
      >
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {TITLE || "Scriptwriter"}
            </Typography>
          </Toolbar>
        </AppBar>
      </Paper>

      <SwipeableViewsWrapper
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <RewritePanel rewrite={data.rewrite} />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <TaskPanel task={data.task} />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <IconPanel icon={data.icon} />
        </TabPanel>
        <TabPanel value={value} index={3} dir={theme.direction}>
          TODO
        </TabPanel>
      </SwipeableViewsWrapper>

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation showLabels value={value} onChange={handleChange}>
          <BottomNavigationAction label="重写" icon={<RestoreIcon />} />
          <BottomNavigationAction label="任务" icon={<TaskAltIcon />} />
          <BottomNavigationAction label="图标" icon={<ImageIcon />} />
          <BottomNavigationAction label="我的" icon={<FavoriteIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
