import { 
  ChaoticSystemDefinition, 
  LeveragePoint, 
  SystemIdentifier, 
  SystemParameter, 
  SimulationRun,
  SimulationScenario,
  ScenarioIdentifier,
  UserIdentifier,
  AgentIdentifier,
  SimulationRunIdentifier
} from '../types';
import { mockSystemsData, mockLeveragePointsData, mockScenariosData } from './mockData';

abstract class BaseApiService {
  protected baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }
}

class MockSystemsApiService extends BaseApiService {
  private systems: ChaoticSystemDefinition[] = [];
  private leveragePoints: LeveragePoint[] = [];

  constructor(baseUrl: string, initialSystems: ChaoticSystemDefinition[], initialLeveragePoints: LeveragePoint[]) {
    super(baseUrl);
    this.systems = initialSystems;
    this.leveragePoints = initialLeveragePoints;
  }

  async getSystems(): Promise<ChaoticSystemDefinition[]> {
    return new Promise(resolve => setTimeout(() => resolve(this.systems), 600));
  }

  async getSystemById(id: SystemIdentifier): Promise<ChaoticSystemDefinition> {
    const system = this.systems.find((s) => s.id === id);
    if (!system) throw new Error(`System with ID ${id} not found.`);
    return Promise.resolve(system);
  }

  async identifyLeveragePoints(systemId: SystemIdentifier): Promise<LeveragePoint[]> {
    return new Promise(resolve => setTimeout(() => resolve(this.leveragePoints.filter(lp => Math.random() > 0.5 || true)), 800));
  }

  async updateSystemParameter(systemId: SystemIdentifier, parameterId: string, value: number | string | boolean): Promise<SystemParameter> {
    const systemIndex = this.systems.findIndex(s => s.id === systemId);
    if (systemIndex === -1) throw new Error(`System with ID ${systemId} not found.`);

    const paramIndex = this.systems[systemIndex].parameters.findIndex(p => p.id === parameterId);
    if (paramIndex === -1) throw new Error(`Parameter with ID ${parameterId} not found in system ${systemId}.`);

    this.systems[systemIndex].parameters[paramIndex] = {
      ...this.systems[systemIndex].parameters[paramIndex],
      currentValue: value,
    };
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.systems[systemIndex].parameters[paramIndex];
  }
}

class MockSimulationsApiService extends BaseApiService {
  private runs: SimulationRun[] = [];
  
  async startSimulationRun(
    systemId: SystemIdentifier,
    scenarioId: ScenarioIdentifier,
    initiatedBy: UserIdentifier | AgentIdentifier
  ): Promise<SimulationRun> {
    const newRun: SimulationRun = {
      id: `sim-${Date.now()}`,
      systemId,
      scenarioId,
      initiatedBy,
      startTime: new Date().toISOString(),
      status: 'Running',
      initialState: [], 
      appliedLeveragePoints: [],
      results: { overallImpact: 'Processing...', riskAssessment: [], achievedGoals: [], unintendedConsequences: [] },
      metricsHistory: [],
      parametersHistory: [],
      events: [{ timestamp: new Date().toISOString(), type: 'start', description: 'Simulation started' }],
      modelVersion: '1.0',
      tags: ['mock', 'auto-generated'],
    };
    this.runs.push(newRun);
    return Promise.resolve(newRun);
  }
}

// Instantiate services
export const systemsApiService = new MockSystemsApiService('http://localhost:3001/api/systems', mockSystemsData, mockLeveragePointsData);
export const simulationsApiService = new MockSimulationsApiService('http://localhost:3001/api/simulations');
