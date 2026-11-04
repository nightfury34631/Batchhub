import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../services/apiClient";

interface BatchSummary {
  batchId: string;
  name: string;
  department: string;
  studentCount: number;
  noticeCount: number;
  resourceCount: number;
}

export const AdminBatchesView: React.FC = () => {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res: any = await apiClient.get<any>("/users/admin/batches");
        const payload = res?.data?.data || res?.data || res || [];
        setBatches(Array.isArray(payload) ? payload : []);
      } catch (err: any) {
        console.error("Failed to load batches:", err);
        setBatches([
          {
            batchId: "all",
            name: "Batch 3rd Year (All Active Records)",
            department: "CSE",
            studentCount: 0,
            noticeCount: 0,
            resourceCount: 0,
          },
        ]);
        setError(
          "Showing default batch container (restart backend server to load live batch counts).",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#f8fafc",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            margin: 0,
            color: "#ffffff",
          }}
        >
          Admin Control Center — Batches
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
          Select a batch below to view and remove students, notices, resources,
          tasks, events, and projects.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            backgroundColor: "rgba(234, 179, 8, 0.15)",
            border: "1px solid rgba(234, 179, 8, 0.4)",
            borderRadius: "0.5rem",
            color: "#fde047",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{ color: "#94a3b8", padding: "3rem 0", textAlign: "center" }}
        >
          Loading batches...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {batches.map((b) => (
            <Link
              key={b.batchId}
              to={`/admin/batches/${encodeURIComponent(b.batchId)}`}
              style={{
                textDecoration: "none",
                backgroundColor: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "border-color 0.2s, transform 0.2s",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      backgroundColor: "#1e293b",
                      color: "#38bdf8",
                      border: "1px solid #334155",
                    }}
                  >
                    {b.department || "CSE"}
                  </span>
                  <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                    ID: {b.batchId}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#f1f5f9",
                    margin: "1rem 0 0.5rem",
                  }}
                >
                  {b.name}
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "1.25rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #1f2937",
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                }}
              >
                <span>
                  <strong>{b.studentCount}</strong> Students
                </span>
                <span>•</span>
                <span>
                  <strong>{b.noticeCount}</strong> Notices
                </span>
                <span>•</span>
                <span>
                  <strong>{b.resourceCount}</strong> Resources
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBatchesView;
