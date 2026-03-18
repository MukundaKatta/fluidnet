"use client";

import { useState, useEffect, useRef } from "react";
import { Droplets, BarChart3, BookOpen, Layers, Settings, Play, Pause, RefreshCw, Zap, Brain, GitBranch, Eye } from "lucide-react";

type Tab = "visualizer" | "architectures" | "benchmarks" | "papers";

interface NetworkNode { id: number; x: number; y: number; activation: number; type: "input" | "hidden" | "output"; connections: number[]; timeConstant: number; }
interface Architecture { name: string; description: string; type: string; params: string; adaptiveWeights: boolean; continuousTime: boolean; keyFeature: string; year: number; }
interface BenchmarkResult { architecture: string; task: string; accuracy: number; latency: number; memoryMB: number; adaptability: number; }
interface Paper { title: string; authors: string; year: number; venue: string; citations: number; abstract: string; url: string; tags: string[]; }

const architectures: Architecture[] = [
  { name: "Liquid Time-Constant Networks (LTC)", description: "Neural networks with continuously-varying time constants that allow the network to adapt its dynamics to the temporal structure of the input.", type: "Continuous-time RNN", params: "Variable", adaptiveWeights: true, continuousTime: true, keyFeature: "Time-varying neurons with ODE-based dynamics", year: 2021 },
  { name: "Closed-form Continuous-depth (CfC)", description: "Approximation of liquid networks using closed-form solutions, making them faster while maintaining adaptability.", type: "Continuous-time", params: "Compact", adaptiveWeights: true, continuousTime: true, keyFeature: "Closed-form ODE solutions, no numerical solver needed", year: 2022 },
  { name: "Neural Circuit Policies (NCP)", description: "Sparse, wiring-based neural networks inspired by the C. elegans nervous system with only 302 neurons.", type: "Sparse RNN", params: "Very small", adaptiveWeights: true, continuousTime: true, keyFeature: "Biologically-inspired sparse connectivity", year: 2020 },
  { name: "Structured State Spaces (S4)", description: "Linear state space models with structured parameterization for efficient long-range sequence modeling.", type: "State Space", params: "Medium", adaptiveWeights: false, continuousTime: true, keyFeature: "O(N log N) computation for sequences", year: 2022 },
  { name: "Mamba", description: "Selective state space model with input-dependent selection mechanism for efficient sequence modeling.", type: "Selective SSM", params: "Variable", adaptiveWeights: true, continuousTime: false, keyFeature: "Hardware-aware selective scan algorithm", year: 2023 },
  { name: "RWKV", description: "Linear attention mechanism combining transformer-like training with RNN-like inference efficiency.", type: "Linear Attention", params: "Variable", adaptiveWeights: false, continuousTime: false, keyFeature: "O(N) inference with parallel training", year: 2023 },
];

const benchmarks: BenchmarkResult[] = [
  { architecture: "LTC", task: "Autonomous Driving", accuracy: 94.2, latency: 12, memoryMB: 45, adaptability: 96 },
  { architecture: "CfC", task: "Autonomous Driving", accuracy: 93.8, latency: 5, memoryMB: 32, adaptability: 94 },
  { architecture: "NCP", task: "Autonomous Driving", accuracy: 91.5, latency: 3, memoryMB: 12, adaptability: 92 },
  { architecture: "Transformer", task: "Autonomous Driving", accuracy: 89.1, latency: 45, memoryMB: 256, adaptability: 65 },
  { architecture: "LTC", task: "Time Series Forecasting", accuracy: 92.7, latency: 8, memoryMB: 38, adaptability: 95 },
  { architecture: "S4", task: "Time Series Forecasting", accuracy: 93.1, latency: 6, memoryMB: 48, adaptability: 78 },
  { architecture: "Mamba", task: "Time Series Forecasting", accuracy: 94.5, latency: 4, memoryMB: 52, adaptability: 82 },
  { architecture: "LSTM", task: "Time Series Forecasting", accuracy: 88.3, latency: 15, memoryMB: 64, adaptability: 60 },
  { architecture: "LTC", task: "Robotic Control", accuracy: 96.1, latency: 6, memoryMB: 28, adaptability: 98 },
  { architecture: "NCP", task: "Robotic Control", accuracy: 95.3, latency: 2, memoryMB: 8, adaptability: 97 },
  { architecture: "CfC", task: "Robotic Control", accuracy: 95.8, latency: 4, memoryMB: 22, adaptability: 96 },
];

