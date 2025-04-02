import { Settings } from "luxon";

Settings.throwOnInvalid = true;

declare module "luxon" {
  interface TSSettings {
    throwOnInvalid: true;
  }
}
