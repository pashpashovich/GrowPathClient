import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  Email,
  Group,
  History,
  People,
  Send,
} from '@mui/icons-material';
import MailingSectionNav from '../components/mailings/MailingSectionNav';
import RecipientsSection from '../components/mailings/RecipientsSection';
import GroupsSection from '../components/mailings/GroupsSection';
import TemplatesSection from '../components/mailings/TemplatesSection';
import MailingsListSection from '../components/mailings/MailingsListSection';
import HistorySection from '../components/mailings/HistorySection';

export const MAILING_SECTIONS = {
  RECIPIENTS: 'recipients',
  GROUPS: 'groups',
  TEMPLATES: 'templates',
  MAILINGS: 'mailings',
  HISTORY: 'history',
};

const SECTION_CONFIG = [
  { key: MAILING_SECTIONS.RECIPIENTS, title: 'Получатели', icon: People },
  { key: MAILING_SECTIONS.GROUPS, title: 'Группы', icon: Group },
  { key: MAILING_SECTIONS.TEMPLATES, title: 'Шаблоны', icon: Email },
  { key: MAILING_SECTIONS.MAILINGS, title: 'Рассылки', icon: Send },
  { key: MAILING_SECTIONS.HISTORY, title: 'История', icon: History },
];

const MailingsPage = () => {
  const [activeSection, setActiveSection] = useState(MAILING_SECTIONS.RECIPIENTS);

  const renderSection = () => {
    switch (activeSection) {
      case MAILING_SECTIONS.GROUPS:
        return <GroupsSection />;
      case MAILING_SECTIONS.TEMPLATES:
        return <TemplatesSection />;
      case MAILING_SECTIONS.MAILINGS:
        return <MailingsListSection />;
      case MAILING_SECTIONS.HISTORY:
        return <HistorySection />;
      case MAILING_SECTIONS.RECIPIENTS:
      default:
        return <RecipientsSection />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Электронная рассылка
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '0 0 280px' }}>
          <MailingSectionNav
            sections={SECTION_CONFIG}
            activeKey={activeSection}
            onSelect={setActiveSection}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>{renderSection()}</Box>
      </Box>
    </Box>
  );
};

export default MailingsPage;
