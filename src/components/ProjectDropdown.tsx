import { Select } from "antd";

interface Props {
  projects: string[];
  // onSelect: (projectName: string) => void;
  onFilter: (projName: string) => void;
}

const ProjectDropdown = ({ projects, onFilter }: Props) => {
  return (
    <Select
      showSearch
      placeholder="Select a project"
      onChange={onFilter}
      allowClear
      style={{ width: "250px" }}
      options={projects.map((name) => ({
        label: name,
        value: name,
      }))}
    />
  );
};

export default ProjectDropdown;
