import { WebPartContext } from "@microsoft/sp-webpart-base";
export interface ISheqAuditProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  spcontext: WebPartContext;
}
export interface IProjectProps {
  key: number;
  selectedProject: {name: string, id: string}
  onProjectChange?: Function;
  projects: Array<any>;
}