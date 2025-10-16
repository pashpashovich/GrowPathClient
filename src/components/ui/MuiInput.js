import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff, Search } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: '#F6F7F9',
    transition: 'all 0.2s ease-in-out',
    
    '&:hover': {
      backgroundColor: '#FFFFFF',
    },
    
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(26, 122, 224, 0.1)',
    },
    
    '&.Mui-error': {
      backgroundColor: '#FFF5F5',
    },
  },
  
  '& .MuiInputLabel-root': {
    fontFamily: 'Source Sans Pro, sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    color: '#212121',
  },
  
  '& .MuiOutlinedInput-input': {
    fontFamily: 'Source Sans Pro, sans-serif',
    fontSize: '16px',
    color: '#212121',
  },
  
  '& .MuiFormHelperText-root': {
    fontFamily: 'Source Sans Pro, sans-serif',
    fontSize: '14px',
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: '#F6F7F9',
  
  '&:hover': {
    backgroundColor: '#FFFFFF',
  },
  
  '&.Mui-focused': {
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 0 3px rgba(26, 122, 224, 0.1)',
  },
}));

const Input = ({
  type = 'text',
  label = '',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error = '',
  helperText = '',
  icon = null,
  iconPosition = 'start',
  showPasswordToggle = false,
  fullWidth = true,
  required = false,
  select = false,
  options = [],
  size = 'medium',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputProps = () => {
    const inputProps = {
      startAdornment: null,
      endAdornment: null,
    };

    if (icon && iconPosition === 'start') {
      inputProps.startAdornment = (
        <InputAdornment position="start">
          {icon}
        </InputAdornment>
      );
    }

    if (showPasswordToggle && type === 'password') {
      inputProps.endAdornment = (
        <InputAdornment position="end">
          <IconButton
            onClick={togglePasswordVisibility}
            edge="end"
            tabIndex={-1}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      );
    }

    if (icon && iconPosition === 'end' && !showPasswordToggle) {
      inputProps.endAdornment = (
        <InputAdornment position="end">
          {icon}
        </InputAdornment>
      );
    }

    return inputProps;
  };

  if (select) {
    return (
      <FormControl 
        fullWidth={fullWidth} 
        error={!!error}
        disabled={disabled}
        size={size}
      >
        <InputLabel required={required}>{label}</InputLabel>
        <StyledSelect
          value={value}
          onChange={onChange}
          label={label}
          {...props}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </StyledSelect>
        {(error || helperText) && (
          <FormHelperText>{error || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  return (
    <StyledTextField
      type={inputType}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      error={!!error}
      helperText={error || helperText}
      fullWidth={fullWidth}
      required={required}
      size={size}
      InputProps={getInputProps()}
      {...props}
    />
  );
};

export const SearchInput = (props) => (
  <Input
    {...props}
    icon={<Search />}
    iconPosition="start"
    placeholder="Искать стажера"
  />
);

export const SelectInput = ({ options, ...props }) => (
  <Input
    {...props}
    select
    options={options}
  />
);

export default Input;

