import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { tripApi } from '../api/tripApi';
import { transportApi } from '../api/transportApi';
import { documentApi } from '../api/documentApi';
import { getErrorMessage } from '../api/client';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import type { DocumentItem, Transport, Trip, TripStatus } from '../types';

const TRANSPORT_TYPE_LABELS: Record<Transport['type'], string> = {
  BUS: 'Автобус',
  MINIVAN: 'Минивэн',
  CAR: 'Легковой автомобиль',
};

// Кабинет владельца транспортного средства
export default function OwnerDashboard() {
  const [tab, setTab] = useState(0);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [error, setError] = useState('');

  const loadTrips = useCallback(() => {
    tripApi
      .getMy()
      .then(setTrips)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const loadTransports = useCallback(() => {
    transportApi
      .getMy()
      .then(setTransports)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    loadTrips();
    loadTransports();
  }, [loadTrips, loadTransports]);

  const handleSetStatus = async (tripId: number, status: TripStatus) => {
    try {
      await tripApi.setStatus(tripId, status);
      loadTrips();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Кабинет владельца транспорта
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Мои рейсы" />
        <Tab label="Мои транспортные средства" />
        <Tab label="Документы" />
      </Tabs>

      {tab === 0 && (
        trips.length === 0 ? (
          <EmptyState title="Рейсов нет" message="Менеджер назначит рейс на ваше транспортное средство" />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Тур</TableCell>
                  <TableCell>Транспорт</TableCell>
                  <TableCell>Дата выезда</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Сменить статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id} hover>
                    <TableCell>{trip.id}</TableCell>
                    <TableCell>{trip.tour.title}</TableCell>
                    <TableCell>
                      {trip.transport.model} ({trip.transport.plateNumber})
                    </TableCell>
                    <TableCell>{new Date(trip.departureDate).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>
                      <StatusChip status={trip.status} kind="trip" />
                    </TableCell>
                    <TableCell align="right">
                      {trip.status === 'SCHEDULED' && (
                        <Button size="small" variant="contained" onClick={() => handleSetStatus(trip.id, 'READY')}>
                          Готов к выезду
                        </Button>
                      )}
                      {trip.status === 'READY' && (
                        <Button size="small" variant="contained" onClick={() => handleSetStatus(trip.id, 'EN_ROUTE')}>
                          В пути
                        </Button>
                      )}
                      {trip.status === 'EN_ROUTE' && (
                        <Button size="small" variant="contained" color="success" onClick={() => handleSetStatus(trip.id, 'COMPLETED')}>
                          Выполнен
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {tab === 1 && (
        transports.length === 0 ? (
          <EmptyState title="Транспортных средств нет" message="Менеджер добавит ваше транспортное средство" />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Модель</TableCell>
                  <TableCell>Гос. номер</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Мест</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transports.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.model}</TableCell>
                    <TableCell>{t.plateNumber}</TableCell>
                    <TableCell>{TRANSPORT_TYPE_LABELS[t.type]}</TableCell>
                    <TableCell>{t.seats}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {tab === 2 && <DocumentsTab trips={trips} onError={setError} />}
    </Box>
  );
}

interface DocumentsTabProps {
  trips: Trip[];
  onError: (msg: string) => void;
}

function DocumentsTab({ trips, onError }: DocumentsTabProps) {
  const [selectedTripId, setSelectedTripId] = useState<number | ''>('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadDocs = useCallback(
    (tripId: number) => {
      documentApi
        .getByTrip(tripId)
        .then(setDocuments)
        .catch((err) => onError(getErrorMessage(err)));
    },
    [onError],
  );

  useEffect(() => {
    if (selectedTripId !== '') loadDocs(selectedTripId);
    else setDocuments([]);
  }, [selectedTripId, loadDocs]);

  const handleUpload = async () => {
    if (selectedTripId === '' || !file) return;
    setUploading(true);
    try {
      await documentApi.upload(selectedTripId, file);
      setFile(null);
      loadDocs(selectedTripId);
    } catch (err) {
      onError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      const blob = await documentApi.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await documentApi.remove(deleteId);
      setDeleteId(null);
      if (selectedTripId !== '') loadDocs(selectedTripId);
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Рейс</InputLabel>
          <Select
            label="Рейс"
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <MenuItem value="">— выберите рейс —</MenuItem>
            {trips.map((trip) => (
              <MenuItem key={trip.id} value={trip.id}>
                №{trip.id} · {trip.tour.title} · {new Date(trip.departureDate).toLocaleDateString('ru-RU')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={selectedTripId === ''}>
          {file ? file.name : 'Выбрать файл'}
          <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedTripId === '' || !file || uploading}
        >
          {uploading ? 'Загрузка…' : 'Загрузить'}
        </Button>
      </Box>

      {selectedTripId === '' ? (
        <EmptyState title="Выберите рейс" message="Документы прикрепляются к конкретному рейсу" />
      ) : documents.length === 0 ? (
        <EmptyState title="Документов нет" message="Загрузите путевой лист или договор к этому рейсу" />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Имя файла</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Загружен</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>{doc.id}</TableCell>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>{doc.fileType}</TableCell>
                  <TableCell>{new Date(doc.uploadedAt).toLocaleString('ru-RU')}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(doc)} sx={{ mr: 1 }}>
                      Скачать
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteId(doc.id)}>
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="Удалить документ?"
        message="Файл будет удалён без возможности восстановления."
        confirmText="Удалить"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
