import {
  Button,
  Card,
  Dropdown,
  notification,
  Popover,
  Tooltip,
  Alert,
  Divider,
} from "antd";
import "antd/dist/reset.css";
import { Copy, Edit2, File, MoreVertical, Play, Trash2 } from "lucide-react";
import React from "react";
import { Link, useLocation } from "wouter";
import { createFlow, Flow } from "../api/flows";
import { useAppState } from "../App";
import RunModal from "../components/RunModal";
import FlowsLayout from "../layouts/FlowsLayout";
import FlowsList from "../interfaces/FlowsList";
import MainLayout from "../layouts/MainLayout";
const Home: React.FC = () => {
  const [_location, navigate] = useLocation();
  const app = useAppState();

  return (
    <FlowsLayout>
      
    </FlowsLayout>
  );
};

export default Home;
