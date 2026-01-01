import React, { useState, useEffect, useCallback } from 'react';
import { useApplication } from '../context/AppContext';
import { systemsApiService } from '../services/api';
import { LeveragePoint, SystemIdentifier, SystemParameter, SystemMetric } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemDetailViewProps {
  systemId: SystemIdentifier;
}

export const SystemDetailView: React.FC<SystemDetailViewProps> = ({ systemId }) => {
    const { state, dispatch, onError, onInterventionSuccess } = useApplication();
    const system = state.systems.find(s => s.id === systemId);

    const [leveragePoints, setLeveragePoints] = useState<LeveragePoint[]>([]);
    const [loadingLeveragePoints, setLoadingLeveragePoints] = useState(false);
    const [updatingParameter, setUpdatingParameter] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');

    const fetchLeveragePoints = useCallback(async () => {
        setLoadingLeveragePoints(true);
        try {
            const fetchedLeveragePoints = await systemsApiService.identifyLeveragePoints(systemId);
            setLeveragePoints(fetchedLeveragePoints);
        } catch (error: any) {
            onError?.(error);
        } finally {
            setLoadingLeveragePoints(false);
        }
    }, [systemId, onError]);

    useEffect(() => {
        fetchLeveragePoints();
    }, [fetchLeveragePoints]);

    const handleParameterUpdate = async (sysId: SystemIdentifier, paramId: string, value: number | string | boolean) => {
        setUpdatingParameter(true);
        try {
            await systemsApiService.updateSystemParameter(sysId, paramId, value);
            // Re-fetch system to update state
            const updatedSystem = await systemsApiService.getSystemById(sysId);
            dispatch({ type: 'UPDATE_SYSTEM', payload: updatedSystem });
        } catch (error: any) {
            onError?.(error);
        } finally {
            setUpdatingParameter(false);
        }
    };

    if (!system) return null;

    const tabs = ['Overview', 'Parameters', 'Metrics', 'Leverage Points', 'Agents'];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header Area */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{system.name}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">{system.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                         <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            Version {system.modelVersion}
                        </span>
                        <span className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                            Last Modified: {new Date(system.lastModified).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-8">
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Quick Metrics View */}
                         <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Metrics</h3>
                            <div className="space-y-4">
                                {system.metrics.slice(0, 2).map(metric => (
                                    <div key={metric.id} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.name}</span>
                                            <span className="text-xl font-bold text-slate-900 dark:text-white">{metric.currentValue} <span className="text-xs text-slate-500 font-normal">{metric.unit}</span></span>
                                        </div>
                                        <div className="h-24 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={metric.history.map(h => ({ ...h, value: Number(h.value) }))}>
                                                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* High Level Params */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Critical Parameters</h3>
                             <ul className="space-y-3">
                                {system.parameters.filter(p => p.securityLevel === 'high' || p.isLeverageCandidate).slice(0, 4).map(param => (
                                    <li key={param.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{param.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{param.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-mono font-bold text-indigo-600 dark:text-indigo-400">{param.currentValue} {param.unit}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'Parameters' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {system.parameters.map(param => (
                            <ParameterCard 
                                key={param.id} 
                                param={param} 
                                onUpdate={(val) => handleParameterUpdate(system.id, param.id, val)}
                                isUpdating={updatingParameter}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'Metrics' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {system.metrics.map(metric => (
                            <MetricChartCard key={metric.id} metric={metric} />
                        ))}
                     </div>
                )}

                {activeTab === 'Leverage Points' && (
                     <div className="grid grid-cols-1 gap-6">
                         {loadingLeveragePoints ? (
                             <div className="text-center py-10 text-slate-500">Analyzing system structure...</div>
                         ) : (
                             leveragePoints.map(lp => (
                                 <LeveragePointCard key={lp.id} lp={lp} onPropose={() => {
                                     onInterventionSuccess?.(lp.id, system.id);
                                     alert(`Proposed intervention: ${lp.action}`);
                                 }} />
                             ))
                         )}
                     </div>
                )}

                {activeTab === 'Agents' && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No active agents assigned</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Assign autonomous agents to monitor this system.</p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Deploy Agent
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components for cleaner file
const ParameterCard: React.FC<{ param: SystemParameter; onUpdate: (val: any) => void; isUpdating: boolean }> = ({ param, onUpdate, isUpdating }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-base font-semibold text-slate-900 dark:text-white">{param.name}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    param.securityLevel === 'high' ? 'bg-red-100 text-red-800' : 
                    param.securityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>{param.securityLevel}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 overflow-hidden text-ellipsis">{param.description}</p>
            
            <div className="flex items-center space-x-2">
                <input 
                    type="number" 
                    defaultValue={Number(param.currentValue)}
                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-slate-900 dark:text-white"
                    disabled={isUpdating}
                    onBlur={(e) => onUpdate(parseFloat(e.target.value))}
                />
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium w-12">{param.unit}</span>
            </div>
        </div>
    );
};

const MetricChartCard: React.FC<{ metric: SystemMetric }> = ({ metric }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{metric.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{metric.description}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metric.currentValue}</div>
                    <div className="text-xs text-slate-400 uppercase">{metric.unit}</div>
                </div>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.history.map(h => ({ ...h, value: Number(h.value) }))}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'})} 
                            stroke="#94a3b8" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.375rem', color: '#f8fafc' }}
                            itemStyle={{ color: '#818cf8' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const LeveragePointCard: React.FC<{ lp: LeveragePoint; onPropose: () => void }> = ({ lp, onPropose }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-300 transition-colors">
        <div className="p-6">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{lp.action}</h4>
                <div className="flex items-center space-x-2">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Prob: {(lp.outcomeProbability * 100).toFixed(0)}%
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Effort: {lp.implementationEffort}
                    </span>
                </div>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{lp.description}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase">Cost</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono">{lp.cost}</span>
                </div>
                <div>
                    <span className="block text-xs font-medium text-slate-500 uppercase">Time to Impact</span>
                    <span className="text-slate-900 dark:text-slate-200">{lp.timeToImpact}</span>
                </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end space-x-4">
                <button 
                    onClick={onPropose}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Propose Intervention
                </button>
            </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
            <span>ID: {lp.id}</span>
            <span>Est. Impact: {lp.impactMagnitude}</span>
        </div>
    </div>
);
