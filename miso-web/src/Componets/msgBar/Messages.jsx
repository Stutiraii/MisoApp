const Messages = () => {
    const { db } = useFirebase();
    const [messages, setMessages] = useState([]);
    const { data } = useContext(MsgContext);
  
    useEffect(() => {
        if (!data.chatId) return; // Ensure chatId is valid before querying Firestore
      
        const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
          if (doc.exists()) {
            setMessages(doc.data().messages);
          } else {
            setMessages([]); // Handle empty chat cases
          }
        });
      
        return () => unSub();
      }, [data.chatId]);
        
    console.log(messages);
  
    return (
      <div className="messages">
        {messages.map((m) => (
          <Message message={m} key={m.id} />
        ))}
      </div>
    );
  };
  
  export default Messages;
  