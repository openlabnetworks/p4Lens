import React, { useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronRight, 
  FiChevronDown, 
  FiPackage, 
  FiSettings, 
  FiSend,
  FiFileText,
  FiDatabase,
  FiCode,
  FiZap,
  FiLayers,
  FiX
} from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const DEFAULT_CREATOR = {
  name: "Sankalp Jha",
  url: "https://sankalpjha.dev",
};

// Pipeline Stage Card Component
function PipelineStageCard({ stage, index, isActive, onClick, totalStages }) {
  const stageConfig = {
    parser: {
      border: "border-white/10",
      icon: FiPackage,
      label: "Parser",
    },
    control: {
      border: "border-white/10",
      icon: FiSettings,
      label: "Control",
    },
      deparser: {
      border: "border-white/10",
      icon: FiSend,
      label: "Deparser",
    },
  };

  const config = stageConfig[stage.type] || {
    border: "border-white/10",
    icon: FiCode,
    label: stage.type,
  };

  const Icon = config.icon;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Connection Line */}
      {index < totalStages - 1 && (
        <div className="absolute left-1/2 top-full z-0 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-[#7cc242]/75 to-[#7357a5]/20">
          <Motion.div
            className="absolute left-1/2 top-0 h-3 w-3 -ml-1.5 bg-[#7cc242] shadow-[0_0_18px_rgba(124,194,66,0.9)]"
            animate={{ y: [0, 56, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      <Motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "relative cursor-pointer border bg-black/90 text-[#f7f4ff] shadow-[0_18px_48px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-[#7cc242]/50 hover:bg-[#111111]",
          config.border,
          isActive && "ring-2 ring-[#7cc242] ring-offset-2 ring-offset-black"
        )}
      >
        {/* Header */}
        <div className="border-b border-white/10 p-5 text-[#fbf9ff] sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/10 bg-black/40 text-[#7cc242] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(115,87,165,0.18)]">
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm opacity-90 uppercase tracking-wide font-semibold">
                  {config.label}
                </div>
                <div className="mt-1 truncate text-xl font-bold sm:text-2xl">{stage.name}</div>
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-3xl font-bold opacity-20">#{index + 1}</div>
            </div>
          </div>
      </div>

        {/* Stats */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {stage.stats.tables > 0 && (
              <Badge variant="outline" className="border-white/10 bg-black/40 px-3 py-1.5 text-sm text-[#e7dcff]">
                {stage.stats.tables} {stage.stats.tables === 1 ? 'Table' : 'Tables'}
              </Badge>
            )}
            {stage.stats.actions > 0 && (
              <Badge variant="outline" className="border-[#7cc242]/30 bg-[#7cc242]/10 px-3 py-1.5 text-sm text-[#dff8c9]">
                {stage.stats.actions} {stage.stats.actions === 1 ? 'Action' : 'Actions'}
              </Badge>
            )}
            {stage.stats.states > 0 && (
              <Badge variant="outline" className="border-white/10 bg-black/25 px-3 py-1.5 text-sm text-[#cdbdff]">
                {stage.stats.states} {stage.stats.states === 1 ? 'State' : 'States'}
              </Badge>
            )}
          </div>
    </div>
      </Motion.div>
    </Motion.div>
  );
}

export default function PipelineFlow({ structure, creator = DEFAULT_CREATOR }) {
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("pipeline");

  const globalTables = structure?._tables || {};
  const globalHeaders = structure?._headers || {};

  // Organize pipeline stages
  const pipelineStages = useMemo(() => {
    if (!structure) return [];

    const nodeKeys = Object.keys(structure).filter((k) => !k.startsWith("_"));
    const sortedKeys = nodeKeys.sort((a, b) => {
      const order = { parser: 0, control: 1, deparser: 2 };
      const typeA = structure[a].type;
      const typeB = structure[b].type;
      return (order[typeA] || 99) - (order[typeB] || 99);
    });

    return sortedKeys.map((name, index) => {
      const info = structure[name];
      const tables = info.tables || [];
      const actions = info.actions || [];
      const states = info.states || [];

      return {
        id: name,
        name,
        info,
          type: info.type,
        index,
        stats: {
          tables: tables.length,
          actions: Array.isArray(actions) ? actions.length : 0,
          states: Array.isArray(states) ? states.length : 0,
        },
      };
    });
  }, [structure]);

  if (!structure || pipelineStages.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-[#bdb2d6]">
        Upload a P4 file to visualize.
      </div>
    );
  }

  return (
    <div className="p4-ambient relative h-screen w-screen overflow-hidden bg-black text-[#f7f4ff]">
      <div className="p4-grid-field pointer-events-none absolute inset-x-4 top-24 h-[calc(100vh-8rem)] opacity-60" />
      {/* Top Navigation Bar */}
      <div className="absolute left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/90 shadow-sm backdrop-blur-lg">
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h1 className="text-2xl font-black tracking-tight text-[#fbf9ff] drop-shadow-[0_0_14px_rgba(124,194,66,0.28)] sm:text-3xl">P4Lens</h1>
            <div className="flex border border-white/10 bg-black/40 p-1">
              <Button
                onClick={() => {
                  setViewMode("pipeline");
                  setSelected(null);
                }}
                variant={viewMode === "pipeline" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none shadow-none",
                  viewMode === "pipeline"
                    ? "bg-[#7cc242] text-[#071004] hover:bg-[#93db54]"
                    : "text-[#dfd4ff] hover:bg-black/40 hover:text-white"
                )}
              >
                Pipeline
              </Button>
              <Button
                onClick={() => {
                  setViewMode("overview");
                  setSelected(null);
                }}
                variant={viewMode === "overview" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none shadow-none",
                  viewMode === "overview"
                    ? "bg-[#7cc242] text-[#071004] hover:bg-[#93db54]"
                    : "text-[#dfd4ff] hover:bg-black/40 hover:text-white"
                )}
              >
                Overview
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="text-xs text-[#a99dcc]">
              Built by{" "}
              <a
                href={creator?.url || DEFAULT_CREATOR.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#f7f4ff] hover:text-[#7cc242] hover:underline"
              >
                {creator?.name || DEFAULT_CREATOR.name}
              </a>
            </div>
            <Badge variant="outline" className="max-w-[220px] truncate border-[#7cc242]/30 bg-[#7cc242]/10 text-sm text-[#dff8c9]">
              {structure._filename || "P4 Program"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 h-full overflow-y-auto pt-36 sm:pt-28 lg:pt-20">
        {viewMode === "pipeline" && (
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-[#fbf9ff]">P4 Pipeline Flow</h2>
              <p className="text-[#bdb2d6]">Select a stage to inspect tables, actions, state transitions, and apply logic.</p>
            </div>

            <div className="space-y-8">
              {pipelineStages.map((stage, index) => (
                <PipelineStageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  totalStages={pipelineStages.length}
                  isActive={selected?.id === stage.id}
                  onClick={() => setSelected(stage)}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === "overview" && (
          <OverviewView
            pipelineStages={pipelineStages}
            globalTables={globalTables}
            globalHeaders={globalHeaders}
          />
        )}
      </div>

      {/* Detailed Side Panel */}
      <AnimatePresence>
        {selected && viewMode === "pipeline" && (
          <DetailedPanel
            stage={selected}
            globalTables={globalTables}
            globalHeaders={globalHeaders}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Comprehensive Detailed Panel Component
function DetailedPanel({ stage, globalTables, globalHeaders, onClose }) {
  const [activeTab, setActiveTab] = useState("deep-dive");

  const info = stage.info;
  const applyLogic = info.apply_logic || {};
  const tables = info.tables || [];
  const actions = info.actions || [];
  const states = info.states || [];
  const extracts = info.extracts || [];
  const transitions = info.transitions || [];

  return (
    <Motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed bottom-0 right-0 top-28 z-40 flex w-full flex-col overflow-hidden border-l border-white/10 bg-black text-[#f7f4ff] shadow-2xl sm:top-20 sm:w-[min(600px,calc(100vw-2rem))]"
    >
      {/* Header */}
      <div className="border-b border-white/10 bg-black p-5 text-[#fbf9ff] sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{stage.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="border-[#7cc242]/30 bg-[#7cc242]/10 text-xs text-[#dff8c9]">
                {info.type}
              </Badge>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-[#dfd4ff] hover:bg-black/40 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-black px-4 pt-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-none bg-black/40 text-[#bdb2d6] sm:grid-cols-4">
            <TabsTrigger value="deep-dive" className="rounded-none data-[state=active]:bg-[#7cc242] data-[state=active]:text-[#071004]">Deep Dive</TabsTrigger>
            <TabsTrigger value="tables" className="rounded-none data-[state=active]:bg-[#7cc242] data-[state=active]:text-[#071004]">Tables</TabsTrigger>
            <TabsTrigger value="actions" className="rounded-none data-[state=active]:bg-[#7cc242] data-[state=active]:text-[#071004]">Actions</TabsTrigger>
            <TabsTrigger value="flow" className="rounded-none data-[state=active]:bg-[#7cc242] data-[state=active]:text-[#071004]">Flow</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="deep-dive" className="mt-0">
              <DeepDiveTab
                info={info}
                states={states}
                extracts={extracts}
                transitions={transitions}
                applyLogic={applyLogic}
                globalHeaders={globalHeaders}
              />
            </TabsContent>
            <TabsContent value="tables" className="mt-0">
              <TablesTabDetailed tables={tables} globalTables={globalTables} />
            </TabsContent>
            <TabsContent value="actions" className="mt-0">
              <ActionsTabDetailed actions={actions} />
            </TabsContent>
            <TabsContent value="flow" className="mt-0">
              <FlowTab applyLogic={applyLogic} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </Motion.div>
  );
}

// Deep Dive Tab - Comprehensive Explanation
function DeepDiveTab({ info, states, extracts, transitions, applyLogic, globalHeaders }) {
  const type = info.type;

  return (
    <div className="space-y-6">
      {/* What is this stage? */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 bg-black/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-[#fbf9ff]">
          <FiFileText className="w-5 h-5" />
          What is {type}?
        </h3>
        {type === "parser" && (
          <p className="text-sm leading-relaxed text-[#cfc5e3]">
            The <strong>Parser</strong> is the first stage in P4 packet processing. It reads incoming packet bits
            sequentially and extracts headers based on the packet structure. Think of it as a "packet decoder" that
            identifies what type of packet it is (Ethernet, IPv4, TCP, etc.) and extracts the relevant header fields.
            The parser uses a state machine to navigate through different header types.
          </p>
        )}
        {type === "control" && (
          <p className="text-sm leading-relaxed text-[#cfc5e3]">
            The <strong>Control</strong> block is the "brain" of P4 processing. It contains match-action tables that
            make forwarding decisions. When a packet arrives, the control block examines header fields, matches them
            against table entries, and executes corresponding actions (like forwarding, dropping, or modifying headers).
            The <code className="bg-black px-1 text-[#e5ffcf]">apply</code> block is the main function that orchestrates
            which tables to apply and in what order.
          </p>
        )}
        {type === "deparser" && (
          <p className="text-sm leading-relaxed text-[#cfc5e3]">
            The <strong>Deparser</strong> is the final stage that reassembles the packet. After all processing is done,
            it takes the modified headers and serializes them back into a packet format. It emits headers in the correct
            order, ensuring the packet is properly formatted before being sent out.
          </p>
        )}
      </Motion.div>

      {/* Parser-specific details */}
      {type === "parser" && states && states.length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 bg-black/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#fbf9ff]">
            <FiLayers className="w-5 h-5" />
            Parser State Machine
          </h3>
          <div className="space-y-3">
            {states.map((state, i) => (
              <div key={i} className="border border-white/10 bg-black p-4">
                <div className="mb-2 font-semibold text-[#fbf9ff]">{state}</div>
                {extracts[i] && (
                  <div className="mt-1 text-sm text-[#bdb2d6]">
                    <span className="font-medium">Extracts:</span>{" "}
                    <code className="bg-black/40 px-2 py-0.5 text-[#e9ddff]">{extracts[i]}</code>
                  </div>
                )}
                {transitions[i] && transitions[i] !== "select" && transitions[i] !== "accept" && (
                  <div className="mt-1 text-sm text-[#bdb2d6]">
                    <span className="font-medium">Transitions to:</span>{" "}
                    <span className="text-[#7cc242]">{transitions[i]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Motion.div>
      )}

      {/* Control-specific details */}
      {type === "control" && applyLogic && applyLogic.raw_apply_body && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-white/10 bg-black/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#fbf9ff]">
            <FiCode className="w-5 h-5" />
            Apply Block - Main Function
          </h3>
          <div className="overflow-x-auto border border-white/10 bg-black p-4 font-mono text-xs text-[#e5ffcf]">
            <pre>{applyLogic.raw_apply_body}</pre>
          </div>
          <div className="mt-4 border border-white/10 bg-black p-4">
            <p className="text-sm text-[#cfc5e3]">
              <strong className="text-[#fbf9ff]">Understanding apply blocks:</strong> The <code>apply</code> block is like the <code>main()</code> function
              in traditional programming. It defines the execution flow - which tables to apply and under what conditions.
            </p>
          </div>
        </Motion.div>
      )}

      {/* Headers Reference */}
      {Object.keys(globalHeaders).length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-white/10 bg-black/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#fbf9ff]">
            <FiDatabase className="w-5 h-5" />
            Available Headers
          </h3>
          <div className="space-y-3">
            {Object.entries(globalHeaders).map(([name, fields]) => (
              <div key={name} className="border border-white/10 bg-black p-4">
                <div className="mb-2 font-semibold text-[#fbf9ff]">{name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {fields.map((field, fi) => (
                    <div key={fi} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-[#7cc242]"></div>
                      <span className="text-[#cfc5e3]">{field.field}</span>
                      <span className="text-[#8f80b7]">({field.bits})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Motion.div>
      )}
    </div>
  );
}

// Detailed Tables Tab
function TablesTabDetailed({ tables, globalTables }) {
  if (tables.length === 0) {
    return (
      <div className="py-12 text-center text-[#bdb2d6]">
        <FiDatabase className="mx-auto mb-4 h-16 w-16 text-[#7357a5]" />
        <p>No tables in this control block</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tables.map((tableName, i) => {
        const table = globalTables[tableName];
        if (!table) return null;

        return (
          <Motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-white/10 bg-black/90 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#fbf9ff]">{tableName}</h3>
              {table.size && (
                <span className="border border-[#7cc242]/30 bg-[#7cc242]/10 px-3 py-1 text-xs font-semibold text-[#dff8c9]">
                  Max {table.size} entries
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#fbf9ff]">
                  <FiZap className="w-4 h-4" />
                  Match Keys
                </h4>
                <div className="space-y-2 border border-white/10 bg-black p-4">
                  {table.keys.map((key, ki) => (
                    <div key={ki} className="flex items-center gap-3 bg-black/40 p-2">
                      <div className="h-2 w-2 bg-[#7cc242]"></div>
                      <code className="flex-1 text-sm text-[#cfc5e3]">{key}</code>
                    </div>
                  ))}
                </div>
              </div>

                <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-[#fbf9ff]">
                  <FiZap className="w-4 h-4" />
                  Available Actions
                </h4>
                <div className="border border-white/10 bg-black p-4">
                  <div className="flex flex-wrap gap-2">
                    {table.actions.map((action, ai) => (
                      <span
                        key={ai}
                        className="border border-white/10 bg-black/40 px-3 py-1.5 text-sm font-semibold text-[#e7dcff]"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        );
      })}
    </div>
  );
}

// Detailed Actions Tab
function ActionsTabDetailed({ actions }) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return (
      <div className="py-12 text-center text-[#bdb2d6]">
        <FiSettings className="mx-auto mb-4 h-16 w-16 text-[#7357a5]" />
        <p>No actions defined in this block</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actions.map((action, i) => (
        <Motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="border border-white/10 bg-black/90 p-6 shadow-lg"
        >
          <h3 className="mb-4 text-xl font-bold text-[#fbf9ff]">{action.name || action}</h3>

          {typeof action === "object" && (
            <div className="space-y-4">
              {action.parameters && action.parameters.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-[#fbf9ff]">Parameters</h4>
                  <div className="space-y-2 border border-white/10 bg-black p-4">
                    {action.parameters.map((param, pi) => (
                      <div key={pi} className="flex items-center gap-3 bg-black/40 p-2">
                        <code className="text-sm text-[#cfc5e3]">
                          {param.type} <span className="font-semibold">{param.name}</span>
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {action.body_preview && (
                <div>
                  <h4 className="mb-2 font-semibold text-[#fbf9ff]">Implementation</h4>
                  <pre className="overflow-x-auto border border-white/10 bg-black p-4 font-mono text-xs text-[#e5ffcf]">
                    {action.body_preview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Motion.div>
      ))}
    </div>
  );
}

// Flow Tab
function FlowTab({ applyLogic }) {
  return (
    <div className="space-y-6">
      <div className="border border-white/10 bg-black/90 p-5">
        <h3 className="mb-2 text-lg font-bold text-[#fbf9ff]">Execution Flow</h3>
        <p className="text-sm text-[#cfc5e3]">
          This shows the order in which tables are applied and how packet processing flows.
        </p>
      </div>

      {applyLogic.logic && applyLogic.logic.length > 0 ? (
        <div className="space-y-4">
          {applyLogic.logic.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-[#7cc242]/30 bg-[#7cc242]/10 font-bold text-[#dff8c9]">
                {i + 1}
              </div>
              <div className="flex-1 border border-white/10 bg-black p-4">
                <code className="text-sm text-[#cfc5e3]">{step}</code>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-[#bdb2d6]">
          <p>No explicit flow logic defined</p>
        </div>
      )}
    </div>
  );
}

// Overview View
function OverviewView({ pipelineStages, globalTables, globalHeaders }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold text-[#fbf9ff]">Program Overview</h2>
        <p className="text-[#bdb2d6]">Complete P4 pipeline analysis</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-white/10 bg-black/90 p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-[#7cc242]">{pipelineStages.length}</div>
          <div className="mt-2 text-sm text-[#bdb2d6]">Pipeline Stages</div>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 bg-black/90 p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-[#7cc242]">{Object.keys(globalTables).length}</div>
          <div className="mt-2 text-sm text-[#bdb2d6]">Match-Action Tables</div>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-white/10 bg-black/90 p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-[#7cc242]">{Object.keys(globalHeaders).length}</div>
          <div className="mt-2 text-sm text-[#bdb2d6]">Header Types</div>
        </Motion.div>
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="border border-white/10 bg-black/90 p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-[#7cc242]">
            {pipelineStages.reduce((sum, s) => sum + (s.stats.actions || 0), 0)}
          </div>
          <div className="mt-2 text-sm text-[#bdb2d6]">Total Actions</div>
        </Motion.div>
      </div>

      <div className="border border-white/10 bg-black/90 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-[#fbf9ff]">Pipeline Flow</h3>
        <div className="space-y-3">
          {pipelineStages.map((stage, i) => (
            <div key={i} className="flex items-center gap-4 border border-white/10 bg-black p-4">
              <div className="flex h-10 w-10 items-center justify-center border border-[#7cc242]/30 bg-[#7cc242]/10 font-bold text-[#dff8c9]">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#fbf9ff]">{stage.name}</div>
                <div className="text-xs uppercase text-[#8f80b7]">{stage.type}</div>
              </div>
              <div className="text-sm font-semibold uppercase text-[#bdb2d6]">{i < pipelineStages.length - 1 ? "-" : "done"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
