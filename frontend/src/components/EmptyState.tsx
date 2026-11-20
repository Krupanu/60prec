import { Box, Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import type { ReactNode } from 'react';

interface Props {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export default function EmptyState({
  title = 'Ничего не найдено',
  message = 'Попробуйте изменить параметры поиска',
  action,
}: Props) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2,
        color: 'text.secondary',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 64, color: '#D9CBC2', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mb: action ? 3 : 0 }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
}
