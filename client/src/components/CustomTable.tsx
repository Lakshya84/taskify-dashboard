import { Table, Avatar, Typography, Select, Tooltip } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import "../../index.css";
import high from "../assets/high.png";
import medium from "../assets/medium.png";
import low from "../assets/low.png";
import { type TaskData, type User } from "../types/taskType";
import { useEffect, useState } from "react";
import BigDrawer from "./BigDrawer";
import axiosInstance from "../services/axiosInstance";
import dayjs from "dayjs";
import { useTaskContext } from "../stores/TaskContext";
import { useAntMessage } from "../stores/MessageContext";

const { Text } = Typography;
const formatDate = (iso: string) => dayjs(iso).format("DD MMM YYYY");

interface CustomTableProps {
  searchQuery?: string;
  priorityTask?: string;
  projName?: string;
}

const CustomTable: React.FC<CustomTableProps> = ({
  searchQuery,
  priorityTask,
  projName,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const { tasks, setTasks } = useTaskContext();
  const [loading, setLoading] = useState(false);
  const messageApi = useAntMessage();

  // pagination state handling
  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
    total: number;
  }>({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  const handleOpenDrawer = (task: TaskData) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const getInitial = (name: string): string =>
    name?.trim().charAt(0).toUpperCase() || "?";

  const getAvatarColor = (initials: string): string => {
    const colors = ["#FC9B71", "#ED7F95", "#D9D1FF", "#A9A9A9"];
    const charCode = initials.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const renderAssignees = (assignees: User[]) => (
    <Avatar.Group max={{ count: 4 }}>
      {assignees.map((assignee, index) => (
        <Tooltip title={assignee.name} key={index}>
          <Avatar
            size="default"
            style={{
              backgroundColor: getAvatarColor(getInitial(assignee.name)),
            }}
          >
            {getInitial(assignee.name)}
          </Avatar>
        </Tooltip>
      ))}
    </Avatar.Group>
  );

  const renderReporter = (reporter: User) => (
    <Tooltip title={reporter.name}>
      <Avatar
        size="default"
        style={{ backgroundColor: getAvatarColor(getInitial(reporter.name)) }}
      >
        {getInitial(reporter.name)}
      </Avatar>
    </Tooltip>
  );

  const statusOptions = [
    { label: "To do", value: 1 },
    { label: "In Progress", value: 2 },
    { label: "Done", value: 3 },
  ];

  const priorityIcons: Record<number, { src: string; label: string }> = {
    1: { src: low, label: "Low" },
    2: { src: medium, label: "Normal" },
    3: { src: high, label: "High" },
  };

  const columns: ColumnsType<TaskData> = [
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      render: (project) => project.projectName,
      width: 140,
    },
    {
      title: "Task ID",
      dataIndex: "alias",
      key: "alias",
      ellipsis: true,
      render: (alias: string, record: TaskData) => (
        <span
          onClick={() => handleOpenDrawer(record)}
          style={{
            color: "#834666",
            borderBottom: "1px solid #834666",
            cursor: "pointer",
          }}
        >
          {alias}
        </span>
      ),
      width: 80,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <Text ellipsis={{ tooltip: title }}>{title}</Text>
      ),
      width: 220,
    },
    {
      title: "Assigned by",
      dataIndex: "reporter",
      key: "reporter",
      render: renderReporter,
      width: 100,
    },
    {
      title: "Assignees",
      dataIndex: "assignee",
      key: "assignee",
      render: renderAssignees,
      width: 100,
    },
    {
      title: "Assigned date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
      width: 100,
    },
    {
      title: "Due date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => formatDate(date),
      width: 100,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: number) => {
        const icon = priorityIcons[priority];
        return (
          <div style={{ display: "flex", gap: 4 }}>
            <img src={icon?.src} alt={icon?.label} />
            <span>{icon?.label}</span>
          </div>
        );
      },
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number, record: TaskData) => (
        <Select<number>
          value={status}
          className="custom-status-select"
          style={{ width: "120px" }}
          options={statusOptions}
          onChange={async (newStatus) => {
            try {
              const updatedTask = { ...record, status: newStatus };
              await axiosInstance.post("Task/save", updatedTask);
              messageApi.success("Status updated");
              setTasks((prev) =>
                prev.map((task) =>
                  task.id === record.id ? { ...task, status: newStatus } : task
                )
              );
            } catch (err) {
              console.error("Status update error:", err);
              messageApi.error("Failed to update status");
            }
          }}
        />
      ),
      width: 150,
    },
  ];

  const transformTask = (data: any): TaskData => ({
    id: data.id,
    alias: data.alias,
    title: data.title,
    description: data.description,
    assignee: data.assignee ?? [],
    reporter: data.reporter,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    attachments: data.attachments ?? [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    comments: data.comments ?? [],
    activityLog: data.activityLog ?? [],
    project: data.project,
  });

  const fetchTasks = async (
    page: number,
    pageSize: number,
    searchQuery: string,
    priorityTask: string,
    projName: string
  ) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("Task/allTasks", {
        params: { page, pageSize, searchQuery, priorityTask, projName },
      });
      const totalCount = res.data.total;

      // saving tasks in context
      setTasks(res.data.result.map(transformTask));

      setPagination({
        current: page,
        pageSize,
        total: totalCount,
      });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      messageApi.error("Could not load task data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(
      pagination.current,
      pagination.pageSize,
      searchQuery || "",
      priorityTask || "",
      projName || ""
    );
  }, [
    pagination.current,
    pagination.pageSize,
    searchQuery,
    priorityTask,
    projName,
  ]);

  const handleTableChange: TableProps<TaskData>["onChange"] = (pag) => {
    setPagination({
      current: pag.current ?? 1,
      pageSize: pag.pageSize ?? 5,
      total: pag.total ?? 0,
    });
  };

  const tableProps: TableProps<TaskData> = {
    columns,
    dataSource: tasks,
    rowKey: "id",
    scroll: { x: "max-content" },
    size: "middle",
    loading,
    pagination: pagination,
    onChange: handleTableChange,
  };

  return (
    <>
      <Table
        className="custom-table-header"
        {...tableProps}
        style={{ marginTop: "10px" }}
      />
      {isDrawerOpen && selectedTask && (
        <BigDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          task={selectedTask}
        />
      )}
    </>
  );
};

export default CustomTable;
