/// <reference types="vinxi/types/server" />
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { getRouterManifest } from "@tanstack/react-start/router-manifest";
import { createRouter } from "./router";
import { createClerkHandler } from "@clerk/tanstack-react-start/server";
import "./utils/luxon";

export default createClerkHandler(
  createStartHandler({
    createRouter,
    getRouterManifest,
  }),
)(defaultStreamHandler);
