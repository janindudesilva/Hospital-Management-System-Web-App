import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Fade,
  useTheme,
  alpha,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Add,
  Delete,
  CreditCard,
  ChevronLeft,
  Security,
  VerifiedUser,
  Edit,
  Receipt,
  Payment,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';

const safeFormatDate = (dateVal, formatStr) => {
  if (!dateVal) return 'N/A';
  try {
    let d;
    if (typeof dateVal === 'string') {
      d = parseISO(dateVal);
      if (!isValid(d)) d = new Date(dateVal);
    } else if (Array.isArray(dateVal)) {
      d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0);
    } else {
      d = new Date(dateVal);
    }
    return isValid(d) ? format(d, formatStr) : 'Invalid Date';
  } catch (e) {
    return 'Invalid Date';
  }
}

const PaymentMethods = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardType: 'VISA'
  });

  useEffect(() => {
    if (user?.id) {
      fetchPatientAndCards();
    }
  }, [user]);

  const fetchPatientAndCards = async () => {
    try {
      setLoading(true);
      const patientRes = await axios.get(`/api/patients/user/${user.id}`);
      const pId = patientRes.data.id;
      setPatientId(pId);
      
      const cardsRes = await axios.get(`/api/payment-cards/patient/${pId}`);
      const billsRes = await axios.get(`/api/bills/patient/${pId}`);
      setCards(cardsRes.data);
      setBills(billsRes.data);
    } catch (err) {
      setError('Failed to load payment methods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    // Basic validation
    if (!editingCardId && !/^\d{16}$/.test(formData.cardNumber)) {
      setError('Card number must be 16 digits');
      return;
    }
    
    const [month, year] = formData.expiryDate.split('/');
    const m = parseInt(month, 10);
    if (!month || !year || m < 1 || m > 12) {
      setError('Invalid expiry date (MM/YY)');
      return;
    }

    if (!editingCardId && !/^\d{3,4}$/.test(formData.cvv)) {
      setError('CVV must be 3 or 4 digits');
      return;
    }

    try {
      setError('');
      if (editingCardId) {
        await axios.put(`/api/payment-cards/${editingCardId}`, {
          ...formData,
          patientId: patientId
        });
        setSuccess('Card updated successfully!');
      } else {
        await axios.post('/api/payment-cards', {
          ...formData,
          patientId: patientId
        });
        setSuccess('Card added successfully!');
      }
      setOpenDialog(false);
      setFormData({
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardType: 'VISA'
      });
      setEditingCardId(null);
      fetchPatientAndCards();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save card. Please check details.';
      setError(msg);
    }
  };

  const handlePayBill = (bill) => {
    navigate('/patient-dashboard');
  };

  const resetForm = () => {
    setOpenDialog(false);
    setFormData({
      cardHolderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardType: 'VISA'
    });
    setEditingCardId(null);
  };

  const handleEditClick = (card) => {
    setEditingCardId(card.id);
    setFormData({
      cardHolderName: card.cardHolderName,
      cardNumber: '**** **** **** ' + (card.cardNumberMasked?.split(' ').pop() || ''), // Just for visual cue
      expiryDate: card.expiryDate,
      cvv: '***', // Placeholder
      cardType: card.cardType
    });
    setOpenDialog(true);
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm('Are you sure you want to remove this card?')) {
      try {
        await axios.delete(`/api/payment-cards/${id}`);
        setSuccess('Card removed');
        fetchPatientAndCards();
      } catch (err) {
        setError('Failed to remove card');
      }
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          <Box display="flex" alignItems="center" mb={4}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">Payments & Bills</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Grid container spacing={3}>
            {/* Payment Cards */}
            {Array.isArray(cards) && cards.map((card) => (
              <Grid item xs={12} key={card.id}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: theme.shadows[2],
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                          <CreditCard />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {card.cardType} {card.cardNumberMasked}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Expires {card.expiryDate} • {card.cardHolderName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit Card">
                          <IconButton onClick={() => handleEditClick(card)} color="primary">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Card">
                          <IconButton onClick={() => handleDeleteCard(card.id)} color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Add New Card Placeholder */}
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  borderRadius: 4, 
                  borderStyle: 'dashed',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                }}
                onClick={() => setOpenDialog(true)}
              >
                <Add color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" color="primary" fontWeight="bold">Add New Payment Method</Typography>
                <Typography variant="body2" color="textSecondary">Cards are stored securely using industry-standard encryption</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box mt={6} mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">My Bills</Typography>
          </Box>
          
          {bills.length === 0 ? (
            <Box textAlign="center" py={4} bgcolor={alpha(theme.palette.primary.main, 0.02)} borderRadius={4} border={`1px dashed ${alpha(theme.palette.primary.main, 0.2)}`}>
              <Typography variant="body1" color="textSecondary">
                No billing records found
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 4, mb: 4, overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="right"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.map(bill => (
                    <TableRow key={bill.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>#{bill.id}</TableCell>
                      <TableCell>Hospital Services</TableCell>
                      <TableCell>LKR {Number(bill.finalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={bill.paymentStatus} 
                          size="small" 
                          color={bill.paymentStatus === 'PAID' ? 'success' : 'error'} 
                          sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>{safeFormatDate(bill.createdAt, 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        {bill.paymentStatus !== 'PAID' && (
                          <Button size="small" variant="contained" onClick={() => handlePayBill(bill)} sx={{ borderRadius: 2 }}>
                            Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box mt={6} p={3} borderRadius={4} bgcolor={alpha(theme.palette.success.main, 0.05)} border={`1px solid ${alpha(theme.palette.success.main, 0.1)}`}>
            <Box display="flex" gap={2} alignItems="center">
              <Security color="success" />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="success.dark">Security Information</Typography>
                <Typography variant="body2" color="textSecondary">
                  Your full card details never touch our servers. We use secure tokenization to handle your payments safely.
                  All transactions are monitored by our security team.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Add Card Dialog */}
      <Dialog open={openDialog} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingCardId ? 'Edit Payment Card' : 'Add New Payment Card'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={1} mb={3} mt={1} p={1.5} borderRadius={1} bgcolor="rgba(0,0,0,0.03)">
            <VerifiedUser sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="caption" color="textSecondary">Safe & Secure 256-bit SSL Encryption</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Holder Name"
                placeholder="Name as it appears on card"
                value={formData.cardHolderName}
                onChange={(e) => setFormData({...formData, cardHolderName: e.target.value.toUpperCase()})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 1234 5678"
                inputProps={{ maxLength: 16 }}
                disabled={!!editingCardId}
                helperText={editingCardId ? "Card number cannot be changed" : ""}
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '')})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
                value={formData.expiryDate}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.length === 2 && formData.expiryDate.length === 1) val += '/';
                  setFormData({...formData, expiryDate: val});
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                placeholder="123"
                type="password"
                disabled={!!editingCardId}
                inputProps={{ maxLength: 4 }}
                value={formData.cvv}
                onChange={(e) => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={resetForm}>Cancel</Button>
          <Button 
            onClick={handleAddCard} 
            variant="contained" 
            disabled={(!editingCardId && (!formData.cardNumber || !formData.cvv)) || !formData.expiryDate || !formData.cardHolderName}
            sx={{ px: 4, borderRadius: 2 }}
          >
            {editingCardId ? 'Update Card' : 'Save Card'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentMethods;
