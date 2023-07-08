import React from "react";
import { Icon } from "./api/metadata";
import { Box, ImageList, Typography, ImageListItem } from "@mui/material";
import { getUIRedirectUrl } from "./common/helper.js";

interface IconPanelProps {
  icon: Icon;
}

export function IconPanel({ icon }: IconPanelProps) {
  const handleAdd = () => {
    const url = getUIRedirectUrl([icon.gallery], 'icon');
    window.open(url, "_blank");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{ p: 1, flex: 0, borderRadius: 2, bgcolor: "grey.100" }}
        onClick={() => handleAdd()}
      >
        <Typography variant="h4">{icon.name}</Typography>
        <Typography variant="overline">{icon.description}</Typography>
        <Typography variant="caption" display="block">点击添加到 Quantumult X</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <ImageList cols={4} gap={16}>
          {icon.icons.map((item) => (
            <ImageListItem key={item.resource}>
              <img
                src={`${item.resource}?w=144&h=144&fit=crop&auto=format`}
                srcSet={`${item.resource}?w=144&h=144&fit=crop&auto=format&dpr=2 2x`}
                alt={item.name}
                loading="lazy"
              />
              <Typography variant="caption" align="center">
                {item.name}
              </Typography>
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    </Box>
  );
}
