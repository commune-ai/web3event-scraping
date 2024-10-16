'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Pagination, CircularProgress } from '@mui/material';
import Image from 'next/image';

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const eventsPerPage = 9;

  useEffect(() => {
    const makeScrapRequest = async () => {
      try {
        const response = await fetch('/api/eventbrite/scrap', { method: 'GET' });
        const data = await response.json();
        console.log('Scrap request response:', data);
      } catch (error) {
        console.error('Error making scrap request:', error);
      }
    };
    makeScrapRequest();
  }, []);

  return (
    <div>hello world</div>
  )

}
export default EventsPage;
