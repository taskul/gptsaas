import { Routes, Route } from 'react-router-dom';
import { useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { themeSettings } from './theme';
import NavBar from './components/NavBar';
import HomeScreen from './components/screens/HomeScreen';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import SummaryScreen from './components/screens/SummaryScreen';
import ParagraphScreen from './components/screens/ParagraphScreen';
import ChatBotScreen from './components/screens/ChatBotScreen';
import JavascriptScreen from './components/screens/JavascriptScreen';
import ScifiScreen from './components/screens/ScifiScreen';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PrivateRoute from './components/routing/PrivateRoute';
import NormalWrapper from './components/routing/NormalWrapper';
const stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}`);


function App() {
  const theme = useMemo(() => createTheme(themeSettings()), []);
  return (
    <Elements stripe={stripePromise}>
      <div className="App">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NavBar />
          <Routes>
            <Route exact path="/" element={<HomeScreen />} />
            <Route exact path="/login" element={<LoginScreen />} />
            <Route exact path="/register" element={<RegisterScreen />} />
            <Route exact path="/summary" element={ 
                // check is user is logged in and if they have a normal subscription
                <PrivateRoute>
                  <NormalWrapper>
                    <SummaryScreen />
                  </NormalWrapper>
                </PrivateRoute>
              } />
            <Route exact path="/paragraph" element={<ParagraphScreen />} />
            <Route exact path="/chatbot" element={<ChatBotScreen />} />
            <Route exact path="/js-convert" element={<JavascriptScreen />} />
            <Route exact path="/scifi-img" element={<ScifiScreen />} />

          </Routes>
        </ThemeProvider>
      </div>
    </Elements>
  );
}

export default App;
