import {
  Drawer,
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  Typography,
  Row,
  Space,
  Grid,
  Col,
} from "antd";
import drag from "../assets/drag.png";
import cancelMark from "../assets/cancel.png";
import CustomButton from "./CustomButton";
import "../../index.css";
import { useUsers } from "../hooks/useUsers";
import { useProjects } from "../hooks/useProjects";
import { useCreateTask } from "../hooks/useCreateTask";
import { type TaskData, type Project, type User } from "../types/taskType";
import { useTaskContext } from "../stores/TaskContext";
import { useAntMessage } from "../stores/MessageContext";
import { useState } from "react";
const { useBreakpoint } = Grid;

const { Option } = Select;

interface CustomFormDrawerProps {
  onClose?: () => void;
  open?: boolean;
}

const CustomFormDrawer: React.FC<CustomFormDrawerProps> = ({
  onClose,
  open,
}) => {
  const screens = useBreakpoint();

  const [form] = Form.useForm();
  const { projects, isLoading }: { projects: Project[]; isLoading: boolean } =
    useProjects();
  const { users, isUserLoading }: { users: User[]; isUserLoading: boolean } =
    useUsers();
  const messageApi = useAntMessage();
  const [fileList, setFileList] = useState<any[]>([]);

  const { addTask } = useTaskContext();
  const { createTask } = useCreateTask();

  const rest = {
    name: "profilePicture",
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
      const newFileList = info.fileList.slice(-1);
      setFileList(newFileList);
    },
    fileList,
  };

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const attachments = await Promise.all(
        fileList.map(async (file) => {
          const base64 = await convertFileToBase64(file.originFileObj);
          return {
            fileName: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            type: file.type,
            base64: base64,
          };
        })
      );

      const payload: Partial<TaskData> = {
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
        attachments: attachments,
        project: projects.find((p) => p.id === values.project),
        comments: [],
        activityLog: [],
      };
      console.log("Payload being sent:", payload);
      const result = await createTask(payload);
      console.log("Form submitted successfully");
      messageApi.success("Task created");
      if (result) {
        addTask(result);
        form.resetFields();
        onClose?.();
      }
    } catch (error) {
      console.log("Form submission error: ", error);
      messageApi.error("Please fix the form errors and try again");
    }
  };

  return (
    <Drawer
      closable={false}
      onClose={onClose}
      open={open}
      destroyOnHidden={true}
      maskClosable={false}
      width={screens.lg ? "25%" : "100%"}
      footer={
        <Row justify={"end"}>
          <Space>
            <CustomButton
              text="Close"
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
        </Row>
      }
      title={
        <Row justify={"space-between"}>
          <Col style={{ borderBottom: "2px solid #28C66F" }}>
            <Typography.Title level={5} className="title-header">
              Add Task
            </Typography.Title>
          </Col>
          <Col>
            <img
              src={cancelMark}
              style={{ cursor: "pointer" }}
              onClick={onClose}
            />
          </Col>
        </Row>
      }
    >
      <Form
        form={form}
        // style={{ padding: "4px" }}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        colon={false}
        requiredMark={false}
      >
        <Form.Item
          name="project"
          label="Project"
          hasFeedback
          rules={[{ required: true, message: "Please select your Project" }]}
        >
          <Select placeholder="Please select a Project" loading={isLoading}>
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
            {
              required: true,
              max: 50,
              validator: (_, value) =>
                value && value.trim().length >= 3
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Title should at least 3 characters long")
                    ),
            },
          ]}
        >
          <Input placeholder="Please enter task title" />
        </Form.Item>

        {/* Reporter D-D */}
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
            allowClear
            loading={isUserLoading}
            options={users.map((u) => ({
              value: u.id,
              label: u.name,
            }))}
            labelInValue={true}
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
            allowClear
            labelInValue={true}
            placeholder="Please select reporter(s)"
            loading={isUserLoading}
            options={users.map((u) => ({
              value: u.id,
              label: u.name,
            }))}
          />
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
            {
              validator: (_, value) =>
                value && value.trim().length >= 3
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(
                        "Must be at least 3 characters, not empty/spaces"
                      )
                    ),
            },
          ]}
        >
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 3 }}
            placeholder="Autosize height based on content lines"
          />
        </Form.Item>

        {/* Priority */}
        <Form.Item
          name="priority"
          label="Priority"
          wrapperCol={{ span: 12 }}
          rules={[{ required: true, message: "Please select task Priority" }]}
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
          wrapperCol={{ span: 12 }}
          rules={[{ required: true, message: "Please select task Status" }]}
        >
          <Select placeholder="Status">
            <Option value={1}>To Do</Option>
            <Option value={2}>In Progress</Option>
            <Option value={3}>Done</Option>
          </Select>
        </Form.Item>

        {/* duedate */}
        <Form.Item
          name="dueDate"
          label="Due date"
          rules={[{ required: true, message: "Please select due date" }]}
        >
          <DatePicker placeholder="Select date" />
        </Form.Item>

        {/* Upload */}
        <Form.Item name="attachment" label="Attachment">
          <Upload.Dragger
            {...rest}
            name="attachement"
            multiple
            className="custom-upload"
          >
            <Col className="ant-upload-drag-icon">
              <img src={drag} />
            </Col>
            <Typography.Text>
              Click or drag file to this area to upload
            </Typography.Text>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CustomFormDrawer;
