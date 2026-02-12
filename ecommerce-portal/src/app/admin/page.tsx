"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AgentReport {
  status: "idle" | "running" | "success" | "error";
  output: string;
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    errors: string[];
  } | null;
}

const initialReport: AgentReport = {
  status: "idle",
  output: "",
  timestamp: "",
  summary: null,
};

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [agent1Report, setAgent1Report] = useState<AgentReport>(initialReport);
  const [agent2Report, setAgent2Report] = useState<AgentReport>(initialReport);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const triggerAgent = async (agentNum: 1 | 2) => {
    const setReport = agentNum === 1 ? setAgent1Report : setAgent2Report;
    setReport({
      status: "running",
      output: "",
      timestamp: new Date().toISOString(),
      summary: null,
    });

    try {
      const response = await fetch(`/api/agent${agentNum}`, { method: "POST" });
      const data = await response.json();
      setReport({
        status: data.success ? "success" : "error",
        output: data.output,
        timestamp: new Date().toISOString(),
        summary: data.summary,
      });
    } catch {
      setReport({
        status: "error",
        output: "Failed to connect to the agent service.",
        timestamp: new Date().toISOString(),
        summary: null,
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 data-testid="admin-dashboard-title" className="text-2xl font-bold text-gray-900">
              Testing Dashboard
            </h1>
            <p className="text-sm text-gray-500">Multi-Agent E2E Testing Portal</p>
          </div>
          <button
            data-testid="admin-logout"
            onClick={handleLogout}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AgentCard
            agentNum={1}
            title="Agent 1: Script Validation & Maintenance"
            description="Validates existing Playwright test scripts, checks for syntax errors, verifies test structure, and reports any issues found. Use this agent for maintenance activities."
            icon={
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            report={agent1Report}
            onTrigger={() => triggerAgent(1)}
            color="blue"
          />

          <AgentCard
            agentNum={2}
            title="Agent 2: E2E Test Execution"
            description="Executes all Playwright E2E test scripts against the ecommerce portal and generates a detailed test execution report with pass/fail results."
            icon={
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            report={agent2Report}
            onTrigger={() => triggerAgent(2)}
            color="emerald"
          />
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  agentNum,
  title,
  description,
  icon,
  report,
  onTrigger,
  color,
}: {
  agentNum: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  report: AgentReport;
  onTrigger: () => void;
  color: "blue" | "emerald";
}) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      button: "bg-blue-600 hover:bg-blue-700",
      iconBg: "bg-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      button: "bg-emerald-600 hover:bg-emerald-700",
      iconBg: "bg-emerald-100",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      data-testid={`agent-${agentNum}-card`}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className={`${classes.bg} ${classes.border} border-b p-6`}>
        <div className="flex items-start gap-4">
          <div className={`${classes.iconBg} p-3 rounded-lg`}>{icon}</div>
          <div className="flex-1">
            <h2 data-testid={`agent-${agentNum}-title`} className="text-lg font-bold text-gray-900">
              {title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <button
          data-testid={`trigger-agent-${agentNum}`}
          onClick={onTrigger}
          disabled={report.status === "running"}
          className={`w-full ${classes.button} text-white py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {report.status === "running" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Running...
            </span>
          ) : (
            `Trigger Agent ${agentNum}`
          )}
        </button>

        {report.status !== "idle" && (
          <div data-testid={`agent-${agentNum}-report`} className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Report</h3>
              {report.timestamp && (
                <span className="text-xs text-gray-500">
                  {new Date(report.timestamp).toLocaleString()}
                </span>
              )}
            </div>

            {report.summary && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{report.summary.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{report.summary.passed}</p>
                  <p className="text-xs text-gray-500">Passed</p>
                </div>
                <div className={`${report.summary.failed > 0 ? "bg-red-50" : "bg-gray-50"} rounded-lg p-3 text-center`}>
                  <p className={`text-2xl font-bold ${report.summary.failed > 0 ? "text-red-600" : "text-gray-900"}`}>
                    {report.summary.failed}
                  </p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
              </div>
            )}

            {report.summary && report.summary.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-red-800 mb-1">Issues Found:</p>
                {report.summary.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-700">- {err}</p>
                ))}
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre
                data-testid={`agent-${agentNum}-output`}
                className="text-sm text-green-400 font-mono whitespace-pre-wrap break-words"
              >
                {report.output || "Waiting for output..."}
              </pre>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {report.status === "success" && (
                <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed Successfully
                </span>
              )}
              {report.status === "error" && (
                <span className="inline-flex items-center gap-1 text-sm text-red-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Issues Detected
                </span>
              )}
              {report.status === "running" && (
                <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  In Progress...
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
