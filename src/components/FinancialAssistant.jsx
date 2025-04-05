import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Box,
  Avatar,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Fade,
  Zoom,
  Fab
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

// Sample quick suggestions
const quickSuggestions = [
  "How can I start investing with little money?",
  "What's the best way to save for retirement?",
  "How do I create a monthly budget?",
  "Should I pay off debt or invest first?",
  "How can I improve my credit score?"
];

const FinancialAssistant = () => {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "👋 Welcome! I'm Vision, your personal financial guide. Whether you're looking to grow your wealth, plan for the future, or make smarter money decisions, I'm here to help with personalized advice tailored just for you. What's on your mind today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputState, setInputState] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  const [autoScrollDisabled, setAutoScrollDisabled] = useState(false);

  // Update messagesRef when messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Add scroll event listener to show/hide scroll button
  useEffect(() => {
    const chatContainer = chatContainerRef.current;

    const handleScroll = () => {
      if (!chatContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      // Show button when scrolled up (not at bottom)
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);

      // Track if user has manually scrolled away from bottom
      if (!isScrolledUp && autoScrollDisabled) {
        setAutoScrollDisabled(false);
      } else if (isScrolledUp && !autoScrollDisabled) {
        setAutoScrollDisabled(true);
      }
    };

    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [autoScrollDisabled]);

  // Controlled scroll to bottom when new messages are added
  useEffect(() => {
    // Only auto-scroll if the user hasn't manually scrolled up
    if (messages.length > 0 && !autoScrollDisabled) {
      scrollToBottom();
    }
  }, [messages, autoScrollDisabled]);

  // Memoized handlers to prevent recreating functions on each render
  const handleInputChange = useCallback((e) => {
    e.stopPropagation(); // Prevent event bubbling
    setInputState(e.target.value);
  }, []);

  // Memoize the copy to clipboard function
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      },
      () => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(''), 2000);
      }
    );
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputState.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: inputState.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Get current messages from ref to avoid stale closure
    const currentMessages = messagesRef.current;

    // Update messages in one go to prevent multiple re-renders
    const updatedMessages = [...currentMessages, userMessage];
    setMessages(updatedMessages);
    setInputState('');
    setIsTyping(true);
    setError('');

    // Reset auto-scroll when sending a new message
    setAutoScrollDisabled(false);

    try {
      // Ensure API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please check your environment variables.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // Create a context-aware prompt with better instructions
      const context = updatedMessages.map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');
      const prompt = `You are a friendly and knowledgeable financial advisor named Vision having a natural conversation. Based on this conversation history:

${context}

User: ${userMessage.content}

Provide a warm, engaging response that feels personal and conversational while maintaining professional accuracy. Include specific examples, relatable analogies, and actionable steps when relevant. If discussing investments, include brief market context and risk disclaimers naturally in the conversation.

Use emojis occasionally (1-2 per response) to make the conversation more engaging. Break down complex financial concepts into simple terms.

When you want to emphasize text, use Markdown format like **bold text** or *italic text*.

If you don't know something or if it's outside your expertise, clearly state that instead of making up information.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const assistantMessage = {
        type: 'assistant',
        content: response.text(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true // Flag for animation
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Remove the "isNew" flag after animation completes
      setTimeout(() => {
        setMessages(prev =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, isNew: false } : msg
          )
        );
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred while processing your request');
      const errorMessage = {
        type: 'assistant',
        content: `I apologize, but I encountered an error while processing your request. ${error.message ? `Error details: ${error.message}` : 'Please try again or rephrase your question.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputState]);

  const handleKeyPress = useCallback((event) => {
    event.stopPropagation(); // Prevent event bubbling
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setInputState(suggestion);
    // Focus the input after setting suggestion
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const refreshConversation = useCallback(() => {
    if (window.confirm("Are you sure you want to start a new conversation? This will clear the current chat history.")) {
      const welcomeMessage = {
        type: 'assistant',
        content: "👋 Welcome! I'm Vision, your personal financial guide. What financial questions can I help you with today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNew: true
      };

      setMessages([welcomeMessage]);
      setInputState('');
      setError('');
      setAutoScrollDisabled(false);

      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => ({ ...msg, isNew: false }))
        );
      }, 1000);
    }
  }, []);

  // Improved scroll to bottom function that stays within the chat container
  const scrollToBottom = useCallback(() => {
    // Prevent scroll events from bubbling up to the document
    if (chatContainerRef.current && messagesEndRef.current) {
      // Use scrollIntoView with containment to parent
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShowScrollButton(false);
      setAutoScrollDisabled(false);
    }
  }, []);

  // Memoized MessageBubble component to prevent unnecessary re-renders
  const MessageBubble = useMemo(() => React.memo(({ message }) => (
    <Zoom in={true} appear={message.isNew} style={{ transitionDelay: message.isNew ? '150ms' : '0ms' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: 2,
          flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
        }}
      >
        <Avatar
          sx={{
            bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
            mx: 1,
            width: 40,
            height: 40,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            },
            animation: message.isNew ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(104, 159, 56, 0.7)'
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(104, 159, 56, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(104, 159, 56, 0)'
              }
            }
          }}
        >
          {message.type === 'user' ?
            <PersonIcon sx={{ fontSize: 24 }} /> :
            <MonetizationOnIcon sx={{ fontSize: 24 }} />
          }
        </Avatar>
        <Box sx={{ position: 'relative', maxWidth: '70%' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: message.type === 'user' ? 'primary.light' : 'background.paper',
              color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
              boxShadow: message.isNew
                ? '0 0 15px rgba(104, 159, 56, 0.5)'
                : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              },
              borderLeft: message.type === 'assistant' ? '4px solid' : 'none',
              borderColor: message.type === 'assistant' ? 'secondary.main' : 'transparent',
            }}
          >
            {message.type === 'assistant' ? (
              <Box
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '1rem',
                  fontWeight: message.isNew ? 500 : 400,
                  '& strong': { fontWeight: 700 },
                  '& em': { fontStyle: 'italic' }
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '1rem',
                  fontWeight: message.isNew ? 500 : 400,
                }}
              >
                {message.content}
              </Typography>
            )}
            {message.type === 'assistant' && (
              <Fade in={true}>
                <Box sx={{ position: 'absolute', right: 8, bottom: 8 }}>
                  <Tooltip title={copySuccess || "Copy to clipboard"}>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(message.content)}
                      sx={{
                        opacity: 0.6,
                        '&:hover': {
                          opacity: 1,
                          backgroundColor: 'rgba(104, 159, 56, 0.1)'
                        }
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Fade>
            )}
          </Paper>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              ml: message.type === 'user' ? 'auto' : '2px',
              mt: 0.5,
              display: 'block',
              textAlign: message.type === 'user' ? 'right' : 'left',
              fontStyle: 'italic'
            }}
          >
            {message.type === 'user' ? 'You' : 'Vision'} • {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      </Box>
    </Zoom>
  ), (prevProps, nextProps) => {
    // Only re-render if essential props change
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.isNew === nextProps.message.isNew &&
      prevProps.message.timestamp === nextProps.message.timestamp
    );
  }), [copyToClipboard]);

  // Memoize the suggestion chips
  const SuggestionChips = useMemo(() => {
    if (messages.length >= 3) return null;

    return (
      <Fade in={messages.length < 3}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TipsAndUpdatesIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              Try asking:
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickSuggestions.map((suggestion, idx) => (
              <Chip
                key={idx}
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animation: `fadeInSlide 0.5s ${idx * 0.1}s both`,
                  '@keyframes fadeInSlide': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  },
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }
                }}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      </Fade>
    );
  }, [messages.length, handleSuggestionClick]);

  // Memoize the message list for better performance
  const MessageList = useMemo(() => {
    return messages.map((message, index) => (
      <MessageBubble
        key={`msg-${index}-${message.timestamp || 'no-timestamp'}`}
        message={message}
      />
    ));
  }, [messages, MessageBubble]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        position: 'relative',
        bgcolor: 'background.default',
        overflow: 'hidden' // Important - prevent outer scrolling
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Vision
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your Personal Finance Guide
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Start a new conversation">
            <IconButton onClick={refreshConversation} color="primary">
              <AutorenewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chat container with proper positioning context */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          mb: 2,
          px: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        <Box sx={{ flex: '1 0 auto' }}>
          {MessageList}
          {isTyping && (
            <Fade in={isTyping}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  ml: 6,
                  mb: 2
                }}
              >
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  FinBot is thinking...
                </Typography>
              </Box>
            </Fade>
          )}
          {error && (
            <Zoom in={!!error}>
              <Box sx={{
                p: 2,
                mb: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 2,
                mx: 'auto',
                maxWidth: '80%',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(244, 67, 54, 0.3)'
              }}>
                <Typography variant="body2">{error}</Typography>
              </Box>
            </Zoom>
          )}
        </Box>
        {/* Empty div for scroll anchoring */}
        <div ref={messagesEndRef} />
      </Box>

      {/* ChatGPT-like "Scroll to bottom" button - positioned relative to chat container */}
      <Zoom in={showScrollButton}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToBottom}
          sx={{
            position: 'absolute',
            bottom: 120,
            right: 20,
            zIndex: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            '&:hover': {
              transform: 'scale(1.05)',
            },
            animation: showScrollButton ? 'bounce 1s infinite alternate' : 'none',
            '@keyframes bounce': {
              '0%': { transform: 'translateY(0)' },
              '100%': { transform: 'translateY(-5px)' }
            }
          }}
        >
          <ArrowDownwardIcon />
        </Fab>
      </Zoom>

      {/* Suggested questions with improved animations */}
      {SuggestionChips}

      {/* Enhanced input area with controlled re-rendering */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        borderRadius: 3,
        p: 1
      }}>
        <TextField
          fullWidth
          inputRef={inputRef}
          multiline
          maxRows={4}
          value={inputState}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your financial question..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(104, 159, 56, 0.2)'
              }
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!inputState.trim() || isTyping}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 48,
            height: 48,
            borderRadius: '50%',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
        >
          <SendIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default FinancialAssistant;