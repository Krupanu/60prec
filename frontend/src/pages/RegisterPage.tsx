import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { homePathFor } from './LoginPage';

interface FormState {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.firstName.trim()) e.firstName = 'Укажите имя';
    if (!form.lastName.trim()) e.lastName = 'Укажите фамилию';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Введите корректный e-mail';
    if (!/^\+?[0-9\s\-()]{7,20}$/.test(form.phone)) e.phone = 'Введите корректный телефон';
    if (form.password.length < 6) e.password = 'Пароль не короче 6 символов';
    if (form.password !== form.passwordConfirm) e.passwordConfirm = 'Пароли не совпадают';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      navigate(homePathFor(user), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 460 }} elevation={3}>
        <Typography variant="h5" align="center" gutterBottom>
          Регистрация
        </Typography>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Имя"
            fullWidth
            margin="normal"
            value={form.firstName}
            onChange={set('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
          <TextField
            label="Фамилия"
            fullWidth
            margin="normal"
            value={form.lastName}
            onChange={set('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={set('email')}
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="email"
          />
          <TextField
            label="Телефон"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={set('phone')}
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="+375 29 123-45-67"
          />
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={set('password')}
            error={!!errors.password}
            helperText={errors.password}
            autoComplete="new-password"
          />
          <TextField
            label="Повторите пароль"
            type="password"
            fullWidth
            margin="normal"
            value={form.passwordConfirm}
            onChange={set('passwordConfirm')}
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Регистрация…' : 'Зарегистрироваться'}
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Уже есть аккаунт?{' '}
          <MuiLink component={Link} to="/login">
            Войти
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
