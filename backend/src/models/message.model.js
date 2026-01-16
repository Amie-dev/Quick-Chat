import { Schema,model } from "mongoose";

const messageSchema=new Schema(
    {
conversation:{
    type:Schema.Types.ObjectId,
    ref:"Conversation",
    required:true,
    index:true
},
sender:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true
},
content:{
    type:String,
    required:true,
    trim:true
}
,
read:{
    type:Boolean,
    default:false,
    index:true
}
},
{
    timestamps:true
})



messageSchema.index({
    conversation:1,
    createdAt:-1
})
messageSchema.index({
    sender:1,
    createdAt:-1
})

messageSchema.post("save", async function (doc) {
  try {
    const Conversation = model("Conversation");

    const preview = {
      content: doc.content,
      timestamp: doc.createdAt, // keep consistent with Conversation schema
    };

    await Conversation.findByIdAndUpdate(
      doc.conversation,
      {
        lastMessage: doc._id,
        lastMessagePreview: preview,
      },
      { new: true } // optional, if you need the updated doc
    );
  } catch (error) {
    console.error("Error updating Conversation after message save", error);
  }
});


const Message=model("Message",messageSchema)

export default Message