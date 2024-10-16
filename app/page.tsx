'use client'
import { Card, CardContent, Typography, Grid, Box, CardActionArea, AppBar, Toolbar, TextField, Select, MenuItem, FormControl, CircularProgress, Container, useMediaQuery, Autocomplete } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';

interface CityData {
  count: number;
  avatar: string;
  tint_color: string;
  city: string;
}

interface RegionData {
  [key: string]: CityData[];
}

export default function Home() {
  const [regionData, setRegionData] = useState<RegionData>({});
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmall = useMediaQuery('(max-width:425px)');
  const isMedium = useMediaQuery('(min-width:426px) and (max-width:768px)');

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

  const filteredRegionData = useMemo(() => {
    if (!searchTerm.includes('@') && searchTerm !== '') {
      return Object.entries(regionData).reduce((acc, [region, cities]) => {
        if (['America', 'Asia', 'Europe'].includes(region)) {
          const filteredCities = cities.filter(city =>
            selectedRegion === 'All Regions' || region === selectedRegion
          );
          if (filteredCities.length > 0) {
            acc[region] = filteredCities;
          }
        }
        return acc;
      }, {} as RegionData);
    }

    const searchTermWithoutAt = searchTerm.slice(1);
    return Object.entries(regionData).reduce((acc, [region, cities]) => {
      if (['America', 'Asia', 'Europe'].includes(region)) {
        const filteredCities = cities.filter(city =>
          (selectedRegion === 'All Regions' || region === selectedRegion) &&
          city.city.toLowerCase().includes(searchTermWithoutAt.toLowerCase())
        );
        if (filteredCities.length > 0) {
          acc[region] = filteredCities;
        }
      }
      return acc;
    }, {} as RegionData);
  }, [regionData, selectedRegion, searchTerm]);

  const cityOptions = useMemo(() => {
    return Object.values(filteredRegionData).flatMap(cities => 
      cities.map(city => `@${city.city}`)
    );
  }, [filteredRegionData]);

  const handleCityClick = (city: string) => {
    router.push(`/city/${encodeURIComponent(city)}`);
  };

  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 > 155;
  };

  const handleSearch = () => {
    const region = selectedRegion === 'All Regions' ? 'all-region' : encodeURIComponent(selectedRegion);
    const route = searchTerm ? `/search/${region}/${encodeURIComponent(searchTerm)}` : `/search/${region}`;
    router.push(route);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setShowDropdown(event.target.value.includes('@'));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1a1a1a' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', py: 2 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, mb: isMobile ? 2 : 0 }}>
              Express Vector Screen
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
              <FormControl variant="outlined" size="small" sx={{ mb: isMobile ? 2 : 0, mr: isMobile ? 0 : 2, minWidth: 120, width: isMobile ? '100%' : 'auto' }}>
                <Select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as string)}
                  sx={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="All Regions">All Regions</MenuItem>
                  {['America', 'Asia', 'Europe'].map((region) => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                freeSolo
                options={showDropdown ? cityOptions : []}
                inputValue={searchTerm}
                onInputChange={(event, value) => setSearchTerm(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Search City or Title... (Type '@' for city list)"
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    sx={{ mr: 2, backgroundColor: 'white', width: '100%', minWidth: '300px' }}
                  />
                )}
                filterOptions={(options, state) => {
                  return state.inputValue.startsWith('@') 
                    ? options.filter(option => option.toLowerCase().includes(state.inputValue.toLowerCase()))
                    : [];
                }}
                sx={{ width: '100%', maxWidth: '300px' }}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <main className="flex min-h-screen flex-col items-center justify-between" style={{ backgroundColor: '#2a2a2a', padding: isSmall ? '0' : '24px' }}>
        <Container maxWidth="lg">
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress />
            </Box>
          ) : (
            Object.entries(filteredRegionData).map(([region, cities]) => (
              <Box key={region} mb={4}>
                <Typography variant="h4" gutterBottom color="white">{region}</Typography>
                <Grid container spacing={2}>
                  {cities.map((city, index) => (
                    <Grid item xs={12} sm={isMedium ? 6 : 12} md={4} key={index}>
                      <Card 
                        sx={{ 
                          backgroundColor: city.tint_color || '#E6F3FF',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 4px 20px rgba(255,255,255,0.12)',
                          },
                          height: '100%'
                        }}
                      >
                        <CardActionArea onClick={() => handleCityClick(city.city)} sx={{ height: '100%' }}>
                          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            {city.avatar && (
                              <Box sx={{ width: '100px', height: '100px', position: 'relative', mb: 2 }}>
                                <img
                                  src={city.avatar}
                                  alt={`${city.city} avatar`}
                                  style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                                />
                              </Box>
                            )}
                            <Typography variant="h6" component="div" color={isLightColor(city.tint_color || '#E6F3FF') ? 'black' : 'white'} align="center">
                              {city.city}
                            </Typography>
                            <Typography color={isLightColor(city.tint_color || '#E6F3FF') ? 'black' : 'white'} align="center">
                              Events: {city.count}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}
        </Container>
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Typography variant="body2" color="white">
            Express Vector Screen
          </Typography>
        </Box>
      </main>
    </>
  );
}
