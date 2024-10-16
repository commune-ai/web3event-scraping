
'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CardActionArea, Modal, CircularProgress, Button, AppBar, Toolbar, TextField } from '@mui/material';
import Container from '@mui/material/Container';
import Markdown from 'react-markdown';
import DetailModal from '@/app/components/DetailModal';

export default function CityPage() {
    const params = useParams();
    const router = useRouter();
    const name = decodeURIComponent(params.name as string);
    const [cityData, setCityData] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCityData, setFilteredCityData] = useState<any[]>([]);

    useEffect(() => {
        const fetchCityData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/city/${encodeURIComponent(name)}`);
                const data = await response.json();
                setCityData(data);
                setFilteredCityData(data);
            } catch (error) {
                console.error('Error fetching city data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCityData();
    }, [name]);

    useEffect(() => {
        const filtered = cityData.filter(event => 
            event.event?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCityData(filtered);
    }, [searchTerm, cityData]);

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
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mr: 2, backgroundColor: 'white' }}
                    />
                    <Button color="inherit" onClick={() => router.back()}>
                        Back
                    </Button>
                </Toolbar>
            </AppBar>
            <Toolbar /> {/* This empty Toolbar acts as a spacer */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, overflow: 'auto' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />
                    </Box>
                ) : filteredCityData.length > 0 ? (
                    <Grid container spacing={4}>
                        {filteredCityData.map((event, index) => (
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
                    <Typography>No events found.</Typography>
                )}
            </Container>
            <DetailModal
                isModalOpen={isModalOpen}
                handleCloseModal={handleCloseModal}
                isLoading={isLoading}
                selectedEvent={selectedEvent}
            />
        </Box>
    );
}
