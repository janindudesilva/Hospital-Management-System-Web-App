import React, { useState, useRef } from 'react'
import {
  Box,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material'
import {
  CameraAlt,
  Close,
  CloudUpload,
  Check,
} from '@mui/icons-material'
import axios from 'axios'

const ProfilePictureUpload = ({ 
  currentImage, 
  onImageUpdate, 
  userId, 
  size = 120,
  showName = true,
  name = '',
  readOnly = false 
}) => {
  const theme = useTheme()
  const fileInputRef = useRef(null)
  const [uploadDialog, setUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
        setUploadDialog(true)
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('profilePicture', selectedFile)
    formData.append('userId', userId)

    try {
      const response = await axios.post('/api/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Profile picture updated successfully!')
      onImageUpdate(response.data.profilePictureUrl)
      
      // Close dialog after success
      setTimeout(() => {
        setUploadDialog(false)
        setSelectedFile(null)
        setPreviewUrl(null)
        setSuccess('')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading profile picture')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePicture = async () => {
    try {
      await axios.delete(`/api/upload/profile-picture/${userId}`)
      onImageUpdate('')
      setSuccess('Profile picture removed successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.response?.data?.message || 'Error removing profile picture')
    }
  }

  const handleCloseDialog = () => {
    setUploadDialog(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setError('')
    setSuccess('')
  }

  const getImageUrl = (image) => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `/uploads/profile-pictures/${image}`
  }

  return (
    <Box>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Box position="relative">
          <Avatar
            src={getImageUrl(currentImage)}
            sx={{
              width: size,
              height: size,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: theme.shadows[4],
              cursor: readOnly ? 'default' : 'pointer',
              '&:hover': !readOnly && {
                boxShadow: theme.shadows[8],
              }
            }}
            onClick={!readOnly ? () => fileInputRef.current?.click() : undefined}
          >
            {!currentImage && name.charAt(0)?.toUpperCase()}
          </Avatar>
          
          {!readOnly && (
            <IconButton
              sx={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                width: 36,
                height: 36,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraAlt fontSize="small" />
            </IconButton>
          )}
        </Box>

        {showName && (
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            {name}
          </Typography>
        )}

        {!readOnly && currentImage && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleRemovePicture}
            startIcon={<Close />}
          >
            Remove Picture
          </Button>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload Preview Dialog */}
      <Dialog open={uploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Update Profile Picture
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {uploading && <LinearProgress sx={{ mb: 2 }} />}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                maxWidth: 300,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                Preview
              </Typography>
              <Avatar
                src={previewUrl}
                sx={{
                  width: 120,
                  height: 120,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              />
              <Typography variant="body2" color="textSecondary" noWrap>
                {selectedFile?.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Size: {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Paper>

            <Box display="flex" gap={2} width="100%">
              <Button
                variant="outlined"
                onClick={handleCloseDialog}
                disabled={uploading}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading}
                startIcon={uploading ? <></> : <CloudUpload />}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ProfilePictureUpload
