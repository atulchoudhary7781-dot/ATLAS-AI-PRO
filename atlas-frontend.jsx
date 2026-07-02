/*
ATLAS AI PRO - Next.js 14 Frontend
Modern React Dashboard with Real-Time WebSocket Support
Supports: Video Intelligence, Market Analysis, Web Scraper, Code Auditor
*/

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Clock, Zap, TrendingUp, Video, Globe, Code, DollarSign } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type ModuleType = 'video_intelligence' | 'market_analysis' | 'web_scraper' | 'code_auditor';
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Task {
  id: string;
  module: ModuleType;
  status: TaskStatus;
  request: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  created_at: string;
  completed_at?: string;
  progress: number;
}

interface Module {
  id: ModuleType;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  endpoints: string[];
}

// ============================================================================
// MODULES CONFIG
// ============================================================================

const MODULES: Module[] = [
  {
    id: 'video_intelligence',
    name: 'Video Intelligence',
    icon: <Video className="w-6 h-6" />,
    color: 'bg-purple-500',
    description: 'Deepfake detection & frame extraction',
    endpoints: ['/api/video/analyze', '/api/video/extract-frames']
  },
  {
    id: 'market_analysis',
    name: 'Market Analysis',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-green-500',
    description: 'Stock prediction & sentiment analysis',
    endpoints: ['/api/market/predict', '/api/market/sentiment']
  },
  {
    id: 'web_scraper',
    name: 'Web Scraper',
    icon: <Globe className="w-6 h-6" />,
    color: 'bg-blue-500',
    description: 'Website scraping & monitoring',
    endpoints: ['/api/scraper/analyze', '/api/scraper/monitor']
  },
  {
    id: 'code_auditor',
    name: 'Code Auditor',
    icon: <Code className="w-6 h-6" />,
    color: 'bg-orange-500',
    description: 'Code review & GitHub analysis',
    endpoints: ['/api/audit/code', '/api/audit/repository']
  }
];

// ============================================================================
// MAIN APP
// ============================================================================

export default function AtlasProApp() {
  const [activeModule, setActiveModule] = useState<ModuleType>('video_intelligence');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws/tasks');
        ws.onopen = () => {
          setWsConnected(true);
          console.log('WebSocket connected');
        };
        ws.onmessage = (event) => {
          console.log('WebSocket message:', event.data);
        };
        ws.onerror = () => setWsConnected(false);
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    };

    connectWebSocket();
  }, []);

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'video_intelligence':
        return <VideoIntelligenceModule tasks={tasks} setTasks={setTasks} />;
      case 'market_analysis':
        return <MarketAnalysisModule tasks={tasks} setTasks={setTasks} />;
      case 'web_scraper':
        return <WebScraperModule tasks={tasks} setTasks={setTasks} />;
      case 'code_auditor':
        return <CodeAuditorModule tasks={tasks} setTasks={setTasks} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">ATLAS AI PRO</h1>
                <p className="text-purple-300 text-sm">Enterprise-Grade Multi-Module AI System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-300">{wsConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Overview */}
        {metrics && (
          <MetricsOverview metrics={metrics} />
        )}

        {/* Module Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeModule === module.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-purple-500/20 bg-slate-800/50 hover:border-purple-500/50'
              }`}
            >
              <div className={`${module.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white`}>
                {module.icon}
              </div>
              <h3 className="font-semibold text-white text-sm">{module.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{module.description}</p>
            </button>
          ))}
        </div>

        {/* Active Module Content */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-purple-500/20 p-8">
          {renderModuleContent()}
        </div>

        {/* Tasks List */}
        <TasksList tasks={tasks} />
      </main>
    </div>
  );
}

// ============================================================================
// METRICS OVERVIEW
// ============================================================================

function MetricsOverview({ metrics }: { metrics: any }) {
  const successRate = metrics.total_tasks > 0 
    ? ((metrics.completed_tasks / metrics.total_tasks) * 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <MetricCard
        label="Total Tasks"
        value={metrics.total_tasks}
        icon={<Clock className="w-5 h-5" />}
        color="blue"
      />
      <MetricCard
        label="Completed"
        value={metrics.completed_tasks}
        icon={<CheckCircle2 className="w-5 h-5" />}
        color="green"
      />
      <MetricCard
        label="Failed"
        value={metrics.failed_tasks}
        icon={<AlertCircle className="w-5 h-5" />}
        color="red"
      />
      <MetricCard
        label="Success Rate"
        value={`${successRate}%`}
        icon={<TrendingUp className="w-5 h-5" />}
        color="purple"
      />
    </div>
  );
}

