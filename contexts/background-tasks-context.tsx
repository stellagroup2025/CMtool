"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type TaskStatus = "pending" | "running" | "completed" | "error"

export type TaskType =
  | "generate-carousel"
  | "generate-post"
  | "generate-batch"
  | "publish-instagram"
  | "generate-images"

export interface BackgroundTask {
  id: string
  type: TaskType
  title: string
  description?: string
  status: TaskStatus
  progress?: number // 0-100
  error?: string
  result?: any
  createdAt: Date
  completedAt?: Date
}

interface BackgroundTasksContextType {
  tasks: BackgroundTask[]
  addTask: (task: Omit<BackgroundTask, "id" | "createdAt">) => string
  updateTask: (id: string, updates: Partial<BackgroundTask>) => void
  removeTask: (id: string) => void
  clearCompleted: () => void
  getTask: (id: string) => BackgroundTask | undefined
}

const BackgroundTasksContext = createContext<BackgroundTasksContextType | undefined>(undefined)

export function BackgroundTasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<BackgroundTask[]>([])

  const addTask = useCallback((task: Omit<BackgroundTask, "id" | "createdAt">) => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTask: BackgroundTask = {
      ...task,
      id,
      createdAt: new Date(),
    }
    setTasks((prev) => [newTask, ...prev])
    return id
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<BackgroundTask>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, completedAt: updates.status === "completed" || updates.status === "error" ? new Date() : task.completedAt }
          : task
      )
    )
  }, [])

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((task) => task.status !== "completed"))
  }, [])

  const getTask = useCallback(
    (id: string) => {
      return tasks.find((task) => task.id === id)
    },
    [tasks]
  )

  return (
    <BackgroundTasksContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        removeTask,
        clearCompleted,
        getTask,
      }}
    >
      {children}
    </BackgroundTasksContext.Provider>
  )
}

export function useBackgroundTasks() {
  const context = useContext(BackgroundTasksContext)
  if (!context) {
    throw new Error("useBackgroundTasks must be used within BackgroundTasksProvider")
  }
  return context
}
