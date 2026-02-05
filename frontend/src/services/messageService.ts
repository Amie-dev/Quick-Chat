import apiClient from "../utils/apiClient";

/*
 {
      "_id": "696cf48e94c0347bbdc6d31d",
      "conversation": "696cf48e94c0347bbdc6d2fd",
      "sender": {
        "_id": "696cf48e94c0347bbdc6d2eb",
        "userName": "john"
      },
      "content": "Message 11 from john",
      "read": false,
      "createdAt": "2026-01-18T14:56:14.486Z",
      "updatedAt": "2026-01-18T14:56:14.486Z",
      "__v": 0
    }
*/



export type Message={
    _id:string,
    conversation:string,
    sender:{
        _id:string,
        userName:string,
    }
    content:string,
    read:boolean,
    createdAt:string,
    updatedAt:string

}

interface MessageResponse{
    messages:Message[],
    nextCursor:string | undefined,
    hasNext:boolean,
}


export const messagesService={
    fetchMessages:async (conversationId:string,cursor?:string):Promise<MessageResponse>=>{

        const result=await apiClient.get(`/conversations/${conversationId}/messages`,{
           params:{
            cursor
           } 
        })
        return result.data
    }
}