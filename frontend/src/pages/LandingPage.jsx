import React from 'react';
import { Box, Typography, Button, Container, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LocalHospital, CheckCircle, CloudQueue, PhoneInTalk, Security, Assessment, Group, LocalPharmacy } from '@mui/icons-material';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const orangeColor = '#FF8200';
  const greenColor = '#84C225';
  const blueColor = '#1265A8';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* White App Bar */}
      <Box sx={{ bgcolor: 'white', py: 2, px: { xs: 2, md: 8 }, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital sx={{ color: greenColor, fontSize: 40 }} />
          <Typography variant="h4" sx={{ color: blueColor, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            Hospital Management System
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', mt: 0.5 }}>Integrated Hospital Management System</Typography>
          </Typography>
        </Box>

        {/* Navigation Links - Desktop Only */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
          {['HOME', 'FEATURES', 'CONTACT US'].map((text) => (
            <Typography 
              key={text} 
              variant="subtitle2" 
              sx={{ color: '#475569', fontWeight: 600, cursor: 'pointer', '&:hover': { color: blueColor } }}
            >
              {text}
            </Typography>
          ))}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/register')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm hover:shadow-md transform transition-transform hover:-translate-y-1 duration-300"
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 3 }}
            >
              Sign Up
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-xl transform transition-transform hover:-translate-y-1 duration-300"
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
            >
              Login ✨
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ color: blueColor, fontWeight: 700, mb: 3 }}>
              The Ultimate Next-Generation Hospital Management System for Medical Professionals.
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', mb: 4, fontSize: '1.1rem' }}>
              Experience state-of-the-art digital control over your clinical workflows. Our integrated platform handles Patient Records, Doctor Appointments, Billing, and even AI-Driven Disease Prediction in one seamless ecosystem.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Smart Appointment Scheduling', 'Electronic Medical Records (EMR)', 'AI Disease Prediction Engine', 'Secure Prescription & Billing'].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: greenColor, fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ color: '#334155', fontWeight: 500 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Visual representation of the diagram in screenshot */}
            <Box sx={{ position: 'relative', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <img 
                 src="https://placehold.co/500x400/E2E8F0/1265A8?text=Doctor+Illustration" 
                 alt="Doctor Illustration"
                 className="max-w-full h-auto rounded-xl shadow-2xl transition-all duration-700 hover:scale-[1.02]" 
               />
               <Box className="absolute top-[10%] right-[10%] bg-white p-3 rounded-2xl shadow-xl animate-bounce">
                  <Assessment sx={{ color: orangeColor, fontSize: 40 }} />
               </Box>
               <Box className="absolute bottom-[20%] left-[10%] bg-white p-3 rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                  <PhoneInTalk sx={{ color: '#E91E63', fontSize: 40 }} />
               </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>


      {/* Why HMS Section */}
      <Box sx={{ bgcolor: '#F8FAFC', py: 8, flexGrow: 1 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ color: '#334155', fontWeight: 700, mb: 6 }}>
            Why Choose Our HMS?
          </Typography>
          <Grid container spacing={4}>
            
            <Grid item xs={12} md={4}>
              <Box className="bg-white p-8 rounded-2xl h-full text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition-transform duration-300 hover:-translate-y-3 cursor-pointer" sx={{ borderBottom: `4px solid ${blueColor}` }}>
                <CloudQueue sx={{ fontSize: 60, color: blueColor, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F172A' }}>Reliable Cloud Architecture</Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Highly available cloud infrastructure ensuring your hospital's critical patient data is accessible rapidly and securely, 24/7 without interruption.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box className="bg-white p-8 rounded-2xl h-full text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition-transform duration-300 hover:-translate-y-3 cursor-pointer" sx={{ borderBottom: `4px solid ${greenColor}` }}>
                <Group sx={{ fontSize: 60, color: greenColor, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F172A' }}>Advanced Clinical Tools</Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Empower your doctors with seamlessly integrated Medical Records and an advanced AI-Driven Disease Prediction system for superior patient diagnosis.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box className="bg-white p-8 rounded-2xl h-full text-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition-transform duration-300 hover:-translate-y-3 cursor-pointer" sx={{ borderBottom: `4px solid ${orangeColor}` }}>
                <Security sx={{ fontSize: 60, color: orangeColor, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F172A' }}>Uncompromising Security</Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  Built with strict Role-Based Access Control (RBAC) ensuring patient confidentiality. Hard-delete isolation protects your sensitive clinical workflows.
                </Typography>
              </Box>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: blueColor, color: 'white', pt: 6, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocalHospital sx={{ color: 'white', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Hospital HMS</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>✉ support@hospitalhms.com</Typography>
              <Typography variant="body2">📞 +94 12345678</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>QUICK LINKS</Typography>
              {['Home', 'About Us', 'Pricing', 'FAQ', 'Blog'].map(link => (
                <Typography key={link} variant="body2" sx={{ mb: 1, cursor: 'pointer', '&:hover': { color: greenColor } }}>{link}</Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>MODULES</Typography>
              {['Doctor Appointments', 'Patient EMR', 'AI Disease Prediction', 'Pharmacy & Prescriptions', 'Automated Billing'].map(link => (
                <Typography key={link} variant="body2" sx={{ mb: 1, cursor: 'pointer', '&:hover': { color: greenColor } }}>{link}</Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>SECURITY & TECH</Typography>
              {['Role-Based Access Control', 'Encrypted Credentials', 'RESTful Microservices', 'React + Vite Architecture'].map(link => (
                <Typography key={link} variant="body2" sx={{ mb: 1 }}>{link}</Typography>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box sx={{ bgcolor: greenColor, color: 'white', py: 2, textAlign: 'center' }}>
        <Typography variant="body2">Copyright © Hospital HMS - All Rights Reserved | Privacy Policy</Typography>
      </Box>

    </Box>
  );
};

export default LandingPage;
