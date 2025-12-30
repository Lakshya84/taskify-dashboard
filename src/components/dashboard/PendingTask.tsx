import { Button, Modal, Row, Table, type TableProps } from "antd";
import type { TaskData } from "../../types/taskType";
import type { ColumnsType } from "antd/es/table";
import { useTaskContext } from "../../stores/TaskContext";
import "../../../index.css";
import { useState } from "react";

const PendingTask: React.FC = () => {
  const { tasks, loading } = useTaskContext();

  const [previewVisible, setPreviewVisible] = useState(false);

  const dataSourceTask = tasks.filter((task) => task.status !== 3);

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
      title: "Pending Task",
      dataIndex: "title",
      key: "title",
      className: "pending-task-col",
      render: (tasks) => <span style={{ color: "red" }}>{tasks}</span>,
    },
  ];

  const PendingTableProp: TableProps<TaskData> = {
    columns,
    scroll: { x: "max-content" },
    loading,
    pagination: false,
    dataSource: dataSourceTask.slice(0, 4),
  };

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <h2>Pending Tasks Table</h2>
        <Button className="table-head-button" onClick={() => showTasks()}>
          View More
        </Button>
      </Row>
      <Table
        {...PendingTableProp}
        rowKey="id"
        className="custom-table-header"
      />
      <Modal
        open={previewVisible}
        onCancel={handleClose}
        footer={null}
        title="All Pending Tasks"
      >
        <Table
          {...PendingTableProp}
          dataSource={dataSourceTask}
          rowKey="id"
          scroll={{ x: "max-content" }}
        />
      </Modal>
    </>
  );
};

export default PendingTask;
