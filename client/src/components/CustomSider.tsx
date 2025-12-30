import { Col, Menu, Row, type MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import "../../index.css";
import { useNavigate, useLocation } from "react-router-dom";

const menuLabels = ["Dashboard", "Tasks"];
const menuIcons = [MdOutlineSpaceDashboard, FaTasks];
const navigatePage = ["/dashboard", "/"];

function CustomSider() {
  const navigate = useNavigate();
  const location = useLocation();

  const items: MenuProps["items"] = menuIcons.map((Icon, index) => ({
    key: index,
    // className: "custom-sider",
    icon: (
      <Row className="sider-div">
        <Col>
          <Row>
            <Col span={24}>
              <Icon className="dashboard-icon" />
            </Col>
          </Row>
          <Row justify={"center"}>
            <span style={{ fontSize: "12px" }}>{menuLabels[index]}</span>
          </Row>
        </Col>
      </Row>
    ),
    title: "",
    onClick: () => navigate(navigatePage[index]),
  }));

  const selectedKey = navigatePage.indexOf(location.pathname).toString();

  return (
    <Sider collapsed className="custom-sider" style={{ minHeight: "97vh" }}>
      <Menu
        items={items}
        theme="dark"
        selectedKeys={[selectedKey]}
        className="custom-menu"
      />
    </Sider>
  );
}

export default CustomSider;
