import React, {useState } from "react";
import {Box, Link, Typography, useTheme, Button} from "@mui/material";
import axios from "axios";

const NavBar = () => {
    const theme = useTheme();
    const [loggedIn, setLoggedIn ] = useState(JSON.parse(localStorage.getItem("authToken")));

    const logoutHandler = async () => { 
        try {
            await axios.post("/api/auth/logout").then(res => fullyLogout(res.data));
        } catch (err) {
            console.log(err);
        }
    }

    const fullyLogout = (data) => { 
        if (data.success) {
            localStorage.removeItem("authToken");
            window.location.reload();
        }
    }

    // if user is still logged in, check if the token is still valid, and if not log them out
    const checkRefresh = async () => {
        try {
            const token = await axios.get("/api/auth/refresh-token")
            if (!token.data) {
                localStorage.removeItem("authToken");
                setLoggedIn(false);
                logoutHandler();
            } else {
                const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.data}` } }
                await axios.get("/api/auth/subscription", config).then(res => checkSub(res.data));
                setLoggedIn(true);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const checkSub = (data) => {
        if (data.subscription) {
            localStorage.setItem("sub", JSON.stringify(data.subscription));
        } else {
            localStorage.removeItem("sub");
        }
    }

    const createPortal = async () => {
        try {
            const token = await axios.get("/api/auth/refresh-token")
            if (token.data) {
                const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.data}` } }
                const customerId = await axios.get("/api/auth/customer", config)
                if (customerId.data.customerId) {
                    const portal = await axios.post("/api/stripe/portal", {customerId: customerId.data.customerId}, config)
                    if (portal.data.url) {
                        window.open(portal.data.url, "_self")
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    checkRefresh();

    return (
        <Box p="1rem 6%" width="100%" backgroundColor={theme.palette.background.alt} textAlign="center" sx={{boxShadow:3, mb: 2}}>
            <Typography variant="h1" color="primary" fontWeight="bold">
                <Link href="/" color="primary" sx={{mx: 2}} underline="none">SaaSAI</Link>
            </Typography>
            { 
                loggedIn 
                ? 
                <>
                <Button onClick={createPortal} color="primary">Billing Portal</Button>
                <Button color="primary" onClick={logoutHandler} >Logout</Button>
                </> 
                : 
                <>
                <Link href="/register" color="primary" sx={{mx: 2}} underline="none">Register</Link>
                <Link href="/login" color="primary" sx={{mx: 2}} underline="none">Login</Link>
                </>
            }
        </Box>
    );
}

export default NavBar;