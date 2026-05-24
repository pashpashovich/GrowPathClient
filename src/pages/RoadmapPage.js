import React, { useState, useEffect } from 'react';
import { Box, Modal } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RoadmapView from '../components/roadmap/RoadmapView';
import StageForm from '../components/roadmap/StageForm';
import InternshipSelector from '../components/roadmap/InternshipSelector';
import RoadmapEntityForm from '../components/roadmap/RoadmapEntityForm';
import {
  fetchInternshipsAsync,
  fetchInternshipsProfileAsync,
  fetchIprsAsync,
  fetchStagesAsync,
  setCurrentInternship,
} from '../store/slices/roadmapSlice';

const RoadmapPage = ({ canEdit = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const authRole = useSelector((state) => state.auth.role);
  const userRole = currentUser?.role ?? authRole;
  const currentInternshipId = useSelector((state) => state.roadmap.currentInternshipId);
  const isIntern = userRole === 'intern';
  const isMentor = userRole === 'mentor';
  const [openForm, setOpenForm] = useState(false);
  const [stageToEdit, setStageToEdit] = useState(null);
  const [entityViewMode, setEntityViewMode] = useState('templates');
  const [entityFormOpen, setEntityFormOpen] = useState(false);
  const [entityFormMode, setEntityFormMode] = useState('template');
  const [entityToEdit, setEntityToEdit] = useState(null);
  useEffect(() => {
    if (userRole === 'intern') {
      dispatch(fetchInternshipsProfileAsync());
    } else if (userRole === 'mentor') {
      dispatch(setCurrentInternship(null));
      if (entityViewMode === 'iprs') {
        dispatch(fetchIprsAsync({ mentorId: currentUser?.id }));
      } else {
        dispatch(fetchInternshipsAsync({ mentorId: currentUser?.id }));
      }
    } else if (userRole) {
      dispatch(fetchInternshipsAsync());
    }
  }, [dispatch, userRole, currentUser?.id, entityViewMode, location.pathname]);

  const useIprMode = isIntern || (isMentor && entityViewMode === 'iprs');

  useEffect(() => {
    if (currentInternshipId) {
      dispatch(fetchStagesAsync({ internshipId: currentInternshipId, useIpr: useIprMode }));
    }
  }, [dispatch, currentInternshipId, useIprMode]);

  const handleOpenForm = (stage = null) => {
    setStageToEdit(stage);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setStageToEdit(null);
  };


  const handleEditInternship = (internship) => {
    const isIpr = Boolean(internship?.internId);
    setEntityToEdit(internship || null);
    setEntityFormMode(isIpr ? 'ipr-edit' : 'template');
    setEntityFormOpen(true);
  };

  const handleCreateIpr = () => {
    setEntityToEdit(null);
    setEntityFormMode('ipr-create');
    setEntityFormOpen(true);
  };

  const handleCloseEntityForm = () => {
    setEntityFormOpen(false);
    setEntityToEdit(null);
  };

  return (
    <Box>
      <InternshipSelector
        entityViewMode={entityViewMode}
        onChangeEntityViewMode={setEntityViewMode}
        onEditInternship={handleEditInternship}
        onCreateIpr={handleCreateIpr}
        canEdit={canEdit}
        useIpr={useIprMode}
      />
      <RoadmapView onEdit={handleOpenForm} canEdit={canEdit} useIpr={useIprMode} />

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
            useIpr={useIprMode}
          />
        </Box>
      </Modal>

      <Modal
        open={entityFormOpen}
        onClose={handleCloseEntityForm}
        aria-labelledby="entity-form-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', md: 720 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 2,
          }}
        >
          <RoadmapEntityForm
            mode={entityFormMode}
            entityToEdit={entityToEdit}
            onClose={handleCloseEntityForm}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default RoadmapPage;
