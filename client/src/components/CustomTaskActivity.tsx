import { Avatar, Col, Row, Timeline } from "antd";
import "../../index.css";
import type { ActivityLog } from "../types/taskType";
import dayjs from "dayjs";
import { groupByDate } from "../utils/activityHelpers";
import prevToCurr from "../assets/prevToCurr.png";
import ActivitySpan from "./AcitivitySpan";

interface CustomTaskActivityProps {
  activity: ActivityLog[] | undefined;
  filterMonth?: string | null;
}

export const getRandomColor = (name: string): string => {
  const colors = ["#D9D1FF", "#FC9B71", "#6BC6C6", "#ED7F95"];

  if (!name) return colors[0];
  const AvatarColor =
    name.split("").reduce((accum, char) => accum + char.charCodeAt(0), 0) %
    colors.length;

  return colors[AvatarColor];
};

const CustomTaskActivity: React.FC<CustomTaskActivityProps> = ({
  activity,
  filterMonth,
}) => {
  const filteredActivity = filterMonth
    ? activity
        ?.filter((log) => dayjs(log.createdAt).format("MMMM") === filterMonth)
        .sort(
          (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
        ) // descendinging sorting
    : activity?.sort(
        (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      );

  const groupedActivity = filteredActivity ? groupByDate(filteredActivity) : {};

  const timelineItems = Object.entries(groupedActivity)
    .map(([dateLabel, logs]) => [
      {
        dot: <></>,
        children: <ActivitySpan day={dateLabel} />,
      },
      ...logs.map((log) => ({
        dot: (
          <Avatar
            size="default"
            style={{
              backgroundColor: getRandomColor(log.performedBy?.name || ""),
            }}
          >
            {log.performedBy?.name?.[0]}
          </Avatar>
        ),
        children: (
          <>
            <Row justify="space-between" align={"middle"}>
              <Col className="commentor-col commentor">
                {log.performedBy?.name}{" "}
                <span style={{ color: "#464155" }}>{log.actionDisplay}</span>
              </Col>
              <Col className="time">
                {dayjs(log.createdAt).format("hh:mm A")}
              </Col>
            </Row>

            {!log.previous && !log.current ? (
              <span> </span>
            ) : log.previous == null ? (
              <span className="task-activity-font">{log.current}</span>
            ) : (
              <span className="task-activity-font">
                {log.previous}
                <img
                  src={prevToCurr}
                  alt="changedLogo"
                  className="changed-Logo"
                />
                {log.current}
              </span>
            )}
          </>
        ),
      })),
    ])
    .flat(); // flatten the nested array of logs into a single array of logs

  return <Timeline className="activity-timeline" items={timelineItems} />;
};

export default CustomTaskActivity;
