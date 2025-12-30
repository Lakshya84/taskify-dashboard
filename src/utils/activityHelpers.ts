import dayjs from "dayjs";
import type { ActivityLog, Comment } from "../types/taskType";

export const getDateLabel = (date: string): string => {
  const logDate = dayjs(date);
  const today = dayjs();
  const yesterday = dayjs().subtract(1, "day");

  if (logDate.isSame(today, "day")) return "Today";
  if (logDate.isSame(yesterday, "day")) return "Yesterday";
  return logDate.format("DD-MMM-YYYY");
};

export const groupByDate = (logs: ActivityLog[]) => {
  const grouped: Record<string, ActivityLog[]> = {};

  logs.forEach((log) => {
    const label = getDateLabel(log.createdAt);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(log);
  });

  return grouped;
};

export const groupCommentsByDate = (comments: Comment[]) => {
  const grouped: Record<string, Comment[]> = {};

  comments.forEach((comment) => {
    const label = getDateLabel(comment.createdAt);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(comment);
  });

  return grouped;
};