const papers: Paper[] = [
  { title: "Liquid Time-constant Networks", authors: "Hasani et al.", year: 2021, venue: "AAAI", citations: 450, abstract: "We introduce a new class of time-continuous recurrent neural network models. Instead of declaring a learning system's dynamics by implicit nonlinearities, we construct networks of linear first-order dynamical systems modulated via nonlinear interlinked gates.", url: "#", tags: ["liquid-networks", "continuous-time", "ODE"] },
  { title: "Closed-form Continuous-depth Models", authors: "Hasani et al.", year: 2022, venue: "NeurIPS", citations: 280, abstract: "Continuous-depth neural models have become increasingly important. We present a new family of models that have a closed-form solution and can thus be trained and evaluated without requiring a numerical ODE solver.", url: "#", tags: ["CfC", "closed-form", "efficient"] },
  { title: "Neural Circuit Policies Enabling Auditable Autonomy", authors: "Lechner et al.", year: 2020, venue: "Nature Machine Intelligence", citations: 380, abstract: "We propose neural circuit policies that are sparse, interpretable, and can be formally verified — inspired by the connectome of the nematode C. elegans.", url: "#", tags: ["NCP", "interpretable", "robotics"] },
  { title: "Efficiently Modeling Long Sequences with Structured State Spaces", authors: "Gu et al.", year: 2022, venue: "ICLR", citations: 920, abstract: "We propose the Structured State Space sequence model (S4) based on a new parameterization for the state space model.", url: "#", tags: ["S4", "state-space", "long-range"] },
  { title: "Mamba: Linear-Time Sequence Modeling with Selective State Spaces", authors: "Gu & Dao", year: 2023, venue: "ArXiv", citations: 1200, abstract: "We introduce a new architecture that combines selective state space models with a hardware-aware algorithm for efficient training and inference.", url: "#", tags: ["mamba", "selective-SSM", "efficient"] },
];

