import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import App from './App';
import Signup from './auth/Signup';
import Signin from './auth/Signin';
import Activate from './auth/Activate';
import Private from './core/Private';
import Admin from './core/Admin';
import AuthGuardRoute from './auth/AuthGuardRoute';
import Forgot from './auth/Forgot';
import Reset from './auth/Reset';

const Routes = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={App} />
                <Route path="/signup" exact component={Signup} />
                <Route path="/signin" exact component={Signin} />
                <Route path="/auth/activate/:token" exact component={Activate} />
                <AuthGuardRoute path="/private" exact role="subscriber" component={Private} />
                <AuthGuardRoute path="/admin" exact role="admin" component={Admin} />
                <Route path="/auth/password/forgot" exact component={Forgot} />
                <Route path="/auth/password/reset/:token" exact component={Reset} />
            </Switch>
        </BrowserRouter>
    );
};

export default Routes;
