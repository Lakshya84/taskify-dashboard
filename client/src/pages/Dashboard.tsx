import { Card, Col, Layout, Row } from "antd";
import CustomSider from "../components/CustomSider";
import { Content } from "antd/es/layout/layout";
import PriorityChart from "../components/dashboard/PriorityChart";
import StatusChart from "../components/dashboard/StatusChart";
import PendingTask from "../components/dashboard/PendingTask";
import DueTask from "../components/dashboard/DueTask";
import { TaskProvider } from "../stores/TaskContext";

const Dashboard: React.FC = () => {
  return (
    <>
      {/* <h1>Hello</h1> */}
      <TaskProvider>
        <Layout>
          <CustomSider />
          <Content className="layout">
            <Row
              justify={"space-around"}
              align={"middle"}
              style={{
                marginTop: "40px",
                marginBottom: "40px",
              }}
              gutter={[8, 8]}
            >
              <Col lg={{ span: "10" }}>
                <Card>
                  <StatusChart />
                </Card>
              </Col>
              {/* <Divider type="horizontal" /> */}

              <Col lg={{ span: "10" }}>
                <Card>
                  <PriorityChart />
                </Card>
              </Col>
            </Row>
            {/* <Divider /> */}
            <Row
              style={{ margin: "20px" }}
              justify={"space-around"}
              align={"middle"}
              gutter={[10, 10]}
            >
              <Col>
                <Card>
                  <PendingTask />
                </Card>
              </Col>
              <Col>
                <Card>
                  <DueTask />
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </TaskProvider>
    </>
  );
};

export default Dashboard;
