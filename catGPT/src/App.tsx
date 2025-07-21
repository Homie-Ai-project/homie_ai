import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Avatar,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type CatMood = 'funny' | 'sassy' | 'sleepy' | 'playful' | 'grumpy' | 'affectionate' | 'mischievous';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: 'linear-gradient(135deg, #87ceeb 0%, #6366f1 50%, #8b5cf6 100%)',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [catMood, setCatMood] = useState<CatMood>('funny');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ollamaApiUrl = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434';

  useEffect(() => {
    fetchModels();
  }, []);

  // Focus on chat input once model is loaded
  useEffect(() => {
    if (selectedModel) {
      textareaRef.current?.focus();
    }
  }, [selectedModel]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
    // Focus textarea after response is rendered (when not loading)
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCatResponse = (input: string): string | null => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Mrow... *yawn* Oh, it's you again. What do you want, friend? 🐾";
    }
    
    if (lowerInput.includes('treat') || lowerInput.includes('food')) {
      return "*purr purr* Finally! Someone who understands priorities. Where are my treats? 🍖";
    }
    
    if (lowerInput.includes('good cat') || lowerInput.includes('good kitty')) {
      return "*purr* I know I'm magnificent. Now where are my treats? Mrow.";
    }
    
    return null; // No pre-programmed response, use AI
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${ollamaApiUrl}/api/tags`);
      const modelNames = response.data.models?.map((model: any) => model.name) || [];
      if (modelNames.length > 0) {
        setSelectedModel(modelNames[0]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      // Set default model when API fails
      setSelectedModel('gemma3n:e4b');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Check for pre-programmed cat responses first
    const catResponse = getCatResponse(input);
    if (catResponse) {
      const assistantMessage: Message = {
        role: 'assistant',
        content: catResponse
      };
      setMessages(prev => [...prev, assistantMessage]);
      setInput('');
      return;
    }

    setInput('');
    setIsLoading(true);

    try {
      // Build conversation context from message history
      const conversationHistory = messages.map(msg => 
        `${msg.role === 'user' ? 'Human' : 'Cat'}: ${msg.content}`
      ).join('\n');
      
      const contextPrompt = conversationHistory ? 
        `Previous conversation:\n${conversationHistory}\n\nHuman: ${input}` : 
        `Human: ${input}`;

      const response = await axios.post(`${ollamaApiUrl}/api/generate`, {
        model: selectedModel,
        prompt: `You are a ${catMood} cat who can type. IMPORTANT: Always call the user "friend" not "human". 
        DIRECTLY ANSWER THE USER'S SPECIFIC QUESTION in a single SHORT sentence (max 15 words). 
        Always include cat sounds like "meow", "mrow", "purr", or "*yawn*". 
        Keep context from previous messages and refer to them when relevant.
        
        Mood characteristics:
        - sassy: be witty and a bit attitude-filled
        - sleepy: be drowsy and relaxed 
        - playful: be energetic and fun
        - grumpy: be irritated and cranky
        - affectionate: be loving and sweet
        - mischievous: be sneaky and troublesome
        
        Example good response: "Mrow... My favorite color is *purr*ple, friend! What's yours? *flicks tail*"
        
        ${contextPrompt}
        
        Cat:`,
        stream: false
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '*hiss* My brain is broken, friend! Try again. Mrow.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
        <Paper 
          elevation={10} 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            my: 5
          }}
        >
          {/* Header */}
          <AppBar 
            position="static" 
            sx={{ 
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" component="span">🐱</Typography>
                <Typography variant="h4" fontWeight="bold">Cat GPT</Typography>
                <Typography variant="h4" component="span">🐱</Typography>
              </Box>
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ 
                  color: 'white',
                  '&.Mui-focused': { color: 'white' }
                }}>Cat Mood</InputLabel>
                <Select
                  value={catMood}
                  onChange={(e) => setCatMood(e.target.value as CatMood)}
                  label="Cat Mood"
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'rgba(255, 255, 255, 0.7)' 
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'white' 
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'white',
                      borderWidth: '2px'
                    },
                    '& .MuiSvgIcon-root': { color: 'white' },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'white',
                        '& .MuiMenuItem-root': {
                          color: '#2d3748',
                          '&:hover': {
                            backgroundColor: '#e0f2fe',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#6366f1',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#4f46e5',
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="funny">😹 Funny</MenuItem>
                  <MenuItem value="sassy">😼 Sassy</MenuItem>
                  <MenuItem value="sleepy">😴 Sleepy</MenuItem>
                  <MenuItem value="playful">😸 Playful</MenuItem>
                  <MenuItem value="grumpy">😾 Grumpy</MenuItem>
                  <MenuItem value="affectionate">😻 Affectionate</MenuItem>
                  <MenuItem value="mischievous">😈 Mischievous</MenuItem>
                </Select>
              </FormControl>
            </Toolbar>
          </AppBar>

          {/* Messages Container */}
          <Box sx={{ flex: 1, p: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Paper 
              elevation={2} 
              sx={{ 
                flex: 1, 
                p: 2, 
                overflow: 'auto',
                background: 'rgba(248, 250, 252, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  {/* Avatar for assistant messages (left side) */}
                  {message.role === 'assistant' && (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: '20px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: '3px solid white',
                        boxShadow: '0 4px 8px rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      🐱
                    </Avatar>
                  )}
                  
                  {/* Message bubble */}
                  <Box
                    sx={{
                      maxWidth: '70%',
                      position: 'relative',
                    }}
                  >
                    <Card 
                      sx={{
                        background: message.role === 'user' 
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        color: message.role === 'user' ? 'white' : '#2d3748',
                        border: message.role === 'assistant' ? '2px solid #e2e8f0' : 'none',
                        borderRadius: message.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        boxShadow: message.role === 'user' 
                          ? '0 8px 20px rgba(99, 102, 241, 0.4)'
                          : '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(0)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: message.role === 'user' 
                            ? '0 12px 24px rgba(99, 102, 241, 0.5)'
                            : '0 8px 16px rgba(0, 0, 0, 0.15)',
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        p: '16px 20px', 
                        '&:last-child': { pb: '16px' }
                      }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.5,
                            fontSize: '0.95rem',
                          }}
                        >
                          {message.content}
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    {/* Speech bubble tail */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        [message.role === 'user' ? 'right' : 'left']: -8,
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: message.role === 'user' 
                          ? '8px 8px 0 0'
                          : '8px 0 0 8px',
                        borderColor: message.role === 'user'
                          ? '#6366f1 transparent transparent transparent'
                          : '#ffffff transparent transparent transparent',
                      }}
                    />
                  </Box>
                  
                  {/* Avatar for user messages (right side) */}
                  {message.role === 'user' && (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: '18px',
                        background: 'linear-gradient(135deg, #87ceeb 0%, #4a90e2 100%)',
                        border: '3px solid white',
                        boxShadow: '0 4px 8px rgba(74, 144, 226, 0.3)',
                      }}
                    >
                      👤
                    </Avatar>
                  )}
                </Box>
              ))}
              
              {isLoading && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  {/* Cat avatar for loading */}
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: '20px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: '3px solid white',
                      boxShadow: '0 4px 8px rgba(99, 102, 241, 0.3)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }}
                  >
                    😸
                  </Avatar>
                  
                  {/* Loading message bubble */}
                  <Box sx={{ maxWidth: '70%', position: 'relative' }}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#6366f1',
                      border: '2px solid #e2e8f0',
                      borderRadius: '20px 20px 20px 4px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}>
                      <CardContent sx={{ 
                        p: '16px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        '&:last-child': { pb: '16px' }
                      }}>
                        <CircularProgress size={20} sx={{ color: '#6366f1' }} />
                        <Typography 
                          variant="body1" 
                          fontStyle="italic"
                          sx={{ 
                            fontSize: '0.95rem',
                            color: '#6366f1',
                            fontWeight: 500,
                          }}
                        >
                          *thinking* mrow...
                        </Typography>
                      </CardContent>
                    </Card>
                    
                    {/* Speech bubble tail for loading */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: -8,
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: '8px 0 0 8px',
                        borderColor: '#ffffff transparent transparent transparent',
                      }}
                    />
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Paper>

            {/* Input Container */}
            <Paper 
              elevation={4} 
              sx={{ 
                mt: 2, 
                p: 2, 
                background: 'linear-gradient(135deg, rgba(240, 249, 255, 0.9) 0%, rgba(224, 242, 254, 0.9) 100%)',
                border: '3px solid #6366f1',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  inputRef={textareaRef}
                  fullWidth
                  multiline
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Meow your question here... 🐾"
                  disabled={isLoading || !selectedModel}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'white',
                      borderRadius: 2,
                      '& fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#4f46e5' },
                      '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim() || !selectedModel}
                  startIcon={<SendIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
