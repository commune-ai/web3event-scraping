'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CardActionArea, Modal, CircularProgress, Button, AppBar, Toolbar } from '@mui/material';
import Container from '@mui/material/Container';
import Markdown from 'react-markdown';

export default function CityPage() {
    const params = useParams();
    const router = useRouter();
    const name = decodeURIComponent(params.name as string);
    const [cityData, setCityData] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCityData = async () => {
            try {
                const response = await fetch(`/api/city/${encodeURIComponent(name)}`);
                const data = await response.json();
                setCityData(data);
            } catch (error) {
                console.error('Error fetching city data:', error);
            }
        };

        fetchCityData();
    }, [name]);

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')}~${endDate.getFullYear()}.${String(endDate.getMonth() + 1).padStart(2, '0')}.${String(endDate.getDate()).padStart(2, '0')}`;
    };

    const handleCardClick = async (event: any) => {
        setIsLoading(true);
        setIsModalOpen(true);
        try {
            const response = await fetch(`/api/event/${event._id}`);
            const data = await response.json();
            console.log("here is handle click", data[0]);
            setSelectedEvent(data[0]);  // Assuming the API returns an array with one event
        } catch (error) {
            console.error('Error fetching event data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    const handleGoToCountry = (country: string) => {
        router.push(`/country/${encodeURIComponent(country)}`);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#2a2a2a', color: 'white' }}>
            <AppBar position="fixed" sx={{ bgcolor: '#1a1a1a' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Events in {name}
                    </Typography>
                    <Button color="inherit" onClick={() => router.back()}>
                        Back
                    </Button>
                </Toolbar>
            </AppBar>
            <Toolbar /> {/* This empty Toolbar acts as a spacer */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, overflow: 'auto' }}>
                {cityData.length > 0 ? (
                    <Grid container spacing={4}>
                        {cityData.map((event, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        boxShadow: '0 4px 8px rgba(255,255,255,0.1)',
                                        bgcolor: '#3a3a3a',
                                        color: 'white',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
                                        }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', borderRadius: 4 }}>
                                        {event.event?.type || 'Unknown'} ({event.event?.time || 'N/A'})
                                    </Typography>
                                    <CardActionArea onClick={() => handleCardClick(event)}>
                                        <Box sx={{ height: 300, overflow: 'hidden' }}>
                                            {event.event?.cover_url ? (
                                                <img src={event.event.cover_url} alt="Event Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Box sx={{ height: '100%', backgroundColor: '#4a4a4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="body2">No image available</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <Typography variant="h6" component="div" gutterBottom>
                                                    {event.event?.name || 'Unnamed Event'}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    {event.event?.start_at && event.event?.end_at
                                                        ? formatDateRange(event.event.start_at, event.event.end_at)
                                                        : 'Date not available'}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="body2" gutterBottom>
                                                    Timezone: {event.event?.timezone || 'Not specified'}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    Price: {event.event?.price || 'Not specified'}
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    Sold Out: {event.sold_out !== undefined ? (event.sold_out ? 'Yes' : 'No') : 'Unknown'}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Featured Info Count: {event.featured_info_count !== undefined ? event.featured_info_count : 'N/A'}
                                                </Typography>
                                            </div>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>Loading city data...</Typography>
                )}
            </Container>
            <Modal
                open={isModalOpen}
                onClose={() => handleCloseModal()}
                aria-labelledby="event-modal-title"
                aria-describedby="event-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '70%',
                    maxHeight: '90vh',
                    bgcolor: '#3a3a3a',
                    color: 'white',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    overflowY: 'auto',
                }}>
                    {isLoading ? (
                        <CircularProgress />
                    ) : selectedEvent ? (
                        <>
                            <Typography id="event-modal-title" variant="h4" component="h2" gutterBottom>
                                {selectedEvent.event?.name || 'Event Details'}
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {selectedEvent.event?.cover_url && (
                                        <img src={selectedEvent.event.cover_url} alt="Event Cover" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>Event Details</Typography>
                                    <Typography><strong>Date:</strong> {selectedEvent.event?.start_at && selectedEvent.event?.end_at ? formatDateRange(selectedEvent.event.start_at, selectedEvent.event.end_at) : 'Not specified'}</Typography>
                                    <Typography><strong>Price:</strong> {selectedEvent.event?.price || 'Not specified'}</Typography>
                                    <Typography><strong>Timezone:</strong> {selectedEvent.event?.timezone || 'Not specified'}</Typography>
                                    <Typography><strong>Sold Out:</strong> {selectedEvent.sold_out !== undefined ? (selectedEvent.sold_out ? 'Yes' : 'No') : 'Unknown'}</Typography>
                                    <Typography><strong>Featured Info Count:</strong> {selectedEvent.featured_info_count !== undefined ? selectedEvent.featured_info_count.toString() : 'N/A'}</Typography>
                                    {selectedEvent.calendar?.website && (
                                        <Typography><strong>Website:</strong> <a href={selectedEvent.calendar.website} target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>{selectedEvent.calendar.website}</a></Typography>
                                    )}
                                    {selectedEvent.api_url && (
                                        <Typography><strong>API URL:</strong> <a href={selectedEvent.api_url} target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>{selectedEvent.api_url}</a></Typography>
                                    )}
                                    {selectedEvent.calendar?.country && (
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            onClick={() => handleGoToCountry(selectedEvent.calendar.country)}
                                            sx={{ mt: 2 }}
                                        >
                                            Go to {selectedEvent.calendar.country} Page
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>Event Description</Typography>

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
        </Box>
    );
}
