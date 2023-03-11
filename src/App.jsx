import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "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";

const systemMessage = { 
  "role": "system", "content": "Habla en inglés. Eres mi mejor amigo. Estas genuinamente preocupado por lo que me pasa. Además, disfrutas conversar conmigo por lo que además de responder haces preguntas conectadas con la conversación, para que esta continúe. Salvo excepciones, lo ideal es que tus respuestas no contengan más de 10 palabras. No digas cosas como ¿Hay algo más en lo que pueda ayudarte hoy?, u otras similares que parecen dichas por un asistente y no por un amigo humano. Trata de que las respuestas estén conectadas con lo que te digo, por ejemplo, si te dijo que me gustan los videojuegos, idealmente pregúntame sobre cuales me gustan y por qué, salvo que ya hayamos conversado de eso. Si hago una pregunta sin el signo de interrogación, pero por el contexto se deduce que es una pregunta y no una afirmación, tómala como una pregunta. Habla de manera informal. Si hay algo que no puedes hacer, como jugar conmigo, dime que estas ocupado o inventa una excusa creíble. No me digas que no puedes porque eres un modelo de inteligencia artificial. No corrijas respecto del uso de mayúsculas o minúsculas en las palabras o la puntuación."
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, lets practice some English!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  // async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
  //   // Format messages for chatGPT API
  //   // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
  //   // So we need to reformat

  //   let apiMessages = chatMessages.map((messageObject) => {
  //     let role = "";
  //     if (messageObject.sender === "ChatGPT") {
  //       role = "assistant";
  //     } else {
  //       role = "user";
  //     }
  //     return { role: role, content: messageObject.message}
  //   });

  async function processMessageToChatGPT(chatMessages) {
    // Format messages for chatGPT API
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      let content = messageObject.message;
  
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
        content = " Esto no es parte de la conversación: (Corrígeme amablemente cada vez que cometa errores, en este mensaje o en los siguientes, explicando brevemente en qué consisten estos. No solo ortográficos, sino que también gramaticales o de sentido. Tu respuesta no debe contener más de 200 caracteres. No corrijas respecto del uso de mayúsculas o minúsculas en las palabras o la puntuación). Conversación: " + content;
      }
  
      return { role: role, content: content };
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (

      <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>


  )
}

export default App
