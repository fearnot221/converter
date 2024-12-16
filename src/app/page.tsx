"use client";

import Link from "next/link";
import { CSSProperties } from "react";
import { useState } from "react";

export default function Home() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Convert Tools</h1>
      <p style={subheadingStyle}>Just try it.</p>
      <div style={gridContainerStyle}>
        {blocks.map((block, index) => (
          <Link
            key={index}
            href={block.link}
            style={{
              ...blockStyle,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div style={innerCardStyle(hoveredIndex === index)}>
              <h2 style={blockTitleStyle}>{block.title}</h2>
              <p style={blockDescStyle}>{block.description}</p>
              <span style={hoverIndicatorStyle(hoveredIndex === index)}>
                &#8594;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const blocks = [
  {
    title: "PNG to JPG",
    description: "Convert PNG images to JPG format.",
    link: "/convert/png-to-jpg",
  },
  {
    title: "JPG to PNG",
    description: "Convert JPG images to PNG format.",
    link: "/convert/jpg-to-png",
  },
  {
    title: "Resize Image",
    description: "Change the dimensions of images.",
    link: "/resize-image",
  },
  {
    title: "Split PDF",
    description: "Split PDF and use csv to rename.",
    link: "/pdf/split",
  },
  {
    title: "LEA 工具",
    description: "使用 LEA 算法處理數據",
    link: "/crypto/lea",
  },
];

const containerStyle: CSSProperties = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#2d3142",
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  background: "linear-gradient(135deg, #f1f2f7, #e3e6ed)",
  minHeight: "100vh",
};

const headingStyle: CSSProperties = {
  fontSize: "2.8rem",
  marginBottom: "10px",
  color: "#3b3f56",
  fontWeight: 700,
};

const subheadingStyle: CSSProperties = {
  fontSize: "1.1rem",
  marginBottom: "40px",
  color: "#5d5f7e",
};

const gridContainerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  padding: "0 20px",
};

const blockStyle: CSSProperties = {
  perspective: "1000px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "200px",
  textDecoration: "none",
};

const innerCardStyle = (isHovered: boolean): CSSProperties => ({
  width: "100%",
  height: "100%",
  padding: "20px",
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: isHovered
    ? "0 12px 30px rgba(0, 0, 0, 0.2)"
    : "0 8px 15px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  color: "#2d3142",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  transform: isHovered
    ? "scale(1.05) translateY(-10px)"
    : "scale(1) translateY(0)",
});

const blockTitleStyle: CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 600,
  margin: "10px 0 6px",
  color: "#3b3f56",
};

const blockDescStyle: CSSProperties = {
  fontSize: "0.95rem",
  color: "#5d5f7e",
};

const hoverIndicatorStyle = (isHovered: boolean): CSSProperties => ({
  fontSize: "1.5rem",
  color: "#3b3f56",
  opacity: isHovered ? 1 : 0,
  transform: isHovered ? "translateX(10px)" : "translateX(0px)",
  transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
  position: "absolute",
  right: "20px",
  bottom: "20px",
});
