import React, { useState } from 'react';
import { Box, Modal } from '@mui/material';
import RoadmapView from '../components/roadmap/RoadmapView';
import StageForm from '../components/roadmap/StageForm';
import InternshipSelector from '../components/roadmap/InternshipSelector';

const RoadmapPage = ({ canEdit = true }) => {
  const [openForm, setOpenForm] = useState(false);
  const [stageToEdit, setStageToEdit] = useState(null);

  const handleOpenForm = (stage = null) => {
    setStageToEdit(stage);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setStageToEdit(null);
  };


  const handleEditInternship = (internship) => {
    // TODO: Реализовать редактирование стажировки
    console.log('Редактирование стажировки:', internship);
  };

  return (
    <Box>
      <InternshipSelector
        onEditInternship={handleEditInternship}
        canEdit={canEdit}
      />
      <RoadmapView onEdit={handleOpenForm} canEdit={canEdit} />

      {/* Модальное окно для создания/редактирования этапа */}
      <Modal
        open={openForm}
        onClose={handleCloseForm}
        aria-labelledby="stage-form-modal-title"
        aria-describedby="stage-form-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', md: 800 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 2,
          }}
        >
          <StageForm
            open={openForm}
            stageToEdit={stageToEdit}
            onClose={handleCloseForm}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default RoadmapPage;