function NetworkVisualization({ running }: { running: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    // Initialize nodes
    const nodes: NetworkNode[] = [];
    const layers = [4, 8, 12, 8, 3];
    let id = 0;
    const width = 800;
    const height = 400;

    layers.forEach((count, layerIdx) => {
      const layerX = (layerIdx / (layers.length - 1)) * (width - 100) + 50;
      for (let i = 0; i < count; i++) {
        const layerY = ((i + 1) / (count + 1)) * height;
        const type = layerIdx === 0 ? "input" as const : layerIdx === layers.length - 1 ? "output" as const : "hidden" as const;
        const connections = layerIdx < layers.length - 1
          ? Array.from({ length: Math.min(3, layers[layerIdx + 1]) }, () =>
              id + count - i + Math.floor(Math.random() * layers[layerIdx + 1])
            )
          : [];
        nodes.push({ id: id++, x: layerX, y: layerY, activation: Math.random(), type, connections, timeConstant: 0.5 + Math.random() * 1.5 });
      }
    });
    nodesRef.current = nodes;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach((targetId) => {
          const target = nodes.find((n) => n.id === targetId);
          if (!target) return;
          const alpha = running ? 0.1 + node.activation * 0.4 : 0.1;
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
          ctx.lineWidth = running ? 0.5 + node.activation * 1.5 : 0.5;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          const cpX = (node.x + target.x) / 2;
          ctx.quadraticCurveTo(cpX, node.y, target.x, target.y);
          ctx.stroke();
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        if (running) {
          node.activation = 0.5 + 0.5 * Math.sin(time / node.timeConstant + node.id * 0.5);
        }
        const radius = 4 + node.activation * 6;
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
        const color = node.type === "input" ? "34, 211, 238" : node.type === "output" ? "236, 72, 153" : "139, 92, 246";
        gradient.addColorStop(0, `rgba(${color}, ${running ? node.activation : 0.5})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${color}, ${0.5 + (running ? node.activation * 0.5 : 0)})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (running) time += 0.05;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [running]);

  return <canvas ref={canvasRef} width={800} height={400} className="w-full h-auto rounded-xl bg-gray-950 border border-gray-800" />;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("visualizer");
  const [running, setRunning] = useState(true);
  const [selectedArch, setSelectedArch] = useState<string>("LTC");
  const [taskFilter, setTaskFilter] = useState<string>("all");

  const tabs: { key: Tab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { key: "visualizer", icon: Eye, label: "Visualizer" },
    { key: "architectures", icon: Layers, label: "Architectures" },
    { key: "benchmarks", icon: BarChart3, label: "Benchmarks" },
    { key: "papers", icon: BookOpen, label: "Papers" },
  ];

  const filteredBenchmarks = taskFilter === "all" ? benchmarks : benchmarks.filter((b) => b.task === taskFilter);
  const tasks = ["all", ...new Set(benchmarks.map((b) => b.task))];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2"><Droplets size={20} className="text-brand-400" /><h1 className="text-lg font-bold">FluidNet</h1></div>
          <p className="text-xs text-gray-500 mt-1">Liquid Neural Networks</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === tab.key ? "bg-brand-600/20 text-brand-400" : "text-gray-400 hover:bg-gray-800"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-3 text-xs space-y-1">
            <p className="text-gray-500">Key Insight</p>
            <p className="text-brand-400">Liquid networks adapt their behavior in real-time through continuous-time dynamics.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === "visualizer" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Liquid Network Visualizer</h2>
                <p className="text-gray-500 mt-1">Watch neurons adapt their activation patterns in real-time</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRunning(!running)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${running ? "bg-red-600/20 text-red-400" : "bg-green-600/20 text-green-400"}`}>
                  {running ? <Pause size={14} /> : <Play size={14} />}
                  {running ? "Pause" : "Run"}
                </button>
              </div>
            </div>
            <NetworkVisualization running={running} />
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full bg-cyan-400" /><p className="text-sm font-medium">Input Neurons</p></div>
                <p className="text-xs text-gray-500">Receive sensory data and propagate signals through time-varying connections</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full bg-purple-400" /><p className="text-sm font-medium">Liquid Neurons</p></div>
                <p className="text-xs text-gray-500">Continuously adapt their time constants based on input dynamics (ODE-governed)</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full bg-pink-400" /><p className="text-sm font-medium">Output Neurons</p></div>
                <p className="text-xs text-gray-500">Produce adaptive responses that change with the temporal structure of inputs</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "architectures" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Novel Architectures</h2>
            <div className="space-y-4">
              {architectures.map((arch) => (
                <div key={arch.name} onClick={() => setSelectedArch(arch.name)}
                  className={`bg-gray-900 border rounded-xl p-6 cursor-pointer transition-colors ${selectedArch === arch.name ? "border-brand-500" : "border-gray-800 hover:border-gray-700"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div><h3 className="font-semibold text-lg">{arch.name}</h3><p className="text-sm text-gray-500">{arch.type} | {arch.year}</p></div>
                    <div className="flex gap-2">
                      {arch.adaptiveWeights && <span className="text-xs bg-brand-900/30 text-brand-400 px-2 py-1 rounded-full">Adaptive</span>}
                      {arch.continuousTime && <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-1 rounded-full">Continuous</span>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{arch.description}</p>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Key Feature</p>
                    <p className="text-sm text-brand-400">{arch.keyFeature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "benchmarks" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Benchmark Comparison</h2>
            <div className="flex gap-2 mb-6">
              {tasks.map((task) => (
                <button key={task} onClick={() => setTaskFilter(task)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize ${taskFilter === task ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                  {task === "all" ? "All Tasks" : task}
                </button>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left px-4 py-3">Architecture</th>
                    <th className="text-left px-4 py-3">Task</th>
                    <th className="text-right px-4 py-3">Accuracy</th>
                    <th className="text-right px-4 py-3">Latency</th>
                    <th className="text-right px-4 py-3">Memory</th>
                    <th className="text-right px-4 py-3">Adaptability</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBenchmarks.map((b, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-medium text-brand-400">{b.architecture}</td>
                      <td className="px-4 py-3">{b.task}</td>
                      <td className="px-4 py-3 text-right">{b.accuracy}%</td>
                      <td className="px-4 py-3 text-right text-gray-400">{b.latency}ms</td>
                      <td className="px-4 py-3 text-right text-gray-400">{b.memoryMB}MB</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-800 rounded-full h-2"><div className="bg-brand-500 rounded-full h-2" style={{ width: `${b.adaptability}%` }} /></div>
                          <span className="text-xs">{b.adaptability}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "papers" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Research Papers</h2>
            <div className="space-y-4">
              {papers.map((paper) => (
                <div key={paper.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-lg">{paper.title}</h3>
                    <span className="text-xs text-gray-500 shrink-0 ml-4">{paper.citations} citations</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{paper.authors} | {paper.venue} {paper.year}</p>
                  <p className="text-sm text-gray-400 mb-3">{paper.abstract}</p>
                  <div className="flex gap-2">
                    {paper.tags.map((tag) => <span key={tag} className="text-xs bg-brand-900/30 text-brand-400 px-2 py-0.5 rounded">{tag}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
