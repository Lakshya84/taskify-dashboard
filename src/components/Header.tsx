import { useState } from "react";
import CustomButton from "./CustomButton";
import CustomFormDrawer from "./CustomFormDrawer";
import PriorityDropdown from "./PriorityDrodown";
import { Row, Col, Input } from "antd";
import { useProjects } from "../hooks/useProjects";
import ProjectDropdown from "./ProjectDropdown";
import "../../index.css"

interface HeaderProps {
  onProjectSelect: (projectName: string) => void;
  onPrioritySelect: (
    priority: "Low" | "Normal" | "High" | "Undefined" | null
  ) => void;
  onSearch: (query: string) => void;
}

interface Project {
  id: string;
  projectName: string;
}

const Header = ({
  onProjectSelect,
  onPrioritySelect,
  onSearch,
}: HeaderProps) => {
  const { projects, isLoading } = useProjects() as {
    projects: Project[];
    isLoading: boolean;
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectProject = (projectName: string) => {
    onProjectSelect(projectName);
  };

  return (
    <Row justify="space-between" align="middle" gutter={[4, 12]}>
      <Col>
        <CustomButton
          text="Task"
          size="large"
          onClick={() => setIsDrawerOpen(true)}
          height="33px"
          width="86px"
          fontSize="13px"
        />
        {isDrawerOpen && (
          <CustomFormDrawer
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}
      </Col>

      <Col>
        <Row gutter={[4, 12]}>
          <Col>
            {!isLoading && (
              <ProjectDropdown
                projects={projects.map((p) => p.projectName)}
                // onSelect={handleSelectProject}
                onFilter={handleSelectProject}
              />
            )}
          </Col>
          <Col>
            <PriorityDropdown onFilter={onPrioritySelect} />
          </Col>

          <Col>
            <Input.Search
              style={{ width: "250px" }}
              placeholder="Search"
              // className="custom-search"
              variant="outlined"
              size="middle"
              allowClear
              onSearch={(value) => onSearch(value.trim().toLowerCase())}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Header;
