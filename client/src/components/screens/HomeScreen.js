import React, {useState} from "react";
import {Box, Link, Typography, Card, Stack, Alert, Collapse} from "@mui/material";
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import ImageSearchRoundedIcon from '@mui/icons-material/ImageSearchRounded';
import {useNavigate} from "react-router-dom";
import axios from "axios";

const HomeScreen = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    // subscription service product id
    // price_1PVjjFKjbni7WFkGoAHJwz4w
    // price_1PXk6IKjbni7WFkGUiSVoWq9

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (localStorage.getItem("authToken")) {
            try {
                const token = await axios.get("/api/auth/refresh-token");          
                if (token.data) {
                    const config = {headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token.data}` } };
                    const sub = await axios.get("/api/auth/subscription", config);
                    if (sub.data.subscription) {
                        navigate("/summary");
                    } else {
                        const session = await axios.post("/api/stripe/checkout", {priceId: "price_1PXk6IKjbni7WFkGUiSVoWq9", sub: "normal"}, config);
                        if (session.data) {
                            window.open(session.data.url, "_self")
                        }
                    }
                } else {
                    setError(true);
                }

            } catch (err) {
                if (err.response.data.message) {
                    setError(true);
                    setErrorMessage(err.response.data.message);
                } else if (err.message) {
                    setError(true);
                    setErrorMessage(err.message);
                }

                setTimeout(() => {
                    setError(false);
                    setErrorMessage("");
                }, 3000);
            }
        } else {
            setError(true);
            setErrorMessage("You must be logged in to access this feature!");
            setTimeout(() => {
                setError(false);
                setErrorMessage("");
            }, 3000);
        }   

    }


    return (
        <Box p={2}>
            <Collapse in={error}>
                <Alert severity="error" sx={{mb:2}}>{errorMessage}</Alert>
            </Collapse>
            <Typography variant="h4" fontWeight="bold" mb={2}>Text Generation</Typography>
            <Stack direction="row" spacing={6} mb={2}>
                <Card 
                    sx={{ boxShadow:2, borderRadius: 5, height: 190, width: 280, '&:hover': {border: 2, boxShadow: 0, borderColor: 'primary.dark', cursor: 'pointer'}}}
                    onClick={ handleCheckout }
                >
                    <DescriptionRoundedIcon sx={{fontSize: 80, color: "primary.main", mt: 2, ml:2}}/>
                    <Stack p={3} pt={0}>
                        <Typography variant="h5">Text Summarizer</Typography>
                        <Typography variant="h6">Summarize long and tedius articles into just a few sentences!</Typography>
                    </Stack>
                </Card>
                {/* ------------------------- Break between cards -------------------------------*/}
                <Card 
                    sx={{ boxShadow:2, borderRadius: 5, height: 190, width: 280, '&:hover': {border: 2, boxShadow: 0, borderColor: 'primary.dark', cursor: 'pointer'}}}
                    onClick={() => navigate("/paragraph")}
                >
                    <FormatAlignLeftRoundedIcon sx={{fontSize: 80, color: "primary.main", mt: 2, ml:2}}/>
                    <Stack p={3} pt={0}>
                        <Typography variant="h5">Paragraph Generator</Typography>
                        <Typography variant="h6">Generate an informative paragraph about any topic!</Typography>
                    </Stack>
                </Card>
                {/* ------------------------- Break between cards -------------------------------*/}
                <Card 
                    sx={{ boxShadow:2, borderRadius: 5, height: 190, width: 280, '&:hover': {border: 2, boxShadow: 0, borderColor: 'primary.dark', cursor: 'pointer'}}}
                    onClick={() => navigate("/chatbot")}
                >
                    <ChatRoundedIcon sx={{fontSize: 80, color: "primary.main", mt: 2, ml:2}}/>
                    <Stack p={3} pt={0}>
                        <Typography variant="h5">Yoda Chat Bot</Typography>
                        <Typography variant="h6">Gain insight from a yoda-like virtual assistant!</Typography>
                    </Stack>
                </Card>
            </Stack>

            {/* -------------------------- NEXT SECTION --------------------------------- */}

            <Typography fontWeight="bold" variant="h4" ml={4} mt={8} mb={2}>Code Generation</Typography>
            <Card onClick={  () => navigate("/js-convert") }
                    sx={{ ml: 4, boxShadow:2, borderRadius: 5, height:190, width:280, '&:hover': {border: 2, boxShadow: 0, borderColor:"primary.dark", cursor: "pointer"}}}>
                <DescriptionRoundedIcon sx={{fontSize: 80, color: "primary.main", mt: 2, ml: 2}}/>
                <Stack p={3} pt={0}>
                    <Typography fontWeight="bold" variant="h5">Javascript Converter</Typography>
                    <Typography variant="h6">Translate english into javascript code!</Typography>
                </Stack>
            </Card>

            {/* -------------------------- NEXT SECTION --------------------------------- */}

            <Typography fontWeight="bold" variant="h4" ml={4} mt={8} mb={2}>Image Generation</Typography>
            <Card onClick={  () => navigate("/scifi-img") }
                    sx={{ ml: 4, boxShadow:2, borderRadius: 5, height:190, width:280, '&:hover': {border: 2, boxShadow: 0, borderColor:"primary.dark", cursor: "pointer"}}}>
                <ImageSearchRoundedIcon sx={{fontSize: 80, color: "primary.main", mt: 2, ml: 2}}/>
                <Stack p={3} pt={0}>
                    <Typography fontWeight="bold" variant="h5">Scifi Image Generator</Typography>
                    <Typography variant="h6">Create a science-fiction version or an image concept!</Typography>
                </Stack>
            </Card>
        </Box>
    );
}

export default HomeScreen;