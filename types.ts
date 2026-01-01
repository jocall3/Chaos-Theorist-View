export type SystemIdentifier = string;
export type UserIdentifier = string;
export type Timestamp = string;
export type ScenarioIdentifier = string;
export type SimulationRunIdentifier = string;
export type ModelVersion = string;
export type AgentIdentifier = string;
export type TransactionIdentifier = string;
export type TokenIdentifier = string;
export type AccountIdentifier = string;
export type DigitalIdentityIdentifier = string;
export type PublicKey = string;
export type PrivateKey = string;

export interface LeveragePoint {
  id: string;
  action: string;
  cost: string;
  outcomeProbability: number;
  timeToImpact: string;
  description: string;
  positiveSideEffects: string[];
  negativeSideEffects: string[];
  impactMagnitude: string;
  predictionConfidence: number;
  implementationEffort: 'Low' | 'Medium' | 'High' | 'Very High';
  reversibility: 'High' | 'Medium' | 'Low' | 'Irreversible';
  risks: { category: string; severity: 'Low' | 'Medium' | 'High'; description: string }[];
  requiredResources: string[];
  stakeholders: { name: string; role: string; influence: 'Low' | 'Medium' | 'High' }[];
  historicalSuccessRate?: number;
  lastUpdated: Timestamp;
  proposedByAgentId?: AgentIdentifier;
  requiredSkill?: string;
  estimatedKpiImpact?: string[];
  requiredPolicy?: string;
}

export interface SystemParameter {
  id: string;
  name: string;
  description: string;
  currentValue: number | string | boolean;
  unit: string;
  minValue: number;
  maxValue: number;
  step: number;
  isLeverageCandidate: boolean;
  dataType: 'number' | 'boolean' | 'string' | 'enum';
  enumValues?: string[];
  dependencies?: { parameterId: string; type: 'influences' | 'is-influenced-by' }[];
  securityLevel: 'low' | 'medium' | 'high';
  governancePolicyId?: string;
}

export interface SystemMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number | string | boolean;
  unit: string;
  target?: { min?: number; max?: number; value?: number; unit: string };
  history: { timestamp: Timestamp; value: number | string | boolean }[];
  alertThresholds?: {
    warning?: { operator: '>' | '<' | '=' | '!='; value: number | string };
    critical?: { operator: '>' | '<' | '=' | '!='; value: number | string };
  };
  isDerived: boolean;
  derivationMethod?: string;
  dataQualityScore: number;
  observationFrequency: string;
}

export interface FeedbackLoop {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative';
  sourceId: string;
  targetId: string;
  strength: number;
  delay: string;
  confidence: number;
  isDynamic: boolean;
}

export interface ChaoticSystemDefinition {
  id: SystemIdentifier;
  name: string;
  description: string;
  createdAt: Timestamp;
  lastModified: Timestamp;
  ownerId: UserIdentifier;
  parameters: SystemParameter[];
  metrics: SystemMetric[];
  feedbackLoops: FeedbackLoop[];
  status: 'Active' | 'Archived' | 'Draft' | 'Under Review' | 'Retired';
  schemaVersion: string;
  tags: string[];
  scope: string;
  externalDataSources: { name: string; url: string; lastSync: Timestamp; status: 'active' | 'inactive' | 'error' }[];
  accessControl: {
    public: boolean;
    sharedWithUsers: UserIdentifier[];
    sharedWithGroups: string[];
    rbacPolicyId?: string;
  };
  simulationModelRef: string;
  modelVersion: ModelVersion;
  monitoringAgents: AgentIdentifier[];
  monitoringConfig: {
    intervalSeconds: number;
    alertOnAnomaly: boolean;
    anomalyDetectionModel: string;
  };
  securityClassification: 'public' | 'confidential' | 'restricted';
  complianceStandards: string[];
  contentHash: string;
}

