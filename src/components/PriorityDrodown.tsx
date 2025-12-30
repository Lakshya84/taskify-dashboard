import { Select } from "antd";

// export const TaskPriority = {
//   Undefined: 0,
//   Low: 1,
//   Normal: 2,
//   High: 3,
// } as const;

// export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

// const priorityOptions = [
//   { label: "Low", value: TaskPriority.Low },
//   { label: "Normal", value: TaskPriority.Normal },
//   { label: "High", value: TaskPriority.High },
// ];

export const TaskPriority = {
  Undefined: 0,
  Low: 1,
  Normal: 2,
  High: 3,
} as const;

// sending labels of respective keys instead of numbers
export type TaskPriorityType = keyof typeof TaskPriority; 

const priorityOptions = [
  { label: "Low", value: "Low" },
  { label: "Normal", value: "Medium" },
  { label: "High", value: "High" },
];

interface PriorityDropdownProps {
  onFilter: (priority: TaskPriorityType) => void;
}

const PriorityDropdown: React.FC<PriorityDropdownProps> = ({ onFilter }) => {
  return (
    <Select
      showSearch
      placeholder="Select Priority"
      style={{ width: "250px" }}
      // style={{ width: "25%" }}
      onChange={(value) => onFilter(value)}
      optionFilterProp="label"
      allowClear
      options={priorityOptions}
    />
  );
};

export default PriorityDropdown;
