import React from "react";
import { Avatar, Badge, Box, Card, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const InfoCard = ({ title, count, icon, color, onClick, badge, ...rest }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Convert MUI color object to string if needed
  const colorValue = typeof color === 'object' ? (color.main || color[500] || '#1976d2') : (color || '#1976d2');

  // Ensure colorValue is a valid color string
  const safeColorValue = colorValue && typeof colorValue === 'string' ? colorValue : '#1976d2';

  return (
    <Card
        {...(theme.palette.mode === "light" && {
          variant: "elevation",
          elevation: 0,
        })}
        onClick={handleClick}
        {...rest}
        sx={{
          p: 3,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha(safeColorValue, 0.25)}`,
          } : {},
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(to bottom right, ${alpha(safeColorValue, 0.8)}, ${alpha(safeColorValue, 0.18)})`
              : theme.palette.background.paper,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          spacing={2}
        >
          <Box flexGrow={1}>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography
              variant="body1"
              fontWeight="600"
              mt="4px"
            >
              {count}
            </Typography>
          </Box>
          <Badge
            badgeContent={badge || 0}
            color="error"
            invisible={!badge || badge === 0}
            overlap="circular"
          >
            <Avatar
              sx={{
                bgcolor: safeColorValue,
                boxShadow: `0 7px 30px ${alpha(safeColorValue, 0.15)}`,
                width: 40,
                height: 40,
                position: "relative",
                "&::before": {
                  content: `""`,
                  position: "absolute",
                  width: "7px",
                  height: "38px",
                  borderBottomRightRadius: "11px",
                  borderTopRightRadius: "6px",
                  top: "10%",
                  right: "30%",
                  backgroundColor: "rgba(255, 255, 255, 0.135)",
                  transform: "rotate(35deg)",
                },
                "&::after": {
                  content: `""`,
                  position: "absolute",
                  width: "6px",
                  height: "40px",
                  borderTopLeftRadius: "5px",
                  borderBottomLeftRadius: "3px",
                  top: "-4%",
                  right: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.135)",
                  transform: "rotate(35deg)",
                },
              }}
            >
              {icon}
            </Avatar>
          </Badge>
        </Stack>
      </Card>
  );
};

export default InfoCard;
