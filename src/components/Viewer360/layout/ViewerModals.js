import React from 'react';
import PropTypes from 'prop-types';
import { FieldNoteModal, ParticipantModal } from '../../ProjectEditor/modals';

/**
 * Компонент для группировки всех модальных окон Viewer360
 */
const ViewerModals = ({
  // Field Note Modal props
  isFieldNoteModalOpen,
  onCloseFieldNoteModal,
  onSaveFieldNote,
  onDeleteFieldNote,
  fieldNotePosition,
  fieldNoteScreenshot,
  selectedScheme,
  project,
  selectedDate,
  editingFieldNote,
  
  // Participant Modal props
  isParticipantModalOpen,
  onCloseParticipantModal,
  currentUser,
  onAddParticipant,
}) => {
  return (
    <>
      {/* Модальное окно полевой заметки */}
      <FieldNoteModal
        isOpen={isFieldNoteModalOpen}
        onClose={onCloseFieldNoteModal}
        onSave={onSaveFieldNote}
        onDelete={onDeleteFieldNote}
        notePosition={fieldNotePosition}
        screenshot={fieldNoteScreenshot}
        schemePreview={selectedScheme?.fullImage}
        project={project}
        photoDate={selectedDate?.toISOString()}
        availableStatuses={project?.fieldNotes?.statuses || []}
        availableTags={project?.fieldNotes?.tags || []}
        editingNote={editingFieldNote}
      />
      
      {/* Модальное окно участников */}
      <ParticipantModal
        isOpen={isParticipantModalOpen}
        onClose={onCloseParticipantModal}
        project={project}
        currentUser={currentUser}
        onAddParticipant={onAddParticipant}
      />
    </>
  );
};

ViewerModals.propTypes = {
  // Field Note Modal props
  isFieldNoteModalOpen: PropTypes.bool.isRequired,
  onCloseFieldNoteModal: PropTypes.func.isRequired,
  onSaveFieldNote: PropTypes.func.isRequired,
  onDeleteFieldNote: PropTypes.func.isRequired,
  fieldNotePosition: PropTypes.object,
  fieldNoteScreenshot: PropTypes.string,
  selectedScheme: PropTypes.object,
  project: PropTypes.object,
  selectedDate: PropTypes.instanceOf(Date),
  editingFieldNote: PropTypes.object,
  
  // Participant Modal props
  isParticipantModalOpen: PropTypes.bool.isRequired,
  onCloseParticipantModal: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  onAddParticipant: PropTypes.func.isRequired,
};

export default ViewerModals;