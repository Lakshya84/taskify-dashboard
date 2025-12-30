import {
  Avatar,
  Col,
  Divider,
  Input,
  Popover,
  Popconfirm,
  Row,
  Timeline,
} from "antd";
import "../../index.css";
import dot from "../assets/dot.png";
import { useState } from "react";
import ok from "../assets/ok.png";
import cancelTick from "../assets/cancelTick.png";
import type { Comment } from "../types/taskType";
import { getRandomColor } from "./CustomTaskActivity";
import update from "../assets/update.png";
import { groupCommentsByDate } from "../utils/activityHelpers";
import DeleteOutlined from "../assets/DeleteOutlined.png";
import dayjs from "dayjs";
import axiosInstance from "../services/axiosInstance";
import { useAntMessage } from "../stores/MessageContext";
import ActivitySpan from "./AcitivitySpan";

interface CustomActivityProps {
  comments: Comment[];
  taskId?: string;
  filterMonth?: string | null;
  onCommentUpdated?: () => void;
}

const CustomActivity: React.FC<CustomActivityProps> = ({
  comments,
  taskId,
  filterMonth,
  onCommentUpdated,
}) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const [commentError, setCommentError] = useState("");

  const messageApi = useAntMessage();

  const handleEditClick = (id: string, currentText: string) => {
    setEditingCommentId(id);
    setEditedText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedText("");
  };

  const handleUpdateComment = async (taskId: string, comment: Comment) => {
    if (!taskId && !comment.id) {
      messageApi.error("No comments here yet");
      return;
    }

    try {
      const updateComment = {
        id: comment.id,
        createdBy: comment.createdBy,
        commentText: comment.commentText,
        createdAt: comment.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await axiosInstance.post(`Task/${taskId}/comment`, updateComment);
      messageApi.success("Comment updated Successfully");
      setEditingCommentId(null);
      setEditedText("");
      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error("Error during comment update", error);
      messageApi.error("Error updating comments");
    }
  };

  const handleDeleteComment = async (taskId: string, comment: Comment) => {
    if (taskId === null && comment.id === null) {
      messageApi.error("Either comment or task id not found");
      return;
    }
    try {
      await axiosInstance.post(`Task/${taskId}/delete?commentId=${comment.id}`);
      messageApi.success("Comment deleted Successfully");
      if (onCommentUpdated) {
        onCommentUpdated();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      messageApi.error("Failed to delete comment");
    }
  };

  // Apply filtering and sorting logic
  const filteredComments = filterMonth
    ? comments
        .filter(
          (comment) => dayjs(comment.createdAt).format("MMMM") === filterMonth
        )
        .sort(
          (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
        )
    : comments.sort(
        (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      );

  const groupedComments = groupCommentsByDate(filteredComments);

  const timelineItems = Object.entries(groupedComments)
    .map(([dateLabel, logs]) => [
      {
        dot: <></>,
        children: <ActivitySpan day={dateLabel} />,
      },
      ...logs.map((comment) => ({
        dot: (
          <Avatar
            style={{
              backgroundColor: getRandomColor(comment.createdBy?.name || ""),
            }}
            size="default"
          >
            {comment.createdBy?.name?.[0]}
          </Avatar>
        ),
        children: (
          <>
            <Row justify={"space-between"} align={"middle"}>
              <Col span={18}>
                <span className="commentor-col commentor">
                  {comment.createdBy?.name}
                </span>{" "}
                added a Comment
                <Col className="comment-description">
                  {editingCommentId === comment.id ? (
                    <>
                      <Input.TextArea
                        value={editedText}
                        onChange={(e) => {
                          // setEditedText(e.target.value);

                          const value = e.target.value;
                          setEditedText(e.target.value);

                          if (value.trim().length < 3) {
                            setCommentError(
                              "Must be at least 3 characters long"
                            );
                          } else if (value.length > 200) {
                            setCommentError("Note more than 200 characters");
                          } else {
                            setCommentError("");
                          }
                        }}
                        rows={3}
                        placeholder="Edit your comment..."
                      />
                      {commentError && (
                        <span style={{ color: "red", marginTop: "5px" }}>
                          {commentError}
                        </span>
                      )}
                      <Row justify={"end"}>
                        <img
                          src={cancelTick}
                          alt="cancel"
                          onClick={handleCancelEdit}
                        />
                        <img
                          src={ok}
                          alt="done"
                          onClick={() =>
                            handleUpdateComment(taskId || "", {
                              ...comment,
                              commentText: editedText,
                              updatedAt: new Date().toISOString(),
                            })
                          }
                        />
                      </Row>
                    </>
                  ) : (
                    <span>{comment.commentText}</span>
                  )}
                </Col>
              </Col>

              <Col>
                <Row>
                  <Col className="time">
                    {dayjs(comment.createdAt).format("hh:mm A")}{" "}
                  </Col>
                  <Popover
                    placement="bottomRight"
                    content={
                      <>
                        <Row className="popover-button">
                          <Col>
                            <Row
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                handleEditClick(
                                  comment.id || "",
                                  comment.commentText || ""
                                )
                              }
                            >
                              <img
                                src={update}
                                alt="update"
                                className="editing-button"
                              />
                              Edit
                            </Row>
                          </Col>
                          <Divider size="small" />
                          <Col>
                            <Row style={{ cursor: "pointer" }}>
                              <Popconfirm
                                trigger={"hover"}
                                title="Delete the comment"
                                description="Are you sure to delete this comment?"
                                onConfirm={() =>
                                  handleDeleteComment(taskId || "", comment)
                                }
                                onCancel={handleCancelEdit}
                              >
                                <span style={{ display: "flex" }}>
                                  <img
                                    src={DeleteOutlined}
                                    alt="delete"
                                    className="editing-button"
                                  />
                                  Delete
                                </span>
                              </Popconfirm>
                            </Row>
                          </Col>
                        </Row>
                      </>
                    }
                  >
                    <Col>
                      <img src={dot} style={{ cursor: "pointer" }} />
                    </Col>
                  </Popover>
                </Row>
              </Col>
            </Row>
          </>
        ),
      })),
    ])
    .flat();

  return (
    <Row justify={"space-between"}>
      <Col>
        <Timeline className="comment-timeline" items={timelineItems} />
      </Col>
    </Row>
  );
};

export default CustomActivity;
