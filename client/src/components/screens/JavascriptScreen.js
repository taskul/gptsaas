import React from 'react';
import { Box, Link, Typography, useTheme, useMediaQuery, Collapse, Alert, TextField, Button, Card, Stack } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';

const JavascriptScreen = () => {
    const theme = useTheme();
    const isNotMobile = useMediaQuery("(min-width: 1000px)");

    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [code, setCode ] = useState("");

    const codeHandler = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post("/api/openai/js-convert", { text });
            setCode(data.response.substring(2)); // Assuming data contains an object with a key 'summary'
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else if (err.message) {
                setError(err.message);
            }
            setTimeout(() => {
                setError("");
            }, 5000);
        }
    }

    return (
        <Box
            width={isNotMobile ? "50%" : "90%"}
            p="2rem"
            m="2rem auto"
            borderRadius={5}
            backgroundColor={theme.palette.background.alt}
            sx={{ boxShadow: 5 }}
        >
            <Collapse in={!!error}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            </Collapse>
            <form onSubmit={codeHandler}>
                <Typography variant="h3" mb={2}>JavaScript Converter</Typography>
                <Stack direction="row" spacing={1}>
                    <Box width="87%">
                        <TextField
                            multiline
                            placeholder="Enter instructions here"
                            fullWidth
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </Box>
                    <Button disableElevation variant="contained" type="submit" sx={{ color: "white" }}>Convert</Button>
                </Stack>
            </form>
            <Card sx={{ mt: 4, p: 2, border: 1, boxShadow: 0, borderColor: "neutral.medium", borderRadius: 2, height: "300px", bgcolor: "background.default" }}>
                {code ? (
                    <Card variant='h4' color="primary.dark" fontWeight="bold" sx={{ textAlign: "left", verticalAlign: "middle", lineHeight: "250px", overflow: "auto"}}>
                        {/* pre tag will display code as code lines instead of a paragraph */}
                        <pre><Typography>{code}</Typography></pre>
                    </Card>
                ) : (
                    <Card variant="h3" color="neutral.main" sx={{ textAlign: "center", verticalAlign: "middle", lineHeight: "450px" }}>
                        <Typography>Code will appear here</Typography>
                    </Card>
                )}
            </Card>
            <Typography mt={2}>Not the tool you were looking for? <Link href="/">Go back</Link></Typography>
        </Box>
    );
}

export default JavascriptScreen;
