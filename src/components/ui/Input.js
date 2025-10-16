import React, { useState } from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error = '',
  label = '',
  icon = null,
  iconPosition = 'left',
  showPasswordToggle = false,
  className = '',
  required = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const inputClasses = [
    'input',
    error ? 'input--error' : '',
    disabled ? 'input--disabled' : '',
    isFocused ? 'input--focused' : '',
    icon ? `input--with-icon input--icon-${iconPosition}` : '',
    className
  ].filter(Boolean).join(' ');

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

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <div className="input-icon input-icon--left">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
        
        {icon && iconPosition === 'right' && (
          <div className="input-icon input-icon--right">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <div className="input-error">
          <span className="input-error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;


