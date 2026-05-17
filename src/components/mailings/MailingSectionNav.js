import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

const MailingSectionNav = ({ sections, activeKey, onSelect, counts = {} }) => (
  <Card sx={{ position: 'sticky', top: 80 }}>
    <CardContent sx={{ p: 0 }}>
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="bold"
          sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
        >
          Разделы
        </Typography>
      </Box>
      <Box>
        {sections.map(({ key, title, icon: Icon }) => {
          const isSelected = activeKey === key;
          const count = counts[key];
          return (
            <Button
              key={key}
              fullWidth
              onClick={() => onSelect(key)}
              sx={{
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderLeft: 4,
                borderColor: isSelected ? 'primary.main' : 'transparent',
                bgcolor: isSelected ? 'primary.50' : 'transparent',
                color: isSelected ? 'primary.main' : 'text.secondary',
                fontWeight: isSelected ? 600 : 400,
                borderRadius: 0,
                '&:hover': {
                  bgcolor: isSelected ? 'primary.50' : 'grey.50',
                },
              }}
            >
              {Icon ? <Icon fontSize="small" /> : null}
              <Typography variant="body2" sx={{ flex: 1, textAlign: 'left' }}>
                {title}
              </Typography>
              {count != null && count > 0 ? (
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>
                  {count}
                </Typography>
              ) : null}
            </Button>
          );
        })}
      </Box>
    </CardContent>
  </Card>
);

export default MailingSectionNav;
