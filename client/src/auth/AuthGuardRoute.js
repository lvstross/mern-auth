import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isAuth } from './helpers';

// Role<Subscriber | Admin>

const AdminRoute = ({ component: Component, role, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isAuth() && isAuth().role === role ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: '/signin',
                        state: { from: props.location }
                    }}
                />
            )
        }
    ></Route>
);

export default AdminRoute;
