import '@fortawesome/fontawesome-free/css/all.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProjectsProvider } from './context/ProjectsContext';
import { TasksProvider } from './context/TasksContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ProjectsProvider>
          <TasksProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TasksProvider>
        </ProjectsProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
