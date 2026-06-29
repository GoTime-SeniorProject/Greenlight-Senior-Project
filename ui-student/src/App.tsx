import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./lib/apollo-client";
import { ConfigProvider } from "antd";
import { theme } from "./theme";
import { Routes, Route} from "react-router-dom";

import RootLayout from "./pages/_layout";
import Login from "./pages/login";
import Home from "./pages/index";
import EventForm from "./pages/event-form";
import DatabaseDump from "./pages/database-dump";
import AntdExample from "./pages/antd-example";
import EventSubmissions from "./pages/event-submissions";
import EventOverview from "./pages/event-overview";
import Budget from "./pages/budget";
import Resources from "./pages/resources";
import Calendar from "./pages/calendar";
import OrgMembers from "./pages/org-members";
import FormLayout from "./pages/_event-layout";
import EventReview from "./pages/event-review";


export default function App() {
    return (

    <ApolloProvider client={apolloClient}>
        <ConfigProvider theme={theme}>
            <Routes>
                <Route path="/" element={<RootLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="event-submissions" element={<EventSubmissions />} />
                    <Route path="event-overview" element={<EventOverview />} />
                    <Route path="budget" element={<Budget />} />
                    <Route path="resources" element={<Resources />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="org-members" element={<OrgMembers />} />
                    <Route element={<FormLayout />} >
                        <Route path="event-form/:id?" element={<EventForm />} />
                        <Route path="event-review/:id?" element={<EventReview />} />
                    </Route>
                    

                    <Route path="database-dump" element={<DatabaseDump />} />
                    <Route path="antd-example" element={<AntdExample />} />
                </Route>
            </Routes>
        </ConfigProvider>
    </ApolloProvider>
    );
}
