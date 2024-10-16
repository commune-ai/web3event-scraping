'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CardActionArea, CircularProgress, Button, AppBar, Toolbar, TextField, Select, MenuItem, FormControl, SelectChangeEvent, Autocomplete } from '@mui/material';
import Container from '@mui/material/Container';
import DetailModal from '@/app/components/DetailModal';

interface RegionData {
  [key: string]: any[];
}

export default function SearchPage() {
    const params = useParams();
    const router = useRouter();
    const region = decodeURIComponent(params.region as string);
    const title = decodeURIComponent(params.title as string);
    const [searchData, setSearchData] = useState<any[]>([]);
    const [filteredSearchData, setFilteredSearchData] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [resultCount, setResultCount] = useState(0);
    const [selectedRegion, setSelectedRegion] = useState(region === 'all-region' ? 'All Regions' : region);
    const [searchTitle, setSearchTitle] = useState(title);
    const [regionData, setRegionData] = useState<RegionData>({});
    const [titleOptions, setTitleOptions] = useState<string[]>([]);

    const fetchSearchData = async (regionValue: string, titleValue: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/search/${encodeURIComponent(regionValue)}/${encodeURIComponent(titleValue)}`);
            const data = await response.json();
            setSearchData(data);
            setFilteredSearchData(data);
            setResultCount(data.length);
            // Extract unique titles for autocomplete
            const titles = Array.from(new Set(data.map((event: any) => event.event?.name)));
            setTitleOptions(titles.filter((title): title is string => !!title));
        } catch (error) {
            console.error('Error fetching search data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSearchData(region, title);
    }, [region, title]);

    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/country');
            const data: RegionData = await res.json();
            console.log(data);
            setRegionData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const filtered = searchData.filter(event => 
            event.event?.name.toLowerCase().includes(searchTitle.toLowerCase())
        );
        setFilteredSearchData(filtered);
        setResultCount(filtered.length);
    }, [searchTitle, searchData]);

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

    const handleRegionChange = (event: SelectChangeEvent<string>) => {
        const newRegion = event.target.value;
        setSelectedRegion(newRegion);
        const regionParam = newRegion === 'All Regions' ? 'all-region' : newRegion;
        fetchSearchData(regionParam, searchTitle);
    };

    const handleSearchTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = event.target.value;
        setSearchTitle(newTitle);
        const regionParam = selectedRegion === 'All Regions' ? 'all-region' : selectedRegion;
        fetchSearchData(regionParam, newTitle);
    };

    const handleBack = () => {
        router.push('/');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#2a2a2a', color: 'white' }}>
            <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
                <Container maxWidth="lg">
                    <Toolbar sx={{ flexDirection: 'row', alignItems: 'center', py: 2 }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: 0 }}>
                            Search Results: {selectedRegion} - {searchTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 120, backgroundColor: 'white' }}>
                                <Select
                                    value={selectedRegion}
                                    onChange={handleRegionChange}
                                >
                                    <MenuItem value="All Regions">All Regions</MenuItem>
                                    {Object.keys(regionData).map((region) => (
                                        <MenuItem key={region} value={region}>
                                            {region}
                                        </MenuItem>
                                    ))} 
                                </Select>
                            </FormControl>
                            <Autocomplete
                                freeSolo
                                options={titleOptions}
                                value={searchTitle}
                                onChange={(event, newValue) => {
                                    setSearchTitle(newValue || '');
                                    const regionParam = selectedRegion === 'All Regions' ? 'all-region' : selectedRegion;
                                    fetchSearchData(regionParam, newValue || '');
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        placeholder="Search Title..."
                                        sx={{ mr: 2, backgroundColor: 'white', width: 200 }}
                                    />
                                )}
                            />
                        </Box>
                        <Button
                            onClick={handleBack}
                            sx={{ color: 'white', mr: 2 }}
                        >
                            Back
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, overflow: 'auto' }}>
                <Typography variant="h5" gutterBottom>
                    {resultCount} events found
                </Typography>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress />
                    </Box>
                ) : filteredSearchData.length > 0 ? (
                    <Grid container spacing={4}>
                        {filteredSearchData.map((event, index) => (
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
