import React, { useState, useEffect } from "react";
import { apiClient } from "../../services/apiClient";

interface Material {
  id: number;
  title: string;
  course_code: string;
  category: string;
  file_url: string;
  status: string;
  uploaded_by: number;
  created_at: string;
}

export const ResourcesView: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      let res: any;
      try {
        res = await apiClient.get<any>("/resources");
      } catch {
        res = await apiClient.get<any>("/materials");
      }
      const raw =
        res?.data?.data ||
        res?.data?.resources ||
        res?.data?.materials ||
        res?.data ||
        res ||
        [];
      setMaterials(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueCourses = [
    "All",
    ...Array.from(new Set(materials.map((m) => m.course_code).filter(Boolean))),
  ];

  const filteredMaterials =
    selectedCourse === "All"
      ? materials
      : materials.filter((m) => m.course_code === selectedCourse);

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              margin: 0,
              color: "#ffffff",
            }}
          >
            Course Materials
          </h1>
          <p
            style={{
              color: "#94a3b8",
              marginTop: "0.35rem",
              fontSize: "0.9rem",
            }}
          >
            Filter and access shared batch study materials by course.
          </p>
        </div>

        {/* Course Dropdown Filter */}
        <div style={{ minWidth: "240px" }}>
          <label
            htmlFor="courseFilter"
            style={{
              display: "block",
              fontSize: "0.8rem",
              color: "#94a3b8",
              marginBottom: "0.35rem",
            }}
          >
            Filter by Course
          </label>
          <select
            id="courseFilter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "0.5rem",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#f8fafc",
              outline: "none",
              fontSize: "0.9rem",
            }}
          >
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course === "All" ? "All Courses" : course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
          Loading course materials...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            backgroundColor: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "0.75rem",
            color: "#64748b",
          }}
        >
          No materials found for{" "}
          {selectedCourse === "All" ? "any course" : selectedCourse}.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              style={{
                backgroundColor: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      backgroundColor: "#1e293b",
                      color: "#38bdf8",
                      border: "1px solid #334155",
                    }}
                  >
                    {material.course_code || "General"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      backgroundColor:
                        material.status === "approved"
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(234, 179, 8, 0.15)",
                      color:
                        material.status === "approved" ? "#4ade80" : "#facc15",
                    }}
                  >
                    {material.status || "Active"}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#f1f5f9",
                    margin: "0 0 0.5rem",
                  }}
                >
                  {material.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
                  Category: {material.category || "Lecture Notes"}
                </p>
              </div>

              <div
                style={{
                  marginTop: "1.25rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #1f2937",
                }}
              >
                <a
                  href={
                    material.file_url && material.file_url !== "n/a"
                      ? material.file_url
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!material.file_url || material.file_url === "n/a")
                      e.preventDefault();
                  }}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    backgroundColor:
                      material.file_url && material.file_url !== "n/a"
                        ? "#2563eb"
                        : "#1f2937",
                    color:
                      material.file_url && material.file_url !== "n/a"
                        ? "#ffffff"
                        : "#64748b",
                    cursor:
                      material.file_url && material.file_url !== "n/a"
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {material.file_url && material.file_url !== "n/a"
                    ? "Open Resource"
                    : "No Link Provided"}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesView;
