import React from 'react';
import { Autocomplete, TextField, Box, IconButton, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface TagAutocompleteProps {
  options: string[];
  loading?: boolean;
  value: string[];
  onChange: (tags: string[]) => void;
  onSave: () => void;
  disabled?: boolean;
}

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({ options, loading, value, onChange, onSave, disabled }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
      <Autocomplete
        multiple
        freeSolo
        options={options}
        value={value}
        onChange={(_, newValue) => onChange(newValue as string[])}
        renderInput={(params) => (
          <TextField {...params} label="Tags" size="small" disabled={disabled} />
        )}
        disabled={disabled}
        sx={{ minWidth: 200, flex: 1 }}
        loading={loading}
      />
      <IconButton color="primary" onClick={onSave} disabled={disabled || value.length === 0} size="large">
        {loading ? <CircularProgress size={24} /> : <CheckIcon />}
      </IconButton>
    </Box>
  );
};

export default TagAutocomplete;
