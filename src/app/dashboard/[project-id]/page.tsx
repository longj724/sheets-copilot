"use client";

// External Dependencies
import { useParams } from "next/navigation";

// Internal Dependencies
import MainContent from "../_components/MainContent";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params["project-id"] as string;

  return <MainContent projectId={projectId} />;
}
