import React, { useState, useEffect } from 'react'
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    Autocomplete,
    Tooltip,
    CircularProgress,
    Alert,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import {
    Add,
    Search,
    Visibility,
    Delete,
    Payment,
    Receipt,
    Download,
    CheckCircle,
    AccountBalanceWallet,
    Edit,
} from '@mui/icons-material'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { format, parseISO } from 'date-fns'

const schema = yup.object().shape({
    appointmentId: yup.number().required('Appointment is required'),
    patientId: yup.number().required('Patient is required'),
    doctorFee: yup.number().min(0).default(0),
    labFee: yup.number().min(0).default(0),
    medicineFee: yup.number().min(0).default(0),
    otherCharges: yup.number().min(0).default(0),
    discountAmount: yup.number().min(0).default(0),
    paymentStatus: yup.string().oneOf(['PAID', 'PENDING', 'PARTIAL', 'CANCELLED']).required('Status is required'),
    paymentMethod: yup.string(),
    notes: yup.string(),
})

const Billing = () => {
    const [bills, setBills] = useState([])
    const [appointments, setAppointments] = useState([])
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBill, setSelectedBill] = useState(null)
    const [editingBill, setEditingBill] = useState(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            doctorFee: 0,
            labFee: 0,
            medicineFee: 0,
            otherCharges: 0,
            discountAmount: 0,
            paymentStatus: 'PENDING',
        }
    })

    // Calculate totals for the form display
    const watchedFields = watch(['doctorFee', 'labFee', 'medicineFee', 'otherCharges', 'discountAmount'])
    const totalAmount = (watchedFields[0] || 0) + (watchedFields[1] || 0) + (watchedFields[2] || 0) + (watchedFields[3] || 0)
    const finalAmount = totalAmount - (watchedFields[4] || 0)

    useEffect(() => {
        fetchBills()
        fetchAppointments()
        fetchPatients()
    }, [])

    const fetchBills = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/bills/patient/1') // This is a placeholder, usually we'd have /api/bills for admins
            // Check if there's a better endpoint for admins
            setBills(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Error fetching bills:', error)
            // Fallback: search-based fetching or handle empty
            setBills([])
        } finally {
            setLoading(false)
        }
    }

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointments')
            setAppointments(response.data)
        } catch (error) {
            console.error('Error fetching appointments:', error)
        }
    }

    const fetchPatients = async () => {
        try {
            const response = await axios.get('/api/patients')
            setPatients(response.data)
        } catch (error) {
            console.error('Error fetching patients:', error)
        }
    }

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true)
            setSubmitError(null)
            if (editingBill) {
                await axios.put(`/api/bills/${editingBill.id}`, data)
            } else {
                await axios.post('/api/bills', data)
            }
            setOpenDialog(false)
            setEditingBill(null)
            reset()
            fetchBills()
        } catch (error) {
            setSubmitError(error.response?.data?.message || 'Failed to process request.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteBill = async (id) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                await axios.delete(`/api/bills/${id}`)
                fetchBills()
            } catch (error) {
                console.error('Delete bill error:', error)
            }
        }
    }

    const handleEditBill = (bill) => {
        setEditingBill(bill)
        reset({
            appointmentId: bill.appointmentId,
            patientId: bill.patientId,
            doctorFee: bill.doctorFee,
            labFee: bill.labFee,
            medicineFee: bill.medicineFee,
            otherCharges: bill.otherCharges,
            discountAmount: bill.discountAmount,
            paymentStatus: bill.paymentStatus,
            paymentMethod: bill.paymentMethod,
            notes: bill.notes,
        })
        setOpenDialog(true)
    }

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.patch(`/api/bills/${id}/status?status=${status}`)
            fetchBills()
        } catch (error) {
            console.error('Update status error:', error)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'success'
            case 'PENDING': return 'error'
            case 'PARTIAL': return 'warning'
            default: return 'default'
        }
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Billing & Invoices</Typography>
                    <Typography variant="subtitle2" color="textSecondary">Manage payments and financial records</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Generate Invoice
                </Button>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.main', color: 'white' }}>
                        <AccountBalanceWallet fontSize="large" />
                        <Box>
                            <Typography variant="overline">Total Outstanding</Typography>
                            <Typography variant="h4" fontWeight="bold">
                                LKR {bills.filter(b => b.paymentStatus !== 'PAID').reduce((acc, b) => acc + b.finalAmount, 0).toFixed(2)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Search sx={{ ml: 2, mr: 1, color: 'text.secondary' }} />
                        <TextField
                            fullWidth
                            variant="standard"
                            placeholder="Search invoices by patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ disableUnderline: true }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                            <TableCell><strong>Invoice ID</strong></TableCell>
                            <TableCell><strong>Patient</strong></TableCell>
                            <TableCell><strong>Total Amount</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Receipt sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
                                    <Typography color="textSecondary">No billing records found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            bills
                                .filter(b => b.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((bill) => (
                                    <TableRow key={bill.id} hover>
                                        <TableCell>#{bill.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">{bill.patientName}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="bold">LKR {bill.finalAmount.toFixed(2)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={bill.paymentStatus}
                                                size="small"
                                                color={getStatusColor(bill.paymentStatus)}
                                            />
                                        </TableCell>
                                        <TableCell>{bill.createdAt ? format(new Date(bill.createdAt), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Invoice">
                                                <IconButton size="small" onClick={() => setSelectedBill(bill)} color="primary"><Visibility /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Bill">
                                                <IconButton size="small" onClick={() => handleEditBill(bill)} color="info"><Edit /></IconButton>
                                            </Tooltip>
                                            {bill.paymentStatus !== 'PAID' && (
                                                <Tooltip title="Mark as Paid">
                                                    <IconButton size="small" onClick={() => handleStatusUpdate(bill.id, 'PAID')} color="success"><CheckCircle /></IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Delete Bill">
                                                <IconButton size="small" onClick={() => handleDeleteBill(bill.id)} color="error"><Delete /></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Bill Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle fontWeight="bold">Generate New Invoice</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Controller
                                    name="patientId"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            options={patients}
                                            getOptionLabel={(option) => option.fullName || ''}
                                            onChange={(_, data) => field.onChange(data?.id)}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Select Patient" error={!!errors.patientId} />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="appointmentId"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            options={appointments}
                                            getOptionLabel={(option) => `Visit: ${option.patientName} - ${option.doctorName} (${format(parseISO(option.appointmentDate), 'dd/MM/yy')})` || ''}
                                            onChange={(_, data) => field.onChange(data?.id)}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Select Appointment" error={!!errors.appointmentId} />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField fullWidth type="number" label="Consultation Fee" {...control.register('doctorFee')} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth type="number" label="Laboratory Fee" {...control.register('labFee')} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth type="number" label="Medicine Charges" {...control.register('medicineFee')} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth type="number" label="Miscellaneous" {...control.register('otherCharges')} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth type="number" label="Discount Amount" {...control.register('discountAmount')} />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Initial Status</InputLabel>
                                    <Controller
                                        name="paymentStatus"
                                        control={control}
                                        render={({ field }) => (
                                            <Select {...field} label="Initial Status">
                                                <MenuItem value="PENDING">PENDING</MenuItem>
                                                <MenuItem value="PAID">PAID</MenuItem>
                                                <MenuItem value="PARTIAL">PARTIAL</MenuItem>
                                            </Select>
                                        )}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', textAlign: 'right' }}>
                                    <Typography variant="body2" color="textSecondary">Subtotal: LKR {totalAmount.toFixed(2)}</Typography>
                                    <Typography variant="h5" fontWeight="bold">Total Due: LKR {finalAmount.toFixed(2)}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                        {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Generate Invoice'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* View Bill Details */}
            <Dialog open={!!selectedBill} onClose={() => setSelectedBill(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Invoice Detail</Typography>
                    <Chip label={selectedBill?.paymentStatus} color={getStatusColor(selectedBill?.paymentStatus)} />
                </DialogTitle>
                <DialogContent dividers>
                    {selectedBill && (
                        <Box>
                            <Box mb={4}>
                                <Typography variant="h5" color="primary" fontWeight="bold">HOSPITAL SYSTEM</Typography>
                                <Typography variant="caption" color="textSecondary">Clinical Services Invoice</Typography>
                            </Box>

                            <Grid container spacing={2} mb={4}>
                                <Grid item xs={6}>
                                    <Typography variant="overline" color="textSecondary">Bill To</Typography>
                                    <Typography variant="body1" fontWeight="bold">{selectedBill.patientName}</Typography>
                                </Grid>
                                <Grid item xs={6} textAlign="right">
                                    <Typography variant="overline" color="textSecondary">Invoice Date</Typography>
                                    <Typography variant="body1">{format(new Date(selectedBill.createdAt), 'PP')}</Typography>
                                </Grid>
                            </Grid>

                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Physician Consultation Fees</TableCell>
                                        <TableCell align="right">LKR {selectedBill.doctorFee?.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Laboratory & Testing</TableCell>
                                        <TableCell align="right">LKR {selectedBill.labFee?.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Pharmacy Supplies</TableCell>
                                        <TableCell align="right">LKR {selectedBill.medicineFee?.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Hospital Facilities & Others</TableCell>
                                        <TableCell align="right">LKR {selectedBill.otherCharges?.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Total Charges</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>LKR {selectedBill.totalAmount?.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: 'error.main' }}>Discount Applied</TableCell>
                                        <TableCell align="right" sx={{ color: 'error.main' }}>LKR {selectedBill.discountAmount?.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Net Amount Due</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}>
                                            LKR {selectedBill.finalAmount?.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            <Box mt={4}>
                                <Typography variant="caption" color="textSecondary">Note: {selectedBill.notes || 'No adjustment notes provided.'}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedBill(null)}>Close</Button>
                    <Button variant="contained" startIcon={<Download />}>Download</Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}

export default Billing
