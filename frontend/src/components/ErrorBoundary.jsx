import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.group('React Error Boundary Caught:');
    console.error(error);
    console.error(errorInfo);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh" 
          bgcolor="#f8fafc"
          p={3}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h4" color="error" gutterBottom fontWeight="bold">
              Something went wrong
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              The application encountered an unexpected error while rendering this page.
            </Typography>
            <Box 
              bgcolor="#fff1f2" 
              p={2} 
              borderRadius={2} 
              textAlign="left" 
              mb={3}
              sx={{ overflowX: 'auto', border: '1px solid #fecaca' }}
            >
              <Typography variant="caption" component="pre" sx={{ color: '#991b1b', fontFamily: 'monospace' }}>
                {this.state.error && this.state.error.toString()}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ px: 4 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
