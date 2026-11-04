import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "../../services/apiClient";

type TabKey =
  | "students"
  | "notices"
  | "resources"
  | "tasks"
  | "events"
  | "projects";

export const AdminBatchDetailView: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("students");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tabs: {
    key: TabKey;
    label: string;
    endpoint: string;
    deleteBase: string;
  }[] = [
    {
      key: "students",
      label: "Students",
      endpoint: "/members",
      deleteBase: "/users",
    },
    {
      key: "notices",
      label: "Notices",
      endpoint: "/notices",
      deleteBase: "/notices",
    },
    {
      key: "resources",
      label: "Resources",
      endpoint: "/resources",
      deleteBase: "/resources",
    },
    { key: "tasks", label: "Tasks", endpoint: "/tasks", deleteBase: "/tasks" },
    {
      key: "events",
      label: "Events",
      endpoint: "/events",
      deleteBase: "/events",
    },
    {
      key: "projects",
      label: "Projects",
      endpoint: "/projects",
      deleteBase: "/projects",
    },
  ];

  useEffect(() => {
    fetchTabItems();
  }, [activeTab, batchId]);

  const fetchTabItems = async () => {
    setLoading(true);
    try {
      try {
        const adminRes: any = await apiClient.get<any>(
          `/users/admin/batches/${batchId}/${activeTab}`,
        );
        const data = adminRes?.data?.data || adminRes?.data || adminRes || [];
        setItems(Array.isArray(data) ? data : []);
      } catch {
        const currentTab = tabs.find((t) => t.key === activeTab)!;
        const res: any = await apiClient.get<any>(currentTab.endpoint);
        const raw =
          res?.data?.data ||
          res?.data?.[activeTab] ||
          res?.[activeTab] ||
          res?.data ||
          res ||
          [];
        const list = Array.isArray(raw) ? raw : [];

        if (batchId && batchId !== "all") {
          setItems(
            list.filter(
              (item: any) =>
                !item.batch ||
                String(item.batch).toLowerCase() ===
                  String(batchId).toLowerCase() ||
                String(item.batch_id) === String(batchId),
            ),
          );
        } else {
          setItems(list);
        }
      }
    } catch (error) {
      console.error(`Error loading ${activeTab}:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove this item (#${id})?`,
      )
    )
      return;

    try {
      try {
        await apiClient.delete<any>(`/users/admin/${activeTab}/${id}`);
      } catch {
        const currentTab = tabs.find((t) => t.key === activeTab)!;
        await apiClient.delete<any>(`${currentTab.deleteBase}/${id}`);
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Failed to delete item:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete item.",
      );
    }
  };

  const handlePromoteToggle = async (student: any) => {
    const newRole = student.role === "cr" ? "student" : "cr";
    if (
      !window.confirm(
        `Change ${student.name || student.full_name}'s role to ${newRole.toUpperCase()}?`,
      )
    )
      return;

    try {
      await apiClient.put<any>(`/users/admin/users/${student.id}/role`, {
        role: newRole,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === student.id ? { ...item, role: newRole } : item,
        ),
      );
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update role.",
      );
    }
  };

  const filteredItems = items.filter((item) => {
    const text =
      `${item.name || ""} ${item.full_name || ""} ${item.title || ""} ${item.email || ""} ${item.course_code || ""}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#f8fafc",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <Link
            to="/admin/batches"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontSize: "0.875rem",
              display: "inline-block",
              marginBottom: "0.5rem",
            }}
          >
            ← Back to All Batches
          </Link>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              margin: 0,
              color: "#ffffff",
            }}
          >
            Managing Batch: {batchId === "all" ? "All Active Records" : batchId}
          </h1>
        </div>

        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            color: "#f8fafc",
            outline: "none",
            minWidth: "240px",
          }}
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid #1f2937",
          marginBottom: "1.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                backgroundColor: isActive ? "#2563eb" : "#111827",
                color: isActive ? "#ffffff" : "#94a3b8",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List Container */}
      <div
        style={{
          backgroundColor: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}
          >
            Loading {activeTab}...
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}
          >
            No {activeTab} found in this batch.
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid #1f2937",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {item.course_code && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "0.375rem",
                          backgroundColor: "#1e293b",
                          color: "#38bdf8",
                          border: "1px solid #334155",
                        }}
                      >
                        {item.course_code}
                      </span>
                    )}
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#f1f5f9",
                        fontSize: "1rem",
                      }}
                    >
                      {item.title ||
                        item.name ||
                        item.full_name ||
                        `Record #${item.id}`}
                    </span>
                    {item.role && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          backgroundColor:
                            item.role === "admin"
                              ? "#7c2d12"
                              : item.role === "cr"
                                ? "#1e3a8a"
                                : "#1f2937",
                          color: "#e2e8f0",
                        }}
                      >
                        {item.role}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "0.825rem",
                      color: "#94a3b8",
                      marginTop: "0.25rem",
                    }}
                  >
                    {activeTab === "students"
                      ? `${item.email || ""} ${item.student_id ? `• Roll: ${item.student_id}` : ""}`
                      : item.description ||
                        item.content ||
                        item.category ||
                        `Status: ${item.status || "Active"}`}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {activeTab === "students" && item.role !== "admin" && (
                    <button
                      onClick={() => handlePromoteToggle(item)}
                      style={{
                        padding: "0.4rem 0.75rem",
                        borderRadius: "0.375rem",
                        border: "1px solid #3b82f6",
                        backgroundColor: "transparent",
                        color: "#60a5fa",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                      }}
                    >
                      {item.role === "cr" ? "Demote to Student" : "Make CR"}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "0.375rem",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBatchDetailView;
