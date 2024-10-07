import React, { useState } from 'react';
import { Modal, Box, Typography, Grid, CircularProgress, IconButton } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';

interface DetailModalProps {
    isModalOpen: boolean;
    handleCloseModal: () => void;
    isLoading: boolean;
    selectedEvent: any;
}

export default function DetailModal({ isModalOpen, handleCloseModal, isLoading, selectedEvent }: DetailModalProps) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const handleImageClick = () => {
        setIsImageModalOpen(true);
    };

    const handleImageModalClose = () => {
        setIsImageModalOpen(false);
    };

    return (
        <>
            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="event-modal-title"
                aria-describedby="event-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '1000px',
                    height: '90vh',
                    bgcolor: '#3a3a3a',
                    color: 'white',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    overflowY: 'auto',
                }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedEvent ? (
                        <>
                            <Typography id="event-modal-title" variant="h4" component="h2" gutterBottom sx={{ color: '#FFD700' }}>
                                {selectedEvent.event?.name || 'Event Details'}
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {selectedEvent.event?.cover_url && (
                                        <Box 
                                            sx={{ 
                                                width: '100%', 
                                                height: '0', 
                                                paddingBottom: '56.25%', 
                                                position: 'relative',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                            }}
                                            onClick={handleImageClick}
                                        >
                                            <img 
                                                src={selectedEvent.event.cover_url} 
                                                alt="Event Cover" 
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    left: 0, 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s ease-in-out',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        </Box>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#4CAF50' }}>Event Details</Typography>
                                    <Typography sx={{ color: '#E0E0E0' }}><strong>Date:</strong> {selectedEvent.event?.start_at && selectedEvent.event?.end_at ? `${selectedEvent.event.start_at} to ${selectedEvent.event.end_at}` : 'Not specified'}</Typography>
                                    <Typography sx={{ color: '#E0E0E0' }}><strong>Price:</strong> {selectedEvent.event?.price || 'Not specified'}</Typography>
                                    <Typography sx={{ color: '#E0E0E0' }}><strong>Timezone:</strong> {selectedEvent.event?.timezone || 'Not specified'}</Typography>
                                    <Typography sx={{ color: '#E0E0E0' }}><strong>Sold Out:</strong> {selectedEvent.sold_out !== undefined ? (selectedEvent.sold_out ? 'Yes' : 'No') : 'Unknown'}</Typography>
                                    <Typography sx={{ color: '#E0E0E0' }}><strong>Featured Info Count:</strong> {selectedEvent.featured_info_count !== undefined ? selectedEvent.featured_info_count.toString() : 'N/A'}</Typography>
                                    {selectedEvent.calendar?.website && (
                                        <Typography><strong>Website:</strong> <a href={selectedEvent.calendar.website} target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>{selectedEvent.calendar.website}</a></Typography>
                                    )}
                                    {selectedEvent.api_url && (
                                        <Typography><strong>API URL:</strong> <a href={selectedEvent.api_url} target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>{selectedEvent.api_url}</a></Typography>
                                    )}
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#4CAF50' }}>Event Description</Typography>
                                {selectedEvent.description_mirror && selectedEvent.description_mirror.content && selectedEvent.description_mirror.content.length > 0 ? (
                                    selectedEvent.description_mirror.content.map((block: { type: string; content: { text: string }[] }, index: number) => {
                                        switch (block.type) {
                                            case 'paragraph':
                                                return (
                                                    <Typography key={index} paragraph>
                                                        {block.content && block.content.map((item: { text: string }, idx: number) => item.text).join('')}
                                                    </Typography>
                                                );
                                            case 'heading':
                                                return (
                                                    <Typography key={index} variant="h6" gutterBottom>
                                                        {block.content && block.content.map((item: { text: string }, idx: number) => item.text).join('')}
                                                    </Typography>
                                                );
                                            case 'list':
                                                return (
                                                    <ul key={index}>
                                                        {block.content && block.content.map((item: { text: string }, idx: number) => (
                                                            <li key={idx}>{item.text}</li>
                                                        ))}
                                                    </ul>
                                                );
                                            default:
                                                return null;
                                        }
                                    })
                                ) : (
                                    <Typography>No description available.</Typography>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Typography>No event data available</Typography>
                    )}
                </Box>
            </Modal>
            <Modal
                open={isImageModalOpen}
                onClose={handleImageModalClose}
                aria-labelledby="image-modal"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    height: '90%',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <IconButton
                        aria-label="close"
                        onClick={handleImageModalClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                            width: '40px',
                            height: '40px',
                            padding: 0,
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            x
                        </Box>
                        {/* <CloseIcon /> */}
                    </IconButton>
                    {selectedEvent?.event?.cover_url && (
                        <img
                            src={selectedEvent.event.cover_url}
                            alt="Event Cover"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    )}
                </Box>
            </Modal>
        </>
    );
}
