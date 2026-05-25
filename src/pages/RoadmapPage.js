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
import {
  fetchAssessmentsForIprAsync,
  clearAssessmentsForIpr,
} from '../store/slices/assessmentSlice';
import { getAuthUserId } from '../utils/authUser';

const RoadmapPage = ({ canEdit = true }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const authRole = useSelector((state) => state.auth.role);
  const userRole = currentUser?.role ?? authRole;
  const currentInternshipId = useSelector((state) => state.roadmap.currentInternshipId);
  const internships = useSelector((state) => state.roadmap.internships);
  const isIntern = userRole === 'intern';
  const isMentor = userRole === 'mentor';
  const [openForm, setOpenForm] = useState(false);
  const [stageToEdit, setStageToEdit] = useState(null);
  const [entityViewMode, setEntityViewMode] = useState('templates');
  const showStageAssessments = isMentor && (isIntern || entityViewMode === 'iprs');
  const [entityFormOpen, setEntityFormOpen] = useState(false);
  const [entityFormMode, setEntityFormMode] = useState('template');
  const [entityToEdit, setEntityToEdit] = useState(null);
  useEffect(() => {
    if (userRole === 'intern') {
      dispatch(fetchInternshipsProfileAsync());
    } else if (userRole === 'mentor') {
      dispatch(setCurrentInternship(null));
      const mentorId = getAuthUserId(currentUser);
      const mentorParams = Number.isFinite(mentorId) ? { mentorId } : {};
      if (entityViewMode === 'iprs') {
        dispatch(fetchIprsAsync(mentorParams));
      } else {
        dispatch(fetchInternshipsAsync(mentorParams));
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

  useEffect(() => {
    if (!showStageAssessments || !currentInternshipId) {
      return undefined;
    }
    const ipr = internships.find((i) => String(i.id) === String(currentInternshipId));
    if (!ipr?.internId || !ipr?.programId) {
      return undefined;
    }
    dispatch(
      fetchAssessmentsForIprAsync({
        iprId: currentInternshipId,
        internId: ipr.internId,
        internshipId: ipr.programId,
      })
    );
    return undefined;
  }, [dispatch, showStageAssessments, currentInternshipId, internships]);

  useEffect(() => {
    if (!showStageAssessments && currentInternshipId) {
      dispatch(clearAssessmentsForIpr(currentInternshipId));
    }
  }, [dispatch, showStageAssessments, currentInternshipId]);

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
      <RoadmapView
        onEdit={handleOpenForm}
        canEdit={canEdit}
        useIpr={useIprMode}
        showStageAssessments={showStageAssessments}
      />

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
