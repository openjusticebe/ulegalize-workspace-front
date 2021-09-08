import React from "react";
import { Route } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import CircularProgress from '@material-ui/core/CircularProgress';

const PrivateRoute = ({ component, ...args }) => (
    <Route
        render={withAuthenticationRequired(component, {
            onRedirecting: () => <CircularProgress />,
        })}
        {...args}
    />
);

export default PrivateRoute;

