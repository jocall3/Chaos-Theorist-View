import React, { useEffect, useCallback } from 'react';
import { ApplicationProvider, useApplication } from './context/AppContext';
import { SystemSidebar } from './components/SystemSidebar';
import { SystemDetailView } from './components/SystemDetail';
import { AIChatWindow } from './components/ChatWindow';
import { systemsApiService } from './services/api';
import { SystemIdentifier } from './types';

// Internal component to consume context and manage layout
const ChaosTheoristViewInternal: React.FC<{initialSystemId?: SystemIdentifier}> = ({initialSystemId}) => {
  const { state, dispatch, accessibleSystems, onError } = useApplication();
  const { selectedSystemId, systems, isLoading, globalError, userPreferences } = state;

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'SET_USER_PREFERENCE', payload: { key: 'darkMode', value: !userPreferences.darkMode } });
  }, [dispatch, userPreferences.darkMode]);

  // Apply dark mode preference
  useEffect(() => {
    document.documentElement.classList.toggle('dark', userPreferences.darkMode);
  }, [userPreferences.darkMode]);

  // Initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'systems', value: true } });
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });
      try {
        const fetchedSystems = await systemsApiService.getSystems();
        const userAccessibleSystems = fetchedSystems.filter(sys => accessibleSystems.includes(sys.id));
        dispatch({ type: 'SET_SYSTEMS', payload: userAccessibleSystems });
        
        if (initialSystemId && userAccessibleSystems.some(s => s.id === initialSystemId)) {
          dispatch({ type: 'SET_SELECTED_SYSTEM', payload: initialSystemId });
        } else if (userAccessibleSystems.length > 0 && !selectedSystemId) {
          dispatch({ type: 'SET_SELECTED_SYSTEM', payload: userAccessibleSystems[0].id });
        }
      } catch (error: any) {
        const errorMessage = `Failed to load initial systems: ${error.message}`;
        dispatch({ type: 'SET_GLOBAL_ERROR', payload: errorMessage });
        onError?.(error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'systems', value: false } });
      }
    };
    fetchInitialData();
  }, [dispatch, accessibleSystems, onError, initialSystemId]);

  const handleSelectSystem = useCallback((id: SystemIdentifier | null) => {
    dispatch({ type: 'SET_SELECTED_SYSTEM', payload: id });
  }, [dispatch]);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200`}>
      <SystemSidebar
        systems={systems}
        selectedSystemId={selectedSystemId}
        onSelectSystem={handleSelectSystem}
        isLoading={isLoading.systems}
        error={globalError}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center px-6 py-4 bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 z-10">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Chaos Theorist View</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              System Operational
            </div>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle dark mode"
            >
              {userPreferences.darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m8.05-9.14a4.997 4.997 0 00-7.07 7.07A4.997 4.997 0 0014.14 8.05 4.997 4.997 0 008.05 2.86zM7 7l-1 1M17 7l1 1M7 17l-1-1M17 17l1-1"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto relative p-6">
          {globalError && !isLoading.systems && (
             <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{globalError}</p>
                </div>
              </div>
            </div>
          )}
          
          {isLoading.systems ? (
            <LoadingSpinner />
          ) : selectedSystemId ? (
            <SystemDetailView systemId={selectedSystemId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-lg">Select a system from the sidebar to view details</p>
            </div>
          )}
          
          <AIChatWindow />
        </main>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const currentUser = "sysadmin-001";
  const accessibleSystems = ['financial-market-stability-v1', 'supply-chain-resilience-v1'];
  
  const serviceConfig = {
    systemApiUrl: 'http://localhost:3001/api/systems',
    simulationApiUrl: 'http://localhost:3001/api/simulations',
    agentApiUrl: 'http://localhost:3001/api/agents',
    tokenRailApiUrl: 'http://localhost:3001/api/token-rail',
    identityApiUrl: 'http://localhost:3001/api/identity',
  };

  return (
    <ApplicationProvider 
      currentUser={currentUser} 
      accessibleSystems={accessibleSystems} 
      serviceConfig={serviceConfig}
    >
      <ChaosTheoristViewInternal />
    </ApplicationProvider>
  );
};

export default App;