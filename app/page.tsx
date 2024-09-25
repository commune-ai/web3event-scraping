'use client'
import { Card, CardContent, Typography, Grid, Box, CardActionArea, Link } from '@mui/material';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/country');
        const data: RegionData = await res.json();
        setRegionData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const isLightColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24" style={{ backgroundColor: '#2a2a2a' }}>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {Object.entries(regionData).map(([region, cities]) => (
          <Box key={region} mb={4}>
            <Typography variant="h4" gutterBottom color="white">{region === 'Asia' ? 'Asia & Pacific' : region}</Typography>
            <Grid container spacing={2}>
              
              {cities.map((city, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      backgroundColor: city.tint_color ? city.tint_color : '#E6F3FF',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 20px rgba(255,255,255,0.12)',
                      }
                    }}
                  >
                    <CardActionArea component={Link} href={`/city/${city.city}`}>
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" component="div" color={isLightColor(city.tint_color || '#E6F3FF') ? 'black' : 'white'}>
                            {city.city}
                          </Typography>
                          <Typography color={isLightColor(city.tint_color || '#E6F3FF') ? 'black' : 'white'}>
                            Events: {city.count}
                          </Typography>
                          <Typography 
                            color={isLightColor(city.tint_color || '#E6F3FF') ? 'black' : 'white'} 
                            sx={{ 
                              textDecoration: 'underline', 
                              mt: 1,
                              '&:hover': {
                                fontWeight: 'bold',
                              }
                            }}
                          >
                            View Details
                          </Typography>
                        </Box>
                        {city.avatar && (
                          <Box sx={{ width: '100px', height: '100px', position: 'relative' }}>
                            <img
                              src={city.avatar}
                              alt={`${city.city} avatar`}
                              style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </div>
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Typography variant="body2" color="white">
          Express Vector Screen
        </Typography>
      </Box>
    </main>
  );
}
