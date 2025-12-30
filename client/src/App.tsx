// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import CustomTable from "./components/CustomTable";
import { useState } from "react";
import { TaskProvider } from "../src/stores/TaskContext";
import { MessageProvider } from "./stores/MessageContext";
import CustomSider from "./components/CustomSider";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";

function App() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<
    "Low" | "Normal" | "High" | "Undefined" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <MessageProvider>
        <TaskProvider>
          <Layout>
            <CustomSider />
            <Layout className="layout">
              <Content>
                <Header
                  onProjectSelect={setSelectedProject}
                  onPrioritySelect={setSelectedPriority}
                  onSearch={setSearchQuery}
                />
                <CustomTable
                  projName={selectedProject || ""}
                  priorityTask={selectedPriority?.toString() || ""}
                  searchQuery={searchQuery}
                />
              </Content>
            </Layout>
          </Layout>
        </TaskProvider>
      </MessageProvider>
    </>
  );
}

export default App;
