import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo = ({ size = 'medium' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24, fontSize: '0.8rem' };
      case 'large':
        return { width: 40, height: 40, fontSize: '1.2rem' };
      default:
        return { width: 32, height: 32, fontSize: '1rem' };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 'bold',
          fontSize: sizeStyles.fontSize,
          color: 'inherit',
        }}
      >
        GrowPath
      </Typography>
    </Box>
  );
};

export default Logo;
