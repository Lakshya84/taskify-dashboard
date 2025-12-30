import React, { createContext, useContext } from "react";
import { message } from "antd";

const MessageContext = createContext<any | null>(null);

export const useAntMessage = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useAntMessage must be used within MessageProvider");
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};
