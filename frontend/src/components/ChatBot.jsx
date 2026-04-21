import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Fab, Paper, Typography, TextField, IconButton, List, ListItem,
  ListItemText, Avatar, Drawer, Divider, CircularProgress, Card, CardContent,
  Fade, useTheme, Button, Tooltip, Zoom
} from '@mui/material';
import { 
  Chat, Close, Send, Psychology, Person, 
  MedicalServices, LocalHospital, NavigateNext 
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ChatBot = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your AI Medical Assistant. Describe your symptoms to me, and I'll analyze them for you.", 
      sender: 'bot', 
      time: new Date() 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [realPatientId, setRealPatientId] = useState(null);

  useEffect(() => {
    if (user?.id && user.role === 'ROLE_PATIENT') {
      fetchPatientId();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchPatientId = async () => {
    try {
      const res = await axios.get(`/api/patients/user/${user.id}`);
      setRealPatientId(res.data.id);
    } catch (err) {
      console.error("Chatbot: Could not find linked patient profile.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chatbot/message', {
        message: input,
        patientId: realPatientId
      });

      const botMsg = { 
        id: Date.now() + 1, 
        text: res.data.response, 
        prediction: res.data.prediction,
        sender: 'bot', 
        time: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Sorry, I'm having trouble thinking right now. Please try again later.", 
        sender: 'bot', 
        time: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => setOpen(!open);

  return (
    <>
      <Zoom in timeout={1000}>
        <Fab 
          color="primary" 
          aria-label="chat" 
          sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 2000, boxShadow: theme.shadows[10] }}
          onClick={toggleChat}
        >
          {open ? <Close /> : <Tooltip title="AI Symptom Checker Chat" arrow placement="left"><Chat /></Tooltip>}
        </Fab>
      </Zoom>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleChat}
        PaperProps={{
          sx: { width: { xs: '100vw', sm: 400 }, borderRadius: { sm: '20px 0 0 20px' }, height: '100vh', display: 'flex', flexDirection: 'column' }
        }}
      >
        <Box sx={{ p: 2, background: theme.palette.primary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: 'white' }}>
              <Psychology color="primary" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">HMS AI Assistant</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Symptom Analysis Engaged</Typography>
            </Box>
          </Box>
          <IconButton onClick={toggleChat} color="inherit">
            <Close />
          </IconButton>
        </Box>

        <Box 
          sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f4f7f9', display: 'flex', flexDirection: 'column', gap: 2 }} 
          ref={scrollRef}
        >
          {messages.map((msg) => (
            <Box 
              key={msg.id} 
              sx={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              <Fade in>
                <Paper sx={{ 
                  p: 2, 
                  borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  bgcolor: msg.sender === 'user' ? theme.palette.primary.main : 'white',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  boxShadow: 2
                }}>
                  <Typography variant="body2">{msg.text}</Typography>
                  
                  {msg.prediction && (
                    <Card sx={{ 
                      mt: 2, 
                      borderRadius: 3, 
                      borderLeft: '5px solid', 
                      borderColor: 'primary.main', 
                      bgcolor: 'rgba(30, 58, 138, 0.03)',
                      boxShadow: 'none',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <CardContent sx={{ p: '16px !important' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                          <MedicalServices fontSize="small" color="primary" />
                          <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 1, color: 'primary.main' }}>AI ANALYSIS</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="800" gutterBottom>
                          {msg.prediction.predictedCategory}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                          Our AI models suggest consulting a <strong>{msg.prediction.recommendedSpecialist}</strong> based on these symptoms.
                        </Typography>
                        <Button 
                          size="small" 
                          variant="contained" 
                          disableElevation
                          sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }} 
                          endIcon={<NavigateNext />} 
                          href="/disease-prediction"
                        >
                          View Full Report
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </Paper>
              </Fade>
            </Box>
          ))}
          {loading && (
            <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1, alignItems: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
              <CircularProgress size={12} />
              <Typography variant="caption">AI is thinking...</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="e.g., I have fever and a bad cough..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              autoComplete="off"
            />
            <IconButton color="primary" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatBot;
