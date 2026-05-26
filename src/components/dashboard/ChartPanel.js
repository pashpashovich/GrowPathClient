import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

const ChartPanel = ({ title, subtitle, children, loading = false, height = 300, emptyText }) => {
  const hasContent = React.Children.count(children) > 0;

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ flex: 1, minHeight: height, position: 'relative' }}>
          {loading && <Skeleton variant="rounded" width="100%" height={height} />}
          {!loading && !hasContent && emptyText ? (
            <Box
              sx={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">{emptyText}</Typography>
            </Box>
          ) : null}
          {!loading && hasContent ? children : null}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartPanel;
