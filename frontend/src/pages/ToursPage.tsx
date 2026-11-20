import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Pagination,
  Typography,
} from '@mui/material';
import { tourApi } from '../api/tourApi';
import type { TourFilter } from '../api/tourApi';
import { getErrorMessage } from '../api/client';
import TourCard from '../components/TourCard';
import FilterPanel from '../components/FilterPanel';
import EmptyState from '../components/EmptyState';
import type { Tour } from '../types';

const PAGE_SIZE = 12;
const EMPTY_FILTER: TourFilter = {
  search: '',
  country: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  sort: '',
};

// Каталог туров: фильтры + сетка карточек + пагинация
export default function ToursPage() {
  const [draft, setDraft] = useState<TourFilter>(EMPTY_FILTER);
  const [applied, setApplied] = useState<TourFilter>(EMPTY_FILTER);
  const [page, setPage] = useState(0);
  const [tours, setTours] = useState<Tour[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (filter: TourFilter, pageNum: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await tourApi.getAll({ ...filter, page: pageNum, size: PAGE_SIZE });
      setTours(data.content);
      setTotalPages(data.totalPages);
      // Пополняем список стран для фильтра по мере загрузки каталога
      setCountries((prev) =>
        Array.from(new Set([...prev, ...data.content.map((t) => t.country)])).sort(),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(applied, page);
  }, [applied, page, load]);

  const handleApply = () => {
    setPage(0);
    setApplied(draft);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTER);
    setApplied(EMPTY_FILTER);
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Каталог туров
      </Typography>
      <FilterPanel
        value={draft}
        countries={countries}
        onChange={setDraft}
        onApply={handleApply}
        onReset={handleReset}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : tours.length === 0 ? (
        <EmptyState
          title="Туры не найдены"
          message="Попробуйте изменить параметры фильтрации"
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {tours.map((tour) => (
              <Grid item key={tour.id} xs={12} sm={6} md={4} lg={3}>
                <TourCard tour={tour} />
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, p) => setPage(p - 1)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
