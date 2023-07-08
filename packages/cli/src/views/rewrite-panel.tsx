import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItem,
  IconButton,
  Link,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { Rewrite, RewriteItem } from "./api/metadata.js";
import { getRedirectUrl } from "./common/helper.js";

interface RewritePanelProps {
  rewrite: Rewrite;
}

export function RewritePanel({ rewrite }: RewritePanelProps) {
  const handleAdd = (rewrite: RewriteItem) => {
    const url = getRedirectUrl({
      rewrite_remote: [
        `${rewrite.resource.replace(".js", ".conf")}, tag=${
          rewrite.title
        }, update-interval=86400, opt-parser=true, enabled=true`,
      ],
    });
    window.open(url);
  };

  const handleAddGallery = (rewrite: Rewrite) => {
    const url = getRedirectUrl({
      rewrite_remote: [
        `${rewrite.gallery}, tag=Scriptwriter 重写, update-interval=86400, opt-parser=true, enabled=true`,
      ],
    });
    window.open(url, "_blank");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{ p: 2, flex: 0, borderRadius: 2, bgcolor: "grey.100" }}
        onClick={() => handleAddGallery(rewrite)}
      >
        <Typography variant="h4">重写列表</Typography>
        <Typography variant="overline">当前重写总数：{rewrite.rewrites.length}</Typography>
        <Typography variant="caption" display="block">点击添加到 Quantumult X</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <List>
          {rewrite.rewrites.map((rewriteItem, i) => {
            const first = i === 0;
            const last = i === rewrite.rewrites.length - 1;
            const borderRadius = {
              borderTopLeftRadius: first ? 8 : 0,
              borderTopRightRadius: first ? 8 : 0,
              borderBottomLeftRadius: last ? 8 : 0,
              borderBottomRightRadius: last ? 8 : 0,
            };
            return (
              <ListItem
                key={rewriteItem.resource}
                sx={{
                  bgcolor: "grey.100",
                  mb: 0.25,
                  ...borderRadius,
                }}
                secondaryAction={
                  <Link
                    href={rewriteItem.resource}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconButton edge="end" aria-label="comments">
                      <OpenInNewIcon />
                    </IconButton>
                  </Link>
                }
                disablePadding
              >
                <ListItemButton onClick={() => handleAdd(rewriteItem)}>
                  <ListItemText
                    primary={rewriteItem.title}
                    secondary={rewriteItem.description}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
