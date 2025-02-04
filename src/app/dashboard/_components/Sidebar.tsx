"use client";

// External Dependencies
import React from "react";
import {
  LayoutDashboard,
  Plus,
  ChevronLeft,
  Pencil,
  Check,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

// Internal Dependencies
import type { Project } from "~/types/project";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
} from "~/hooks/use-projects";
import { cn } from "~/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const router = useRouter();
  const params = useParams();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");

  const { data: projects = [] } = useProjects();

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const handleCreateProject = () => {
    createProject.mutate();
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleUpdateName = async (projectId: string) => {
    if (editingName.trim()) {
      await updateProject.mutateAsync({
        projectId,
        name: editingName.trim(),
      });
    }
    setEditingId(null);
  };

  return (
    <div
      className={cn(
        "relative h-screen bg-[#f8f9fb] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex flex-col p-4">
        <Button
          onClick={handleCreateProject}
          className="w-full justify-start"
          disabled={createProject.isPending}
        >
          {createProject.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {!isCollapsed && <span className="ml-2">New Project</span>}
        </Button>

        <div className="mt-4 space-y-1">
          {projects.map((project) => (
            <div key={project.id} className="group relative flex items-center">
              <Button
                onClick={() => router.push(`/dashboard/${project.id}`)}
                variant={
                  params?.["project-id"] === project.id ? "secondary" : "ghost"
                }
                className="w-full justify-start"
              >
                <LayoutDashboard className="h-4 w-4" />
                {!isCollapsed && (
                  <>
                    {editingId === project.id ? (
                      <Input
                        value={editingName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditingName(e.target.value)
                        }
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>,
                        ) => {
                          if (e.key === "Enter") {
                            void handleUpdateName(project.id);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        className="ml-2 h-6"
                        autoFocus
                      />
                    ) : (
                      <span className="ml-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        {project.name}
                      </span>
                    )}
                  </>
                )}
              </Button>
              {!isCollapsed && editingId !== project.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 hidden h-8 w-8 group-hover:flex"
                  onClick={() => startEditing(project)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {!isCollapsed && editingId === project.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 h-8 w-8"
                  onClick={() => void handleUpdateName(project.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={toggleSidebar}
        variant="outline"
        size="icon"
        className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full"
      >
        <ChevronLeft
          className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`}
        />
      </Button>
    </div>
  );
};

export default Sidebar;
