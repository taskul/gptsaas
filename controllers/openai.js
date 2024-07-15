require('dotenv').config({ path: '../config.env' });
const { OpenAI } = require('openai');

// Create an instance of the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_SECRET,
});


exports.summarize = async (req, res, next) => {
  const { text } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Summarize this: \n${text}` }],
      max_tokens: 500, // 500 tokens is about 375 words
      temperature: 0.5, // temperature is how unique the response will be and basically the amount of risk the model will take when developing its response
    });

    const summary = completion.choices[0].message.content;
    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

exports.paragraph = async (req, res, next) => {
    const { text } = req.body;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Write a detailed paragraph about: \n${text}` }],
        max_tokens: 500, 
        temperature: 0.5, 
      });
  
      const summary = completion.choices[0].message.content;
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  // yoda like chatbot
exports.chatbot = async (req, res, next) => {
const { text } = req.body;
try {
    const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: `Answer questions similar to how Yoda from Star Wars would
        Me: "What is your name?"
        Yoda: "Yoda my name is."
        Me: "How old are you?"
        Yoda: "Old I am. 900 years old I am."
        Me: "What is your favorite color?"
        Yoda: "Blue my favorite color is."
        Me; ${text}`, 
        // doing some training on how yoda would answer questions here
    }],
    max_tokens: 300, 
    temperature: 0.7, 
    });

    const summary = completion.choices[0].message.content;
    res.status(200).json({ summary });
} catch (error) {
    next(error);
}
};

// javascript converter
exports.jsConverter = async (req, res, next) => {
    const { text } = req.body;
    try {
        const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', 
        messages: [{ role: 'user', content: `/* Convert these instructions into JavaScript code: \n${text} */`, 
        }],
        max_tokens: 400, 
        temperature: 0.25, 
        });
    
        const response = completion.choices[0].message.content;
        res.status(200).json({ response });
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        res.status(500).json({ error: 'An error occurred while summarizing the text.' });
    }
    };

// creates a sci-fi image
exports.scifi = async (req, res) => {
    const { text } = req.body;
    try {
        const response = await openai.images.generate({
            prompt: text,
            n: 1,
            size: "512x512"
        });
    
        const imageUrl = response.data[0].url;
        res.status(200).json({ imageUrl });
    } catch (error) {
        next(error);
    }
};