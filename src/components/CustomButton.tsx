import React, { type ReactNode } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface CustomButtonProps {
  text: string;
  bgColor?: string;
  textColor?: string;
  size?: "small" | "middle" | "large";
  icon?: ReactNode;
  onClick?: () => void;
  height?: string | number;
  width?: string | number;
  fontSize?: string | number;
}
const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  height,
  bgColor,
  textColor,
  icon = <PlusOutlined />,
  onClick,
  width,
}) => {
  return (
    <Button
      type="primary"
      icon={icon}
      onClick={onClick}
      style={{
        backgroundColor: bgColor || "#01B075",
        color: textColor || "#ffffff",
        border: "none",
        fontSize: "14px",
        width: width,
        height: height,
      }}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