export interface SimulationRun {
  id: SimulationRunIdentifier;
  systemId: SystemIdentifier;
  initiatedBy: UserIdentifier | AgentIdentifier;
  scenarioId?: ScenarioIdentifier;
  startTime: Timestamp;
  endTime?: Timestamp;
  durationMs?: number;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  initialState: { parameterId: string; value: number | string | boolean }[];
  appliedLeveragePoints: {
    leveragePointId: string;
    applicationTime: Timestamp;
    agentId?: AgentIdentifier;
    status: 'planned' | 'executed' | 'failed';
  }[];
  results: {
    overallImpact: string;
    riskAssessment: { category: string; severity: 'Low' | 'Medium' | 'High'; description: string }[];
    achievedGoals: string[];
    unintendedConsequences: string[];
  };
  metricsHistory: { metricId: string; data: { timestamp: Timestamp; value: number | string | boolean }[] }[];
  parametersHistory: { parameterId: string; data: { timestamp: Timestamp; value: number | string | boolean }[] }[];
  events: { timestamp: Timestamp; type: string; description: string; data?: any }[];
  modelVersion: ModelVersion;
  computeResourcesUsed?: {
    cpuTimeSeconds?: number;
    memoryGB?: number;
    gpuTimeSeconds?: number;
    cloudProvider?: string;
    instanceType?: string;
  };
  cost?: { amount: number; currency: string };
  auditTrailHash?: string;
  notes?: string;
  tags: string[];
  outputLogUrl?: string;
}

export interface DigitalIdentity {
  id: DigitalIdentityIdentifier;
  name: string;
  type: 'user' | 'agent' | 'contract' | 'organization';
  publicKey: PublicKey;
  privateKeyMock?: PrivateKey;
  status: 'active' | 'suspended' | 'revoked';
  roles: string[];
  organizationId?: string;
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  verifiableCredentials: { type: string; issuer: string; issuanceDate: Timestamp; expirationDate?: Timestamp; hash: string }[];
  contactInfo?: { email?: string; secureEndpoint?: string };
  agentProfileId?: AgentIdentifier;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requiredTools: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
  lastEvaluated: Timestamp;
}

export interface AgentProfile {
  id: AgentIdentifier;
  name: string;
  description: string;
  digitalIdentityId: DigitalIdentityIdentifier;
  status: 'active' | 'paused' | 'offline' | 'learning';
  deployedAt: Timestamp;
  lastActive: Timestamp;
  primaryObjective: string;
  skills: AgentSkill[];
  configuration: {
    riskTolerance: 'low' | 'medium' | 'high';
    maxBudget?: { amount: number; currency: string };
    operationalHours?: string;
    accessScope: SystemIdentifier[];
  };
  performanceMetrics: {
    successRate: number;
    averageExecutionTimeMs: number;
    errorRate: number;
    lastReported: Timestamp;
  };
  aiModelRef: string;
  modelSoftwareVersion: string;
  auditLog: { timestamp: Timestamp; action: string; context: any }[];
  managers: UserIdentifier[];
  operationalCost?: { amount: number; currency: string; frequency: 'hourly' | 'daily' | 'monthly' };
  tags: string[];
}

export interface TokenDefinition {
  id: TokenIdentifier;
  name: string;
  description: string;
  symbol: string;
  type: 'fungible' | 'non-fungible' | 'hybrid';
  totalSupply?: number | 'unlimited';
  decimals?: number;
  underlyingAsset: string;
  blockchainPlatform: string;
  contractAddress: string;
  whitepaperUrl?: string;
  programmableRules: string[];
  complianceStandards: string[];
  createdAt: Timestamp;
  status: 'active' | 'retired' | 'pending';
  auditTrailHash: string;
  authorizedAgents: AgentIdentifier[];
}

