import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h2" color="primary" fontWeight={700}>
        404
      </Typography>
      <Typography variant="h6" gutterBottom>
        Страница не найдена
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Возможно, страница была удалена или вы перешли по неверной ссылке
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        На главную
      </Button>
    </Box>
  );
}
