import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ArrowBack, Email, Phone, Business } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const PLACEHOLDER_EMAIL = 'hr@growpath.local';
const PLACEHOLDER_PHONE = '+7 (000) 000-00-00';

const HRContactPage = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'GrowPath — Связь с HR';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 3, sm: 5 },
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Button
          component={RouterLink}
          to="/login"
          startIcon={<ArrowBack />}
          sx={{ mb: 3, color: 'text.secondary' }}
        >
          На страницу входа
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, mb: 1 }}>
            Связь с HR
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Если у вас ещё нет учетной записи в GrowPath, обратитесь в HR-отдел. Специалисты
            помогут оформить доступ и ответят на вопросы по программам стажировок
          </Typography>

          <List disablePadding>
            <ListItem disableGutters sx={{ alignItems: 'flex-start', py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main', mt: 0.5 }}>
                <Email />
              </ListItemIcon>
              <ListItemText
                primary="Электронная почта"
                secondary={
                  <Link href={`mailto:${PLACEHOLDER_EMAIL}`} underline="hover" fontWeight={600}>
                    {PLACEHOLDER_EMAIL}
                  </Link>
                }
                primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              />
            </ListItem>
            <ListItem disableGutters sx={{ alignItems: 'flex-start', py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main', mt: 0.5 }}>
                <Phone />
              </ListItemIcon>
              <ListItemText
                primary="Телефон"
                secondary={
                  <Link href={`tel:${PLACEHOLDER_PHONE.replace(/\s/g, '')}`} underline="hover" fontWeight={600}>
                    {PLACEHOLDER_PHONE}
                  </Link>
                }
                primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              />
            </ListItem>
            <ListItem disableGutters sx={{ alignItems: 'flex-start', py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main', mt: 0.5 }}>
                <Business />
              </ListItemIcon>
              <ListItemText
                primary="Часы работы"
                secondary="Пн–Пт, 10:00–18:00 (пример; уточните у вашего HR)"
                primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default HRContactPage;
