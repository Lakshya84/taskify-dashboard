import { Button, Modal, Row, Table, type TableProps } from "antd";
import type { TaskData } from "../../types/taskType";
import type { ColumnsType } from "antd/es/table";
import { useTaskContext } from "../../stores/TaskContext";
import dayjs from "dayjs";
import { useState } from "react";

const DueTask: React.FC = () => {
  const { tasks, loading } = useTaskContext();

  const [previewVisible, setPreviewVisible] = useState(false);

  const today = dayjs();
  const dataSourceTask = tasks.filter(
    (task) => task.status !== 3 && dayjs(task.dueDate).isBefore(today)
  );

  const showTasks = () => {
    setPreviewVisible(true);
  };

  const handleClose = () => {
    setPreviewVisible(false);
  };

  const columns: ColumnsType<TaskData> = [
    {
      title: "Sl. No.",
      key: "serialNumber",
      render: (_: any, __: TaskData, index: number) => index + 1,
      width: 80,
    },
    {
      title: "Due Tasks",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Duedate",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate) => {
        const dateString =
          typeof dueDate === "string" ? dueDate : dueDate?.$date;

        const Date = dateString
          ? dayjs(dateString).format("DD-MM-YYYY")
          : "N/A";
        return <span style={{ color: "red" }}>{Date}</span>;
      },
      width: "100",
    },
  ];

  const DueTableProp: TableProps<TaskData> = {
    columns,
    loading,
    scroll: { x: "max-content" },
    pagination: false,
    dataSource: dataSourceTask.slice(0, 4),
  };

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <h2>Due Tasks Table</h2>
        <Button className="table-head-button" onClick={() => showTasks()}>
          View More
        </Button>
      </Row>
      <Table {...DueTableProp} rowKey="id" className="custom-table-header" />
      <Modal
        open={previewVisible}
        onCancel={handleClose}
        footer={null}
        title="All Due Tasks"
      >
        <Table
          {...DueTableProp}
          dataSource={dataSourceTask}
          rowKey="id"
          className="custom-table-header"
        />
      </Modal>
    </>
  );
};

export default DueTask;
