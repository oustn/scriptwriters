import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Link,
  IconButton,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Task } from "./api/metadata.js";
import { getUIRedirectUrl } from "./common/helper.js";

interface RewritePanelProps {
  task: Task;
}

export function TaskPanel({ task }: RewritePanelProps) {
  const handleAdd = (task: Task) => {
    const url = getUIRedirectUrl([task.gallery], 'task');
    window.open(url, "_blank");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{ p: 1, flex: 0, borderRadius: 2, bgcolor: "grey.100" }}
        onClick={() => handleAdd(task)}
      >
        <Typography variant="h4">{task.name}</Typography>
        <Typography variant="overline">{task.description}</Typography>
        <Typography variant="caption" display="block">点击添加到 Quantumult X</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <List>
          {task.tasks.map((taskItem, i) => {
            const first = i === 0;
            const last = i === task.tasks.length - 1;
            const borderRadius = {
              borderTopLeftRadius: first ? 8 : 0,
              borderTopRightRadius: first ? 8 : 0,
              borderBottomLeftRadius: last ? 8 : 0,
              borderBottomRightRadius: last ? 8 : 0,
            };
            return (
              <ListItem
                key={taskItem.resource}
                sx={{
                  bgcolor: "grey.100",
                  mb: 0.25,
                  ...borderRadius,
                }}
                secondaryAction={
                  <Link
                    href={taskItem.resource}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconButton edge="end" aria-label="comments">
                      <OpenInNewIcon />
                    </IconButton>
                  </Link>
                }
              >
                <ListItemAvatar>
                  <Avatar src={taskItem.icon} />
                </ListItemAvatar>
                <ListItemText
                  primary={taskItem.title || taskItem.tag}
                  secondary={taskItem.description}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
