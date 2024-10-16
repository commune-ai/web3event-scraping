'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CardActionArea, Button, AppBar, Toolbar, TextField, Modal, CircularProgress, useMediaQuery } from '@mui/material';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

export default function SearchPage() {
    const params = useParams();
    const router = useRouter();
    const [eventData, setEventData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEventData, setFilteredEventData] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [totalEvents, setTotalEvents] = useState(0);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery('(max-width:425px)');

    useEffect(() => {
        const fetchEventData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/search/${params.region}`);
                const data = await response.json();
                setEventData(data);
                setFilteredEventData(data);
                setTotalEvents(data.length);
            } catch (error) {
                console.error('Error fetching event data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventData();
    }, [params.region]);

    useEffect(() => {
        const filtered = eventData.filter(event => 
            (event.event?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (event.calendar?.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (event.event?.timezone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        );
        setFilteredEventData(filtered);
        setTotalEvents(filtered.length);
    }, [searchTerm, eventData]);

    const handleCardClick = async (event: any) => {
        setIsLoading(true);
        setIsModalOpen(true);
        try {
            const response = await fetch(`/api/event/${event._id}`);
            const data = await response.json();
            setSelectedEvent(data[0]);
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

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')}~${endDate.getFullYear()}.${String(endDate.getMonth() + 1).padStart(2, '0')}.${String(endDate.getDate()).padStart(2, '0')}`;
    };

    const handleGoToCountry = (country: string) => {
        router.push(`/country/${encodeURIComponent(country)}`);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#2a2a2a', color: 'white' }}>
            <AppBar position="fixed" sx={{ bgcolor: '#1a1a1a' }}>
                <Toolbar sx={{ flexDirection: isSmallScreen ? 'column' : 'row', alignItems: 'center', py: isSmallScreen ? 2 : 0 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: isSmallScreen ? 2 : 0 }}>
                        Events
                    </Typography>
                    <Button color="inherit" onClick={() => router.back()} sx={{ width: isSmallScreen ? '100%' : 'auto' }}>
                        Back
                    </Button>
                </Toolbar>
            </AppBar>
            <Toolbar sx={{ mb: isSmallScreen ? 2 : 0 }} />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, overflow: 'auto' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 4, bgcolor: 'white' }}
                />
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Total Events: {totalEvents}
                </Typography>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {filteredEventData.map((event, index) => (
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
                                    <CardActionArea onClick={() => handleCardClick(event)}>
                                        <Box sx={{ height: 200, overflow: 'hidden' }}>
                                            {event.event?.cover_url ? (
                                                <img src={event.event.cover_url} alt="Event Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Box sx={{ height: '100%', backgroundColor: '#4a4a4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography variant="body2">No image available</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                        <CardContent>
                                            <Typography variant="h6" component="div">
                                                {event.event?.name}
                                            </Typography>
                                            <Typography variant="body2">
                                                Date: {formatDateRange(event.event?.start_at, event.event?.end_at)}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                            <CircularProgress />
                        </Box>
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
