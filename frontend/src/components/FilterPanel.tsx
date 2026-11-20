import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import type { TourFilter } from '../api/tourApi';
import { TOUR_TYPE_LABELS } from './TourCard';
import type { TourType } from '../types';

interface Props {
  value: TourFilter;
  countries: string[];
  onChange: (next: TourFilter) => void;
  onApply: () => void;
  onReset: () => void;
}

// Панель фильтров каталога туров: поиск, страна, тип, диапазон цен, сортировка
export default function FilterPanel({ value, countries, onChange, onApply, onReset }: Props) {
  const set = (patch: Partial<TourFilter>) => onChange({ ...value, ...patch });

  const numOrEmpty = (raw: string): number | '' => {
    if (raw.trim() === '') return '';
    const n = Number(raw);
    return Number.isNaN(n) ? '' : n;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          label="Поиск"
          size="small"
          value={value.search ?? ''}
          onChange={(e) => set({ search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onApply()}
          sx={{ minWidth: 200, flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Страна</InputLabel>
          <Select
            label="Страна"
            value={value.country ?? ''}
            onChange={(e) => set({ country: e.target.value })}
          >
            <MenuItem value="">Все страны</MenuItem>
            {countries.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Тип тура</InputLabel>
          <Select
            label="Тип тура"
            value={value.type ?? ''}
            onChange={(e) => set({ type: e.target.value as TourType | '' })}
          >
            <MenuItem value="">Все типы</MenuItem>
            {(Object.keys(TOUR_TYPE_LABELS) as TourType[]).map((t) => (
              <MenuItem key={t} value={t}>
                {TOUR_TYPE_LABELS[t]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Цена от"
          size="small"
          type="number"
          value={value.minPrice ?? ''}
          onChange={(e) => set({ minPrice: numOrEmpty(e.target.value) })}
          sx={{ width: 110 }}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Цена до"
          size="small"
          type="number"
          value={value.maxPrice ?? ''}
          onChange={(e) => set({ maxPrice: numOrEmpty(e.target.value) })}
          sx={{ width: 110 }}
          inputProps={{ min: 0 }}
        />
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Сортировка</InputLabel>
          <Select
            label="Сортировка"
            value={value.sort ?? ''}
            onChange={(e) => set({ sort: e.target.value })}
          >
            <MenuItem value="">По умолчанию</MenuItem>
            <MenuItem value="price,asc">Сначала дешевле</MenuItem>
            <MenuItem value="price,desc">Сначала дороже</MenuItem>
            <MenuItem value="avgRating,desc">По рейтингу</MenuItem>
            <MenuItem value="durationDays,asc">По длительности</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={onApply}
        >
          Найти
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<FilterAltOffIcon />}
          onClick={onReset}
        >
          Сбросить
        </Button>
      </Box>
    </Paper>
  );
}
