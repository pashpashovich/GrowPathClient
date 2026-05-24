import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import ProgramSelector from '../components/internshipPrograms/ProgramSelector';
import ProgramMentorsSection from '../components/internshipPrograms/ProgramMentorsSection';

const HRMentorsPage = () => {
  const programs = useSelector((state) => state.internshipProgram.programs) || [];
  const [programId, setProgramId] = React.useState(null);

  const activePrograms = useMemo(
    () => programs.filter((p) => p.status !== 'archived'),
    [programs]
  );

  return (
    <Box sx={{ width: '100%', textAlign: 'left' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, textAlign: 'left' }}>
        Менторы программ
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <ProgramSelector
          programs={activePrograms}
          value={programId}
          onChange={setProgramId}
        />
      </Paper>

      <ProgramMentorsSection programId={programId} />
    </Box>
  );
};

export default HRMentorsPage;