export interface TokenRailTransaction {
  id: TransactionIdentifier;
  tokenId: TokenIdentifier;
  type: 'transfer' | 'mint' | 'burn' | 'swap' | 'stake' | 'loan' | 'collateralize';
  timestamp: Timestamp;
  senderId: DigitalIdentityIdentifier | AccountIdentifier;
  receiverId: DigitalIdentityIdentifier | AccountIdentifier;
  amount: number;
  tokenSymbol: string;
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
  transactionHash: string;
  blockNumber?: number;
  fees?: { amount: number; currency: string; type: string }[];
  contractExecutionId?: string;
  context?: {
    purpose?: string;
    invoiceId?: string;
    relatedTransactionId?: TransactionIdentifier;
  };
  senderSignature: string;
  verifiableProofs?: { type: string; proofData: string }[];
  governancePolicyId?: string;
}

export interface SimulationScenario {
  id: ScenarioIdentifier;
  name: string;
  description: string;
  systemId: SystemIdentifier;
  createdBy: UserIdentifier | AgentIdentifier;
  createdAt: Timestamp;
  lastModified: Timestamp;
  initialConditions: { parameterId: string; value: number | string | boolean }[];
  plannedInterventions: {
    leveragePointId: string;
    timing: 'at_start' | 'after_delay' | 'on_condition';
    delaySeconds?: number;
    conditionExpression?: string;
    agentId?: AgentIdentifier;
  }[];
  expectedOutcomes: string[];
  keyMetricsToMonitor: string[];
  status: 'draft' | 'active' | 'archived';
  tags: string[];
  simulationRuns: SimulationRunIdentifier[];
  systemSchemaVersion: string;
}

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  executorAgentId: AgentIdentifier;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  targetSystemId: SystemIdentifier;
  actions: {
    leveragePointId?: string;
    customAction?: string;
    parameters?: { [key: string]: any };
    order: number;
    status: 'scheduled' | 'executing' | 'completed' | 'failed';
    executedAt?: Timestamp;
    result?: string;
  }[];
  schedule: {
    type: 'once' | 'recurring' | 'on_event';
    startTime?: Timestamp;
    cronExpression?: string;
    eventTrigger?: string;
  };
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  initiatedBy: UserIdentifier | AgentIdentifier;
  executionHistory: { timestamp: Timestamp; status: string; log: string }[];
  risks?: { category: string; severity: 'Low' | 'Medium' | 'High'; description: string }[];
  requiredApprovals?: { approverId: UserIdentifier; status: 'pending' | 'approved' | 'rejected' }[];
  predictedImpact?: string;
  actualImpact?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Timestamp;
  aiModel?: 'Gemini' | 'ChatGPT' | 'Claude' | 'System';
}

export interface AppState {
  selectedSystemId: SystemIdentifier | null;
  systems: ChaoticSystemDefinition[];
  activeSimulations: SimulationRun[];
  scenarios: SimulationScenario[];
  agents: AgentProfile[];
  agentTasks: AgentTask[];
  tokenDefinitions: TokenDefinition[];
  digitalIdentities: DigitalIdentity[];
  isLoading: {
    systems: boolean;
    simulations: boolean;
    scenarios: boolean;
    agents: boolean;
    agentTasks: boolean;
    tokenRails: boolean;
    identities: boolean;
  };
  globalError: string | null;
  userPreferences: {
    darkMode: boolean;
    refreshIntervalSeconds: number;
    notificationSettings: {
      criticalAlerts: boolean;
      simulationUpdates: boolean;
    };
  };
  chat: {
    isOpen: boolean;
    messages: ChatMessage[];
    isThinking: boolean;
    currentModel: 'Gemini' | 'ChatGPT' | 'Claude' | 'System';
  };
}

export type AppAction =
  | { type: 'SET_SELECTED_SYSTEM'; payload: SystemIdentifier | null }
  | { type: 'SET_SYSTEMS'; payload: ChaoticSystemDefinition[] }
  | { type: 'UPDATE_SYSTEM'; payload: ChaoticSystemDefinition }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['isLoading']; value: boolean } }
  | { type: 'SET_GLOBAL_ERROR'; payload: string | null }
  | { type: 'SET_USER_PREFERENCE'; payload: { key: keyof AppState['userPreferences']; value: any } }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_THINKING'; payload: boolean }
  | { type: 'SET_CHAT_MODEL'; payload: AppState['chat']['currentModel'] };
