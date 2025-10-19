import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant, size }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    boxShadow: variant === 'contained' 
      ? '0 4px 12px rgba(26, 122, 224, 0.3)' 
      : 'none',
    transform: 'translateY(-1px)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: variant === 'contained' 
      ? '0 2px 6px rgba(26, 122, 224, 0.3)' 
      : 'none',
  },
  
  '&.Mui-disabled': {
    opacity: 0.6,
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  
  ...(size === 'small' && {
    padding: '8px 16px',
    fontSize: '14px',
    minHeight: '36px',
  }),
  
  ...(size === 'medium' && {
    padding: '12px 24px',
    fontSize: '16px',
    minHeight: '44px',
  }),
  
  ...(size === 'large' && {
    padding: '16px 32px',
    fontSize: '18px',
    minHeight: '52px',
  }),
  
  '&.full-width': {
    width: '100%',
  },
}));

const Button = ({ 
  children, 
  variant = 'contained', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  fullWidth = false,
  onClick, 
  type = 'button',
  color = 'primary',
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      color={color}
      className={fullWidth ? 'full-width' : ''}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        children
      )}
    </StyledButton>
  );
};

export default Button;