function MetricCard({ label, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
  };

  return (
    <div className={`bg-slate-800/50 border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE: VIDEO INTELLIGENCE
// ============================================================================

function VideoIntelligenceModule({ tasks, setTasks }: any) {
  const [videoUrl, setVideoUrl] = useState('');
  const [sensitivity, setSensitivity] = useState(0.8);

  const handleAnalyze = async () => {
    if (!videoUrl) return;
    
    try {
      const res = await fetch('/api/video/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl,
          analysis_type: 'deepfake_detection',
          sensitivity
        })
      });
      const data = await res.json();
      setTasks([...tasks, { id: data.task_id, module: 'video_intelligence', status: 'processing', request: {}, created_at: new Date().toISOString(), progress: 0 }]);
      setVideoUrl('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Video Intelligence</h2>
        <p className="text-gray-400 mb-6">Analyze videos for deepfakes and extract key frames</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Video URL</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter video URL or file path..."
            className="w-full px-4 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sensitivity: {(sensitivity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleAnalyze}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          Analyze Video
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
        <h3 className="font-semibold text-white mb-3">Features:</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Deepfake detection with AI analysis</li>
          <li>✓ Frame extraction and analysis</li>
          <li>✓ Face consistency checking</li>
          <li>✓ Audio-visual sync analysis</li>
          <li>✓ Real-time processing with progress tracking</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE: MARKET ANALYSIS
// ============================================================================

function MarketAnalysisModule({ tasks, setTasks }: any) {
  const [symbols, setSymbols] = useState('AAPL,MSFT,GOOGL');
  const [timeframe, setTimeframe] = useState('1d');

  const handlePredict = async () => {
    if (!symbols) return;
    
    try {
      const res = await fetch('/api/market/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: symbols.split(',').map(s => s.trim()),
          timeframe,
          analysis_type: 'prediction'
        })
      });
      const data = await res.json();
      setTasks([...tasks, { id: data.task_id, module: 'market_analysis', status: 'processing', request: {}, created_at: new Date().toISOString(), progress: 0 }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Market Analysis AI</h2>
        <p className="text-gray-400 mb-6">Predict stock movements and analyze market sentiment</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Stock Symbols (comma-separated)</label>
          <input
            type="text"
            value={symbols}
            onChange={(e) => setSymbols(e.target.value)}
            placeholder="AAPL,MSFT,GOOGL,AMZN..."
            className="w-full px-4 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
          </select>
        </div>

        <button
          onClick={handlePredict}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          Predict Stocks
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
        <h3 className="font-semibold text-white mb-3">Analysis Includes:</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Price prediction with confidence score</li>
          <li>✓ Support and resistance levels</li>
          <li>✓ Trading signals (BUY/SELL/HOLD)</li>
          <li>✓ Risk analysis</li>
          <li>✓ Market sentiment analysis</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE: WEB SCRAPER
// ============================================================================

function WebScraperModule({ tasks, setTasks }: any) {
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState(1);

  const handleScrape = async () => {
    if (!url) return;
    
    try {
      const res = await fetch('/api/scraper/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          depth,
          extract_type: 'text',
          ai_analysis: true
        })
      });
      const data = await res.json();
      setTasks([...tasks, { id: data.task_id, module: 'web_scraper', status: 'processing', request: {}, created_at: new Date().toISOString(), progress: 0 }]);
      setUrl('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Web Scraper Pro</h2>
        <p className="text-gray-400 mb-6">Scrape websites and analyze content with AI</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Crawl Depth: {depth}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleScrape}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          Scrape & Analyze
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
        <h3 className="font-semibold text-white mb-3">Capabilities:</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Multi-level website crawling</li>
          <li>✓ Text, image, and link extraction</li>
          <li>✓ AI-powered content analysis</li>
          <li>✓ Website monitoring and change detection</li>
          <li>✓ Structured data extraction</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE: CODE AUDITOR
// ============================================================================

function CodeAuditorModule({ tasks, setTasks }: any) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');

  const handleAudit = async () => {
    if (!code) return;
    
    try {
      const res = await fetch('/api/audit/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          focus_areas: ['security', 'performance', 'bugs', 'best_practices']
        })
      });
      const data = await res.json();
      setTasks([...tasks, { id: data.task_id, module: 'code_auditor', status: 'processing', request: {}, created_at: new Date().toISOString(), progress: 0 }]);
      setCode('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Code Auditor AI</h2>
        <p className="text-gray-400 mb-6">Comprehensive code review and security analysis</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Programming Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full h-48 px-4 py-2 bg-slate-900 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
          />
        </div>

        <button
          onClick={handleAudit}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition"
        >
          Audit Code
        </button>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
        <h3 className="font-semibold text-white mb-3">Audit Includes:</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Security vulnerabilities</li>
          <li>✓ Performance optimization</li>
          <li>✓ Bug detection</li>
          <li>✓ Best practices review</li>
          <li>✓ Code quality scoring</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// TASKS LIST
// ============================================================================

function TasksList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Recent Tasks</h2>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No tasks yet. Try submitting a task from one of the modules above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(-10).reverse().map((task) => (
            <div
              key={task.id}
              className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 flex items-center justify-between hover:border-purple-500/50 transition"
            >
              <div className="flex-1">
                <p className="text-sm text-gray-400">
                  {task.id.substring(0, 12)}...
                </p>
                <p className="text-white font-medium capitalize">{task.module.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  task.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                  task.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
