import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo = ({ size = 'medium', showText = true }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, fontSize: '1rem' };
      case 'large':
        return { width: 48, height: 48, fontSize: '1.5rem' };
      default:
        return { width: 40, height: 40, fontSize: '1.2rem' };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Логотип - изображение */}
      <Box
        component="img"
        src="/images/logo.png"
        alt="GrowPath Logo"
        sx={{
          width: sizeStyles.width,
          height: sizeStyles.height,
          objectFit: 'contain',
        }}
      />

      {/* Текст логотипа */}
      {showText && (
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: sizeStyles.fontSize,
            color: 'inherit',
            letterSpacing: '-0.02em',
          }}
        >
          GrowPath
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
