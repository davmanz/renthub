import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Alert, CircularProgress,
  Checkbox, FormControlLabel, Divider, Typography
} from '@mui/material';
import api from '../../../../api/api';
import endpoints from '../../../../api/endpoints';

interface EditBuildingModalProps {
  open: boolean;
  onClose: () => void;
  building: { id: string; name: string; address?: string; } | null;
  refreshBuildings: () => void;
}

const EditBuildingModal = ({ open, onClose, building, refreshBuildings }: EditBuildingModalProps) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editFields, setEditFields] = useState({
    name: false,
    address: false
  });

  useEffect(() => {
    if (building) {
      setName(building.name);
      setAddress(building.address || '');
      // Resetear checkboxes al abrir el modal
      setEditFields({ name: false, address: false });
    }
  }, [building]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que al menos un campo esté seleccionado para editar
    if (!editFields.name && !editFields.address) {
      setError('Seleccione al menos un campo para editar');
      return;
    }

    // Validar campos que estén habilitados para edición
    if (editFields.name && !name.trim()) {
      setError('El nombre del edificio es requerido');
      return;
    }

    if (editFields.address && !address.trim()) {
      setError('La dirección es requerida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Solo enviar los campos que están habilitados para edición
      const updateData: any = {};
      if (editFields.name) updateData.name = name.trim();
      if (editFields.address) updateData.address = address.trim();

      await api.patch(endpoints.siteManagement.building + `${building?.id}/`, updateData);
      refreshBuildings();
      onClose();
    } catch (error) {
      setError('Error al actualizar el edificio');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field: keyof typeof editFields) => {
    setEditFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        Editar Edificio
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
              Seleccione los campos que desea editar:
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editFields.name}
                    onChange={() => handleCheckboxChange('name')}
                    color="primary"
                  />
                }
                label="Editar nombre"
              />
              <TextField
                label="Nombre del Edificio"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editFields.name || loading}
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editFields.address}
                    onChange={() => handleCheckboxChange('address')}
                    color="primary"
                  />
                }
                label="Editar dirección"
              />
              <TextField
                label="Dirección del Edificio"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!editFields.address || loading}
                sx={{ mt: 1 }}
              />
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || (!editFields.name && !editFields.address)}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditBuildingModal;