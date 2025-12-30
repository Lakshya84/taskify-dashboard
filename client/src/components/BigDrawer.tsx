import cancelMark from "../assets/cancel.png";
import bigDragger from "../assets/big-drawerUpload.png";
import {
  Drawer,
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  Avatar,
  Col,
  Row,
  Typography,
  Space,
  Divider,
  Segmented,
  Modal,
  Grid,
} from "antd";
import CustomButton from "./CustomButton";
import { useEffect, useState } from "react";
import "../../index.css";
import TextArea from "antd/es/input/TextArea";
import CustomActivity from "./CustomActivity";
import type { TaskData, Project, User } from "../types/taskType";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import { useProjects } from "../hooks/useProjects";
import { useUsers } from "../hooks/useUsers";
import { useCreateTask } from "../hooks/useCreateTask";
import { useTaskContext } from "../stores/TaskContext";
import axiosInstance from "../services/axiosInstance";
import CustomTaskActivity from "./CustomTaskActivity";
import { useAntMessage } from "../stores/MessageContext";
import DeleteOutlined2 from "../assets/DeleteOutlined2.png";
// import VerticalBar from "../assets/verticalBar.png";
const { useBreakpoint } = Grid;

dayjs.extend(localeData);

const { Option } = Select;

interface BigDrawerProps {
  onClose?: () => void;
  open?: boolean;
  task?: TaskData | null;
}

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const BigDrawer: React.FC<BigDrawerProps> = ({ onClose, open, task }) => {
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [activity, setActivity] = useState<"Comment" | "Activity">("Comment");

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const { projects, isLoading }: { projects: Project[]; isLoading: boolean } =
    useProjects();
  const { users, isUserLoading }: { users: User[]; isUserLoading: boolean } =
    useUsers();
  const messageApi = useAntMessage();

  const { addTask, setTasks } = useTaskContext();
  const { createTask } = useCreateTask();

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const monthOptions = dayjs.months();

  const [selectedTask, setSelectedTask] = useState<TaskData | null>(
    task || null
  );
  const [fileList, setFileList] = useState<any[]>([]);
  const [deletedAttachment, setDeletedAttachment] = useState<string[]>([]);

  // image validator
  const rest = {
    name: "attachments",
    multiple: true,
    accept: "image/jpg, image/jpeg, image/png, image/webp",
    beforeUpload: (file: File) => {
      const isImage =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/webp";
      if (!isImage) {
        messageApi.error("Only standard formats acceptable, JPG/JPEG/PNG/WEBP");
        return Upload.LIST_IGNORE;
      }
      const limit = file.size / 1024 / 1024 < 2;
      if (!limit) {
        messageApi.error("File is too large, size must be less than 2MB");
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange(info: any) {
      const newFileList = info.fileList;
      setFileList(newFileList);
    },
    fileList,
  };

  const handleDeleteAttachment = (file: any) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));

    if (file.uid) {
      setDeletedAttachment((prev) => [...prev, file.uid]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentText(e.target.value);

    if (value.trim().length < 3) {
      setCommentError("Must be at least 3 characters long");
    } else if (value.length > 200) {
      setCommentError("Note more than 200 characters");
    } else {
      setCommentError("");
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      // built in browser API that reads the file contents
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const uploadedAttachments = task?.attachments.map((att) => ({
    uid: att.id,
    name: att.fileName,
    status: "done",
    url: att.base64,
    size: att.size,
  }));

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // filter out deleted old attachments
      const retainedOldAttachments = (task?.attachments || []).filter(
        (att) => !deletedAttachment.includes(att.id || "")
      );
      console.log("Retained ones:::", retainedOldAttachments);

      // convert new Uploads
      const newUploads = await Promise.all(
        fileList
          .filter((file) => file.originFileObj) // only new files
          .map(async (file) => {
            const base64 = await convertFileToBase64(file.originFileObj);
            return {
              fileName: file.name,
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              type: file.type,
              base64: base64,
            };
          })
      );

      const attachments = [...retainedOldAttachments, ...newUploads];

      const payload: Partial<TaskData> = {
        id: task?.id,
        title: values.title,
        description: values.description,
        assignee: values.assignee.map(
          (u: { value: string; label: string }) => ({
            id: u.value,
            name: u.label,
          })
        ),
        reporter: {
          id: values.reporter.value,
          name: values.reporter.label,
        },
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate?.toISOString(),
        attachments,
        project: projects.find((p) => p.id === values.project),
      };
      console.log("Payload being sent:", payload);

      const result = await createTask(payload);
      if (result) {
        addTask(result);
        form.resetFields();
        onClose?.();
      }

      messageApi.success("Task edited successfully");
    } catch (error) {
      console.log("Form submission error: ", error);
      messageApi.error("Please fix the form errors and try again");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !task) {
      messageApi.error("Handle Add Comment Function does not execute rightly");
      return "task not found";
    }
    try {
      const newComment = {
        commentText: commentText.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: { id: task.reporter.id, name: task.reporter.name },
      };
      await axiosInstance.post(`Task/${task.id}/comment`, newComment);

      const updatedComment = await fetchTaskById(task.id);
      if (updatedComment) {
        setSelectedTask(updatedComment);
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? updatedComment : t))
        );
      }
      messageApi.success("Comment added");
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      messageApi.error("Failed to add comment");
    }
  };

  const fetchTaskById = async (id: string) => {
    try {
      const { data } = await axiosInstance.get(`/Task/${id}`);
      return data.result;
    } catch (error) {
      console.error("Error fetching task by id ::: ", error);
      messageApi.error("Error in fetching activity details task using id");
      return null;
    }
  };

  const handlePreview = async (file: any) => {
    try {
      const imageUrl = file.base64 || file.url;
      setPreviewImage(imageUrl);
      setPreviewVisible(true);
    } catch (error) {
      console.error("Error previewing image:", error);
      messageApi.error("Failed to preview image");
    }
  };

  useEffect(() => {
    if (open && task) {
      form.setFieldsValue({
        project: task?.project?.id,
        title: task.title,
        description: task.description,
        dueDate: dayjs(task.dueDate),
        priority: task.priority,
        status: task.status,
        reporter: {
          value: task.reporter.id,
          label: task.reporter.name,
        },
        assignee: task.assignee.map((u) => ({
          value: u.id,
          label: u.name,
        })),
        attachment: task.attachments || [],
        comment: task.comments || [],
      });
      setFileList(uploadedAttachments || []);
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [open, task, form]);

  return (
    <Drawer
      width={screens.lg ? "55%" : "100%"}
      closable={false}
      className="big-drawer"
      onClose={onClose}
      open={open}
      destroyOnHidden={true}
      maskClosable={false}
      footer={
        <Row justify={"end"}>
          <Col lg={{ span: 17 }}>
            <Space>
              {/* Close form button */}
              <CustomButton
                text="Cancel"
                bgColor="#EEEFF4"
                width="94px"
                icon=""
                textColor="#834666"
                onClick={onClose}
              />
              {/* save form button */}
              <CustomButton
                text="Save"
                width="94px"
                icon=""
                bgColor="#01B075"
                onClick={handleSave}
              />
            </Space>
          </Col>
        </Row>
      }
    >
      <Row align={"top"}>
        {/* first form coloumn */}
        <Col className="first-coloumn-big-drawer" xs={24} lg={12}>
          <Typography.Title level={5} className="title-header">
            <span className="title-span">Task Overview</span>
          </Typography.Title>
          {/* <Divider /> */}
          <Form
            form={form}
            requiredMark={false}
            className="big-drawer-form"
            layout="horizontal"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            colon={false}
          >
            <Form.Item name="project" label="Project">
              <Select
                placeholder="Please select a Project"
                loading={isLoading}
                disabled
              >
                {projects.map((project: any) => (
                  <Select.Option key={project.id} value={project.id}>
                    {project.projectName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Title */}
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: "Please input task title" },
                {
                  max: 100,
                  message: "Title should be less than 100 characters",
                },
                {
                  validator: (_, value) =>
                    value && value.trim().length >= 3
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Title cannot be empty or whitespaces or less than 3 characters"
                          )
                        ),
                },
              ]}
            >
              <Input placeholder="Please enter task title" />
            </Form.Item>

            {/* Description */}
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  max: 150,
                  message: "Description must not exceed 150 characters",
                },
              ]}
            >
              <TextArea autoSize={{ minRows: 2, maxRows: 3 }} />
            </Form.Item>

            {/* Due date */}
            <Form.Item
              name="dueDate"
              label="Due date"
              rules={[{ required: true, message: "Please select due date" }]}
            >
              <DatePicker placeholder="Select date" />
            </Form.Item>

            {/* Priority */}
            <Form.Item
              name="priority"
              label="Priority"
              wrapperCol={{ span: 6 }}
              rules={[
                { required: true, message: "Please select task Priority" },
              ]}
            >
              <Select placeholder="Priority">
                <Option value={1}>Low</Option>
                <Option value={2}>Normal</Option>
                <Option value={3}>High</Option>
              </Select>
            </Form.Item>

            {/* Status */}
            <Form.Item
              name="status"
              label="Status"
              wrapperCol={{ span: 6 }}
              rules={[{ required: true, message: "Please select task Status" }]}
            >
              <Select placeholder="Status">
                <Option value={1}>To Do</Option>
                <Option value={2}>In Progress</Option>
                <Option value={3}>Done</Option>
              </Select>
            </Form.Item>

            {/* Reporter (Assigned By)  D-D */}
            <Form.Item
              name="reporter"
              label="Reporter"
              rules={[
                {
                  required: true,
                  message: "Please select a reporter!",
                },
              ]}
            >
              <Select
                placeholder="Please select reporter(s)"
                loading={isUserLoading}
                labelInValue={true}
                options={users.map((u) => ({
                  value: u.id,
                  label: u.name,
                }))}
              />
            </Form.Item>

            {/* Assignee D-D */}
            <Form.Item
              name="assignee"
              label="Assignee"
              rules={[
                {
                  required: true,
                  message: "Please select at least one assignee!",
                  type: "array",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Please select assignee"
                maxTagCount={2}
                labelInValue={true}
                options={users.map((u) => ({
                  value: u.id,
                  label: u.name,
                }))}
              />
            </Form.Item>

            {/* Upload */}
            <Form.Item
              name="attachment"
              label="Attachment"
              getValueFromEvent={normFile}
            >
              <Upload.Dragger
                {...rest}
                name="attachement"
                className="custom-upload"
                itemRender={(originNode, file) => {
                  const previewUrl =
                    file.url ||
                    (file.originFileObj
                      ? URL.createObjectURL(file.originFileObj)
                      : "");
                  return (
                    <>
                      <Row
                        align={"middle"}
                        justify={"space-between"}
                        style={{ marginTop: "15px" }}
                        wrap={false}
                      >
                        <Col
                          span={24}
                          onClick={() => handlePreview(file)}
                          flex={7 / 8}
                        >
                          <Row justify={"space-between"} align={"middle"}>
                            <Col>
                              <img
                                src={previewUrl}
                                alt="thumbnail"
                                style={{ height: "60px", width: "80px" }}
                              />
                            </Col>
                            <Col
                              span={16}
                              style={{ color: "#464155", fontSize: "small" }}
                            >
                              {file.name}
                              <br />
                              <span
                                style={{
                                  color: "#8C8C8C",
                                  fontSize: "smaller",
                                }}
                              >
                                Size: {file.size}
                              </span>
                            </Col>
                          </Row>
                        </Col>

                        <Col>
                          <img
                            src={DeleteOutlined2}
                            alt="delete"
                            className="editing-button"
                            onClick={() => handleDeleteAttachment(file)}
                          />
                        </Col>
                      </Row>
                    </>
                  );
                }}
              >
                <Col className="ant-upload-drag-icon">
                  <img src={bigDragger} />
                </Col>
                <Typography.Text>
                  Click or drag file to this area to upload
                </Typography.Text>
              </Upload.Dragger>
            </Form.Item>
          </Form>
        </Col>

        {/* Image Preview */}
        <Modal
          closable={false}
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img className="modal-attachment" src={previewImage} />
        </Modal>

        {/* <span style={{ border: "1px solid black", height: "85vh" }}></span> */}

        {/* second activity coloumn */}
        <Col xs={24} lg={12} className="second-drawer">
          <Row justify={"space-between"}>
            <Col xs={24} lg={12}>
              <Typography.Title level={5} className="title-header">
                <span className="title-span">Task Logs</span>
              </Typography.Title>
            </Col>
            <Col xs={0} lg={1}>
              <img
                src={cancelMark}
                style={{ cursor: "pointer" }}
                onClick={onClose}
              />
            </Col>
          </Row>
          <Row
            className="second-drawer-row-style"
            gutter={[4, 16]}
            justify={"space-between"}
            align={"middle"}
          >
            <Col xs={{ span: 12, offset: 0 }} md={{ span: 12, offset: 0 }}>
              <Segmented<string>
                options={[
                  {
                    label: (
                      <span
                        style={{
                          color: activity === "Comment" ? "#79435F" : "black",
                        }}
                      >
                        Comment
                      </span>
                    ),
                    value: "Comment",
                  },
                  {
                    label: (
                      <span
                        style={{
                          color: activity === "Activity" ? "#79435F" : "black",
                        }}
                      >
                        Activity
                      </span>
                    ),
                    value: "Activity",
                  },
                ]}
                onChange={async (value) => {
                  try {
                    setActivity(value as "Comment" | "Activity");
                    if (value === "Activity" && task?.id) {
                      const newTask = await fetchTaskById(task.id);
                      if (newTask) {
                        setSelectedTask(newTask);
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching new task", error);
                  }
                }}
                style={{ padding: "5px 3px" }}
              />
            </Col>

            <Col>
              <span style={{ margin: "10px", color: "#8a8383ff" }}>Month</span>
              <Select
                placeholder="Select Month"
                style={{ width: "130px" }}
                onChange={(value) => setSelectedMonth(value)}
                allowClear
              >
                {monthOptions.map((month: any) => (
                  <Option key={month} value={month}>
                    {month}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          {activity === "Activity" ? (
            <CustomTaskActivity
              activity={selectedTask?.activityLog}
              filterMonth={selectedMonth}
            />
          ) : (
            <>
              <Row justify={"space-between"}>
                <Col span={24} style={{ padding: "10px 0" }}>
                  <Row justify={"space-between"}>
                    <Col span={3}>
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    </Col>

                    {/* flex-1 for full width */}
                    <Col flex={1} style={{ marginBottom: "15px" }}>
                      <TextArea
                        value={commentText}
                        placeholder="Autosize height based on content lines"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        onChange={handleChange}
                        showCount
                        maxLength={100}
                      />
                      {commentError && (
                        <span style={{ color: "red", marginTop: "5px" }}>
                          {commentError}
                        </span>
                      )}
                    </Col>
                  </Row>
                  <Row justify="end" style={{ paddingTop: "10px" }}>
                    <Col offset={4}>
                      <CustomButton
                        text="Add Comment"
                        icon=""
                        onClick={handleAddComment}
                      />
                    </Col>
                  </Row>
                  <Divider />
                </Col>
              </Row>
              <CustomActivity
                comments={selectedTask?.comments || []}
                taskId={task?.id}
                filterMonth={selectedMonth}
                onCommentUpdated={async () => {
                  const updated = await fetchTaskById(task?.id || "");
                  if (updated) {
                    setSelectedTask(updated);
                    setTasks((prev) =>
                      prev.map((t) => (t.id === task?.id ? updated : t))
                    );
                  }
                }}
              />
            </>
          )}
        </Col>
      </Row>
    </Drawer>
  );
};
export default BigDrawer;
