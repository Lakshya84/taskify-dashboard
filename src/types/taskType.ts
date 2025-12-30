export interface User {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  projectName: string;
}

export interface Attachments {
  id?: string;
  fileName: string;
  size: string;
  type: string;
  base64: string;
}

export interface Comment {
  id?: string;
  createdBy?: User;
  commentText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  action: string;
  previous?: string;
  current?: string;
  createdAt: string;
  performedBy: User;
  actionDisplay: string;
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  alias: string;
  assignee: User[];
  reporter: User;
  status: number;
  priority: number;
  dueDate: string;
  attachments: Attachments[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  activityLog: ActivityLog[];
  project: Project;
}

// export interface TaskPayload {
//   title: string;
//   description?: string;
//   project: Project;
//   reporter: User;
//   assignee: User;
//   priority: number;
//   status: number;
//   dueDate: string;
//   attachments: string[];
// }

// export interface TaskResponse {
//   id: string;
//   project: Project;
//   title: string;
//   description: string;
//   alias: string;
//   assignee: User[];
//   reporter: User;
//   status: number;
//   priority: number;
//   dueDate: string;
//   attachments: string[];
//   createdAt: string;
//   updatedAt: string;
//   comments: any[];
//   activityLog: {
//     action: number;
//     previous: string | null;
//     current: string;
//     createdAt: string;
//     performedBy: User;
//   }[];
// }

// const mapBackendTaskToTaskData = (task: any): TaskData => {
//   const result = response.result;

//   const priorityMap = {
//     1: "High",
//     2: "Normal",
//     3: "Low",
//   } as const;

//   const statusMap = {
//     1: "To do",
//     2: "In progress",
//     3: "Done",
//   } as const;
//   return {
//     id: result.id,
//     alias: result.alias,
//     title: result.title,
//     assignedBy: result.reporter.name,
//     assignee: result.assignee.map((a: any) => a.name),
//     reporters: [result.reporter.name],
//     reporterIds: [result.reporter.id],
//     assignedDate: result.createdAt,
//     dueDate: result.dueDate,
//     priority: priorityMap[result.priority] ?? "Undefined",
//     status: statusMap[result.status] ?? "Undefined",
//     project: result.project.projectName,
//   };
// };

// const mapPriority = (p: number) => {
//   switch (p) {
//     case 1: return "High";
//     case 2: return "Normal";
//     case 3: return "Low";
//     default: return "Undefined";
//   }
// };

// const mapStatus = (s: number) => {
//   switch (s) {
//     case 1: return "To do";
//     case 2: return "In progress";
//     case 3: return "Done";
//     default: return "Undefined";
//   }
// };
