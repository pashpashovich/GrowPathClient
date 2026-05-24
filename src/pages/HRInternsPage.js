import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import ProgramSelector from '../components/internshipPrograms/ProgramSelector';
import ProgramInternsSection from '../components/internshipPrograms/ProgramInternsSection';

const HRInternsPage = () => {
  const programs = useSelector((state) => state.internshipProgram.programs) || [];
  const [programId, setProgramId] = React.useState(null);

  const activePrograms = useMemo(
    () => programs.filter((p) => p.status !== 'archived'),
    [programs]
  );

  const selectedProgram = useMemo(
    () => programs.find((p) => String(p.id) === String(programId)),
    [programs, programId]
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Стажёры программ
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <ProgramSelector
          programs={activePrograms}
          value={programId}
          onChange={setProgramId}
        />
      </Paper>

      <ProgramInternsSection programId={programId} program={selectedProgram} />
    </Box>
  );
};

export default HRInternsPage;
