import React from 'react';
import { ChaoticSystemDefinition, SystemIdentifier } from '../types';

interface SystemSidebarProps {
  systems: ChaoticSystemDefinition[];
  selectedSystemId: SystemIdentifier | null;
  onSelectSystem: (id: SystemIdentifier | null) => void;
  isLoading: boolean;
  error: string | null;
}

export const SystemSidebar: React.FC<SystemSidebarProps> = ({
  systems,
  selectedSystemId,
  onSelectSystem,
  isLoading,
  error,
}) => {
  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col h-full shadow-inner">
      <div className="mb-6 px-2">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Monitored Systems
        </h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search systems..." 
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-200"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10 opacity-50">
           <span className="text-sm text-slate-500">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm p-2">{error}</div>
      ) : (
        <ul className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
          {systems.length === 0 ? (
            <li className="text-slate-600 dark:text-slate-400 text-sm italic px-2">No systems available.</li>
          ) : (
            systems.map((system) => (
              <li key={system.id}>
                <button
                  onClick={() => onSelectSystem(system.id)}
                  className={`group flex items-center justify-between w-full text-left py-2 px-3 rounded-md transition-all duration-200
                    ${selectedSystemId === system.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  <div className="flex flex-col truncate">
                    <span className="font-medium text-sm truncate">{system.name}</span>
                    <span className={`text-[10px] uppercase tracking-wide mt-0.5 ${selectedSystemId === system.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {system.id}
                    </span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${system.status === 'Active' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => alert('Feature: Add New System')}
          className="flex items-center justify-center w-full py-2 px-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add System
        </button>
      </div>
    </div>
  );
};