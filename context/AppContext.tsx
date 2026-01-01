import React, { createContext, useContext, useReducer } from 'react';
import { 
  AppState, 
  AppAction, 
  UserIdentifier, 
  SystemIdentifier, 
  ChaoticSystemDefinition, 
  SimulationRun, 
  SimulationScenario, 
  AgentProfile, 
  AgentTask, 
  TokenDefinition, 
  DigitalIdentity,
  ChatMessage 
} from '../types';

export const initialAppState: AppState = {
  selectedSystemId: null,
  systems: [],
  activeSimulations: [],
  scenarios: [],
  agents: [],
  agentTasks: [],
  tokenDefinitions: [],
  digitalIdentities: [],
  isLoading: {
    systems: false,
    simulations: false,
    scenarios: false,
    agents: false,
    agentTasks: false,
    tokenRails: false,
    identities: false,
  },
  globalError: null,
  userPreferences: {
    darkMode: false,
    refreshIntervalSeconds: 60,
    notificationSettings: {
      criticalAlerts: true,
      simulationUpdates: true,
    },
  },
  chat: {
    isOpen: false,
    messages: [],
    isThinking: false,
    currentModel: 'Gemini',
  },
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SELECTED_SYSTEM':
      return { ...state, selectedSystemId: action.payload };
    case 'SET_SYSTEMS':
      return { ...state, systems: action.payload };
    case 'UPDATE_SYSTEM':
      return {
        ...state,
        systems: state.systems.map((sys) =>
          sys.id === action.payload.id ? action.payload : sys
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: { ...state.isLoading, [action.payload.key]: action.payload.value } };
    case 'SET_GLOBAL_ERROR':
      return { ...state, globalError: action.payload };
    case 'SET_USER_PREFERENCE':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'TOGGLE_CHAT':
      return { ...state, chat: { ...state.chat, isOpen: !state.chat.isOpen } };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chat: { ...state.chat, messages: [...state.chat.messages, action.payload] } };
    case 'SET_CHAT_THINKING':
      return { ...state, chat: { ...state.chat, isThinking: action.payload } };
    case 'SET_CHAT_MODEL':
      return { ...state, chat: { ...state.chat, currentModel: action.payload } };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  serviceConfig: any;
  currentUser: UserIdentifier;
  accessibleSystems: SystemIdentifier[];
  onInterventionSuccess?: (interventionId: string, systemId: SystemIdentifier) => void;
  onError?: (error: Error) => void;
}

export const ApplicationContext = createContext<AppContextType | undefined>(undefined);

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider: React.FC<React.PropsWithChildren<{
  currentUser: UserIdentifier;
  accessibleSystems: SystemIdentifier[];
  serviceConfig: any;
  onInterventionSuccess?: (id: string, sysId: string) => void;
  onError?: (error: Error) => void;
}>> = ({
  children,
  currentUser,
  accessibleSystems,
  serviceConfig,
  onInterventionSuccess,
  onError,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <ApplicationContext.Provider
      value={{
        state,
        dispatch,
        serviceConfig,
        currentUser,
        accessibleSystems,
        onInterventionSuccess,
        onError,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};