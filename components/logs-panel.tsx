"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { ActivityTimeline } from "@/components/activity-timeline"

export function LogsPanel() {
  return (
    <Tabs defaultValue="tasks" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tasks">Tarefas</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks" className="mt-6">
        <TaskList />
      </TabsContent>
      <TabsContent value="timeline" className="mt-6">
        <ActivityTimeline />
      </TabsContent>
    </Tabs>
  )
}
