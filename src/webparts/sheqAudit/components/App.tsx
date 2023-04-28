import * as React from 'react';
import SpfxProjects from './Projects';
import SpfxSheqAudit from './SheqAudit';
import { HashRouter, Route, Routes } from "react-router-dom";
import { ISheqAuditProps } from './ISheqAuditProps';

export default class App extends React.Component<ISheqAuditProps, {}> {
    public render(): React.ReactElement<ISheqAuditProps> {
        return (
            <HashRouter>
                <Routes>
                    <Route path="/projects" element={SpfxProjects}></Route>
                    <Route path="/sheqAudit/:projectId" element={SpfxSheqAudit}></Route>
                </Routes>
            </HashRouter>
        );
    }
}